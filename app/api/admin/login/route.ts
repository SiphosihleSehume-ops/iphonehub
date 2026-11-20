import { NextResponse } from "next/server";
import {
  adminConfigured,
  COOKIE_NAME,
  createToken,
  passwordMatches,
  SESSION_SECONDS,
} from "@/lib/auth";

export const runtime = "nodejs";

/* 8 attempts per IP per 10 minutes */
const attempts = new Map<string, number[]>();

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "Admin is not set up yet. Add ADMIN_PASSWORD to your environment variables." },
      { status: 503 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 8) {
    return NextResponse.json({ error: "Too many attempts. Try again in a few minutes." }, { status: 429 });
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    /* fall through as wrong password */
  }

  if (!(await passwordMatches(password))) {
    recent.push(now);
    attempts.set(ip, recent);
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, await createToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
  return res;
}
