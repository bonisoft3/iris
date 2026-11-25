// Post-release browser verification journeys for `sayt verify` across all 6
// screens (gallery, detail, intro, landing, camera, about): signs in via the
// guest door, completes the first-visit Como Funciona walkthrough on /, verifies
// the top navigation contains only Gallery, Scan Item, and About (excluding /lp
// and /intro), visits each route and exercises its interactive controls, submits
// a camera scan, and checks 390px phone geometry.
type JourneyItem = {
  screen?: string;
  spec?: { screen: string; accepts?: string };
  role?: string;
  path?: string;
  run?: (page: any, ctx?: { baseUrl?: string; targetUrl?: string }) => Promise<void>;
};

type Seed = {
  itemId: string;
  itemCaption: string;
};
let seed: Seed;

async function ready(page: any, screen: string) {
  await page.waitForFunction(
    (name: string) => {
      const shell = document.querySelector("#app .shell-screen:not([hidden])");
      if (!shell || shell.hasAttribute("data-served") || shell.hasAttribute("data-entering")) return false;
      const view = shell.querySelector(".screen");
      if (!view || view.getAttribute("data-screen") !== name) return false;
      if (view.getAttribute("data-state") === "network-error") throw new Error("screen reported network-error");
      return view.getAttribute("data-state") !== "loading" && !view.querySelector("[data-hydrating], [data-state='loading']");
    },
    screen,
    { timeout: 45_000 },
  );
}

async function navigate(page: any, base: string, path: string, screen: string) {
  const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (!response || response.status() !== 200) throw new Error(`${screen}: navigation failed (${response?.status()})`);
  await ready(page, screen);
}

