"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatRand } from "@/lib/format";
import type { Order, OrderStatus, Product } from "@/lib/types";
import { SearchIcon } from "../Icons";
import {
  BellIcon,
  BoltIcon,
  BoxIcon,
  CartIcon2,
  ExternalIcon,
  HomeIcon,
  LogoPhone,
  LogoutIcon,
  PlusIcon,
  StoreIcon,
  UsersIcon,
} from "./AdminIcons";
import { api } from "./api";
import OrdersTable, { RecentOrders } from "./OrdersTable";
import ProductForm from "./ProductForm";
import ProductsTable from "./ProductsTable";

type View = "dashboard" | "products" | "orders";

const DAYS = 14;

/** Running total at the end of each of the last 14 days, for the little trend lines */
function cumulative<T>(items: T[], dateOf: (t: T) => string, valueOf: (t: T) => number): number[] {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return Array.from({ length: DAYS }, (_, i) => {
    const cutoff = new Date(end);
    cutoff.setDate(cutoff.getDate() - (DAYS - 1 - i));
    return items.reduce((sum, t) => (new Date(dateOf(t)) <= cutoff ? sum + valueOf(t) : sum), 0);
  });
}

function Spark({ values, tone }: { values: number[]; tone: string }) {
  const w = 112;
  const h = 44;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * w,
    h - 5 - ((v - min) / span) * (h - 14),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return (
    <svg className={`adm-spark adm-spark--${tone}`} width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <path d={`${line} L${w} ${h} L0 ${h} Z`} className="adm-spark__fill" />
      <path d={line} className="adm-spark__line" />
    </svg>
  );
}

