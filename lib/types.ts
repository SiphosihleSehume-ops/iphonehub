export type Condition = "Excellent" | "Very Good" | "Good";
export const CONDITIONS: Condition[] = ["Excellent", "Very Good", "Good"];

export type OrderStatus = "Pending" | "Confirmed" | "Delivered" | "Cancelled";
export const ORDER_STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Delivered", "Cancelled"];

export interface Product {
  id: string;
  /** Shown as the card title, e.g. "iPhone 15 Pro" */
  model: string;
  storage: string;
  /** First colour is the one shown on the card */
  colors: string[];
  condition: Condition;
  price: number;
  /** Original price shown struck through. 0 or <= price hides it. */
  oldPrice: number;
  /** /images/... path or a data: URL uploaded from the admin */
  image: string;
  stock: number;
  /** false hides the product from the storefront */
  active: boolean;
  /** units sold through the order form, used for "Most Popular" */
  sold: number;
  createdAt: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  productId: string;
  model: string;
  storage: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderPayload {
  name: string;
  surname: string;
  email: string;
  phone: string;
  address: string;
  quantity: number;
  productId: string;
  model: string;
  storage: string;
  color: string;
  /** honeypot – must stay empty */
  website?: string;
}

export interface OrderResponse {
  ok: boolean;
  reference?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof OrderPayload, string>>;
}
