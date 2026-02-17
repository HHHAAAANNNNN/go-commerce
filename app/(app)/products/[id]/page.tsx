"use client";

import { use, useState } from "react";
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
  stock: number;
  brand: string;
  specs: {
    [key: string]: string;
  };
}

const dummyProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 18999000,
    category: "Smartphones",
    rating: 4.8,
    description: "Latest iPhone with A17 Pro chip and titanium design. Experience the power of Apple's most advanced smartphone featuring a stunning Super Retina XDR display, professional-grade camera system, and all-day battery life.",
    image: "/assets/products/phones/iPhone 15 Pro Max.jpg",
    stock: 25,
    brand: "Apple",
    specs: {
      "Display": "6.7-inch Super Retina XDR",
      "Processor": "A17 Pro chip",
      "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      "Storage": "256GB / 512GB / 1TB",
      "Battery": "Up to 29 hours video playback",
      "Material": "Titanium design with Ceramic Shield"
    }
  },
  {
    id: 2,
    name: "MacBook Pro M3",
    price: 42999000,
    category: "Laptops",
    rating: 4.9,
    description: "Powerful M3 Max chip for professional workflows. The ultimate pro notebook delivers groundbreaking performance and amazing battery life in a stunning design.",
    image: "/assets/products/laptops/MacBook Pro M3.jpg",
    stock: 15,
    brand: "Apple",
    specs: {
      "Display": "16-inch Liquid Retina XDR",
      "Processor": "Apple M3 Max chip",
      "Memory": "36GB unified memory",
      "Storage": "1TB SSD",
      "Graphics": "40-core GPU",
      "Battery": "Up to 22 hours"
    }
  },
  {
    id: 3,
    name: "Samsung S24 Ultra",
    price: 19999000,
    category: "Smartphones",
    rating: 4.7,
    description: "AI-powered flagship with S Pen included. Meet Galaxy AI on the new Galaxy S24 Ultra with cutting-edge Galaxy AI features and the iconic S Pen.",
    image: "/assets/products/phones/Samsung S24 Ultra.jpg",
    stock: 30,
    brand: "Samsung",
    specs: {
      "Display": "6.8-inch Dynamic AMOLED 2X",
      "Processor": "Snapdragon 8 Gen 3",
      "Camera": "200MP Wide + 50MP Periscope + 12MP Ultra Wide",
      "Storage": "256GB / 512GB / 1TB",
      "Battery": "5000mAh with 45W fast charging",
      "Special": "S Pen included"
    }
  },
  {
    id: 4,
    name: "Dell XPS 15",
    price: 25999000,
    category: "Laptops",
    rating: 4.6,
    description: "Premium laptop with stunning OLED display. The perfect blend of power and portability for creative professionals.",
    image: "/assets/products/laptops/Dell XPS 15.jpg",
    stock: 20,
    brand: "Dell",
    specs: {
      "Display": "15.6-inch OLED 3.5K",
      "Processor": "Intel Core i7-13700H",
      "Memory": "16GB DDR5",
      "Storage": "512GB NVMe SSD",
      "Graphics": "NVIDIA RTX 4050",
      "Battery": "Up to 13 hours"
    }
  },
  {
    id: 5,
    name: "Google Pixel 8 Pro",
    price: 14999000,
    category: "Smartphones",
    rating: 4.6,
    description: "Best-in-class camera with AI features. The most advanced Pixel phone yet, powered by Google AI for amazing photos and helpful features.",
    image: "/assets/products/phones/Google Pixel 8 Pro.jpg",
    stock: 35,
    brand: "Google",
    specs: {
      "Display": "6.7-inch LTPO OLED",
      "Processor": "Google Tensor G3",
      "Camera": "50MP Wide + 48MP Ultrawide + 48MP Telephoto",
      "Storage": "128GB / 256GB / 512GB",
      "Battery": "5050mAh with 30W fast charging",
      "AI": "Google AI features included"
    }
  },
  {
    id: 6,
    name: "OnePlus 12",
    price: 12999000,
    category: "Smartphones",
    rating: 4.7,
    description: "Flagship killer with Snapdragon 8 Gen 3. Fast and smooth flagship experience at an incredible value.",
    image: "/assets/products/phones/OnePlus 12.jpg",
    stock: 40,
    brand: "OnePlus",
    specs: {
      "Display": "6.82-inch AMOLED 120Hz",
      "Processor": "Snapdragon 8 Gen 3",
      "Camera": "50MP + 64MP + 48MP Hasselblad",
      "Storage": "256GB / 512GB",
      "Battery": "5400mAh with 100W charging",
      "Special": "Hasselblad camera system"
    }
  },
  {
    id: 7,
    name: "Xiaomi 14 Pro",
    price: 13999000,
    category: "Smartphones",
    rating: 4.5,
    description: "Leica-engineered camera system. Premium flagship with professional photography capabilities.",
    image: "/assets/products/phones/Xiaomi 14 Pro.jpg",
    stock: 28,
    brand: "Xiaomi",
    specs: {
      "Display": "6.73-inch AMOLED 120Hz",
      "Processor": "Snapdragon 8 Gen 3",
      "Camera": "50MP Leica + 50MP + 50MP",
      "Storage": "256GB / 512GB",
      "Battery": "4880mAh with 120W charging",
      "Special": "Leica camera partnership"
    }
  },
  {
    id: 8,
    name: "ASUS ROG Zephyrus",
    price: 32999000,
    category: "Laptops",
    rating: 4.7,
    description: "Gaming laptop with RTX 4070 GPU. Unleash your gaming potential with this powerful yet portable gaming machine.",
    image: "/assets/products/laptops/ASUS ROG Zephyrus.jpg",
    stock: 12,
    brand: "ASUS",
    specs: {
      "Display": "16-inch QHD+ 240Hz",
      "Processor": "AMD Ryzen 9 7940HS",
      "Memory": "32GB DDR5",
      "Storage": "1TB PCIe 4.0 SSD",
      "Graphics": "NVIDIA RTX 4070",
      "Cooling": "ROG Intelligent Cooling"
    }
  },
  {
    id: 9,
    name: "HP Spectre x360",
    price: 24999000,
    category: "Laptops",
    rating: 4.5,
    description: "Convertible laptop with premium build. Versatile 2-in-1 design with stunning craftsmanship and powerful performance.",
    image: "/assets/products/laptops/HP Spectre x360.jpg",
    stock: 18,
    brand: "HP",
    specs: {
      "Display": "13.5-inch 3K2K OLED Touch",
      "Processor": "Intel Core i7-1355U",
      "Memory": "16GB LPDDR4x",
      "Storage": "512GB PCIe SSD",
      "Graphics": "Intel Iris Xe",
      "Battery": "Up to 16 hours"
    }
  },
  {
    id: 10,
    name: "Lenovo ThinkPad X1",
    price: 28999000,
    category: "Laptops",
    rating: 4.6,
    description: "Business laptop with legendary durability. Enterprise-grade security and reliability meets premium design.",
    image: "/assets/products/laptops/Lenovo ThinkPad X1.jpg",
    stock: 22,
    brand: "Lenovo",
    specs: {
      "Display": "14-inch 2.8K OLED",
      "Processor": "Intel Core i7-1365U",
      "Memory": "32GB LPDDR5",
      "Storage": "1TB PCIe SSD",
      "Security": "IR camera, fingerprint reader",
      "Build": "MIL-STD-810H certified"
    }
  }
];

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [selectedImage, setSelectedImage] = useState(0);

  const product = dummyProducts.find(p => p.id === parseInt(resolvedParams.id));

  if (!product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-slate-400 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg font-semibold hover:from-primary-500 hover:to-secondary-500 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    console.log(`Adding ${quantity} x ${product.name} to cart`);
    // Add cart logic here
  };

  const relatedProducts = dummyProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Back Button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-700/40 border border-slate-700/50 text-slate-300 hover:text-white rounded-lg transition-all duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>
        <div className="text-slate-400 text-sm">
          <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
          {' > '}
          <Link href="/products" className="hover:text-primary-400 transition-colors">Products</Link>
          {' > '}
          <span className="text-white">{product.name}</span>
        </div>
      </div>

      {/* Product Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden group">
            <div className="aspect-square relative">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                priority
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'w-full h-full flex items-center justify-center bg-slate-800/50';
                    placeholder.innerHTML = `
                      <svg class="w-24 h-24 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    `;
                    parent.appendChild(placeholder);
                  }
                }}
              />
            </div>
            {/* Stock Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${
                product.stock > 20 
                  ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                  : product.stock > 0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                  : 'bg-red-500/20 text-red-400 border border-red-400/30'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category & Brand */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 border border-primary-400/30 text-primary-400 rounded-full text-xs font-semibold">
              {product.category}
            </span>
            <span className="text-slate-400 text-sm">by <span className="text-white font-semibold">{product.brand}</span></span>
          </div>

          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {product.name}
          </h1>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-white font-bold">{product.rating}</span>
            </div>
            <span className="text-slate-400 text-sm">(128 reviews)</span>
          </div>

          {/* Price */}
          <div className="border-t border-b border-slate-700/50 py-6">
            <p className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </p>
            <p className="text-slate-400 text-sm mt-1">Inclusive of all taxes</p>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-3">
            <label className="text-white font-semibold">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-16 text-center text-white font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="w-10 h-10 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg text-white transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <span className="text-slate-400 text-sm ml-2">({product.stock} available)</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1 py-4 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-300 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-slate-300">Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-slate-300">1 Year Warranty</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-slate-300">30 Days Return</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-slate-300">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-700/50">
          {[
            { id: 'description', label: 'Description'},
            { id: 'specs', label: 'Specifications'},
            { id: 'reviews', label: 'Reviews'},
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-400/10 to-secondary-400/10 text-white border-b-2 border-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">About this product</h3>
              <p className="text-slate-300 leading-relaxed">{product.description}</p>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">Key Features</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Premium build quality
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Advanced technology
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Long-lasting performance
                    </li>
                  </ul>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">What's in the Box</h4>
                  <ul className="space-y-2 text-slate-300 text-sm">
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {product.name}
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Charging cable & adapter
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      User manual & warranty card
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Technical Specifications</h3>
              <div className="grid gap-3">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-4 bg-slate-900/50 rounded-lg p-4 hover:bg-slate-900/70 transition-colors">
                    <span className="text-slate-400 font-medium min-w-[150px]">{key}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
                <button className="px-4 py-2 bg-primary-400/10 hover:bg-primary-400/20 text-primary-400 rounded-lg text-sm font-semibold transition-all border border-primary-400/30">
                  Write a Review
                </button>
              </div>

              {/* Average Rating */}
              <div className="bg-slate-900/50 rounded-lg p-6">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-white mb-2">{product.rating}</p>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-slate-400 text-sm">128 reviews</p>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-slate-400 text-sm w-12">{star} star</span>
                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                            style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%` }}
                          ></div>
                        </div>
                        <span className="text-slate-400 text-sm w-12 text-right">
                          {star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-4">
                {[
                  { name: 'John Doe', rating: 5, date: 'Feb 15, 2026', comment: 'Excellent product! Exceeded my expectations. Fast delivery and great packaging.' },
                  { name: 'Jane Smith', rating: 4, date: 'Feb 10, 2026', comment: 'Very good quality, works as described. Would recommend to others.' },
                  { name: 'Mike Johnson', rating: 5, date: 'Feb 5, 2026', comment: 'Amazing! Best purchase I\'ve made this year. Highly recommended!' },
                ].map((review, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-900/70 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-semibold">{review.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-slate-500 text-xs">•</span>
                          <span className="text-slate-400 text-xs">{review.date}</span>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-slate-300 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Related Products</h2>
            <Link
              href={`/products?category=${product.category}`}
              className="text-primary-400 text-sm font-semibold hover:text-secondary-400 transition-colors flex items-center gap-1"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="group bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800/50 hover:border-primary-400/30 transition-all duration-300"
              >
                <div className="relative h-48 bg-slate-800/50">
                  <Image
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold mb-1 line-clamp-1">{relatedProduct.name}</h3>
                  <p className="text-slate-400 text-sm mb-2 line-clamp-1">{relatedProduct.description}</p>
                  <p className="text-primary-400 font-bold">{formatPrice(relatedProduct.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
