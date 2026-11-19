import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { formatRand } from "@/lib/format";
import { products } from "@/lib/products";
import type { OrderPayload, OrderResponse } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Small in-memory limiter: 5 orders per IP per 10 minutes. */
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\r\n\t]+/g, " ").trim().slice(0, max) : "";

function fail(status: number, body: OrderResponse) {
  return NextResponse.json(body, { status });
}

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 14px;color:#6a7078;font-size:14px;border-bottom:1px solid #eceef1;width:150px">${esc(label)}</td>
    <td style="padding:8px 14px;font-size:14px;font-weight:600;color:#111318;border-bottom:1px solid #eceef1">${value}</td>
  </tr>`;
}

function layout(title: string, intro: string, rows: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f7;font-family:Helvetica,Arial,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px 12px">
    <div style="background:#172540;color:#fff;padding:18px 24px;border-radius:12px 12px 0 0;font-size:22px;font-weight:800">
      iPhone<span style="color:#8fb2f0">Hub</span>
    </div>
    <div style="background:#fff;padding:26px 24px;border-radius:0 0 12px 12px">
      <h1 style="margin:0 0 8px;font-size:20px;color:#111318">${title}</h1>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#3d434b">${intro}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eceef1;border-radius:8px">${rows}</table>
      <p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:#6a7078">${footer}</p>
    </div>
  </div></body></html>`;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (limited(ip)) {
    return fail(429, { ok: false, error: "Too many orders from this connection. Try again shortly." });
  }

  let raw: Partial<OrderPayload>;
  try {
    raw = await req.json();
  } catch {
    return fail(400, { ok: false, error: "Invalid request." });
  }

  // Bots fill the hidden field; pretend success so they learn nothing.
  if (clean(raw.website, 50)) {
    return NextResponse.json({ ok: true, reference: "IH-000000" });
  }

  const name = clean(raw.name, 60);
  const surname = clean(raw.surname, 60);
  const email = clean(raw.email, 120);
  const phone = clean(raw.phone, 25);
  const address = clean(raw.address, 250);
  const color = clean(raw.color, 30);
  const quantity = Number(raw.quantity);
  const product = products.find((p) => p.id === raw.productId);

  const fieldErrors: NonNullable<OrderResponse["fieldErrors"]> = {};
  if (name.length < 2) fieldErrors.name = "Enter your first name";
  if (surname.length < 2) fieldErrors.surname = "Enter your surname";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address";
  if (phone.replace(/\D/g, "").length < 9) fieldErrors.phone = "Enter a valid phone number";
  if (address.length < 8) fieldErrors.address = "Enter your full delivery address";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10)
    fieldErrors.quantity = "Choose between 1 and 10";
  if (!product) return fail(400, { ok: false, error: "That iPhone is no longer available." });
  if (!product.colors.includes(color)) fieldErrors.color = "Pick an available colour";

  if (Object.keys(fieldErrors).length) {
    return fail(422, { ok: false, error: "Please check the highlighted fields.", fieldErrors });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, ORDER_RECEIVER_EMAIL } =
    process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ORDER_RECEIVER_EMAIL) {
    console.error("[order] Mail service is not configured. See .env.example");
    return fail(500, { ok: false, error: "Our order system is temporarily unavailable." });
  }

  const storeName = process.env.STORE_NAME || "iPhoneHub";
  const port = Number(SMTP_PORT) || 465;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: SMTP_SECURE ? SMTP_SECURE === "true" : port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const reference = `IH-${randomBytes(3).toString("hex").toUpperCase()}`;
  const total = product.price * quantity;
  const fullName = `${name} ${surname}`;

  const orderRows =
    row("Reference", esc(reference)) +
    row("iPhone", `${esc(product.model)} (${esc(product.storage)})`) +
    row("Colour", esc(color)) +
    row("Condition", esc(product.condition)) +
    row("Quantity", String(quantity)) +
    row("Unit price", esc(formatRand(product.price))) +
    row("Total", esc(formatRand(total)));

  const ownerHtml = layout(
    `New order ${esc(reference)}`,
    `${esc(fullName)} just placed an order on the website. Reply to this email to reach the customer directly.`,
    orderRows +
      row("Customer", esc(fullName)) +
      row("Email", `<a href="mailto:${esc(email)}">${esc(email)}</a>`) +
      row("Phone", esc(phone)) +
      row("Address", esc(address).replace(/\n/g, "<br>")),
    "Sent automatically by the storefront order form."
  );

  const clientHtml = layout(
    `Thanks for your order, ${esc(name)}!`,
    `We've received your order and our team will contact you shortly to confirm payment and delivery. Here is what you asked for:`,
    orderRows + row("Deliver to", esc(address)) + row("Contact number", esc(phone)),
    `Questions? Just reply to this email and quote ${esc(reference)}. Every ${esc(storeName)} iPhone comes with a 12-month warranty.`
  );

  const text = (heading: string) =>
    `${heading}\n\nReference: ${reference}\n${product.model} ${product.storage} - ${color}\nQuantity: ${quantity}\nTotal: ${formatRand(total)}\n`;

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"${storeName} Orders" <${SMTP_USER}>`,
        to: ORDER_RECEIVER_EMAIL,
        replyTo: `"${fullName}" <${email}>`,
        subject: `New order ${reference}: ${product.model} x${quantity} (${fullName})`,
        text:
          text(`New order from ${fullName}`) +
          `\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\n`,
        html: ownerHtml,
      }),
      transporter.sendMail({
        from: `"${storeName}" <${SMTP_USER}>`,
        to: `"${fullName}" <${email}>`,
        replyTo: ORDER_RECEIVER_EMAIL,
        subject: `Order confirmation ${reference} | ${storeName}`,
        text: text(`Thanks for your order, ${name}!`) + `\nWe'll contact you shortly.\n`,
        html: clientHtml,
      }),
    ]);
  } catch (err) {
    console.error("[order] sendMail failed", err);
    return fail(502, {
      ok: false,
      error: "We couldn't send your order. Please try again in a moment.",
    });
  }

  return NextResponse.json({ ok: true, reference } satisfies OrderResponse);
}
