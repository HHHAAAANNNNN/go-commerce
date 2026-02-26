"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { CartItem } from "../CartModal";

interface FeaturedCategoriesProps {
  onAddToCart: (product: CartItem) => void;
}

export default function FeaturedCategories({ onAddToCart }: FeaturedCategoriesProps) {
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const laptopScrollRef = useRef<HTMLDivElement>(null);

  // Sample data - nanti akan diganti dengan data dari API
  const phones = [
    { id: 1, name: "iPhone 15 Pro Max", price: 21000000, image: "/assets/products/phones/iPhone 15 Pro Max.jpg", rating: 4.9, tag: "Trending", stock: 15, category: "Mobile Phones" },
    { id: 2, name: "Samsung S24 Ultra", price: 19000000, image: "/assets/products/phones/Samsung S24 Ultra.jpg", rating: 4.8, tag: "New", stock: 23, category: "Mobile Phones" },
    { id: 3, name: "Google Pixel 8 Pro", price: 15000000, image: "/assets/products/phones/Google Pixel 8 Pro.jpg", rating: 4.7, tag: "Hot", stock: 8, category: "Mobile Phones" },
    { id: 4, name: "OnePlus 12", price: 13000000, image: "/assets/products/phones/OnePlus 12.jpg", rating: 4.8, tag: "Popular", stock: 12, category: "Mobile Phones" },
    { id: 5, name: "Xiaomi 14 Pro", price: 11000000, image: "/assets/products/phones/Xiaomi 14 Pro.jpg", rating: 4.6, tag: "New", stock: 20, category: "Mobile Phones" },
  ];

  const laptops = [
    { id: 6, name: "MacBook Pro M3", price: 32000000, image: "/assets/products/laptops/MacBook Pro M3.jpg", rating: 4.9, tag: "Premium", stock: 10, category: "Laptops" },
    { id: 7, name: "Dell XPS 15", price: 28000000, image: "/assets/products/laptops/Dell XPS 15.jpg", rating: 4.8, tag: "Popular", stock: 15, category: "Laptops" },
    { id: 8, name: "ASUS ROG Zephyrus", price: 35000000, image: "/assets/products/laptops/ASUS ROG Zephyrus.jpg", rating: 4.7, tag: "Gaming", stock: 7, category: "Laptops" },
    { id: 9, name: "Lenovo ThinkPad X1", price: 26000000, image: "/assets/products/laptops/Lenovo ThinkPad X1.jpg", rating: 4.8, tag: "Business", stock: 18, category: "Laptops" },
    { id: 10, name: "HP Spectre x360", price: 24000000, image: "/assets/products/laptops/HP Spectre x360.jpg", rating: 4.6, tag: "New", stock: 12, category: "Laptops" },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    const scrollContainer = (ref: React.RefObject<HTMLDivElement>) => {
      if (!ref.current) return;

      const container = ref.current;
      let scrollPos = 0;
      const scroll = () => {
        scrollPos += 0.5;
        if (scrollPos >= container.scrollWidth / 2) {
          scrollPos = 0;
        }
        container.scrollLeft = scrollPos;
      };

      const interval = setInterval(scroll, 20);
      return () => clearInterval(interval);
    };

    const cleanupMobile = scrollContainer(mobileScrollRef as React.RefObject<HTMLDivElement>);
    const cleanupLaptop = scrollContainer(laptopScrollRef as React.RefObject<HTMLDivElement>);

    return () => {
      cleanupMobile?.();
      cleanupLaptop?.();
    };
  }, []);

  return (
    <section id="products" className="relative py-24 bg-[#0A0A0F] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1a0f2e]/10 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-300/10 rounded-full filter blur-3xl"></div>
      {/* Bottom gradient transition to next section */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-b from-transparent via-[#0f0a1a]/50 to-[#150a24] pointer-events-none"></div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 mt-[-50px]">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
            Featured Categories
          </h2>
          <p className="text-slate-400 text-lg">Discover the latest trending tech products</p>
        </div>

        {/* Mobile Phones Section - Cards Left, Info Right */}
        <div className="mb-32">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Featured Cards - Left */}
            <div className="order-2 lg:order-1">
              <div 
                ref={mobileScrollRef}
                className="flex gap-6 overflow-x-hidden py-8"
                style={{ scrollBehavior: 'auto' }}
              >
                {[...phones, ...phones].map((phone, index) => (
                  <div
                    key={`${phone.id}-${index}`}
                    className="flex-shrink-0 w-72 bg-gradient-to-br from-primary-400/10 to-secondary-400/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-primary-400/20 hover:border-primary-400/40 transition-all duration-300 hover:scale-105 group"
                  >
                    {/* Product Image */}
                    <div className="relative h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-primary-400/10 rounded-full blur-2xl"></div>
                      </div>
                      <div className="relative h-full flex items-center justify-center">
                        {/* Gambar produk */}
                        <div className="w-full h-full relative">
                          <Image 
                            src={phone.image} 
                            alt={phone.name}
                            fill
                            className="object-cover transition-transform duration-500"
                          />
                        </div>
                      </div>
                      {/* Gradient Overlay dari bawah */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                      {/* Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-accent-400/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-lg">
                          {phone.tag}
                        </span>
                      </div>
                      {/* Stock Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs font-medium rounded-md">
                          {phone.stock} left
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                        {phone.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <svg className="w-4 h-4 text-accent-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-slate-300 text-sm font-medium">{phone.rating}</span>
                        <span className="text-slate-500 text-xs ml-1">(128 reviews)</span>
                      </div>

                      {/* Price */}
                      <p className="text-primary-400 font-bold text-xl mb-4">{formatPrice(phone.price)}</p>

                      {/* Button */}
                      <button 
                        onClick={() => onAddToCart({ 
                          id: phone.id, 
                          name: phone.name, 
                          price: phone.price, 
                          image: phone.image, 
                          quantity: 1, 
                          category: phone.category 
                        })}
                        className="w-full py-2.5 bg-primary-400/20 hover:bg-primary-400/30 text-primary-400 rounded-lg font-medium transition-all duration-300 border border-primary-400/30 hover:border-primary-400/50"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Section - Right */}
            <div className="order-1 lg:order-2 space-y-6">
              
              <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Latest Flagship <span className="text-primary-400">Smartphones</span>
              </h3>
              
              <p className="text-slate-400 text-lg leading-relaxed">
                Discover cutting-edge smartphones with powerful processors, stunning displays, and advanced camera systems. Get the best deals on trending flagship devices.
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

        {/* Laptops Section - Info Left, Cards Right */}
        <div>
          <div className="grid lg:grid-cols-2 gap-8 items-center mt-[-50px]">
            {/* Info Section - Left */}
            <div className="space-y-6 ">
              
              <h3 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Premium <span className="text-secondary-400">Laptops</span> Collection
              </h3>
              
              <p className="text-slate-400 text-lg leading-relaxed">
                High-performance laptops for work, gaming, and creativity. Shop the latest models with cutting-edge technology and stunning designs.
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

            {/* Featured Cards - Right */}
            <div>
              <div 
                ref={laptopScrollRef}
                className="flex gap-6 overflow-x-hidden py-8"
                style={{ scrollBehavior: 'auto' }}
              >
                {[...laptops, ...laptops].map((laptop, index) => (
                  <div
                    key={`${laptop.id}-${index}`}
                    className="flex-shrink-0 w-72 bg-gradient-to-br from-secondary-400/10 to-accent-400/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-secondary-400/20 hover:border-secondary-400/40 transition-all duration-300 hover:scale-105 group"
                  >
                    {/* Product Image */}
                    <div className="relative h-64 bg-gradient-to-br from-slate-800/50 to-slate-900/50 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-secondary-400/10 rounded-full blur-2xl"></div>
                      </div>
                      <div className="relative h-full flex items-center justify-center">
                        {/* Gambar produk */}
                        <div className="w-full h-full relative">
                          <Image 
                            src={laptop.image} 
                            alt={laptop.name}
                            fill
                            className="object-cover transition-transform duration-500"
                          />
                        </div>
                      </div>
                      {/* Gradient Overlay dari bawah */}
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-900 via-slate-800/70 to-transparent"></div>
                      {/* Tag */}
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-accent-400/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full shadow-lg">
                          {laptop.tag}
                        </span>
                      </div>
                      {/* Stock Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-slate-900/80 backdrop-blur-sm text-slate-300 text-xs font-medium rounded-md">
                          {laptop.stock} left
                        </span>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                        {laptop.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        <svg className="w-4 h-4 text-accent-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-slate-300 text-sm font-medium">{laptop.rating}</span>
                        <span className="text-slate-500 text-xs ml-1">(95 reviews)</span>
                      </div>

                      {/* Price */}
                      <p className="text-secondary-400 font-bold text-xl mb-4">{formatPrice(laptop.price)}</p>

                      {/* Button */}
                      <button 
                        onClick={() => onAddToCart({ 
                          id: laptop.id, 
                          name: laptop.name, 
                          price: laptop.price, 
                          image: laptop.image, 
                          quantity: 1, 
                          category: laptop.category 
                        })}
                        className="w-full py-2.5 bg-secondary-400/20 hover:bg-secondary-400/30 text-secondary-400 rounded-lg font-medium transition-all duration-300 border border-secondary-400/30 hover:border-secondary-400/50"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
