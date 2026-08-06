// Auth service: WebAuthn passkey ceremonies plus a guest mint. Contract:
// plugins/pronto/docs/2026-07-30-keep-stage3-vocabulary.md — endpoints are
// mounted WITH the /auth prefix (Caddy strips nothing). Stateless: the
// WebAuthn challenge travels in a short-lived HS256 `state` JWT instead of
// server-side sessions. app_user is a program entity created by the database
// migrations; this service only self-migrates webauthn_credential.
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import postgres from "postgres";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
const JWT_SECRET = Deno.env.get("PGRST_JWT_SECRET") ??
  "pronto-dev-secret-please-override-32ch";
const RP_ID = Deno.env.get("WEBAUTHN_RP_ID") ?? "localhost";
const ORIGIN = Deno.env.get("WEBAUTHN_ORIGIN") ?? "http://localhost:8080";

const USER_TOKEN_TTL_S = 7 * 24 * 3600;
const STATE_TTL_S = 300;

export const sql = postgres(DATABASE_URL);

export async function migrate(): Promise<void> {
  await sql`CREATE TABLE IF NOT EXISTS webauthn_credential (
    id text primary key,
    user_id uuid not null references app_user(id) on delete cascade,
    public_key bytea not null,
    counter bigint not null default 0
  )`;
}

// --- HS256 JWT via WebCrypto ---

const enc = new TextEncoder();

function b64urlEncode(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const b = s.replaceAll("-", "+").replaceAll("_", "/");
  const pad = b.length % 4 === 0 ? "" : "=".repeat(4 - (b.length % 4));
  return Uint8Array.from(atob(b + pad), (c) => c.charCodeAt(0));
}

let hmacKey: CryptoKey | undefined;
async function getKey(): Promise<CryptoKey> {
  hmacKey ??= await crypto.subtle.importKey(
    "raw",
    enc.encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
  return hmacKey;
}

export async function signJwt(
  claims: Record<string, unknown>,
): Promise<string> {
  const head = b64urlEncode(enc.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const payload = b64urlEncode(enc.encode(JSON.stringify(claims)));
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", await getKey(), enc.encode(`${head}.${payload}`)),
  );
  return `${head}.${payload}.${b64urlEncode(sig)}`;
}

export async function verifyJwt(
  token: string,
): Promise<Record<string, unknown> | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      b64urlDecode(parts[2]),
      enc.encode(`${parts[0]}.${parts[1]}`),
    );
    if (!ok) return null;
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(parts[1])));
    if (typeof claims.exp !== "number") return null;
    if (claims.exp <= Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}

export function issueUserToken(id: string, handle: string): Promise<string> {
  return signJwt({
    role: "app_user",
    sub: id,
    handle,
    exp: Math.floor(Date.now() / 1000) + USER_TOKEN_TTL_S,
  });
}

// --- HTTP surface ---

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function jsonError(status: number, error: string): Response {
  return json(status, { error });
}

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await req.json();
    return typeof body === "object" && body !== null ? body : null;
  } catch {
    return null;
  }
}

async function readState(
  body: Record<string, unknown>,
  purpose: string,
): Promise<Record<string, unknown> | null> {
  if (typeof body.state !== "string") return null;
  const st = await verifyJwt(body.state);
  if (!st || st.purpose !== purpose) return null;
  return st;
}

