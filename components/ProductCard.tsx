import Image from "next/image";
import type { Product } from "@/lib/types";
import { formatRand } from "@/lib/format";
import { CartSmall } from "./Icons";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const conditionClass: Record<Product["condition"], string> = {
  Excellent: "tag--excellent",
  "Very Good": "tag--verygood",
  Good: "tag--good",
};

export default function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="card">
      <span className={`tag ${conditionClass[product.condition]}`}>
        {product.condition}
      </span>

      <div className="card__media">
        <Image
          src={product.image}
          alt={`${product.model} in ${product.color}`}
          width={144}
          height={176}
        />
      </div>

      <div className="card__body">
        <h3>{product.model}</h3>
        <p className="card__spec">
          {product.storage} &bull; {product.color}
        </p>
        <p className="card__price">
          <strong>{formatRand(product.price)}</strong>
          <s>{formatRand(product.oldPrice)}</s>
        </p>
        <button className="btn-navy" onClick={() => onAdd(product)}>
          <CartSmall /> Add to Cart
        </button>
      </div>
    </article>
  );
}
