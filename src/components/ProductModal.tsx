"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { X, Plus, Minus, ShoppingCart, ChevronDown, Info, AlertCircle, Award, Leaf, Flame } from "lucide-react";
import { Product } from "@/lib/data";
import { useCart, CartCustomisation } from "@/context/CartContext";
import { calculateItemPricing, formatGBPFromPence, formatGBP } from "@/lib/currency";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-label={`Customise ${product.name}`}
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
      >
        <ProductModalInner key={product.id} product={product} onClose={onClose} />
      </div>
    </>
  );
}

function ProductModalInner({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { addItem } = useCart();

  const [imageError, setImageError] = useState(false);
  const [selectedSize, setSelectedSize] = useState<{ label: string; price: number } | null>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null
  );
  const [selectedFlavour, setSelectedFlavour] = useState<string>(
    product.flavours && product.flavours.length > 0 ? product.flavours[0] : ""
  );
  const [selectedSauce, setSelectedSauce] = useState<string>(
    product.sauces && product.sauces.length > 0 ? product.sauces[0] : ""
  );
  const [selectedExtras, setSelectedExtras] = useState<{ id: string; name: string; price: number }[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Strict integer pence calculation for line pricing
  const pricing = useMemo(() => {
    return calculateItemPricing(
      product.price,
      selectedSize?.price ?? 0,
      selectedExtras,
      quantity
    );
  }, [product, selectedSize, selectedExtras, quantity]);

  function toggleExtra(extra: { id: string; name: string; price: number }) {
    setSelectedExtras((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );
  }

  function handleAddToCart() {
    // Validate required size
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      setValidationError("Please select a required size option.");
      return;
    }

    // Validate required flavour if listed
    if (product.flavours && product.flavours.length > 0 && !selectedFlavour) {
      setValidationError("Please select your preferred flavour.");
      return;
    }

    const customisation: CartCustomisation = {
      size: selectedSize?.label,
      sizePrice: selectedSize?.price ?? 0,
      flavour: selectedFlavour || undefined,
      sauce: selectedSauce || undefined,
      extras: selectedExtras,
      specialInstructions: instructions.trim() || undefined,
      quantity,
    };

    addItem(product, customisation);
    onClose();
  }

  return (
    <div className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col shadow-2xl animate-slide-up pointer-events-auto">
      {/* Image header */}
      <div className="relative h-56 flex-shrink-0 bg-stone-100">
        {!imageError && product.image && product.image.trim() !== "" ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder-food.svg"
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 bg-white/90 hover:bg-white text-stone-800 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Badges on modal */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
          {product.bestseller && (
            <span className="inline-flex items-center gap-1 bg-amber-400 text-stone-900 text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow">
              <Award size={11} className="stroke-[2.5]" />
              Bestseller
            </span>
          )}
          {product.popular && !product.bestseller && (
            <span className="inline-flex items-center gap-1 bg-[#d42b2b] text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
              <Flame size={11} />
              Popular
            </span>
          )}
          {product.vegetarian && (
            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow">
              <Leaf size={11} />
              Vegetarian
            </span>
          )}
        </div>

        {/* Product Title & Base Price */}
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <div className="flex items-end justify-between gap-3">
            <h2 className="font-display font-black text-2xl leading-tight drop-shadow-sm">
              {product.name}
            </h2>
            <span className="font-bold text-lg text-amber-300 whitespace-nowrap drop-shadow-sm">
              From {formatGBP(product.price)}
            </span>
          </div>
          <p className="text-stone-200 text-xs sm:text-sm mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Scrollable Customisation Area */}
      <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
        {/* Validation Banner */}
        {validationError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700 font-semibold animate-shake">
            <AlertCircle size={16} className="flex-shrink-0 text-red-500" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Size / Portion Variants */}
        {product.sizes && product.sizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-semibold text-sm text-stone-900 flex items-center gap-1">
                Select Size / Portion <span className="text-red-500">*</span>
              </h3>
              <span className="text-xs text-stone-400 font-medium">Required</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {product.sizes.map((size) => {
                const isSelected = selectedSize?.label === size.label;
                return (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setValidationError(null);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-[#d42b2b] bg-red-50/70 text-[#d42b2b] shadow-sm"
                        : "border-stone-200 text-stone-700 hover:border-stone-300 bg-stone-50/50"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm">{size.label}</div>
                    <div className="text-xs mt-1 text-stone-500">
                      {size.price > 0 ? `+${formatGBP(size.price)}` : "Standard"}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Flavours / Seasoning */}
        {product.flavours && product.flavours.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-semibold text-sm text-stone-900 flex items-center gap-1">
                Flavour / Heat Level <span className="text-red-500">*</span>
              </h3>
              <span className="text-xs text-stone-400 font-medium">Required</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.flavours.map((flavour) => {
                const isSelected = selectedFlavour === flavour;
                return (
                  <button
                    key={flavour}
                    type="button"
                    onClick={() => {
                      setSelectedFlavour(flavour);
                      setValidationError(null);
                    }}
                    className={`px-3.5 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-[#d42b2b] bg-red-50 text-[#d42b2b]"
                        : "border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {flavour}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Sauces */}
        {product.sauces && product.sauces.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm text-stone-900 mb-2">Choice of Sauce</h3>
            <div className="relative">
              <select
                value={selectedSauce}
                onChange={(e) => setSelectedSauce(e.target.value)}
                className="w-full appearance-none bg-stone-50 border-2 border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 focus:outline-none focus:border-[#d42b2b] pr-8"
                aria-label="Select sauce"
              >
                {product.sauces.map((sauce) => (
                  <option key={sauce} value={sauce}>
                    {sauce}
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Optional Extras */}
        {product.extras && product.extras.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-semibold text-sm text-stone-900">Optional Extras & Dips</h3>
              <span className="text-xs text-stone-400">Multiple choice</span>
            </div>
            <div className="space-y-2">
              {product.extras.map((extra) => {
                const selected = selectedExtras.some((e) => e.id === extra.id);
                return (
                  <button
                    key={extra.id}
                    type="button"
                    onClick={() => toggleExtra(extra)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all text-xs sm:text-sm ${
                      selected
                        ? "border-[#d42b2b] bg-red-50/60"
                        : "border-stone-200 hover:border-stone-300 bg-stone-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                          selected ? "border-[#d42b2b] bg-[#d42b2b]" : "border-stone-300 bg-white"
                        }`}
                      >
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={selected ? "text-[#d42b2b] font-semibold" : "text-stone-700"}>
                        {extra.name}
                      </span>
                    </div>
                    <span className="font-semibold text-stone-700">+{formatGBP(extra.price)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Allergens Notice */}
        {product.allergens && product.allergens.length > 0 && (
          <div className="bg-amber-50/80 rounded-2xl p-3.5 flex items-start gap-2.5 border border-amber-200/60">
            <Info size={16} className="text-amber-700 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Contains:</strong> {product.allergens.join(", ")}. Please review our{" "}
              <a href="/allergens" className="underline font-semibold" target="_blank" rel="noopener noreferrer">
                allergen matrix
              </a>{" "}
              if you have severe food allergies.
            </p>
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <h3 className="font-semibold text-sm text-stone-900 mb-1.5">
            Special Instructions <span className="text-stone-400 font-normal text-xs">(optional)</span>
          </h3>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Extra napkins, sauce on the side, well-done fries..."
            rows={2}
            maxLength={200}
            className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#d42b2b] resize-none placeholder:text-stone-400"
            aria-label="Special instructions"
          />
        </div>
      </div>

      {/* Modal Footer: Quantity controls + Add to Cart */}
      <div className="px-6 py-4 border-t border-stone-100 bg-white flex items-center gap-3">
        {/* Quantity */}
        <div className="flex items-center gap-1.5 bg-stone-100 rounded-2xl p-1">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 rounded-xl bg-white hover:bg-stone-200 flex items-center justify-center transition-colors shadow-sm disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={13} />
          </button>
          <span className="font-bold text-sm w-7 text-center text-stone-800">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="w-8 h-8 rounded-xl bg-[#d42b2b] hover:bg-[#b01f1f] text-white flex items-center justify-center transition-colors shadow-sm"
            aria-label="Increase quantity"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 flex items-center justify-center gap-2 bg-[#d42b2b] hover:bg-[#b52222] text-white py-3.5 px-4 rounded-2xl font-bold text-sm transition-all hover:shadow-lg hover:shadow-red-500/20 active:scale-[0.98]"
        >
          <ShoppingCart size={16} />
          <span>Add to Cart — {formatGBPFromPence(pricing.totalPence)}</span>
        </button>
      </div>
    </div>
  );
}
