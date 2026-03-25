"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BACKEND, getImageUrl } from "../../utils/api";
import { CartItem } from "../CartModal";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  rating: number;
  description: string;
  image: string;
  brand: string;
}

interface FeaturedCategoriesProps {
  onAddToCart: (product: CartItem) => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);

function useAutoScroll(ref: React.RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    if (!enabled || !ref.current) return;
    const container = ref.current;
    let isInteracting = false;
    let autoScrollInterval: NodeJS.Timeout;

    const stopAuto = () => {
      isInteracting = true;
    };

    const startAuto = () => {
      isInteracting = false;
    };

    container.addEventListener("mouseenter", stopAuto);
    container.addEventListener("mouseleave", startAuto);
    container.addEventListener("touchstart", stopAuto, { passive: true });
    container.addEventListener("touchend", startAuto, { passive: true });
    container.addEventListener("touchcancel", startAuto, { passive: true });

    autoScrollInterval = setInterval(() => {
      if (!isInteracting && container) {
        container.scrollLeft += 1;
        // Reset to beginning seamlessly if we've scrolled past half
        if (container.scrollLeft >= container.scrollWidth / 2) {
          container.scrollLeft = 0;
        }
      }
    }, 20); // 50 FPS

    return () => {
      clearInterval(autoScrollInterval);
      container.removeEventListener("mouseenter", stopAuto);
      container.removeEventListener("mouseleave", startAuto);
      container.removeEventListener("touchstart", stopAuto);
      container.removeEventListener("touchend", startAuto);
      container.removeEventListener("touchcancel", startAuto);
    };
  }, [enabled, ref]);
}

// ---- Skeleton card ----
function SkeletonCard({ color }: { color: "primary" | "secondary" }) {
  const border =
    color === "primary"
      ? "border-primary-400/20"
      : "border-secondary-400/20";
  return (
    <div
      className={`flex-shrink-0 w-72 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl overflow-hidden border ${border} animate-pulse`}
    >
      <div className="h-64 bg-slate-800/60" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-700 rounded w-1/2" />
        <div className="h-6 bg-slate-700 rounded w-1/3" />
        <div className="h-10 bg-slate-700 rounded" />
      </div>
    </div>
  );
}

