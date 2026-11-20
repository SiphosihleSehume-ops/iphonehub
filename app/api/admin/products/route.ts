import { NextResponse } from "next/server";
import { parseProduct } from "@/lib/productInput";
import { createProduct, listProducts, type ProductInput } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ products: await listProducts() });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parseProduct(body, false);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fieldErrors: parsed.errors },
      { status: 422 }
    );
  }
  try {
    const product = await createProduct(parsed.value as ProductInput);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
