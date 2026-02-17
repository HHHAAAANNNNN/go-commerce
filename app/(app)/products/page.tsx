"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  description: string;
  image: string;
}

const dummyProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 18999000,
    category: "Smartphones",
    rating: 4.8,
    description: "Latest iPhone with A17 Pro chip and titanium design",
    image: "/assets/products/phones/iPhone 15 Pro Max.jpg"
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 42999000,
    category: "Laptops",
    rating: 4.9,
    description: "Powerful M3 Max chip for professional workflows",
    image: "/assets/products/laptops/MacBook Pro M3.jpg"
  },
  {
    id: 3,
    name: "Samsung S24 Ultra",
    price: 19999000,
    category: "Smartphones",
    rating: 4.7,
    description: "AI-powered flagship with S Pen included",
    image: "/assets/products/phones/Samsung S24 Ultra.jpg"
  },
  {
    id: 4,
    name: "Dell XPS 15",
    price: 25999000,
    category: "Laptops",
    rating: 4.6,
    description: "Premium laptop with stunning OLED display",
    image: "/assets/products/laptops/Dell XPS 15.jpg"
  },
  {
    id: 5,
    name: "Google Pixel 8 Pro",
    price: 14999000,
    category: "Smartphones",
    rating: 4.6,
    description: "Best-in-class camera with AI features",
    image: "/assets/products/phones/Google Pixel 8 Pro.jpg"
  },
  {
    id: 6,
    name: "OnePlus 12",
    price: 12999000,
    category: "Smartphones",
    rating: 4.7,
    description: "Flagship killer with Snapdragon 8 Gen 3",
    image: "/assets/products/phones/OnePlus 12.jpg"
  },
  {
    id: 7,
    name: "Xiaomi 14 Pro",
    price: 13999000,
    category: "Smartphones",
    rating: 4.5,
    description: "Leica-engineered camera system",
    image: "/assets/products/phones/Xiaomi 14 Pro.jpg"
  },
  {
    id: 8,
    name: "ASUS ROG Zephyrus",
    price: 32999000,
    category: "Laptops",
    rating: 4.7,
    description: "Gaming laptop with RTX 4070 GPU",
    image: "/assets/products/laptops/ASUS ROG Zephyrus.jpg"
  },
  {
    id: 9,
    name: "HP Spectre x360",
    price: 24999000,
    category: "Laptops",
    rating: 4.5,
    description: "Convertible laptop with premium build",
    image: "/assets/products/laptops/HP Spectre x360.jpg"
  },
  {
    id: 10,
    name: "Lenovo ThinkPad X1",
    price: 28999000,
    category: "Laptops",
    rating: 4.6,
    description: "Business laptop with legendary durability",
    image: "/assets/products/laptops/Lenovo ThinkPad X1.jpg"
  }
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = ["All", "Smartphones", "Laptops", "Audio", "Tablets"];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = dummyProducts
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = product.price >= minPriceNum && product.price <= maxPriceNum;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    });

  return (
    <>
      {/* Price Filter Modal - Rendered at root level */}
      {showPriceFilter && (
        <>
          <div
            className="fixed inset-0 z-[999]"
            onClick={() => setShowPriceFilter(false)}
          />
          <div className="fixed top-[290px] right-[485px] w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl shadow-primary-400/10 z-[1000] p-4 space-y-3">
            <p className="text-white font-semibold text-sm">Set Price Range</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Min Price</label>
                <input
                  type="number"
                  placeholder="No minimum"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Max Price</label>
                <input
                  type="number"
                  placeholder="No maximum"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                />
              </div>
            </div>
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
              }}
              className="w-full py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Clear Filter
            </button>
          </div>
        </>
      )}

      <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 border border-primary-400/20 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/10 rounded-full filter blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent mb-2">
                Browse Products
              </h1>
              <p className="text-slate-300 text-lg">Discover the latest tech products with amazing deals!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-xl p-6 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
          />
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">Category:</span>
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-primary-400/20 to-secondary-400/20 text-primary-400 border border-primary-400/30"
                      : "bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-700/50"></div>

          {/* Price Range Filter */}
          <div>
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Price Range
              {(minPrice || maxPrice) && (
                <span className="ml-1 px-2 py-0.5 bg-primary-400/20 text-primary-400 rounded text-xs">
                  Active
                </span>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-700/50"></div>

          {/* Sort Order */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-sm font-medium">Sort by Price:</span>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/50 text-white border border-slate-700/50 hover:border-primary-400/50 transition-all"
            >
              {sortOrder === "asc" ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Low to High
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  High to Low
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          Showing <span className="text-white font-semibold">{filteredProducts.length}</span> products
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group relative bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800/50 hover:border-primary-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-400/10"
          >
            {/* Category Tag */}
            <div className="absolute top-3 left-3 z-10 px-3 py-1 bg-gradient-to-r from-primary-400/90 to-secondary-400/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold">
              {product.category}
            </div>

            {/* Product Image */}
            <div className="relative h-72 bg-slate-800/50 overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden w-full h-full flex items-center justify-center text-slate-600">
                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Gradient Overlay - Expands on Hover */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent transition-all duration-300 group-hover:via-slate-900/98 group-hover:from-slate-900 pt-20 group-hover:pt-32 pb-4 px-4">
                {/* Rating & Description - Only visible on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 mb-3">
                  <div className="flex items-center gap-1 mb-2">
                    <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                    <span className="text-yellow-400 text-sm font-semibold">{product.rating}</span>
                    <span className="text-slate-500 text-xs ml-1">(128 reviews)</span>
                  </div>
                  <p className="text-slate-400 text-xs line-clamp-2">{product.description}</p>
                </div>

                {/* Name & Price - Always visible */}
                <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-primary-400 font-bold text-xl">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* No Results */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <svg
            className="w-16 h-16 text-slate-600 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-slate-400 text-lg">No products found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
      </div>
    </>
  );
}
