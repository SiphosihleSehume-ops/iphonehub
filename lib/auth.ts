/**
 * Admin sign-in: one shared password (ADMIN_PASSWORD) and a signed, httpOnly
 * cookie. Uses Web Crypto so the same code runs in middleware and API routes.
 */
export const COOKIE_NAME = "ih_admin";
export const SESSION_SECONDS = 60 * 60 * 24 * 7; // one week

const enc = new TextEncoder();

function secret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function sign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** True when `password` matches ADMIN_PASSWORD (compared via HMAC, constant time). */
export async function passwordMatches(password: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  const [a, b] = await Promise.all([
    sign(`pw:${password}`),
    sign(`pw:${process.env.ADMIN_PASSWORD}`),
  ]);
  return safeEqual(a, b);
}

export async function createToken(): Promise<string> {
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  return `${expires}.${await sign(`session:${expires}`)}`;
}

export async function verifyToken(token: string | undefined): Promise<boolean> {
  if (!token || !secret()) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, await sign(`session:${expires}`));
}
