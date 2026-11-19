import type { ModelName, Product } from "./types";

/**
 * Catalogue. Add a product by pushing another object here and dropping its
 * photo into /public/images. Filters, sorting and the order form pick it up.
 */
export const products: Product[] = [
  {
    id: "ip15-128-pink",
    model: "iPhone 15",
    storage: "128GB",
    color: "Pink",
    colors: ["Pink", "Black", "Blue", "Green", "Yellow"],
    condition: "Excellent",
    price: 12999,
    oldPrice: 14999,
    image: "/images/iphone-15.png",
    popularity: 100,
  },
  {
    id: "ip14-128-midnight",
    model: "iPhone 14",
    storage: "128GB",
    color: "Midnight",
    colors: ["Midnight", "Starlight", "Blue", "Purple", "Red"],
    condition: "Very Good",
    price: 10999,
    oldPrice: 12999,
    image: "/images/iphone-14.png",
    popularity: 90,
  },
  {
    id: "ip13-128-blue",
    model: "iPhone 13",
    storage: "128GB",
    color: "Blue",
    colors: ["Blue", "Midnight", "Starlight", "Pink", "Green", "Red"],
    condition: "Good",
    price: 9999,
    oldPrice: 11999,
    image: "/images/iphone-13.png",
    popularity: 80,
  },
  {
    id: "ip12-128-white",
    model: "iPhone 12",
    storage: "128GB",
    color: "White",
    colors: ["White", "Black", "Blue", "Green", "Red", "Purple"],
    condition: "Very Good",
    price: 8999,
    oldPrice: 10999,
    image: "/images/iphone-12.png",
    popularity: 70,
  },
];

export const MODEL_FILTERS: ModelName[] = [
  "iPhone 15",
  "iPhone 14",
  "iPhone 13",
  "iPhone 12",
  "iPhone 11",
];
export const STORAGE_FILTERS = ["64GB", "128GB", "256GB", "512GB"];
export const CONDITION_FILTERS = ["Excellent", "Very Good", "Good"] as const;
