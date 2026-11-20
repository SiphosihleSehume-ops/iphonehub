import { NextResponse } from "next/server";
import { formatRand } from "@/lib/format";
import { mailConfigured, sendMail } from "@/lib/mail";
import { getProduct, placeOrder, rollbackOrder } from "@/lib/store";
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
  const product = await getProduct(clean(raw.productId, 40));

  const fieldErrors: NonNullable<OrderResponse["fieldErrors"]> = {};
  if (name.length < 2) fieldErrors.name = "Enter your first name";
  if (surname.length < 2) fieldErrors.surname = "Enter your surname";
  if (!EMAIL_RE.test(email)) fieldErrors.email = "Enter a valid email address";
  if (phone.replace(/\D/g, "").length < 9) fieldErrors.phone = "Enter a valid phone number";
  if (address.length < 8) fieldErrors.address = "Enter your full delivery address";
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50)
    fieldErrors.quantity = "Enter a valid quantity";
  if (!product || !product.active) {
    return fail(400, { ok: false, error: "That iPhone is no longer available." });
  }
  if (!product.colors.includes(color)) fieldErrors.color = "Pick an available colour";

  if (Object.keys(fieldErrors).length) {
    return fail(422, { ok: false, error: "Please check the highlighted fields.", fieldErrors });
  }

  const ORDER_RECEIVER_EMAIL = process.env.ORDER_RECEIVER_EMAIL as string;
  if (!mailConfigured()) {
    console.error("[order] Mail service is not configured. See .env.example");
    return fail(500, { ok: false, error: "Our order system is temporarily unavailable." });
  }

  // Reserve the stock and record the order before emailing anyone.
  let placed;
  try {
    placed = await placeOrder({
      productId: product.id,
      color,
      quantity,
      name,
      surname,
      email,
      phone,
      address,
    });
  } catch (err) {
    console.error("[order] could not save order", err);
    return fail(500, { ok: false, error: "We couldn't save your order. Please try again." });
  }
  if (!placed.ok) return fail(409, { ok: false, error: placed.error });

  const order = placed.order;
  const reference = order.id;
  const fullName = `${name} ${surname}`;
  const storeName = process.env.STORE_NAME || "iPhoneHub";
  const orderRows =
    row("Reference", esc(reference)) +
    row("iPhone", `${esc(order.model)} (${esc(order.storage)})`) +
    row("Colour", esc(color)) +
    row("Condition", esc(product.condition)) +
    row("Quantity", String(quantity)) +
    row("Unit price", esc(formatRand(order.unitPrice))) +
    row("Total", esc(formatRand(order.total)));

  const ownerHtml = layout(
    `New order ${esc(reference)}`,
    `${esc(fullName)} just placed an order on the website. Reply to this email to reach the customer directly.`,
    orderRows +
      row("Customer", esc(fullName)) +
      row("Email", `<a href="mailto:${esc(email)}">${esc(email)}</a>`) +
      row("Phone", esc(phone)) +
      row("Address", esc(address)),
    "Sent automatically by the storefront order form."
  );

  const clientHtml = layout(
    `Thanks for your order, ${esc(name)}!`,
    `We've received your order and our team will contact you shortly to confirm payment and delivery. Here is what you asked for:`,
    orderRows + row("Deliver to", esc(address)) + row("Contact number", esc(phone)),
    `Questions? Just reply to this email and quote ${esc(reference)}. Every ${esc(storeName)} iPhone comes with a 12-month warranty.`
  );

  const text = (heading: string) =>
    `${heading}\n\nReference: ${reference}\n${order.model} ${order.storage} - ${color}\nQuantity: ${quantity}\nTotal: ${formatRand(order.total)}\n`;

  try {
    await Promise.all([
      sendMail(
        {
          to: ORDER_RECEIVER_EMAIL,
          replyTo: email,
          replyToName: fullName,
          subject: `New order ${reference}: ${order.model} x${quantity} (${fullName})`,
          text:
            text(`New order from ${fullName}`) +
            `\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\n`,
          html: ownerHtml,
        },
        `${storeName} Orders`
      ),
      sendMail(
        {
          to: email,
          toName: fullName,
          replyTo: ORDER_RECEIVER_EMAIL,
          subject: `Order confirmation ${reference} | ${storeName}`,
          text: text(`Thanks for your order, ${name}!`) + `\nWe'll contact you shortly.\n`,
          html: clientHtml,
        },
        storeName
      ),
    ]);
  } catch (err) {
    console.error("[order] sendMail failed", err);
    await rollbackOrder(order.id).catch((e) => console.error("[order] rollback failed", e));
    return fail(502, {
      ok: false,
      error: "We couldn't send your order. Please try again in a moment.",
    });
  }

  return NextResponse.json({ ok: true, reference } satisfies OrderResponse);
}