async function readRow(base: string, query: string, token: string) {
  const response = await fetch(`${base}/crud/${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`seed read failed: ${response.status}`);
  const rows = await response.json();
  if (!rows[0]) throw new Error(`the demo network has no row for ${query}`);
  return rows[0];
}

const enc = encodeURIComponent;

// accept-guest-signin, accept-first-visit-intro, accept-gallery-grid, accept-gallery-tabs, accept-gallery-search-filter
const gallery: JourneyItem = {
  screen: "gallery",
  async run(page, ctx) {
    const base = String(ctx?.baseUrl);
    await navigate(page, base, "/", "gallery");

    const session = await page.evaluate(() => JSON.parse(localStorage.getItem("pronto-token") ?? "null"));
    if (!session?.token || !session.user?.guest) throw new Error("lazy guest session did not establish a token");

    const item = await readRow(
      base,
      "trash_item?select=id,caption&tagged_as_inappropriate=eq.false&order=created_at.desc,id.asc&limit=1",
      session.token,
    );
    seed = {
      itemId: item.id,
      itemCaption: item.caption,
    };

    // First-time visit on / displays the 3-step Como Funciona walkthrough before revealing the gallery.
    await page.locator(".first-visit-overlay[data-visited='false']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#intro-next-1").click();
    await page.locator(".first-visit-overlay .intro-stage[data-step='2']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#intro-next-2").click();
    await page.locator(".first-visit-overlay .intro-stage[data-step='3']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#intro-start").click();
    await page.locator(".workspace-root").waitFor({ state: "visible", timeout: 15_000 });

    // Sign-in is the nav rail's alone: Sign in opens its panel in place onto Google's way in and this device's.
    const ownSignin = await page.locator('#app [role="dialog"][aria-modal="true"], #app [data-auth-action="passkey-signin"]').count();
    if (ownSignin !== 0) throw new Error(`expected no screen to draw its own sign-in, got ${ownSignin}`);
    await page.locator("body > nav .shell-signin").click();
    const ways = page.locator("body > nav .shell-signin-panel");
    for (const way of [
      ".shell-provider[data-provider='google'], .shell-provider-button[data-provider='google']",
      ".shell-passkey[data-auth-action='accounts']",
    ]) {
      await ways.locator(way).waitFor({ state: "visible", timeout: 15_000 });
    }

    await page.locator(".filter-drawer-btn").click();
    await page.locator("#cat-organic").click();
    await page.locator(".workspace-root[data-category-filter='organic']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#search-clear").click();
    await page.locator(".workspace-root[data-category-filter='all']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator(".filter-drawer-btn").click();

    await page.locator("#tab-mine").click();
    await page.locator(".workspace-root[data-tab='my_items']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#tab-global").click();
    await page.locator(".workspace-root[data-tab='global']").waitFor({ state: "visible", timeout: 15_000 });

    // Direct shelf routes (/gallery and /mine) resolve without onboarding gate.
    await navigate(page, base, "/gallery?q=pet", "gallery");
    await page.locator(".workspace-root[data-shelf='gallery'] .pane-global").waitFor({ state: "visible", timeout: 15_000 });
    await navigate(page, base, "/mine", "gallery");
    await page.locator(".workspace-root[data-shelf='mine'] .pane-mine").waitFor({ state: "visible", timeout: 15_000 });
  },
};

// accept-detail-page, accept-detail-tabs
const detail: JourneyItem = {
  screen: "detail",
  async run(page, ctx) {
    if (!seed) throw new Error("gallery did not resolve the seed");
    await navigate(page, String(ctx?.baseUrl), `/images/${enc(seed.itemId)}`, "detail");
    await page.getByText(seed.itemCaption, { exact: true }).locator("visible=true").first().waitFor({
      state: "visible",
      timeout: 45_000,
    });
    await page.locator("#tab-details").click();
    await page.locator(".detail-tabs-root[data-tab='details']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#tab-nearby").click();
    await page.locator(".detail-tabs-root[data-tab='nearby']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#tab-discard").click();
    await page.locator(".detail-tabs-root[data-tab='discard']").waitFor({ state: "visible", timeout: 15_000 });
  },
};

// accept-intro-stepper
const intro: JourneyItem = {
  screen: "intro",
  async run(page, ctx) {
    await navigate(page, String(ctx?.baseUrl), "/intro", "intro");
    await page.locator(".intro-stage[data-step='1']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#intro-next-1").click();
    await page.locator(".intro-stage[data-step='2']").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("#intro-next-2").click();
    await page.locator(".intro-stage[data-step='3']").waitFor({ state: "visible", timeout: 15_000 });
  },
};

// accept-landing-campaigns
const landing: JourneyItem = {
  screen: "landing",
  async run(page, ctx) {
    await navigate(page, String(ctx?.baseUrl), "/lp", "landing");
    const cards = await page.locator(".campaign-card").count();
    if (cards !== 3) throw new Error(`expected 3 campaign cards on /lp, got ${cards}`);
  },
};

// accept-about-page
const about: JourneyItem = {
  screen: "about",
  async run(page, ctx) {
    await navigate(page, String(ctx?.baseUrl), "/about", "about");
    const fanCards = await page.locator(".about-fan-card").count();
    if (fanCards !== 3) throw new Error(`expected 3 fanned specimen cards on /about, got ${fanCards}`);
    const campaignLinks = await page.locator(".about-campaign-card[data-route='landing']").count();
    if (campaignLinks !== 3) throw new Error(`expected 3 campaign links to /lp on /about, got ${campaignLinks}`);
    await page.locator(".about-studio-link[href='https://bonisoft3.com']").waitFor({ state: "visible", timeout: 15_000 });
  },
};

// accept-camera-scan, accept-camera-segmentation
const camera: JourneyItem = {
  screen: "camera",
  async run(page, ctx) {
    const base = String(ctx?.baseUrl);
    await navigate(page, base, "/camera", "camera");
    await page.locator("#camera-lens-mount[data-hatch='camera-lens']").waitFor({ state: "visible", timeout: 15_000 });
    const modelPickers = await page.locator(".model-picker").count();
    if (modelPickers !== 0) throw new Error(`expected zero .model-picker controls on /camera, got ${modelPickers}`);

    const cityInput = page.locator("form[data-form='submit-scan'] input[name='user_city']");
    await cityInput.fill("Verify City");
    await page.locator("form[data-form='submit-scan'] button[type='submit']").click();
    await page.locator("form[data-form='submit-scan'] .saved").waitFor({ state: "visible", timeout: 15_000 });
    await page.locator("body[data-auth='guest'] .keep-scans-offer [data-auth-action='passkey-register']")
      .waitFor({ state: "visible", timeout: 15_000 });

    // Clean up the verify scan request and promoted item so the demo network stays pristine.
    const session = await page.evaluate(() => JSON.parse(localStorage.getItem("pronto-token") ?? "null"));
    if (session?.token && session?.user?.id) {
      const reqs = await (
        await fetch(
          `${base}/crud/track_request?select=id&user_id=eq.${session.user.id}&user_city=eq.${enc("Verify City")}`,
          { headers: { Authorization: `Bearer ${session.token}` } },
        )
      ).json();
      for (const r of reqs) {
        await fetch(`${base}/crud/trash_item?id=eq.${r.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.token}` },
        });
        await fetch(`${base}/crud/track_request?id=eq.${r.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.token}` },
        });
      }
    }
  },
};

// accept-responsive-geometry
const phoneLayout: JourneyItem = {
  screen: "gallery",
  async run(page, ctx) {
    if (!seed) throw new Error("gallery did not resolve the seed");
    await page.setViewportSize({ width: 390, height: 844 });
    const base = String(ctx?.baseUrl);
    try {
      await navigate(page, base, "/", "gallery");
      const metrics = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        navVisible: Boolean(
          document.querySelector("body > nav") &&
            document.querySelector("body > nav")!.getClientRects().length > 0,
        ),
        navLinks: document.querySelectorAll("body > nav a[data-route]").length,
      }));
      if (metrics.scrollWidth > metrics.innerWidth) {
        throw new Error(`horizontal overflow at 390px: scrollWidth=${metrics.scrollWidth} > ${metrics.innerWidth}`);
      }
      if (!metrics.navVisible) {
        throw new Error("navigation bar is not visible at 390px phone width");
      }
      if (metrics.navLinks !== 5) {
        throw new Error(`expected 5 navigation links (Explore, My Items, Gallery, Scan Item, Settings), got ${metrics.navLinks}`);
      }
    } finally {
      await page.setViewportSize({ width: 1280, height: 800 });
    }
  },
};

// Google signs a person in by its own button on production, framed from the
// auth service's page for iris's own client; a deployment with OIDC_BROKER
// (staging, .say.cue) signs in through the broker's redirect instead.
const googleSignIn: JourneyItem = {
  spec: { screen: "gallery", accepts: "accept-signin-google" },
  async run(page, ctx) {
    const origin = new URL(ctx?.baseUrl ?? ctx?.targetUrl ?? "").origin;
    await page.goto(`${origin}/auth/oidc`, { waitUntil: "domcontentloaded" });
    const offered = JSON.parse(await page.evaluate(() => document.body?.textContent ?? "")) as { providers?: string[]; credential?: Record<string, string> };
    if (Deno.env.get("OIDC_BROKER")) {
      if (!offered.providers?.includes("google") || offered.credential?.google !== undefined) {
        throw new Error(`the broker release misconfigured Google sign-in: ${JSON.stringify(offered)}`);
      }
      await page.goto(`${origin}/auth/oidc/google/start`, { waitUntil: "domcontentloaded" });
      const landed = await page.evaluate(() => ({ host: location.hostname, body: document.body?.textContent?.slice(0, 200) ?? "" }));
      if (landed.host === new URL(origin).hostname) throw new Error(`Sign in with Google stayed on ${landed.host}: ${landed.body}`);
      return;
    }
    const client = offered.credential?.google;
    if (!offered.providers?.includes("google") || typeof client !== "string" || !client.endsWith(".apps.googleusercontent.com")) {
      throw new Error(`the release offers no Google button of its own client: ${JSON.stringify(offered)}`);
    }
    await page.goto(`${origin}/auth/oidc/google/button`, { waitUntil: "domcontentloaded" });
    const drawn = await page.evaluate(() => ({
      client: document.documentElement.dataset.client ?? "",
      script: document.querySelector("script[type=module]")?.getAttribute("src") ?? "",
    }));
    if (drawn.client !== client || !drawn.script.endsWith("/auth/oidc/google/button.js")) {
      throw new Error(`the button page is not Google's for ${client}: ${JSON.stringify(drawn)}`);
    }
  },
};

export const journeys = [
  gallery,
  detail,
  intro,
  landing,
  about,
  camera,
  phoneLayout,
  googleSignIn,
];
