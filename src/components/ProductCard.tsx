type Product = {
  id?: number;
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

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const priceLabel =
    product.price != null
      ? `₹${Number(product.price).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        })}`
      : "Price on Request";

  return (
    <a
      href={product.link ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="card-surface group block rounded-2xl px-4 py-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-slate-800">
            {product.name}
          </p>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            {product.collection || product.category || "Zoya Couture"}
          </p>
        </div>
        <p className="text-sm font-semibold text-gradient">{priceLabel}</p>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-slate-500">
        {product.material && (
          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-violet-600">
            {product.material}
          </span>
        )}
        {product.product_details && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-600">
            {product.product_details}
          </span>
        )}
        {product.category && (
          <span className="rounded-full bg-pink-50 px-2 py-0.5 text-pink-600">
            {product.category}
          </span>
        )}
      </div>
      <p className="mt-2 text-[11px] text-slate-400">
        View details on{" "}
        <span className="text-electric-blue group-hover:text-neon-violet transition-colors">
          Zoya.in
        </span>
      </p>
    </a>
  );
}
