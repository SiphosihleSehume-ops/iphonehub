"use client";

import { useCallback, useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import Filters, { FilterState } from "./Filters";
import Header from "./Header";
import Hero from "./Hero";
import { ChevronDown, GridIcon, ListIcon } from "./Icons";
import OrderModal from "./OrderModal";
import ProductCard from "./ProductCard";

type Sort = "popular" | "newest" | "price-asc" | "price-desc";

const SORT_LABELS: Record<Sort, string> = {
  popular: "Most Popular",
  newest: "Newest",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
};

const num = (s: string) => parseInt(s, 10) || 0;

export default function Storefront({ products }: { products: Product[] }) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    models: [],
    storages: [],
    conditions: [],
  });
  const [sort, setSort] = useState<Sort>("popular");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [active, setActive] = useState<Product | null>(null);
  const [orders, setOrders] = useState(0);

  // Filter options follow whatever the merchant has listed.
  const modelOptions = useMemo(
    () =>
      [...new Set(products.map((p) => p.model))].sort(
        (a, b) => num(b.replace(/\D+/, "")) - num(a.replace(/\D+/, "")) || a.localeCompare(b)
      ),
    [products]
  );
  const storageOptions = useMemo(
    () =>
      [...new Set(products.map((p) => p.storage))].sort((a, b) => {
        const size = (s: string) => num(s) * (s.toUpperCase().includes("TB") ? 1024 : 1);
        return size(a) - size(b);
      }),
    [products]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => {
      if (filters.models.length && !filters.models.includes(p.model)) return false;
      if (filters.storages.length && !filters.storages.includes(p.storage)) return false;
      if (filters.conditions.length && !filters.conditions.includes(p.condition)) return false;
      if (q && !`${p.model} ${p.colors.join(" ")} ${p.storage}`.toLowerCase().includes(q))
        return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "newest") return b.createdAt.localeCompare(a.createdAt);
      return b.sold - a.sold || b.createdAt.localeCompare(a.createdAt);
    });
  }, [products, query, filters, sort]);

  const closeModal = useCallback(() => setActive(null), []);

  return (
    <>
      <Header cartCount={orders} query={query} onQueryChange={setQuery} />

      <main>
        <div className="container">
          <Hero />

          <div className="shop" id="products">
            <Filters
              value={filters}
              onChange={setFilters}
              models={modelOptions}
              storages={storageOptions}
            />

            <section className="shop__main" aria-label="Products">
              <div className="toolbar">
                <p>
                  Showing {visible.length ? `1–${visible.length}` : "0"} of {products.length}{" "}
                  iPhones
                </p>

                <div className="toolbar__right">
                  <label className="sort">
                    <span>Sort by: {SORT_LABELS[sort]}</span>
                    <ChevronDown width={16} height={16} />
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as Sort)}
                      aria-label="Sort products"
                    >
                      {(Object.keys(SORT_LABELS) as Sort[]).map((k) => (
                        <option key={k} value={k}>
                          {SORT_LABELS[k]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    className={`view-btn ${view === "grid" ? "view-btn--on" : ""}`}
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                  >
                    <GridIcon width={22} height={22} />
                  </button>
                  <button
                    className={`view-btn ${view === "list" ? "view-btn--on" : ""}`}
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                  >
                    <ListIcon width={22} height={22} />
                  </button>
                </div>
              </div>

              {visible.length ? (
                <div className={`grid grid--${view}`}>
                  {visible.map((p) => (
                    <ProductCard key={p.id} product={p} onAdd={setActive} />
                  ))}
                </div>
              ) : (
                <p className="empty">
                  {products.length
                    ? "No iPhones match those filters yet."
                    : "New stock is on its way. Please check back soon."}
                </p>
              )}
            </section>
          </div>
        </div>
      </main>

      {active && (
        <OrderModal
          key={active.id}
          product={active}
          products={products.filter((p) => p.stock > 0)}
          onClose={closeModal}
          onOrdered={() => setOrders((n) => n + 1)}
        />
      )}
    </>
  );
}