export default function AdminApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [view, setView] = useState<View>("dashboard");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = useCallback((text: string, bad = false) => {
    setToast({ text, bad });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  useEffect(() => {
    Promise.all([
      api<{ products: Product[] }>("/api/admin/products"),
      api<{ orders: Order[] }>("/api/admin/orders"),
    ])
      .then(([p, o]) => {
        setProducts(p.products);
        setOrders(o.orders);
        setLoaded(true);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  const replace = (p: Product) =>
    setProducts((list) => list.map((x) => (x.id === p.id ? p : x)));

  const focusForm = () =>
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    );

  const saveProduct = async (payload: Record<string, unknown>) => {
    if (editing) {
      const { product } = await api<{ product: Product }>(`/api/admin/products/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      replace(product);
      flash(`${product.model} updated`);
    } else {
      const { product } = await api<{ product: Product }>("/api/admin/products", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setProducts((list) => [...list, product]);
      flash(product.active ? `${product.model} is now live on the website` : `${product.model} saved (hidden)`);
    }
    setEditing(null);
    setFormVersion((v) => v + 1);
  };

  const patchProduct = async (id: string, patch: Partial<Product>) => {
    try {
      const { product } = await api<{ product: Product }>(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
      replace(product);
      flash("Saved");
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  const removeProduct = async () => {
    if (!deleting) return;
    const target = deleting;
    setDeleting(null);
    try {
      await api(`/api/admin/products/${target.id}`, { method: "DELETE" });
      setProducts((list) => list.filter((p) => p.id !== target.id));
      if (editing?.id === target.id) {
        setEditing(null);
        setFormVersion((v) => v + 1);
      }
      flash(`${target.model} deleted`);
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  const setStatus = async (id: string, status: OrderStatus) => {
    try {
      const { order } = await api<{ order: Order }>(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((list) => list.map((o) => (o.id === order.id ? order : o)));
    } catch (e) {
      flash((e as Error).message, true);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };

  /* ---------- derived numbers ---------- */
  const q = query.trim().toLowerCase();
  const shownProducts = useMemo(
    () =>
      products
        .filter(
          (p) =>
            !q ||
            `${p.model} ${p.storage} ${p.colors.join(" ")} ${p.condition}`.toLowerCase().includes(q)
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [products, q]
  );
  const shownOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          !q ||
          `${o.id} ${o.name} ${o.surname} ${o.email} ${o.model} ${o.status}`.toLowerCase().includes(q)
      ),
    [orders, q]
  );

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.status !== "Cancelled");
    const firstSeen = new Map<string, string>();
    [...orders]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach((o) => {
        const key = o.email.toLowerCase();
        if (!firstSeen.has(key)) firstSeen.set(key, o.createdAt);
      });
    const customers = [...firstSeen.values()];
    const since = Date.now() - 30 * 864e5;
    const recent = <T,>(list: T[], dateOf: (t: T) => string) =>
      list.filter((t) => new Date(dateOf(t)).getTime() >= since);
    const revenue = live.reduce((s, o) => s + o.total, 0);
    return {
      products: {
        total: products.length,
        delta: recent(products, (p) => p.createdAt).length,
        series: cumulative(products, (p) => p.createdAt, () => 1),
      },
      orders: {
        total: orders.length,
        delta: recent(orders, (o) => o.createdAt).length,
        series: cumulative(orders, (o) => o.createdAt, () => 1),
      },
      customers: {
        total: customers.length,
        delta: recent(customers, (d) => d).length,
        series: cumulative(customers, (d) => d, () => 1),
      },
      revenue: {
        total: revenue,
        delta: recent(live, (o) => o.createdAt).reduce((s, o) => s + o.total, 0),
        series: cumulative(live, (o) => o.createdAt, (o) => o.total),
      },
    };
  }, [products, orders]);

  const pending = orders.filter((o) => o.status === "Pending").length;

  const nav: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: <HomeIcon /> },
    { id: "products", label: "Products", icon: <BoxIcon /> },
    { id: "orders", label: "Orders", icon: <CartIcon2 />, badge: pending },
  ];

  const productsTable = (
    <ProductsTable
      products={shownProducts}
      total={products.length}
      onAddClick={() => {
        setEditing(null);
        setFormVersion((v) => v + 1);
        focusForm();
      }}
      onEdit={(p) => {
        setEditing(p);
        focusForm();
      }}
      onDelete={setDeleting}
      onPatch={patchProduct}
    />
  );

  const form = (
    <div ref={formRef} className="adm-formwrap">
      <ProductForm
        key={`${editing?.id ?? "new"}-${formVersion}`}
        initial={editing}
        onSubmit={saveProduct}
        onCancel={() => {
          setEditing(null);
          setFormVersion((v) => v + 1);
        }}
      />
    </div>
  );

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">
          <LogoPhone />
          <span>
            iPhone<em>Hub</em>
          </span>
        </div>

        <nav className="adm-nav" aria-label="Admin">
          {nav.map((n) => (
            <button
              key={n.id}
              className={view === n.id ? "is-on" : ""}
              onClick={() => setView(n.id)}
              aria-current={view === n.id ? "page" : undefined}
            >
              {n.icon}
              {n.label}
              {n.badge ? <b>{n.badge}</b> : null}
            </button>
          ))}
          <button onClick={signOut}>
            <LogoutIcon />
            Logout
          </button>
        </nav>

        <div className="adm-portal">
          <StoreIcon />
          <strong>Merchant Portal</strong>
          <span>Manage your store with ease.</span>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-top">
          <label className="adm-search">
            <SearchIcon width={20} height={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, orders, or customers..."
              aria-label="Search"
            />
          </label>
          <div className="adm-top__right">
            <button className="adm-bell" onClick={() => setView("orders")} aria-label={`${pending} pending orders`}>
              <BellIcon />
              {pending > 0 && <b>{pending}</b>}
            </button>
            <div className="adm-user">
              <span className="adm-avatar">M</span>
              Merchant
            </div>
          </div>
        </header>

        <main className="adm-content">
          <h1>{view === "dashboard" ? "Dashboard" : view === "products" ? "Products" : "Orders"}</h1>
          <p className="adm-lead">
            {view === "dashboard"
              ? "Welcome back! Here's what's happening with your store."
              : view === "products"
                ? "Add, price and hide the iPhones shown on your website."
                : "Every order placed on the website, newest first."}
          </p>

          {loadError && <p className="adm-alert">{loadError}</p>}
          {!loaded && !loadError && <p className="adm-muted">Loading...</p>}

          {loaded && view === "dashboard" && (
            <>
              <div className="adm-stats">
                {[
                  { key: "products", label: "Total Products", icon: <BoxIcon width={30} height={30} />, tone: "blue", value: String(stats.products.total), delta: `+${stats.products.delta}` },
                  { key: "orders", label: "Total Orders", icon: <CartIcon2 width={30} height={30} />, tone: "orange", value: String(stats.orders.total), delta: `+${stats.orders.delta}` },
                  { key: "customers", label: "Total Customers", icon: <UsersIcon width={30} height={30} />, tone: "blue", value: String(stats.customers.total), delta: `+${stats.customers.delta}` },
                  { key: "revenue", label: "Total Revenue", icon: <span className="adm-rand">R</span>, tone: "green", value: formatRand(stats.revenue.total).replace("R ", "R"), delta: `+${formatRand(stats.revenue.delta).replace("R ", "R")}` },
                ].map((s) => (
                  <div key={s.key} className="adm-stat">
                    <span className={`adm-stat__icon adm-stat__icon--${s.tone}`}>{s.icon}</span>
                    <div className="adm-stat__body">
                      <span>{s.label}</span>
                      <strong>{s.value}</strong>
                      <em title="Added in the last 30 days">{s.delta} <small>30d</small></em>
                    </div>
                    <Spark values={stats[s.key as keyof typeof stats].series} tone={s.tone} />
                  </div>
                ))}
              </div>

              <div className="adm-grid">
                <div className="adm-grid__products">{productsTable}</div>
                <div className="adm-grid__form">{form}</div>
                <div className="adm-grid__bottom">
                  <RecentOrders orders={shownOrders} onViewAll={() => setView("orders")} />
                  <section className="adm-card">
                    <h2 className="adm-card__title">
                      <BoltIcon width={20} height={20} className="adm-card__icon" /> Quick Actions
                    </h2>
                    <div className="adm-quick">
                      <button
                        onClick={() => {
                          setEditing(null);
                          setFormVersion((v) => v + 1);
                          focusForm();
                        }}
                      >
                        <PlusIcon width={22} height={22} />
                        Add Product
                      </button>
                      <button onClick={() => setView("products")}>
                        <BoxIcon width={22} height={22} />
                        Manage Stock
                      </button>
                      <a href="/" target="_blank" rel="noreferrer">
                        <ExternalIcon width={22} height={22} />
                        View Store
                      </a>
                    </div>
                  </section>
                </div>
              </div>
            </>
          )}

          {loaded && view === "products" && (
            <div className="adm-grid adm-grid--two">
              <div className="adm-grid__products">{productsTable}</div>
              <div className="adm-grid__form">{form}</div>
            </div>
          )}

          {loaded && view === "orders" && <OrdersTable orders={shownOrders} onStatus={setStatus} />}
        </main>
      </div>

      {deleting && (
        <div className="adm-modal" onMouseDown={(e) => e.target === e.currentTarget && setDeleting(null)}>
          <div className="adm-dialog" role="alertdialog" aria-labelledby="del-title">
            <h2 id="del-title">Delete {deleting.model}?</h2>
            <p>
              {deleting.model} ({deleting.storage}) will be removed from the website for good. To
              keep it but hide it, switch off &ldquo;Visible&rdquo; instead.
            </p>
            <div>
              <button className="adm-btn adm-btn--ghost" onClick={() => setDeleting(null)}>
                Keep it
              </button>
              <button className="adm-btn adm-btn--danger" onClick={removeProduct}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`adm-toast ${toast.bad ? "is-bad" : ""}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}
