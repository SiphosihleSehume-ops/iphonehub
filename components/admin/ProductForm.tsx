"use client";

import { FormEvent, useRef, useState } from "react";
import { CONDITIONS, type Product } from "@/lib/types";
import { ApiError, imageToDataUrl } from "./api";
import { PlusIcon, UploadCloud } from "./AdminIcons";

interface Props {
  /** null = adding a new product */
  initial: Product | null;
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

const STORAGES = ["64GB", "128GB", "256GB", "512GB", "1TB"];
const MODELS = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max",
  "iPhone 16", "iPhone 16 Plus", "iPhone 16 Pro", "iPhone 16 Pro Max",
];

export default function ProductForm({ initial, onSubmit, onCancel }: Props) {
  const editing = Boolean(initial);
  const [model, setModel] = useState(initial?.model ?? "");
  const [storage, setStorage] = useState(initial?.storage ?? "");
  const [colors, setColors] = useState(initial?.colors.join(", ") ?? "");
  const [condition, setCondition] = useState<string>(initial?.condition ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [oldPrice, setOldPrice] = useState(
    initial && initial.oldPrice > 0 ? String(initial.oldPrice) : ""
  );
  const [stock, setStock] = useState(initial ? String(initial.stock) : "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [image, setImage] = useState<string | undefined>(initial?.image);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = async (file?: File) => {
    if (!file) return;
    try {
      setImage(await imageToDataUrl(file));
      setErrors((e) => ({ ...e, image: "" }));
    } catch (err) {
      setErrors((e) => ({ ...e, image: (err as Error).message }));
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setErrors({});
    try {
      await onSubmit({
        model,
        storage,
        colors,
        condition,
        price,
        oldPrice,
        stock,
        active,
        ...(image ? { image } : {}),
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors ?? {});
        setMessage(err.message);
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const field = (name: string) => (errors[name] ? "adm-field adm-field--error" : "adm-field");
  const err = (name: string) =>
    errors[name] ? <span className="adm-field__msg">{errors[name]}</span> : null;

  return (
    <form className="adm-card adm-form" onSubmit={submit} noValidate>
      <h2 className="adm-card__title">
        <span className="adm-card__plus">
          <PlusIcon width={16} height={16} />
        </span>
        {editing ? "Edit Product" : "Add New Product"}
      </h2>

      <label className={field("model")}>
        <span>Model *</span>
        <input
          list="adm-models"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. iPhone 15 Pro"
          maxLength={40}
        />
        <datalist id="adm-models">
          {MODELS.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
        {err("model")}
      </label>

      <div className="adm-row">
        <label className={field("storage")}>
          <span>Storage *</span>
          <select value={storage} onChange={(e) => setStorage(e.target.value)}>
            <option value="" disabled>
              Select storage
            </option>
            {STORAGES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          {err("storage")}
        </label>
        <label className={field("condition")}>
          <span>Condition *</span>
          <select value={condition} onChange={(e) => setCondition(e.target.value)}>
            <option value="" disabled>
              Select condition
            </option>
            {CONDITIONS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {err("condition")}
        </label>
      </div>

      <label className={field("colors")}>
        <span>Colours *</span>
        <input
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          placeholder="Pink, Black, Blue"
        />
        <small>Separate with commas. The first one is shown on the card.</small>
        {err("colors")}
      </label>

      <div className="adm-row">
        <label className={field("price")}>
          <span>Price (ZAR) *</span>
          <input
            inputMode="numeric"
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 12999"
          />
          {err("price")}
        </label>
        <label className={field("oldPrice")}>
          <span>Was price</span>
          <input
            inputMode="numeric"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value.replace(/\D/g, ""))}
            placeholder="optional"
          />
          {err("oldPrice")}
        </label>
      </div>

      <label className={field("stock")}>
        <span>Stock Quantity *</span>
        <input
          inputMode="numeric"
          value={stock}
          onChange={(e) => setStock(e.target.value.replace(/\D/g, ""))}
          placeholder="e.g. 10"
        />
        {err("stock")}
      </label>

      <div className={field("image")}>
        <span>Product Image</span>
        <div
          className={`adm-drop ${drag ? "is-drag" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            void pickFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileRef.current?.click()}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="Preview" />
          ) : (
            <UploadCloud />
          )}
          <p>
            {image ? "Click or drop to replace" : "Drag & drop an image here"}
            {!image && (
              <>
                <br />
                or click to upload
              </>
            )}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              void pickFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {err("image")}
      </div>

      <label className="adm-switchrow">
        <span>
          Show on website
          <small>Turn off to hide it without deleting.</small>
        </span>
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        <i className="adm-switch" aria-hidden="true" />
      </label>

      {message && (
        <p className="adm-alert" role="alert">
          {message}
        </p>
      )}

      <div className="adm-form__actions">
        <button className="adm-btn adm-btn--primary adm-btn--block" disabled={busy}>
          <PlusIcon width={17} height={17} />
          {busy ? "Saving..." : editing ? "Save Changes" : "Add Product"}
        </button>
        {editing && (
          <button type="button" className="adm-btn adm-btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
