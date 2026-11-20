"use client";

import { formatRand } from "@/lib/format";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} • ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
};

const tone: Record<OrderStatus, string> = {
  Pending: "pending",
  Confirmed: "confirmed",
  Delivered: "in",
  Cancelled: "out",
};

export function OrderBadge({ status }: { status: OrderStatus }) {
  return <span className={`adm-badge adm-badge--${tone[status]}`}>{status}</span>;
}

/** Compact version used on the dashboard */
export function RecentOrders({
  orders,
  onViewAll,
}: {
  orders: Order[];
  onViewAll: () => void;
}) {
  return (
    <section className="adm-card">
      <div className="adm-card__head">
        <h2 className="adm-card__title">Recent Orders</h2>
        <button className="adm-link" onClick={onViewAll}>
          View All Orders &rarr;
        </button>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table adm-table--compact">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 4).map((o) => (
              <tr key={o.id}>
                <td>
                  <strong>#{o.id}</strong>
                </td>
                <td>
                  {o.name} {o.surname}
                </td>
                <td>
                  {o.model} ({o.storage})
                </td>
                <td>
                  <strong>{formatRand(o.total)}</strong>
                </td>
                <td>
                  <OrderBadge status={o.status} />
                </td>
                <td className="adm-muted">{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={6} className="adm-empty">
                  Orders from the website will show up here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Full list with delivery details and status control */
export default function OrdersTable({
  orders,
  onStatus,
}: {
  orders: Order[];
  onStatus: (id: string, status: OrderStatus) => Promise<void>;
}) {
  return (
    <section className="adm-card">
      <div className="adm-card__head">
        <h2 className="adm-card__title">All Orders</h2>
        <span className="adm-muted">{orders.length} total</span>
      </div>
      <div className="adm-table-wrap">
        <table className="adm-table adm-table--orders">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Delivery</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <strong>#{o.id}</strong>
                </td>
                <td>
                  <strong>
                    {o.name} {o.surname}
                  </strong>
                  <span className="adm-sub">
                    <a href={`mailto:${o.email}`}>{o.email}</a>
                  </span>
                  <span className="adm-sub">
                    <a href={`tel:${o.phone.replace(/\s/g, "")}`}>{o.phone}</a>
                  </span>
                </td>
                <td className="adm-address">{o.address}</td>
                <td>
                  {o.model} ({o.storage})
                  <span className="adm-sub">
                    {o.color} &times; {o.quantity}
                  </span>
                </td>
                <td>
                  <strong>{formatRand(o.total)}</strong>
                </td>
                <td>
                  <select
                    className={`adm-status adm-status--${tone[o.status]}`}
                    value={o.status}
                    onChange={(e) => void onStatus(o.id, e.target.value as OrderStatus)}
                    aria-label={`Status for order ${o.id}`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="adm-muted">{fmtDate(o.createdAt)}</td>
              </tr>
            ))}
            {!orders.length && (
              <tr>
                <td colSpan={7} className="adm-empty">
                  No orders yet. They appear here the moment a customer checks out.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
