import { CONDITIONS, type Condition } from "./types";
import type { ProductInput } from "./store";

const MAX_IMAGE_CHARS = 900_000; // roughly 650 KB of image data
const IMAGE_RE = /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/;

type Raw = Record<string, unknown>;

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

function whole(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN;
  return Number.isFinite(n) && Number.isInteger(n) ? n : null;
}

export function parseColors(v: unknown): string[] {
  const list = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list) {
    const c = text(item, 24);
    if (c && !seen.has(c.toLowerCase())) {
      seen.add(c.toLowerCase());
      out.push(c);
    }
  }
  return out.slice(0, 10);
}

/**
 * Validates a product body. With `partial` only the fields that are present are
 * checked, which lets the table update just a price, stock or visibility.
 */
export function parseProduct(
  body: Raw,
  partial: boolean
): { ok: true; value: Partial<ProductInput> } | { ok: false; errors: Record<string, string> } {
  const value: Partial<ProductInput> = {};
  const errors: Record<string, string> = {};
  const has = (k: string) => body[k] !== undefined;

  if (!partial || has("model")) {
    const model = text(body.model, 40);
    if (model.length < 2) errors.model = "Enter the model, e.g. iPhone 15 Pro";
    else value.model = model;
  }

  if (!partial || has("storage")) {
    const m = text(body.storage, 8).replace(/\s/g, "").match(/^(\d{2,4})(GB|TB)$/i);
    if (!m) errors.storage = "Choose a storage size";
    else value.storage = `${m[1]}${m[2].toUpperCase()}`;
  }

  if (!partial || has("colors")) {
    const colors = parseColors(body.colors);
    if (!colors.length) errors.colors = "Add at least one colour";
    else value.colors = colors;
  }

  if (!partial || has("condition")) {
    if (!CONDITIONS.includes(body.condition as Condition)) errors.condition = "Choose a condition";
    else value.condition = body.condition as Condition;
  }

  if (!partial || has("price")) {
    const price = whole(body.price);
    if (price === null || price < 1 || price > 1_000_000) errors.price = "Enter a price in rand";
    else value.price = price;
  }

  if (has("oldPrice") && body.oldPrice !== "" && body.oldPrice !== null) {
    const old = whole(body.oldPrice);
    if (old === null || old < 0 || old > 1_000_000) errors.oldPrice = "Enter a valid amount";
    else value.oldPrice = old;
  } else if (!partial) {
    value.oldPrice = 0;
  }

  if (!partial || has("stock")) {
    const stock = whole(body.stock);
    if (stock === null || stock < 0 || stock > 9999) errors.stock = "Enter a stock quantity";
    else value.stock = stock;
  }

  if (has("active")) value.active = Boolean(body.active);
  else if (!partial) value.active = true;

  if (has("image")) {
    const image = typeof body.image === "string" ? body.image : "";
    if (image.startsWith("/images/") && !image.includes("..")) value.image = image;
    else if (image.length <= MAX_IMAGE_CHARS && IMAGE_RE.test(image)) value.image = image;
    else errors.image = "Upload a PNG, JPG or WebP photo under 600 KB";
  } else if (!partial) {
    value.image = "/images/placeholder.svg";
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