// ---- Product Card ----
function ProductCard({
  product,
  colorScheme,
  onAddToCart,
  index,
}: {
  product: Product;
  colorScheme: "primary" | "secondary";
  onAddToCart: (p: CartItem) => void;
  index: number;
}) {
  const isPrimary = colorScheme === "primary";
  const cardGradient = isPrimary
    ? "from-primary-400/10 to-secondary-400/10 border-primary-400/20 hover:border-primary-400/40"
    : "from-secondary-400/10 to-accent-400/10 border-secondary-400/20 hover:border-secondary-400/40";
  const priceColor = isPrimary ? "text-primary-400" : "text-secondary-400";
  const btnClass = isPrimary
    ? "bg-primary-400/20 hover:bg-primary-400/30 text-primary-400 border-primary-400/30 hover:border-primary-400/50"
    : "bg-secondary-400/20 hover:bg-secondary-400/30 text-secondary-400 border-secondary-400/30 hover:border-secondary-400/50";

  // Generate a short tag from stock / rating
  const tag =
    product.stock <= 5
      ? "Low Stock"
      : product.rating >= 4.8
        ? "Top Rated"
        : product.rating >= 4.5
          ? "Popular"
          : "New";

  return (
    <div
      key={`${product.id}-${index}`}
      className={`flex-shrink-0 w-72 bg-gradient-to-br ${cardGradient} backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-105 group`}
    >
      {/* Image */}
      <div className="relative h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-32 h-32 ${isPrimary ? "bg-primary-400/10" : "bg-secondary-400/10"
              } rounded-full blur-2xl`}
          />
        </div>
        {product.image ? (
          <div className="relative w-full h-full">
            <Image
              src={getImageUrl(product.image)}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500"
              unoptimized
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No Image
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
        {/* Tag */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-accent-400/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-lg">
            {tag}
          </span>
        </div>
        {/* Stock badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs font-medium rounded-md">
            {product.stock} left
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <svg className="w-4 h-4 text-accent-400 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-slate-300 text-sm font-medium">{Number(product.rating).toFixed(1)}</span>
          {product.brand && (
            <span className="text-slate-500 text-xs ml-1">· {product.brand}</span>
          )}
        </div>

        {/* Price */}
        <p className={`${priceColor} font-bold text-xl mb-4`}>
          {formatPrice(product.price)}
        </p>

        <button
          onClick={() =>
            onAddToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.image,
              quantity: 1,
              category: product.category,
            })
          }
          className={`w-full py-2.5 rounded-lg font-medium transition-all duration-300 border ${btnClass}`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

// ---- Scrolling row ----
function ScrollRow({
  products,
  loading,
  colorScheme,
  refEl,
  onAddToCart,
}: {
  products: Product[];
  loading: boolean;
  colorScheme: "primary" | "secondary";
  refEl: React.RefObject<HTMLDivElement | null>;
  onAddToCart: (p: CartItem) => void;
}) {
  // Duplicate items for infinite-scroll effect
  const items = products.length > 0 ? [...products, ...products] : [];

  return (
    <div
      ref={refEl}
      className="flex gap-6 overflow-x-auto py-8 scrollbar-hide touch-pan-x"
      style={{ scrollBehavior: "auto" }}
    >
      {loading
        ? Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} color={colorScheme} />
        ))
        : items.map((product, idx) => (
          <ProductCard
            key={`${product.id}-${idx}`}
            product={product}
            colorScheme={colorScheme}
            onAddToCart={onAddToCart}
            index={idx}
          />
        ))}
    </div>
  );
}

// ---- Main Component ----
export default function FeaturedCategories({
  onAddToCart,
}: FeaturedCategoriesProps) {
  const [phones, setPhones] = useState<Product[]>([]);
  const [laptops, setLaptops] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const laptopScrollRef = useRef<HTMLDivElement>(null);

  useAutoScroll(mobileScrollRef, !loading && phones.length > 0);
  useAutoScroll(laptopScrollRef, !loading && laptops.length > 0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        let BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        if (BACKEND.endsWith("/api")) BACKEND = BACKEND.slice(0, -4);
        const res = await fetch(`${BACKEND}/api/products`);
        const json = await res.json();
        const all: Product[] = json.data ?? [];

        // Group by category
        setPhones(
          all.filter((p) =>
            p.category?.toLowerCase().includes("mobile") ||
            p.category?.toLowerCase().includes("phone") ||
            p.category?.toLowerCase().includes("smartphone")
          )
        );
        setLaptops(
          all.filter((p) =>
            p.category?.toLowerCase().includes("laptop")
          )
        );
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const hasPhones = loading || phones.length > 0;
  const hasLaptops = loading || laptops.length > 0;

  return (
    <section id="products" className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a0f2e]/10 to-transparent" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-300/10 rounded-full filter blur-3xl" />
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-b from-transparent via-[#0f0a1a]/50 to-[#150a24] pointer-events-none" />

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 mt-[-50px]">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
            Featured Categories
          </h2>
          <p className="text-slate-400 text-lg">
            Discover the latest trending tech products
          </p>
        </div>

        {/* Mobile Phones Section */}
        {hasPhones && (
          <div className="mb-32">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Cards - Left */}
              <div className="order-2 lg:order-1">
                <ScrollRow
                  products={phones}
                  loading={loading}
                  colorScheme="primary"
                  refEl={mobileScrollRef}
                  onAddToCart={onAddToCart}
                />
              </div>

              {/* Info - Right */}
              <div className="order-1 lg:order-2 space-y-6">
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Latest Flagship{" "}
                  <span className="text-primary-400">Smartphones</span>
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Discover cutting-edge smartphones with powerful processors,
                  stunning displays, and advanced camera systems. Get the best
                  deals on trending flagship devices.
                </p>
                <div className="grid grid-cols-2 gap-4 py-6">
                  <div className="p-4 bg-primary-400/5 rounded-xl border border-primary-400/10">
                    <svg className="w-8 h-8 text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-white font-semibold">Fast Shipping</p>
                    <p className="text-slate-500 text-sm">Same day delivery</p>
                  </div>
                  <div className="p-4 bg-secondary-400/5 rounded-xl border border-secondary-400/10">
                    <svg className="w-8 h-8 text-secondary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <p className="text-white font-semibold">Member Deals</p>
                    <p className="text-slate-500 text-sm">Up to 10% off</p>
                  </div>
                </div>
                <button className="group px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full font-semibold text-lg hover:from-primary-500 hover:to-primary-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary-400/20 hover:shadow-xl hover:shadow-primary-400/30">
                  Browse Phones
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Laptops Section */}
        {hasLaptops && (
          <div>
            <div className="grid lg:grid-cols-2 gap-8 items-center mt-[-50px]">
              {/* Info - Left */}
              <div className="space-y-6">
                <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Premium{" "}
                  <span className="text-secondary-400">Laptops</span> Collection
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed">
                  High-performance laptops for work, gaming, and creativity.
                  Shop the latest models with cutting-edge technology and
                  stunning designs.
                </p>
                <div className="grid grid-cols-2 gap-4 py-6">
                  <div className="p-4 bg-secondary-400/5 rounded-xl border border-secondary-400/10">
                    <svg className="w-8 h-8 text-secondary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-white font-semibold">Warranty</p>
                    <p className="text-slate-500 text-sm">2 years coverage</p>
                  </div>
                  <div className="p-4 bg-accent-400/5 rounded-xl border border-accent-400/10">
                    <svg className="w-8 h-8 text-accent-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-white font-semibold">Best Price</p>
                    <p className="text-slate-500 text-sm">Price guarantee</p>
                  </div>
                </div>
                <button className="group px-8 py-4 bg-gradient-to-r from-secondary-400 to-secondary-500 text-white rounded-full font-semibold text-lg hover:from-secondary-500 hover:to-secondary-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-secondary-400/20 hover:shadow-xl hover:shadow-secondary-400/30">
                  Browse Laptops
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>

              {/* Cards - Right */}
              <div>
                <ScrollRow
                  products={laptops}
                  loading={loading}
                  colorScheme="secondary"
                  refEl={laptopScrollRef}
                  onAddToCart={onAddToCart}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
