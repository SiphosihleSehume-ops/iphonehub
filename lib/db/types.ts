import type { Order, OrderStatus, Product } from "../types";

export type ProductInput = Omit<Product, "id" | "sold" | "createdAt">;

export interface NewOrder {
  productId: string;
  color: string;
  quantity: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
}

export type PlaceResult = { ok: true; order: Order } | { ok: false; error: string };

/** Everything the site needs from storage. Implemented by ./postgres and ./file. */
export interface Store {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(id: string, patch: Partial<ProductInput>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;
  listOrders(): Promise<Order[]>;
  /** Checks stock, reserves it and records the order in one atomic step */
  placeOrder(input: NewOrder): Promise<PlaceResult>;
  /** Undo placeOrder when the confirmation emails could not be sent */
  rollbackOrder(orderId: string): Promise<void>;
  setOrderStatus(id: string, status: OrderStatus): Promise<Order | null>;
}
