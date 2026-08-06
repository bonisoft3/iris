// Requires DATABASE_URL pointing at a throwaway postgres. app_user is owned
// elsewhere (see main.ts); tests create a minimal stand-in before running
// the service's own migration against it.
import {
  assert,
  assertEquals,
} from "jsr:@std/assert@1.0.13";
import { handler, issueUserToken, migrate, sql, verifyJwt } from "./main.ts";

await sql`CREATE TABLE IF NOT EXISTS app_user (
  id uuid primary key,
  handle text not null unique,
  created_at timestamptz not null default now()
)`;
await migrate();
await sql`delete from webauthn_credential`;
await sql`delete from app_user`;

function post(path: string, body: unknown): Request {
  return new Request(`http://auth:9999${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const opts = { sanitizeResources: false, sanitizeOps: false };

Deno.test({
  name: "register/start is usernameless: generated identity, resident key",
  ...opts,
  fn: async () => {
    const res = await handler(post("/auth/register/start", {}));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(typeof body.challenge, "string");
    assertEquals(body.rp.id, "localhost");
    assert(/^[a-z]+-[a-z]+-\d\d$/.test(body.user.name), `generated handle, got ${body.user.name}`);
    assertEquals(body.authenticatorSelection.residentKey, "required");
    assert(Array.isArray(body.pubKeyCredParams) && body.pubKeyCredParams.length > 0);
    const st = await verifyJwt(body.state);
    assert(st !== null);
    assertEquals(st.purpose, "register");
    assertEquals(st.handle, body.user.name);
    assertEquals(st.challenge, body.challenge);
    assertEquals(typeof st.userId, "string");
  },
});

Deno.test({
  name: "login/start is discoverable: no identifier, empty allowCredentials",
  ...opts,
  fn: async () => {
    const res = await handler(post("/auth/login/start", {}));
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(typeof body.challenge, "string");
    assertEquals(body.rpId, "localhost");
    assertEquals(body.allowCredentials.length, 0);
    const st = await verifyJwt(body.state);
    assert(st !== null);
    assertEquals(st.purpose, "login");
    assertEquals(st.challenge, body.challenge);
  },
});

Deno.test({
  name: "register/verify rejects garbage state and garbage response",
  ...opts,
  fn: async () => {
    let res = await handler(
      post("/auth/register/verify", { state: "garbage", response: {} }),
    );
    assertEquals(res.status, 401);
    assertEquals((await res.json()).error, "invalid state");

    const start = await handler(post("/auth/register/start", {}));
    const { state } = await start.json();
    res = await handler(
      post("/auth/register/verify", { state, response: { junk: true } }),
    );
    assertEquals(res.status, 401);
    assertEquals((await res.json()).error, "registration verification failed");
  },
});

Deno.test({
  name: "login/verify rejects garbage cleanly",
  ...opts,
  fn: async () => {
    const start = await handler(post("/auth/login/start", { handle: "bob" }));
    const { state } = await start.json();
    const res = await handler(
      post("/auth/login/verify", { state, response: { id: "dGVzdC1jcmVk" } }),
    );
    assertEquals(res.status, 401);
    assertEquals((await res.json()).error, "authentication verification failed");
  },
});

Deno.test({
  name: "whoami 401s without a token",
  ...opts,
  fn: async () => {
    const res = await handler(new Request("http://auth:9999/auth/whoami"));
    assertEquals(res.status, 401);
    assertEquals((await res.json()).error, "missing token");
  },
});

Deno.test({
  name: "issued user JWT carries the frozen claims and satisfies whoami",
  ...opts,
  fn: async () => {
    const id = crypto.randomUUID();
    const token = await issueUserToken(id, "alice");
    const claims = await verifyJwt(token);
    assert(claims !== null);
    assertEquals(claims.role, "app_user");
    assertEquals(claims.sub, id);
    assertEquals(claims.handle, "alice");
    const exp = claims.exp as number;
    const sevenDays = Math.floor(Date.now() / 1000) + 7 * 24 * 3600;
    assert(Math.abs(exp - sevenDays) < 60, `exp ${exp} not ~7d out`);
    const res = await handler(
      new Request("http://auth:9999/auth/whoami", {
        headers: { authorization: `Bearer ${token}` },
      }),
    );
    assertEquals(res.status, 200);
    assertEquals(await res.json(), { id, handle: "alice" });
  },
});

Deno.test({
  name: "guest mints a fresh app_user per call with a valid token",
  ...opts,
  fn: async () => {
    const res = await handler(post("/auth/guest", {}));
    assertEquals(res.status, 200);
    const body = await res.json();
    assert(/^[a-z]+-[a-z]+-\d\d$/.test(body.user.handle), `generated handle, got ${body.user.handle}`);
    const claims = await verifyJwt(body.token);
    assert(claims !== null);
    assertEquals(claims.role, "app_user");
    assertEquals(claims.sub, body.user.id);
    assertEquals(claims.handle, body.user.handle);
    const rows = await sql`select handle from app_user where id = ${body.user.id}`;
    assertEquals(rows.length, 1);
    assertEquals(rows[0].handle, body.user.handle);
    // Each call is a fresh guest — the endpoint never reuses an identity.
    const again = await (await handler(post("/auth/guest", {}))).json();
    assert(again.user.id !== body.user.id, "second guest call reused the identity");
  },
});

Deno.test({
  name: "teardown",
  ...opts,
  fn: async () => {
    await sql.end();
  },
});
