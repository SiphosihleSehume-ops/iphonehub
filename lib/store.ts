import { fileStore } from "./db/file";
import { databaseUrl, postgresStore } from "./db/postgres";
import type { Store } from "./db/types";

export type { NewOrder, ProductInput } from "./db/types";

/**
 * The one place the rest of the app talks to storage.
 *  - DATABASE_URL (or POSTGRES_URL) set  -> Postgres (Vercel, Railway, anywhere)
 *  - not set                             -> data/*.json files (local development)
 */
const store: Store = databaseUrl() ? postgresStore : fileStore;

export const listProducts = store.listProducts;
export const getProduct = store.getProduct;
export const createProduct = store.createProduct;
export const updateProduct = store.updateProduct;
export const deleteProduct = store.deleteProduct;
export const listOrders = store.listOrders;
export const placeOrder = store.placeOrder;
export const rollbackOrder = store.rollbackOrder;
export const setOrderStatus = store.setOrderStatus;
