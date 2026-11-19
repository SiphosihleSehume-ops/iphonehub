export type Condition = "Excellent" | "Very Good" | "Good";

export type ModelName =
  | "iPhone 15"
  | "iPhone 14"
  | "iPhone 13"
  | "iPhone 12"
  | "iPhone 11";

export interface Product {
  id: string;
  model: ModelName;
  storage: string;
  color: string;
  /** Colours a customer can pick for this model when ordering */
  colors: string[];
  condition: Condition;
  price: number;
  oldPrice: number;
  image: string;
  popularity: number;
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
