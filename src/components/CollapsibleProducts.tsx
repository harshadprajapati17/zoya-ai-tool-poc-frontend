"use client";

import { useState } from "react";
import { ProductCard } from "./ProductCard";

type Product = {
  pid: string;
  name: string;
  price: number | null;
  currency?: string | null;
  category?: string | null;
  material?: string | null;
  collection?: string | null;
  product_details?: string | null;
  link?: string | null;
};

type CollapsibleProductsProps = {
  products: Product[];
  defaultExpanded?: boolean;
};

export function CollapsibleProducts({
  products,
  defaultExpanded = false,
}: CollapsibleProductsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (products.length === 0) return null;

  return (
    <section className="mt-3 space-y-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-violet-400 transition-colors hover:text-violet-600"
      >
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M4.5 2L9 6l-4.5 4V2z" />
        </svg>
        {expanded
          ? "Curated for you"
          : `${products.length} suggestion${products.length > 1 ? "s" : ""}`}
      </button>
      {expanded && (
        <div className="grid gap-2 sm:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p.pid} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
