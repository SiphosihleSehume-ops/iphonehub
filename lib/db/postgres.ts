import { randomBytes } from "crypto";
import postgres from "postgres";
import { seedProducts } from "../products";
import type { Order, OrderStatus, Product } from "../types";
import type { NewOrder, PlaceResult, ProductInput, Store } from "./types";

/**
 * Postgres storage (Neon on Vercel, the Postgres plugin on Railway, or any
 * Postgres). Tables are created and the starter catalogue is added
 * automatically the first time the site runs.
 */

type Sql = postgres.Sql;

const g = globalThis as unknown as { __ihSql?: Sql; __ihReady?: Promise<void> };

export function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

function connect(): Sql {
  if (!g.__ihSql) {
    // Serverless functions get one connection each; a long-running server gets a small pool.
    const max = Number(process.env.DATABASE_POOL_MAX) || (process.env.VERCEL ? 1 : 5);
    g.__ihSql = postgres(databaseUrl()!, {
      max,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false, // required by connection poolers such as Neon's
      onnotice: () => {},
    });
  }
  return g.__ihSql;
}

async function init(sql: Sql) {
  await sql.begin(async (tx) => {
    // Stops two cold starts from creating the tables at the same moment.
    await tx`select pg_advisory_xact_lock(7311)`;

    await tx`create table if not exists products (
      id text primary key,
      model text not null,
      storage text not null,
      colors jsonb not null,
      condition text not null,
      price integer not null,
      old_price integer not null default 0,
      image text not null,
      stock integer not null default 0,
      active boolean not null default true,
      sold integer not null default 0,
      created_at timestamptz not null default now()
    )`;
    await tx`create table if not exists orders (
      id text primary key,
      created_at timestamptz not null default now(),
      status text not null default 'Pending',
      name text not null,
      surname text not null,
      email text not null,
      phone text not null,
      address text not null,
      product_id text not null,
      model text not null,
      storage text not null,
      color text not null,
      quantity integer not null,
      unit_price integer not null,
      total integer not null
    )`;
    await tx`create index if not exists orders_created_idx on orders (created_at desc)`;
    await tx`create table if not exists meta (key text primary key, value text not null)`;

    // Seed the starter catalogue once, never again (so deleted products stay deleted).
    const first = await tx`insert into meta (key, value) values ('seeded', '1')
      on conflict (key) do nothing returning key`;
    if (first.length) {
      for (const p of seedProducts) await insertProduct(tx as unknown as Sql, p);
    }
  });
}

async function ready(): Promise<Sql> {
  const sql = connect();
  g.__ihReady ??= init(sql).catch((err) => {
    g.__ihReady = undefined; // try again on the next request
    console.error("[db] setup failed", err);
    throw new Error("Could not connect to the database. Check DATABASE_URL.");
  });
  await g.__ihReady;
  return sql;
}

/* ------------------------------ row mapping ------------------------------ */

interface ProductRow {
  id: string;
  model: string;
  storage: string;
  colors: string[];
  condition: Product["condition"];
  price: number;
  old_price: number;
  image: string;
  stock: number;
  active: boolean;
  sold: number;
  created_at: Date | string;
}

interface OrderRow {
  id: string;
  created_at: Date | string;
  status: OrderStatus;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  product_id: string;
  model: string;
  storage: string;
  color: string;
  quantity: number;
  unit_price: number;
  total: number;
}

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  model: r.model,
  storage: r.storage,
  colors: r.colors,
  condition: r.condition,
  price: r.price,
  oldPrice: r.old_price,
  image: r.image,
  stock: r.stock,
  active: r.active,
  sold: r.sold,
  createdAt: new Date(r.created_at).toISOString(),
});

const toOrder = (r: OrderRow): Order => ({
  id: r.id,
  createdAt: new Date(r.created_at).toISOString(),
  status: r.status,
  name: r.name,
  surname: r.surname,
  email: r.email,
  phone: r.phone,
  address: r.address,
  productId: r.product_id,
  model: r.model,
  storage: r.storage,
  color: r.color,
  quantity: r.quantity,
  unitPrice: r.unit_price,
  total: r.total,
});