const ADJECTIVES = ["amber", "brisk", "calm", "dusk", "ember", "fern", "gold", "hazel", "ivory", "jade", "kind", "lunar", "mellow", "noble", "ochre", "pale", "quiet", "rustic", "sage", "tidal"];
const NOUNS = ["fox", "wren", "otter", "pine", "reed", "moth", "lark", "moss", "dune", "cove", "elk", "finch", "heron", "ibis", "kite", "lynx", "newt", "orca", "quail", "seal"];
function generateHandle(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a}-${n}-${10 + Math.floor(Math.random() * 90)}`;
}

async function registerStart(_req: Request): Promise<Response> {
  // Usernameless by doctrine: no identifier is ever collected.
  const handle = generateHandle();
  const userId = crypto.randomUUID();
  const options = await generateRegistrationOptions({
    rpName: "pronto",
    rpID: RP_ID,
    userName: handle,
    userID: enc.encode(userId),
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });
  const state = await signJwt({
    purpose: "register",
    handle,
    userId,
    challenge: options.challenge,
    exp: Math.floor(Date.now() / 1000) + STATE_TTL_S,
  });
  return json(200, { ...options, state });
}

async function registerVerify(req: Request): Promise<Response> {
  const body = await readBody(req);
  if (!body) return jsonError(400, "invalid json body");
  const st = await readState(body, "register");
  if (!st) return jsonError(401, "invalid state");
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      // deno-lint-ignore no-explicit-any
      response: body.response as any,
      expectedChallenge: st.challenge as string,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
    });
  } catch {
    return jsonError(401, "registration verification failed");
  }
  if (!verification.verified || !verification.registrationInfo) {
    return jsonError(401, "registration verification failed");
  }
  const { credentialID, credentialPublicKey, counter } =
    verification.registrationInfo;
  const userId = st.userId as string;
  // Generated handles can collide; regenerate and retry — never a user error.
  let handle = st.handle as string;
  let inserted = false;
  for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
    try {
      await sql.begin(async (tx) => {
        await tx`insert into app_user (id, handle) values (${userId}, ${handle})`;
        await tx`insert into webauthn_credential (id, user_id, public_key, counter)
          values (${credentialID}, ${userId}, ${credentialPublicKey}, ${counter})`;
      });
      inserted = true;
    } catch (e) {
      if ((e as { code?: string }).code === "23505") handle = generateHandle();
      else throw e;
    }
  }
  if (!inserted) return jsonError(500, "could not allocate identity");
  const token = await issueUserToken(userId, handle);
  return json(200, { token, user: { id: userId, handle } });
}

async function loginStart(_req: Request): Promise<Response> {
  // Discoverable credentials: the authenticator offers the resident passkey.
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: [],
  });
  const state = await signJwt({
    purpose: "login",
    challenge: options.challenge,
    exp: Math.floor(Date.now() / 1000) + STATE_TTL_S,
  });
  return json(200, { ...options, state });
}

async function loginVerify(req: Request): Promise<Response> {
  const body = await readBody(req);
  if (!body) return jsonError(400, "invalid json body");
  const st = await readState(body, "login");
  if (!st) return jsonError(401, "invalid state");
  const response = body.response as { id?: string } | undefined;
  if (!response || typeof response.id !== "string") {
    return jsonError(401, "authentication verification failed");
  }
  // The credential identifies the user (resident key).
  const creds = await sql`
    select c.id, c.public_key, c.counter, c.user_id, u.handle
    from webauthn_credential c join app_user u on u.id = c.user_id
    where c.id = ${response.id}`;
  if (creds.length === 0) {
    return jsonError(401, "authentication verification failed");
  }
  const cred = creds[0];
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      // deno-lint-ignore no-explicit-any
      response: body.response as any,
      expectedChallenge: st.challenge as string,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false,
      authenticator: {
        credentialID: cred.id as string,
        credentialPublicKey: new Uint8Array(cred.public_key as Uint8Array),
        counter: Number(cred.counter),
      },
    });
  } catch {
    return jsonError(401, "authentication verification failed");
  }
  if (!verification.verified) {
    return jsonError(401, "authentication verification failed");
  }
  await sql`update webauthn_credential
    set counter = ${verification.authenticationInfo.newCounter}
    where id = ${cred.id as string}`;
  const userId = cred.user_id as string;
  const handle = cred.handle as string;
  const token = await issueUserToken(userId, handle);
  return json(200, { token, user: { id: userId, handle } });
}

async function guest(_req: Request): Promise<Response> {
  // Origin-independent by terminal doctrine: no WebAuthn, no origin check —
  // this door must open from any origin the cluster is reachable on.
  const userId = crypto.randomUUID();
  let handle = generateHandle();
  let inserted = false;
  for (let attempt = 0; attempt < 3 && !inserted; attempt++) {
    try {
      await sql`insert into app_user (id, handle) values (${userId}, ${handle})`;
      inserted = true;
    } catch (e) {
      if ((e as { code?: string }).code === "23505") handle = generateHandle();
      else throw e;
    }
  }
  if (!inserted) return jsonError(500, "could not allocate identity");
  const token = await issueUserToken(userId, handle);
  return json(200, { token, user: { id: userId, handle } });
}

async function whoami(req: Request): Promise<Response> {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return jsonError(401, "missing token");
  const claims = await verifyJwt(auth.slice("Bearer ".length));
  if (!claims || claims.role !== "app_user") return jsonError(401, "invalid token");
  return json(200, { id: claims.sub, handle: claims.handle });
}

export async function handler(req: Request): Promise<Response> {
  const path = new URL(req.url).pathname;
  try {
    if (req.method === "POST" && path === "/auth/register/start") {
      return await registerStart(req);
    }
    if (req.method === "POST" && path === "/auth/register/verify") {
      return await registerVerify(req);
    }
    if (req.method === "POST" && path === "/auth/login/start") {
      return await loginStart(req);
    }
    if (req.method === "POST" && path === "/auth/login/verify") {
      return await loginVerify(req);
    }
    if (req.method === "POST" && path === "/auth/guest") {
      return await guest(req);
    }
    if (req.method === "GET" && path === "/auth/whoami") {
      return await whoami(req);
    }
    return jsonError(404, "not found");
  } catch (e) {
    console.error(e);
    return jsonError(500, "internal error");
  }
}

if (import.meta.main) {
  await migrate();
  Deno.serve({ port: 9999 }, handler);
}
