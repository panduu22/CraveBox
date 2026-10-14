"use client";

import { useState, useMemo, useRef, useEffect, useCallback, Suspense } from "react";
import {
  Search,
  SlidersHorizontal,
  X,
  Award,
  Flame,
  Leaf,
  CheckCircle2,
  Database,
  RefreshCw,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { products as staticProducts, categories, type Product } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

type DietaryFilter = "all" | "bestseller" | "popular" | "vegetarian";
type SortOption = "default" | "price-asc" | "price-desc" | "calories-asc";

interface MenuClientProps {
  initialCategory?: string;
}

/**
 * Isolated listener for URL search params (?category=...)
 * Wrapped in its own fine-grained <Suspense fallback={null}> boundary
 * so reading searchParams never suspends or blocks the main menu page.
 */
function SearchParamsSync({
  onCategoryParam,
}: {
  onCategoryParam: (category: string) => void;
}) {
  const searchParams = useSearchParams();
  const paramCategory = searchParams.get("category");

  useEffect(() => {
    if (paramCategory) {
      onCategoryParam(paramCategory);
    }
  }, [paramCategory, onCategoryParam]);

  return null;
}

export default function MenuClient({ initialCategory = "all" }: MenuClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory && (categories.some((c) => c.id === initialCategory) || initialCategory === "all")
      ? initialCategory
      : "all"
  );
  const activeCategory = selectedCategory;

  const handleCategoryParam = useCallback((paramCategory: string) => {
    if (categories.some((c) => c.id === paramCategory) || paramCategory === "all") {
      setSelectedCategory(paramCategory);
    }
  }, []);

  const selectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (typeof window !== "undefined") {
      const url = catId === "all" ? "/menu" : `/menu?category=${catId}`;
      window.history.replaceState(null, "", url);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<DietaryFilter>("all");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Database Products state with static default fallback
  const [productsList, setProductsList] = useState<Product[]>(staticProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"mongodb" | "static">("static");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const categoryBarRef = useRef<HTMLDivElement>(null);

  // Manual retry function for user interaction (button click)
  const retrySync = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const res = await fetch("/api/products", {
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to retrieve menu from server`);
      }

      const result = await res.json();

      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setProductsList(result.data);
        if (result.source === "mongodb") {
          setDataSource("mongodb");
          setStatusMessage("Live MongoDB Atlas Menu");
        } else {
          setDataSource("static");
          setStatusMessage("Verified Offline Menu");
        }
      } else {
        throw new Error(result.error || "Invalid response format from menu API");
      }
    } catch (err: unknown) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      const message = isAbort
        ? "Network request timed out. Showing verified offline menu."
        : err instanceof Error
        ? err.message
        : "Failed to connect to database";

      console.warn("Menu data fetch warning:", message);
      setFetchError(message);
      setDataSource("static");
      setStatusMessage("Displaying verified offline menu");
      setProductsList((prev) => (prev.length > 0 ? prev : staticProducts));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch products from server-side /api/products endpoint on mount asynchronously
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    fetch("/api/products", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to retrieve menu from server`);
        return res.json();
      })
      .then((result) => {
        if (!ignore) {
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            setProductsList(result.data);
            if (result.source === "mongodb") {
              setDataSource("mongodb");
              setStatusMessage("Live MongoDB Atlas Menu");
            } else {
              setDataSource("static");
              setStatusMessage("Verified Offline Menu");
            }
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          const isAbort = err instanceof DOMException && err.name === "AbortError";
          const message = isAbort
            ? "Network request timed out. Showing verified offline menu."
            : err instanceof Error
            ? err.message
            : "Failed to connect to database";

          console.warn("Menu data fetch warning:", message);
          setFetchError(message);
          setDataSource("static");
          setStatusMessage("Displaying verified offline menu");
          setProductsList((prev) => (prev.length > 0 ? prev : staticProducts));
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, []);

  // Smooth scroll active category into view
  useEffect(() => {
    if (categoryBarRef.current) {
      const active = categoryBarRef.current.querySelector<HTMLButtonElement>("[data-active='true']");
      active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeCategory]);

  const filteredProducts = useMemo(() => {
    let result = productsList;

    // Filter by Category
    if (activeCategory !== "all") {
      result = result.filter((p) => p && p.category === activeCategory);
    }

    // Filter by Dietary/Badge Filter
    if (dietaryFilter === "bestseller") {
      result = result.filter((p) => p && Boolean(p.bestseller));
    } else if (dietaryFilter === "popular") {
      result = result.filter((p) => p && Boolean(p.popular));
    } else if (dietaryFilter === "vegetarian") {
      result = result.filter((p) => p && Boolean(p.vegetarian));
    }

    // Filter by Availability
    if (onlyAvailable) {
      result = result.filter((p) => p && Boolean(p.available));
    }

    // Search query across name, description, category, flavours, and allergens
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p &&
          ((p.name || "").toLowerCase().includes(q) ||
            (p.description || "").toLowerCase().includes(q) ||
            (p.category || "").toLowerCase().includes(q) ||
            (Array.isArray(p.flavours) &&
              p.flavours.some((f) => (f || "").toLowerCase().includes(q))) ||
            (Array.isArray(p.allergens) &&
              p.allergens.some((a) => (a || "").toLowerCase().includes(q))))
      );
    }

    // Sorting
    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sortBy === "calories-asc") {
      result = [...result].sort((a, b) => (a.calories ?? 9999) - (b.calories ?? 9999));
    }

    return result;
  }, [productsList, activeCategory, dietaryFilter, onlyAvailable, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Fine-grained URL search param listener that never suspends page rendering */}
      <Suspense fallback={null}>
        <SearchParamsSync onCategoryParam={handleCategoryParam} />
      </Suspense>
      {/* Hero Header */}
      <div className="bg-[#1a1a1a] py-10 sm:py-14 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#d42b2b] text-white">
                  Order Online · Fresh Fast Food
                </span>

                {/* Database Source Badge */}
                {dataSource === "mongodb" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    <Database size={11} className="text-emerald-400" />
                    MongoDB Atlas Connected
                  </span>
                )}
                {isLoading && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-800 text-stone-300">
                    <RefreshCw size={11} className="animate-spin text-amber-400" />
                    Syncing...
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl tracking-tight">
                Explore Our Menu
              </h1>
              <p className="text-stone-400 text-sm sm:text-base mt-2 max-w-xl">
                Crispy hand-breaded chicken, signature smash & tower burgers, saucy wings, family buckets, sides and chilled drinks.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-stone-300 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-sm self-start md:self-auto">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <CheckCircle2 size={14} /> 100% Halal
              </span>
              <span className="text-white/20">|</span>
              <span>Delivery 25–40m</span>
              <span className="text-white/20">|</span>
              <span className="text-amber-400 font-semibold">Min order £12</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Filter & Category Bar */}
      <div className="sticky top-[64px] md:top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Search + Quick Badges Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chicken, burgers, wings, fries…"
                className="w-full pl-10 pr-9 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#d42b2b] focus:ring-2 focus:ring-red-100 transition-colors"
                aria-label="Search menu"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick Dietary Filters & Sort Toggle */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              {/* Dietary Chips */}
              <button
                onClick={() => setDietaryFilter(dietaryFilter === "bestseller" ? "all" : "bestseller")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dietaryFilter === "bestseller"
                    ? "bg-amber-400 text-stone-900 shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                <Award size={13} className="stroke-[2.5]" />
                Bestsellers
              </button>

              <button
                onClick={() => setDietaryFilter(dietaryFilter === "popular" ? "all" : "popular")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dietaryFilter === "popular"
                    ? "bg-[#d42b2b] text-white shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                <Flame size={13} />
                Popular
              </button>

              <button
                onClick={() => setDietaryFilter(dietaryFilter === "vegetarian" ? "all" : "vegetarian")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  dietaryFilter === "vegetarian"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                <Leaf size={13} />
                Veggie
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  showFilters || sortBy !== "default" || onlyAvailable
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "border-stone-200 text-stone-700 hover:border-stone-300"
                }`}
                aria-label="Toggle filters"
              >
                <SlidersHorizontal size={13} />
                Sort & Filters
              </button>
            </div>
          </div>

          {/* Expanded Filter & Sort Controls */}
          {showFilters && (
            <div className="mb-3 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex flex-wrap items-center justify-between gap-4 animate-slide-up text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-stone-500 uppercase tracking-wider">Sort:</span>
                {(
                  [
                    { key: "default", label: "Recommended" },
                    { key: "price-asc", label: "Price (Low to High)" },
                    { key: "price-desc", label: "Price (High to Low)" },
                    { key: "calories-asc", label: "Lowest Calories" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSortBy(opt.key)}
                    className={`px-3 py-1 rounded-lg font-medium border transition-colors ${
                      sortBy === opt.key
                        ? "bg-[#d42b2b] text-white border-[#d42b2b]"
                        : "bg-white border-stone-200 text-stone-700 hover:border-stone-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* In-Stock only toggle */}
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#d42b2b] focus:ring-[#d42b2b] border-stone-300"
                />
                In-Stock Only
              </label>
            </div>
          )}

          {/* Category Horizontal Navigation Scroll */}
          <div
            ref={categoryBarRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 pt-1"
          >
            <button
              data-active={activeCategory === "all"}
              onClick={() => selectCategory("all")}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeCategory === "all"
                  ? "bg-[#d42b2b] text-white shadow-md shadow-red-500/20 scale-[1.02]"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              All Items ({productsList.length})
            </button>
            {categories.map((cat) => {
              const count = productsList.filter((p) => p && p.category === cat.id).length;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  data-active={isActive}
                  onClick={() => selectCategory(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-[#d42b2b] text-white shadow-md shadow-red-500/20 scale-[1.02]"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-stone-200/80 text-stone-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Retryable Error Notice if Live Sync Failed */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="py-2.5 px-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              <span>
                <strong>Offline fallback:</strong> {fetchError}. Displaying verified local menu catalogue ({productsList.length} items).
              </span>
            </span>
            <button
              onClick={() => retrySync()}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 rounded-xl font-bold transition-colors w-fit disabled:opacity-50"
            >
              <RefreshCw size={12} className={isLoading ? "animate-spin text-amber-600" : ""} />
              <span>Retry MongoDB Sync</span>
            </button>
          </div>
        </div>
      )}

      {/* Status Notice if Fallback or Error */}
      {statusMessage && !fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="py-2 px-3.5 bg-stone-100/80 border border-stone-200/60 rounded-xl text-xs text-stone-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dataSource === "mongodb" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {statusMessage}
            </span>
            <span className="text-stone-400 text-[11px]">Auto-synchronised</span>
          </div>
        </div>
      )}

      {/* Products Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-stone-200/80 p-8 shadow-sm max-w-lg mx-auto">
            <div className="text-6xl mb-4">🍗</div>
            <h2 className="font-display font-black text-2xl mb-2 text-[#1a1a1a]">No menu items found</h2>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              We couldn&apos;t find any items matching your current filters. Try searching for a different item or clear your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setDietaryFilter("all");
                setOnlyAvailable(false);
                setSortBy("default");
              }}
              className="bg-[#d42b2b] hover:bg-[#b52222] text-white px-6 py-3 rounded-2xl font-bold text-sm transition-all shadow-md shadow-red-500/20"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-stone-500 text-xs sm:text-sm font-medium">
                Showing <strong className="text-stone-800">{filteredProducts.length}</strong> items
                {activeCategory !== "all" && (
                  <> in <span className="text-[#d42b2b] font-semibold">{categories.find((c) => c.id === activeCategory)?.name}</span></>
                )}
                {dietaryFilter !== "all" && (
                  <span className="capitalize text-stone-700"> ({dietaryFilter})</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Product Customisation Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
