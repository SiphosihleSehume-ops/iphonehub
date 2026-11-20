"use client";

import { useEffect, useRef, useState } from "react";
import { formatRand } from "@/lib/format";
import type { Product } from "@/lib/types";
import { BoxIcon, PencilIcon, PlusIcon, TrashIcon } from "./AdminIcons";

const PAGE_SIZE = 5;

interface Props {
  products: Product[];
  total: number;
  onAddClick: () => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  onPatch: (id: string, patch: Partial<Product>) => Promise<void>;
}

export function stockState(p: Product): { label: string; cls: string } {
  if (p.stock <= 0) return { label: "Out of Stock", cls: "out" };
  if (p.stock <= 3) return { label: "Low Stock", cls: "low" };
  return { label: "In Stock", cls: "in" };
}

/** Number that turns into an input when clicked. Enter saves, Esc cancels. */
function InlineNumber({
  value,
  format,
  label,
  onSave,
}: {
  value: number;
  format: (n: number) => string;
  label: string;
  onSave: (n: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const cancelled = useRef(false);

  useEffect(() => setDraft(String(value)), [value]);

  const commit = async () => {
    setEditing(false);
    const n = parseInt(draft, 10);
    if (cancelled.current || !Number.isFinite(n) || n === value) {
      setDraft(String(value));
      return;
    }
    await onSave(n).catch(() => setDraft(String(value)));
  };

  if (editing) {
    return (
      <input
        className="adm-inline-input"
        autoFocus
        inputMode="numeric"
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") {
            cancelled.current = true;
            e.currentTarget.blur();
          }
        }}
      />
    );
  }
  return (
    <button
      type="button"
      className="adm-inline"
      title={`Click to change ${label.toLowerCase()}`}
      onClick={() => {
        cancelled.current = false;
        setDraft(String(value));
        setEditing(true);
      }}
    >
      {format(value)}
    </button>
  );
}

export default function ProductsTable({ products, total, onAddClick, onEdit, onDelete, onPatch }: Props) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = products.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = products.length ? (current - 1) * PAGE_SIZE + 1 : 0;

  useEffect(() => {
    if (page > pages) setPage(pages);
  }, [page, pages]);

  return (
    <section className="adm-card">
      <div className="adm-card__head">
        <h2 className="adm-card__title">
          <BoxIcon width={22} height={22} className="adm-card__icon" />
          Products Management
        </h2>
        <button className="adm-btn adm-btn--primary" onClick={onAddClick}>
          <PlusIcon width={16} height={16} /> Add Product
        </button>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table adm-table--products">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Details</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Visible</th>
              <th className="is-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((p) => {
              const st = stockState(p);
              return (
                <tr key={p.id} className={p.active ? "" : "is-hidden"}>
                  <td>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="adm-thumb" src={p.image} alt="" />
                  </td>
                  <td>
                    <strong>{p.model}</strong>
                    <span className="adm-sub">
                      {p.storage} &bull; {p.colors[0]} &bull; {p.condition}
                    </span>
                  </td>
                  <td>
                    <InlineNumber
                      value={p.price}
                      format={formatRand}
                      label="Price"
                      onSave={(price) => onPatch(p.id, { price })}
                    />
                  </td>
                  <td>
                    <span className={`adm-badge adm-badge--${st.cls}`}>{st.label}</span>
                    <span className="adm-qty">
                      <InlineNumber
                        value={p.stock}
                        format={(n) => `${n} units`}
                        label="Stock"
                        onSave={(stock) => onPatch(p.id, { stock })}
                      />
                    </span>
                  </td>
                  <td>
                    <label className="adm-toggle" title={p.active ? "Shown on website" : "Hidden"}>
                      <input
                        type="checkbox"
                        checked={p.active}
                        onChange={(e) => void onPatch(p.id, { active: e.target.checked })}
                        aria-label={`Show ${p.model} on website`}
                      />
                      <i aria-hidden="true" />
                    </label>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-icon" onClick={() => onEdit(p)} aria-label={`Edit ${p.model}`}>
                        <PencilIcon />
                      </button>
                      <button className="adm-icon" onClick={() => onDelete(p)} aria-label={`Delete ${p.model}`}>
                        <TrashIcon />
                      </button>
                      {p.active ? (
                        <a className="adm-btn adm-btn--small" href={`/#${p.id}`} target="_blank" rel="noreferrer">
                          View
                        </a>
                      ) : (
                        <span className="adm-btn adm-btn--small is-disabled">View</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!slice.length && (
              <tr>
                <td colSpan={6} className="adm-empty">
                  {total ? "No products match your search." : "No products yet. Add your first iPhone."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="adm-pager">
        <span>
          Showing {from}&ndash;{Math.min(current * PAGE_SIZE, products.length)} of {products.length} products
        </span>
        {pages > 1 && (
          <div>
            <button disabled={current === 1} onClick={() => setPage(current - 1)} aria-label="Previous page">
              &lsaquo;
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button
                key={i}
                className={i + 1 === current ? "is-on" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button disabled={current === pages} onClick={() => setPage(current + 1)} aria-label="Next page">
              &rsaquo;
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
