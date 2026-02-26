"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  description: string;
  image?: string;
  stock: number;
  brand: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

  useEffect(() => {
    fetchProduct();
  }, [resolvedParams.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/products/${resolvedParams.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProduct(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    console.log(`Adding ${quantity} x ${product?.name} to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-lg transition-all group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Products
        </Link>
        <div className="text-slate-400 text-sm">
          <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary-400 transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{product.name}</span>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="aspect-square relative">
              {product.image && !imageError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <svg className="w-24 h-24 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* Stock Badge */}
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm shadow-lg ${
                product.stock > 20
                  ? 'bg-green-500/90 text-white'
                  : product.stock > 0
                  ? 'bg-amber-500/90 text-white'
                  : 'bg-red-500/90 text-white'
              }`}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Category & Brand */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-4 py-2 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 border border-primary-400/30 text-primary-400 rounded-full text-sm font-semibold">
              {product.category}
            </span>
            {product.brand && (
              <span className="text-slate-400 text-sm">by <span className="text-white font-semibold">{product.brand}</span></span>
            )}
          </div>

          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white font-bold">{product.rating || "N/A"}</span>
            <span className="text-slate-400 text-sm">(Customer reviews)</span>
          </div>

          {/* Price */}
          <div className="border-t border-b border-slate-700 py-6">
            <p className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              {formatPrice(product.price)}
            </p>
            <p className="text-slate-400 text-sm mt-1">Inclusive of all taxes</p>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <label className="text-white font-semibold">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={product.stock === 0}
                className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed border border-slate-700 rounded-lg text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-16 text-center text-white font-bold text-xl">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={product.stock === 0}
                className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed border border-slate-700 rounded-lg text-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="flex-1 py-4 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { icon: 'M5 13l4 4L19 7', text: 'Free Shipping' },
              { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: '1 Year Warranty' },
              { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', text: '30 Days Return' },
              { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', text: 'Secure Payment' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
                <span className="text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-700">
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
                  ? 'bg-primary-400/10 text-white border-b-2 border-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">About this product</h3>
              <p className="text-slate-300 leading-relaxed">
                {product.description || "High-quality product with excellent features and performance. Perfect for everyday use."}
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Technical Specifications</h3>
              <div className="bg-slate-900 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400">Specifications will be available soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
                <button className="px-4 py-2 bg-primary-400/10 hover:bg-primary-400/20 text-primary-400 rounded-lg text-sm font-semibold transition-all border border-primary-400/30">
                  Write a Review
                </button>
              </div>
              <div className="bg-slate-900 rounded-lg p-8 text-center">
                <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-slate-400">No reviews yet. Be the first to review this product!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
