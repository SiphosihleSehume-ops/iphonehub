import { NextResponse } from "next/server";
import { setOrderStatus } from "@/lib/store";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!ORDER_STATUSES.includes(body?.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 422 });
  }
  try {
    const order = await setOrderStatus(id, body.status as OrderStatus);
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
