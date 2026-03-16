import { useState } from "react";

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
  product_images?: string[] | null;
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const images = (product.product_images ?? []).filter(
    (url): url is string => typeof url === "string" && url.length > 0,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const hasImages = images.length > 0;

  const showPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const showNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasImages) return;
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1,
    );
  };

  const priceLabel =
    product.price != null
      ? `₹${Number(product.price).toLocaleString("en-IN", {
          maximumFractionDigits: 0,
        })}`
      : "Price on Request";

  async function handleCopyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.link) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(product.link);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Best-effort copy; silently ignore failures.
    }
  }

  return (
    <a
      href={product.link ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="card-surface group block rounded-2xl px-4 py-3"
    >
      {hasImages && (
        <div className="relative mb-3 overflow-hidden rounded-xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[currentIndex]}
            alt={product.name}
            className="h-40 w-full object-cover"
          />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <span className="sr-only">Previous image</span>
                <span className="text-xs">&#8592;</span>
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              >
                <span className="sr-only">Next image</span>
                <span className="text-xs">&#8594;</span>
              </button>
              <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white">
                <span>{currentIndex + 1}</span>
                <span className="opacity-60">/</span>
                <span className="opacity-80">{images.length}</span>
              </div>
            </>
          )}
        </div>
      )}

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
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <p>
          View details on{" "}
          <span className="text-electric-blue group-hover:text-neon-violet transition-colors">
            Zoya.in
          </span>
        </p>
        {product.link && (
          <button
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 rounded-full border border-slate-200 bg-white/70 px-2 py-0.5 text-[10px] font-medium text-slate-600 hover:border-violet-300 hover:text-violet-600"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px] text-slate-600">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 hover:border-slate-300 hover:text-violet-600"
        >
          User doesn&apos;t like
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 hover:border-slate-300 hover:text-violet-600"
        >
          User liked
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 hover:border-slate-300 hover:text-violet-600"
        >
          Add to flipbook
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white/80 px-2.5 py-0.5 hover:border-slate-300 hover:text-violet-600"
        >
          Not relevant – add feedback
        </button>
      </div>
    </a>
  );
}
