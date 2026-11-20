import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { seedProducts } from "../products";
import type { Order, OrderStatus, Product } from "../types";
import type { NewOrder, PlaceResult, ProductInput, Store } from "./types";

/**
 * JSON-file storage, used when DATABASE_URL is not set (local development).
 * It needs a writable disk, so it does NOT work on Vercel or on Railway without
 * a volume. Set DATABASE_URL there to use Postgres instead (see ./postgres.ts).
 */
const DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DIR, "products.json");
const ORDERS_FILE = path.join(DIR, "orders.json");

/* One write at a time so two requests can't overwrite each other. */
let queue: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readFile<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

async function writeFile(file: string, data: unknown) {
  try {
    await fs.mkdir(DIR, { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, file);
  } catch (err) {
    console.error("[store] write failed", err);
    throw new Error(
      "No database connected. Add a DATABASE_URL (Postgres) to your environment variables to save products and orders on this host."
    );
  }
}

async function loadProducts(): Promise<Product[]> {
  const found = await readFile<Product[]>(PRODUCTS_FILE);
  if (found) return found;
  try {
    await writeFile(PRODUCTS_FILE, seedProducts);
  } catch {
    /* read-only disk: still show the starter catalogue */
  }
  return seedProducts;
}

async function loadOrders(): Promise<Order[]> {
  return (await readFile<Order[]>(ORDERS_FILE)) ?? [];
}

/* ------------------------------- products ------------------------------- */

export async function listProducts(): Promise<Product[]> {
  return loadProducts();
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await loadProducts()).find((p) => p.id === id);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return locked(async () => {
    const all = await loadProducts();
    const product: Product = {
      ...input,
      id: `p-${randomBytes(4).toString("hex")}`,
      sold: 0,
      createdAt: new Date().toISOString(),
    };
    await writeFile(PRODUCTS_FILE, [...all, product]);
    return product;
  });
}

export function updateProduct(
  id: string,
  patch: Partial<ProductInput>
): Promise<Product | null> {
  return locked(async () => {
    const all = await loadProducts();
    const i = all.findIndex((p) => p.id === id);
    if (i === -1) return null;
    const next = { ...all[i], ...patch };
    all[i] = next;
    await writeFile(PRODUCTS_FILE, all);
    return next;
  });
}

export function deleteProduct(id: string): Promise<boolean> {
  return locked(async () => {
    const all = await loadProducts();
    const rest = all.filter((p) => p.id !== id);
    if (rest.length === all.length) return false;
    await writeFile(PRODUCTS_FILE, rest);
    return true;
  });
}

/* -------------------------------- orders -------------------------------- */

export async function listOrders(): Promise<Order[]> {
  const orders = await loadOrders();
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Checks stock, reserves it and records the order in one locked step. */
export function placeOrder(input: NewOrder): Promise<PlaceResult> {
  return locked(async () => {
    const products = await loadProducts();
    const i = products.findIndex((p) => p.id === input.productId);
    const product = products[i];
    if (!product || !product.active) {
      return { ok: false as const, error: "That iPhone is no longer available." };
    }
    if (product.stock < input.quantity) {
      return {
        ok: false as const,
        error:
          product.stock > 0
            ? `Only ${product.stock} left in stock for the ${product.model}.`
            : `The ${product.model} is sold out.`,
      };
    }

    const order: Order = {
      id: `IH-${randomBytes(3).toString("hex").toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "Pending",
      name: input.name,
      surname: input.surname,
      email: input.email,
      phone: input.phone,
      address: input.address,
      productId: product.id,
      model: product.model,
      storage: product.storage,
      color: input.color,
      quantity: input.quantity,
      unitPrice: product.price,
      total: product.price * input.quantity,
    };

    products[i] = {
      ...product,
      stock: product.stock - input.quantity,
      sold: product.sold + input.quantity,
    };
    const orders = await loadOrders();
    await writeFile(PRODUCTS_FILE, products);
    await writeFile(ORDERS_FILE, [...orders, order]);
    return { ok: true as const, order };
  });
}

/** Undo placeOrder when the confirmation emails could not be sent. */
export function rollbackOrder(orderId: string): Promise<void> {
  return locked(async () => {
    const orders = await loadOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const products = await loadProducts();
    const i = products.findIndex((p) => p.id === order.productId);
    if (i !== -1) {
      products[i] = {
        ...products[i],
        stock: products[i].stock + order.quantity,
        sold: Math.max(0, products[i].sold - order.quantity),
      };
      await writeFile(PRODUCTS_FILE, products);
    }
    await writeFile(
      ORDERS_FILE,
      orders.filter((o) => o.id !== orderId)
    );
  });
}

export function setOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  return locked(async () => {
    const orders = await loadOrders();
    const i = orders.findIndex((o) => o.id === id);
    if (i === -1) return null;
    orders[i] = { ...orders[i], status };
    await writeFile(ORDERS_FILE, orders);
    return orders[i];
  });
}

export const fileStore: Store = {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listOrders,
  placeOrder,
  rollbackOrder,
  setOrderStatus,
};
