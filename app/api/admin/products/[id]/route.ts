import { NextResponse } from "next/server";
import { parseProduct } from "@/lib/productInput";
import { deleteProduct, updateProduct } from "@/lib/store";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = parseProduct(body, true);
  if (!parsed.ok) {
    return NextResponse.json(
      { error: "Please fix the highlighted fields.", fieldErrors: parsed.errors },
      { status: 422 }
    );
  }
  try {
    const product = await updateProduct(id, parsed.value);
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const removed = await deleteProduct(id);
    if (!removed) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
