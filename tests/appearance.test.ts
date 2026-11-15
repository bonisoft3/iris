// Dual-appearance token parity, WCAG AA contrast across light and dark modes,
// and zero raw colour literals or unresolved custom properties across authored stylesheets.
import { assert, assertEquals } from "jsr:@std/assert@1";

const here = new URL("..", import.meta.url);
const read = (rel: string) => Deno.readTextFile(new URL(rel, here));

const EXPECTED_TOKENS = [
  "primary",
  "secondary",
  "accent",
  "danger",
  "neutral",
  "surface",
  "border",
  "surface-muted",
  "link",
  "header",
  "strip-ink",
];

function hexToLuminance(hex: string): number {
  const clean = hex.replace(/^#/, "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const l1 = hexToLuminance(hexA);
  const l2 = hexToLuminance(hexB);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

Deno.test("appearance: DESIGN.md and shell/design.css declare light-dark() pairs meeting WCAG AA (>= 4.5:1)", async () => {
  const designCss = await read("shell/design.css");
  assert(
    designCss.includes('.screen[data-state$="-dark"]') && designCss.includes("color-scheme: dark"),
    "shell/design.css must stamp color-scheme: dark on -dark storyboard frames",
  );

  const lightColors: Record<string, string> = {};
  const darkColors: Record<string, string> = {};
  for (const token of EXPECTED_TOKENS) {
    const re = new RegExp(`--${token}:\\s*light-dark\\((#[0-9a-fA-F]{6}),\\s*(#[0-9a-fA-F]{6})\\)`);
    const m = designCss.match(re);
    assert(m, `shell/design.css must declare --${token}: light-dark(#..., #...)`);
    lightColors[token] = m[1];
    darkColors[token] = m[2];
  }

  const pairs: [string, string][] = [
    ["primary", "neutral"],
    ["primary", "surface"],
    ["primary", "surface-muted"],
    ["secondary", "neutral"],
    ["secondary", "surface"],
    ["link", "neutral"],
    ["link", "surface"],
    ["accent", "surface"],
    ["danger", "surface"],
    ["strip-ink", "header"],
  ];

  for (const [fg, bg] of pairs) {
    const lightRatio = contrastRatio(lightColors[fg], lightColors[bg]);
    const darkRatio = contrastRatio(darkColors[fg], darkColors[bg]);
    assert(
      lightRatio >= 4.5,
      `light mode contrast for --${fg} (${lightColors[fg]}) on --${bg} (${lightColors[bg]}) is ${lightRatio.toFixed(2)}:1 (< 4.5:1)`,
    );
    assert(
      darkRatio >= 4.5,
      `dark mode contrast for --${fg} (${darkColors[fg]}) on --${bg} (${darkColors[bg]}) is ${darkRatio.toFixed(2)}:1 (< 4.5:1)`,
    );
  }
});

Deno.test("appearance: authored screen and shared stylesheets contain zero raw colour literals and resolve all var(--...)", async () => {
  const designCss = await read("shell/design.css");
  const declaredVars = new Set<string>(
    [...designCss.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)].map((m) => m[1]),
  );

  const authoredFiles: string[] = ["shell/shared/chrome.css", "shell/shared/iris.css"];
  for await (const entry of Deno.readDir(new URL("shell/screens/", here))) {
    if (entry.isFile && entry.name.endsWith(".css")) {
      authoredFiles.push(`shell/screens/${entry.name}`);
    }
  }
  authoredFiles.sort();
  assert(authoredFiles.length >= 8, `expected at least 8 authored stylesheets, found ${authoredFiles.length}`);

  const fileContents = new Map<string, string>();
  for (const file of authoredFiles) {
    const css = await read(file);
    fileContents.set(file, css);
    for (const m of css.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)) {
      declaredVars.add(m[1]);
    }
  }

  for (const [file, css] of fileContents.entries()) {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const hexMatches = [...stripped.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].map((m) => m[0]);
    assertEquals(hexMatches, [], `${file} contains raw hex colour literals: ${hexMatches.join(", ")}`);

    const fnMatches = [...stripped.matchAll(/\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/gi)].map((m) => m[0]);
    assertEquals(fnMatches, [], `${file} contains raw colour functions: ${fnMatches.join(", ")}`);

    const referencedVars = [...stripped.matchAll(/var\(\s*(--[a-zA-Z0-9_-]+)/g)].map((m) => m[1]);
    const unresolved = referencedVars.filter((v) => !declaredVars.has(v));
    assertEquals(unresolved, [], `${file} references undeclared custom properties: ${unresolved.join(", ")}`);
  }
});

Deno.test("appearance: every screen in ir.html declares a populated-dark storyboard frame and appearance path", async () => {
  const irHtml = await read("ir.html");
  const screenIds = [...irHtml.matchAll(/<section id="([^"]+)" data-kind="screen"/g)].map((m) => m[1]);
  assert(screenIds.length >= 6, `expected at least 6 screens in ir.html, found ${screenIds.length}`);

  for (const screenId of screenIds) {
    assert(
      irHtml.includes(`id="${screenId}-populated-dark"`) && irHtml.includes(`data-of="${screenId}" data-state="populated-dark"`),
      `ir.html screen #${screenId} must declare a populated-dark storyboard frame`,
    );
  }
});

// Regression: Iris delegates sign-in and passkey/Google selection to its login modal
// via `.shell-signin` -> `[data-auth-trigger]`, so `.shell-register` must never gain a
// higher-specificity `display: inline-flex` rule in the desktop rail.
Deno.test("appearance: nav rail hides .shell-register and .shell-provider so only .shell-signin opens the login modal", async () => {
  const chromeCss = (await read("shell/shared/chrome.css")).replace(/\/\*[\s\S]*?\*\//g, "");
  assert(
    chromeCss.includes("body > nav .shell-register:not([hidden])") &&
      /body > nav \.shell-register:not\(\[hidden\]\)[\s\S]*?display:\s*none\s*!important/.test(chromeCss),
    "chrome.css must hide body > nav .shell-register:not([hidden])",
  );
  assert(
    !/\.shell-register[^\n{]*\{[^}]*display:\s*inline-flex/m.test(chromeCss),
    "chrome.css must not give .shell-register display: inline-flex",
  );
});
