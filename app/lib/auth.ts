export const sessionCookieName = "figyfun_session";

const defaultUsername = "oguzhan";
const defaultPassword = "Ogzhn.kb2516";
const fallbackSecret = "figyfun-local-session-secret-change-on-vercel";
const maxAgeSeconds = 60 * 60 * 24 * 14;

type SessionPayload = {
  username: string;
  exp: number;
};

export type CurrentUser = {
  username: string;
  name: string;
};

function getSecret() {
  return process.env.AUTH_SECRET || process.env.ADMIN_SESSION_SECRET || fallbackSecret;
}

function base64UrlEncode(value: string | ArrayBuffer) {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));

  return base64UrlEncode(signature);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return result === 0;
}

export function validateCredentials(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME || defaultUsername;
  const expectedPassword = process.env.ADMIN_PASSWORD || defaultPassword;

  return safeEqual(username.trim(), expectedUsername) && safeEqual(password, expectedPassword);
}

export async function createSessionValue(username: string) {
  const payload: SessionPayload = {
    username,
    exp: Date.now() + maxAgeSeconds * 1000,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));

  return `${encodedPayload}.${await sign(encodedPayload)}`;
}

export async function verifySessionValue(sessionValue: string | undefined) {
  if (!sessionValue) return null;

  const [encodedPayload, signature] = sessionValue.split(".");
  if (!encodedPayload || !signature || !safeEqual(await sign(encodedPayload), signature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;

    if (!payload.username || payload.exp < Date.now()) return null;

    return {
      username: payload.username,
      name: payload.username === "oguzhan" ? "Oguzhan" : payload.username,
    } satisfies CurrentUser;
  } catch {
    return null;
  }
}
