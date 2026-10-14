"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus, Flame, Award, Leaf, SlidersHorizontal } from "lucide-react";
import { Product } from "@/lib/data";
import { formatGBP } from "@/lib/currency";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isAvailable = Boolean(product?.available);
  const productName = product?.name || "Menu Item";
  const price = typeof product?.price === "number" ? product.price : 0;
  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;
  const allergens = Array.isArray(product?.allergens) ? product.allergens.filter(Boolean) : [];

  const hasCustomisations = Boolean(
    hasSizes ||
    (Array.isArray(product?.flavours) && product.flavours.length > 0) ||
    (Array.isArray(product?.sauces) && product.sauces.length > 0) ||
    (Array.isArray(product?.extras) && product.extras.length > 0)
  );

  const hasValidImage =
    !imageError &&
    Boolean(product?.image && typeof product.image === "string" && product.image.trim() !== "");

  const handleCardClick = () => {
    if (isAvailable) {
      onSelect(product);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && isAvailable) {
      e.preventDefault();
      onSelect(product);
    }
  };

  return (
    <article
      tabIndex={isAvailable ? 0 : -1}
      role="region"
      aria-label={`${productName}, ${formatGBP(price)}`}
      onKeyDown={handleKeyDown}
      className={`group relative bg-white rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col h-full ${
        isAvailable
          ? "border-stone-200/90 shadow-xs hover:shadow-xl hover:border-stone-300 hover:-translate-y-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#d42b2b]"
          : "border-stone-200 bg-stone-50/50 opacity-90 cursor-not-allowed"
      }`}
    >
      {/* ── IMAGE SECTION ───────────────────────────────────── */}
      <div
        onClick={handleCardClick}
        className={`relative w-full aspect-[4/3] bg-stone-100 overflow-hidden ${
          isAvailable ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        {/* Skeleton loading shimmer */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200 to-stone-100 animate-pulse" />
        )}

        {hasValidImage ? (
          <Image
            src={product.image}
            alt={productName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className={`object-cover object-center transition-all duration-500 ease-out ${
              isAvailable
                ? "group-hover:scale-105"
                : "grayscale-[25%] opacity-80"
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder-food.svg"
              alt={productName}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Subtle dark gradient overlay on hover for available items */}
        {product.available && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* ── STATUS BADGES ───────────────────────────────────── */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {!product.available && (
            <span className="inline-flex items-center gap-1 bg-stone-900/95 text-stone-100 text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-xs shadow-md border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Sold Out
            </span>
          )}
          {product.bestseller && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 text-[11px] font-black uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md">
              <Award size={12} className="stroke-[2.5]" />
              Bestseller
            </span>
          )}
          {product.popular && !product.bestseller && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#d42b2b] to-red-600 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md">
              <Flame size={12} />
              Popular
            </span>
          )}
          {product.vegetarian && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-md">
              <Leaf size={12} />
              Veg
            </span>
          )}
        </div>

        {/* Quick customise / add hover button on image */}
        {product.available && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="absolute bottom-3 right-3 w-9 h-9 bg-white/95 hover:bg-[#d42b2b] text-stone-800 hover:text-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
            aria-label={`Customise and add ${product.name}`}
          >
            <Plus size={18} className="stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* ── CARD BODY ───────────────────────────────────────── */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        {/* Top: Title & Price */}
        <div>
          <div className="flex items-start justify-between gap-2.5">
            <h3
              onClick={handleCardClick}
              className={`font-display font-bold text-[15px] sm:text-base text-stone-900 leading-snug line-clamp-1 transition-colors ${
                isAvailable ? "cursor-pointer group-hover:text-[#d42b2b]" : "text-stone-600"
              }`}
              title={productName}
            >
              {productName}
            </h3>
            <div className="text-right whitespace-nowrap">
              <span className="font-display font-black text-[#d42b2b] text-[15px] sm:text-base tabular-nums">
                {hasSizes && (
                  <span className="text-[11px] font-medium text-stone-400 mr-1 uppercase">from</span>
                )}
                {formatGBP(price)}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-[13px] text-stone-500 leading-relaxed line-clamp-2 mt-1.5 min-h-[2.5rem]">
            {product?.description || ""}
          </p>
        </div>

        {/* Meta Stats: Calories & Variants */}
        <div className="flex items-center gap-2.5 text-xs text-stone-400 pt-1 border-t border-stone-100">
          {product?.calories && (
            <span className="inline-flex items-center gap-1 text-stone-500 font-medium">
              <span className="text-amber-500 font-bold">⚡</span>
              {product.calories} kcal
            </span>
          )}
          {hasSizes && (
            <>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500 font-medium">
                {product.sizes?.length} sizes
              </span>
            </>
          )}
          {allergens.length > 0 && (
            <>
              <span className="text-stone-300">•</span>
              <span className="text-stone-400 truncate text-[11px]" title={allergens.join(", ")}>
                {allergens.slice(0, 2).join(", ")}
                {allergens.length > 2 ? "..." : ""}
              </span>
            </>
          )}
        </div>

        {/* ── ACTION CTA BUTTON ──────────────────────────────── */}
        <button
          type="button"
          onClick={() => isAvailable && onSelect(product)}
          disabled={!isAvailable}
          className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200 ${
            isAvailable
              ? "bg-stone-900 hover:bg-[#d42b2b] text-white hover:shadow-md cursor-pointer active:scale-[0.98]"
              : "bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200"
          }`}
          aria-label={
            isAvailable
              ? `${hasCustomisations ? "Customise" : "Add"} ${productName} to cart`
              : `${productName} is currently sold out`
          }
        >
          {isAvailable ? (
            <>
              {hasCustomisations ? (
                <>
                  <SlidersHorizontal size={14} className="stroke-[2.2]" />
                  <span>Customise & Add</span>
                </>
              ) : (
                <>
                  <Plus size={15} className="stroke-[2.5]" />
                  <span>Add to Order</span>
                </>
              )}
            </>
          ) : (
            <span>Sold Out Today</span>
          )}
        </button>
      </div>
    </article>
  );
}
