"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { formatRand } from "@/lib/format";
import type { OrderPayload, OrderResponse, Product } from "@/lib/types";
import { CheckCircle, CloseIcon } from "./Icons";

interface OrderModalProps {
  product: Product;
  /** Everything currently in stock, for the iPhone type dropdown */
  products: Product[];
  onClose: () => void;
  onOrdered: () => void;
}

type Errors = Partial<Record<keyof OrderPayload, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v: OrderPayload, maxQty: number): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 2) e.name = "Enter your first name";
  if (v.surname.trim().length < 2) e.surname = "Enter your surname";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address";
  if (v.phone.replace(/[^\d]/g, "").length < 9) e.phone = "Enter a valid phone number";
  if (v.address.trim().length < 8) e.address = "Enter your full delivery address";
  if (!Number.isInteger(v.quantity) || v.quantity < 1) e.quantity = "Enter a quantity";
  else if (v.quantity > maxQty) e.quantity = `Only ${maxQty} in stock`;
  return e;
}

export default function OrderModal({ product, products, onClose, onOrdered }: OrderModalProps) {
  const [form, setForm] = useState<OrderPayload>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    address: "",
    quantity: 1,
    productId: product.id,
    model: product.model,
    storage: product.storage,
    color: product.colors[0],
    website: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [reference, setReference] = useState("");
  const firstField = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => products.find((p) => p.id === form.productId) ?? product,
    [form.productId, product, products]
  );
  const total = selected.price * (Number.isFinite(form.quantity) ? form.quantity : 1);

  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const set = <K extends keyof OrderPayload>(key: K, value: OrderPayload[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const onModelChange = (productId: string) => {
    const next = products.find((p) => p.id === productId);
    if (!next) return;
    setForm((f) => ({
      ...f,
      productId: next.id,
      model: next.model,
      storage: next.storage,
      color: next.colors.includes(f.color) ? f.color : next.colors[0],
      quantity: Math.min(f.quantity || 1, next.stock),
    }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate(form, selected.stock);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    setServerError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: OrderResponse = await res.json();
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setServerError(data.error ?? "We couldn't send your order. Please try again.");
        setStatus("error");
        return;
      }
      setReference(data.reference ?? "");
      setStatus("done");
      onOrdered();
    } catch {
      setServerError("Network problem. Check your connection and try again.");
      setStatus("error");
    }
  };

  return (
    <div
      className="modal"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal__panel" role="dialog" aria-modal="true" aria-labelledby="order-title">
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <CloseIcon />
        </button>

        {status === "done" ? (
          <div className="done">
            <CheckCircle />
            <h2 id="order-title">Order received</h2>
            <p>
              Thank you, {form.name}. A confirmation email is on its way to{" "}
              <strong>{form.email}</strong>, and our team will contact you to arrange payment and
              delivery.
            </p>
            {reference && <p className="done__ref">Reference: {reference}</p>}
            <button className="btn-navy" onClick={onClose}>
              Continue shopping
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="order-title">Complete your order</h2>
            <p className="modal__sub">
              {selected.model} &bull; {selected.storage} &bull; {formatRand(selected.price)} each
            </p>

            <div className="grid2">
              <Field label="First name" error={errors.name}>
                <input
                  ref={firstField}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  autoComplete="given-name"
                  maxLength={60}
                />
              </Field>
              <Field label="Surname" error={errors.surname}>
                <input
                  value={form.surname}
                  onChange={(e) => set("surname", e.target.value)}
                  autoComplete="family-name"
                  maxLength={60}
                />
              </Field>
              <Field label="Email" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  autoComplete="email"
                  maxLength={120}
                />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                  placeholder="e.g. 082 123 4567"
                  maxLength={25}
                />
              </Field>
            </div>

            <Field label="Delivery address" error={errors.address}>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                autoComplete="street-address"
                maxLength={250}
              />
            </Field>

            <div className="grid3">
              <Field label="iPhone type">
                <select value={form.productId} onChange={(e) => onModelChange(e.target.value)}>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.model} ({p.storage}, {p.condition})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Colour">
                <select value={form.color} onChange={(e) => set("color", e.target.value)}>
                  {selected.colors.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Quantity" error={errors.quantity}>
                <input
                  type="number"
                  min={1}
                  max={selected.stock}
                  value={Number.isFinite(form.quantity) ? form.quantity : ""}
                  onChange={(e) => set("quantity", parseInt(e.target.value, 10))}
                />
              </Field>
            </div>

            {/* honeypot: real visitors never see or fill this */}
            <input
              className="hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              name="website"
            />

            <div className="modal__total">
              <span>Total</span>
              <strong>{formatRand(total)}</strong>
            </div>

            {serverError && (
              <p className="form-error" role="alert">
                {serverError}
              </p>
            )}

            <button className="btn-navy btn-navy--lg" disabled={status === "sending"}>
              {status === "sending" ? "Sending order..." : "Place order"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`field ${error ? "field--error" : ""}`}>
      <span className="field__label">{label}</span>
      {children}
      {error && <span className="field__msg">{error}</span>}
    </label>
  );
}
