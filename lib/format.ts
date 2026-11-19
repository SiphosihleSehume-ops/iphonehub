/** 12999 -> "R 12,999" (matches the storefront design) */
export function formatRand(value: number): string {
  return `R ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}