async function insertProduct(sql: Sql, p: Product) {
  await sql`insert into products
    (id, model, storage, colors, condition, price, old_price, image, stock, active, sold, created_at)
    values (${p.id}, ${p.model}, ${p.storage}, ${sql.json(p.colors)}, ${p.condition}, ${p.price},
            ${p.oldPrice}, ${p.image}, ${p.stock}, ${p.active}, ${p.sold}, ${p.createdAt})
    on conflict (id) do nothing`;
}

/* -------------------------------- products -------------------------------- */

async function listProducts(): Promise<Product[]> {
  const sql = await ready();
  const rows = await sql<ProductRow[]>`select * from products order by created_at desc`;
  return rows.map(toProduct);
}

async function getProduct(id: string): Promise<Product | undefined> {
  const sql = await ready();
  const [row] = await sql<ProductRow[]>`select * from products where id = ${id}`;
  return row ? toProduct(row) : undefined;
}

async function createProduct(input: ProductInput): Promise<Product> {
  const sql = await ready();
  const product: Product = {
    ...input,
    id: `p-${randomBytes(4).toString("hex")}`,
    sold: 0,
    createdAt: new Date().toISOString(),
  };
  await insertProduct(sql, product);
  return product;
}

async function updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product | null> {
  const sql = await ready();
  return sql.begin(async (tx) => {
    const [row] = await tx<ProductRow[]>`select * from products where id = ${id} for update`;
    if (!row) return null;
    const next: Product = { ...toProduct(row), ...patch };
    await tx`update products set
      model = ${next.model}, storage = ${next.storage}, colors = ${tx.json(next.colors)},
      condition = ${next.condition}, price = ${next.price}, old_price = ${next.oldPrice},
      image = ${next.image}, stock = ${next.stock}, active = ${next.active}
      where id = ${id}`;
    return next;
  });
}

async function deleteProduct(id: string): Promise<boolean> {
  const sql = await ready();
  const res = await sql`delete from products where id = ${id}`;
  return res.count > 0;
}

/* --------------------------------- orders --------------------------------- */

async function listOrders(): Promise<Order[]> {
  const sql = await ready();
  const rows = await sql<OrderRow[]>`select * from orders order by created_at desc`;
  return rows.map(toOrder);
}

async function placeOrder(input: NewOrder): Promise<PlaceResult> {
  const sql = await ready();
  return sql.begin(async (tx): Promise<PlaceResult> => {
    // Lock the product row so two simultaneous orders can't both take the last unit.
    const [p] = await tx<ProductRow[]>`select * from products where id = ${input.productId} for update`;
    if (!p || !p.active) return { ok: false, error: "That iPhone is no longer available." };
    if (p.stock < input.quantity) {
      return {
        ok: false,
        error:
          p.stock > 0
            ? `Only ${p.stock} left in stock for the ${p.model}.`
            : `The ${p.model} is sold out.`,
      };
    }

    const id = `IH-${randomBytes(3).toString("hex").toUpperCase()}`;
    const total = p.price * input.quantity;
    const [row] = await tx<OrderRow[]>`insert into orders
      (id, status, name, surname, email, phone, address, product_id, model, storage, color,
       quantity, unit_price, total)
      values (${id}, 'Pending', ${input.name}, ${input.surname}, ${input.email}, ${input.phone},
              ${input.address}, ${p.id}, ${p.model}, ${p.storage}, ${input.color},
              ${input.quantity}, ${p.price}, ${total})
      returning *`;
    await tx`update products set stock = stock - ${input.quantity}, sold = sold + ${input.quantity}
      where id = ${p.id}`;
    return { ok: true, order: toOrder(row) };
  });
}

async function rollbackOrder(orderId: string): Promise<void> {
  const sql = await ready();
  await sql.begin(async (tx) => {
    const [o] = await tx<OrderRow[]>`delete from orders where id = ${orderId} returning *`;
    if (!o) return;
    await tx`update products set stock = stock + ${o.quantity}, sold = greatest(0, sold - ${o.quantity})
      where id = ${o.product_id}`;
  });
}

async function setOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  const sql = await ready();
  const [row] = await sql<OrderRow[]>`update orders set status = ${status} where id = ${id} returning *`;
  return row ? toOrder(row) : null;
}

export const postgresStore: Store = {
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
