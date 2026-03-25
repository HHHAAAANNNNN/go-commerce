"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authFetch, BACKEND, publicFetch, DEMO_MODE } from "../../../utils/api";

interface ProductSpec {
  key: string;
  value: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  total_reviews: number;
  description: string;
  image?: string;
  stock: number;
  brand: string;
  specifications?: ProductSpec[];
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [role, setRole] = useState<string>("customer");

  // Reviews state
  interface Review {
    id: number;
    user_name: string;
    rating: number;
    review_text: string;
    is_verified: boolean;
    created_at: string;
  }
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsFetched, setReviewsFetched] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) setRole((JSON.parse(raw) as { role?: string }).role ?? "customer");
    } catch { /* ignore */ }
    fetchProduct();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (activeTab === 'reviews' && !reviewsFetched) {
      fetchReviews();
    }
  }, [activeTab]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await publicFetch(`${BACKEND}/api/products/${resolvedParams.id}/reviews`);
      const data = await res.json();
      if (data.success) setReviews(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewsLoading(false);
      setReviewsFetched(true);
    }
  };

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await publicFetch(`${BACKEND}/api/products/${resolvedParams.id}`);
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

  const imageSrc = (path?: string) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BACKEND}${path}`;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // ── Demo mode: show notification, don't call API ──────────────────────────
    if (DEMO_MODE) {
      setSuccessMsg("🛒 Demo Mode — keranjang sudah berisi produk demo. Cek halaman Cart!");
      setTimeout(() => setSuccessMsg(''), 4000);
      return;
    }
    // ─────────────────────────────────────────────────────────────────────────

    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setSuccessMsg("Please login first");
        setTimeout(() => setSuccessMsg(''), 3000);
        return;
      }
      const user = JSON.parse(storedUser);
      const res = await authFetch(`${BACKEND}/api/users/${user.id}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: String(product.id), quantity }),
      });
      const data = await res.json();
      if (data.success) {
        window.dispatchEvent(new Event("cartUpdated"));
        setSuccessMsg(`${product.name} (×${quantity}) ditambahkan ke keranjang!`);
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setSuccessMsg(data.message || "Failed to add to cart");
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setSuccessMsg("Error: could not reach server");
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleProductSaved = () => {
    setShowEditModal(false);
    setSuccessMsg('Produk berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
    fetchProduct();
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
          <p className="text-slate-400 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg font-semibold hover:from-primary-500 hover:to-secondary-500 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const fullImageSrc = imageSrc(product.image);
  const specs = product.specifications ?? [];

  return (
    <>
      {/* Success Toast — below navbar */}
      {successMsg && (
        <div className={`fixed top-[85px] right-6 z-[60] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl backdrop-blur-sm border ${successMsg.startsWith("🛒 Demo")
          ? "bg-amber-500/20 border-amber-500/40"
          : "bg-green-500/20 border-green-500/40"
          }`}>
          {successMsg.startsWith("🛒 Demo") ? (
            <span className="text-amber-300 text-lg shrink-0">ℹ️</span>
          ) : (
            <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span className={`font-semibold ${successMsg.startsWith("🛒 Demo") ? "text-amber-300" : "text-green-300"}`}>
            {successMsg}
          </span>
        </div>
      )}

      {/* Floating Edit Button — admin only */}
      {role === 'admin' && (
        <button
          onClick={() => setShowEditModal(true)}
          title="Edit Product"
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white shadow-2xl shadow-primary-400/40 hover:shadow-primary-400/60 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-end flex-wrap gap-4">
          <div className="text-slate-400 text-sm">
            <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-primary-400 transition-colors">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </div>

        {/* Floating Back to Products — fixed, stays visible on scroll */}
        <Link
          href="/products"
          className="fixed top-[85px] left-4 md:left-72 z-50 inline-flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl shadow-2xl shadow-black/40 hover:shadow-black/60 hover:scale-105 active:scale-95 backdrop-blur-sm transition-all duration-200 group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back to Products</span>
        </Link>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="aspect-square relative">
                {fullImageSrc && !imageError ? (
                  <img src={fullImageSrc} alt={product.name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <svg className="w-24 h-24 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4">
                <span className={`px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-sm shadow-lg ${product.stock > 20 ? 'bg-green-500/90 text-white' : product.stock > 0 ? 'bg-amber-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-4 py-2 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 border border-primary-400/30 text-primary-400 rounded-full text-sm font-semibold">{product.category}</span>
                {product.brand && <span className="text-slate-400 text-sm">by <span className="text-white font-semibold">{product.brand}</span></span>}
              </div>
              {/* Delete button — admin only */}
              {role === 'admin' && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 rounded-lg text-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${product.total_reviews > 0 && i < Math.floor(product.rating || 0) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white font-bold">{product.total_reviews > 0 ? product.rating.toFixed(1) : "N/A"}</span>
              <span className="text-slate-400 text-sm">
                {product.total_reviews > 0 ? `(${product.total_reviews} review${product.total_reviews !== 1 ? 's' : ''})` : '(No reviews yet)'}
              </span>
            </div>
            <div className="border-t border-b border-slate-700 py-4 md:py-6">
              <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">{formatPrice(product.price)}</p>
              <p className="text-slate-400 text-sm mt-1">Inclusive of all taxes</p>
            </div>
            {/* Quantity + Add to Cart — customer only */}
            {role === 'customer' && (
              <>
                <div className="space-y-3">
                  <label className="text-white font-semibold">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stock === 0} className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed border border-slate-700 rounded-lg text-white transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <span className="w-16 text-center text-white font-bold text-xl">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={product.stock === 0} className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed border border-slate-700 rounded-lg text-white transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    <span className="text-slate-400 text-sm ml-2">({product.stock} available)</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 py-4 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold rounded-lg transition-all duration-300 disabled:cursor-not-allowed">
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { icon: 'M5 13l4 4L19 7', text: 'Free Shipping' },
                { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', text: '1 Year Warranty' },
                { icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15', text: '30 Days Return' },
                { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', text: 'Secure Payment' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} /></svg>
                  <span className="text-slate-300">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
          <div className="flex border-b border-slate-700">
            {[{ id: 'description', label: 'Description' }, { id: 'specs', label: 'Specifications' }, { id: 'reviews', label: 'Reviews' }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex-1 px-3 md:px-6 py-3 md:py-4 text-sm md:text-base font-semibold transition-all ${activeTab === tab.id ? 'bg-primary-400/10 text-white border-b-2 border-primary-400' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">About this product</h3>
                <p className="text-slate-300 leading-relaxed">{product.description || "High-quality product with excellent features and performance."}</p>
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Technical Specifications</h3>
                {specs.length > 0 ? (
                  <div className="divide-y divide-slate-700 rounded-lg overflow-hidden border border-slate-700">
                    {specs.map((spec, i) => (
                      <div key={i} className={`flex items-start px-5 py-3 ${i % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-900/30'}`}>
                        <span className="w-44 shrink-0 text-slate-400 text-sm font-medium">{spec.key}</span>
                        <span className="text-white text-sm">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-slate-400">No specifications available.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Customer Reviews</h3>
                {reviewsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="bg-slate-900 rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-slate-400">No reviews yet. Be the first to review!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {rev.user_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-white text-sm font-semibold">{rev.user_name}</p>
                              <p className="text-slate-500 text-xs">{rev.created_at}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <svg key={s} className={`w-4 h-4 ${s <= rev.rating ? 'text-amber-400' : 'text-slate-600'}`}
                                  viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            {rev.is_verified && (
                              <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-full">
                                ✓ Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                        {rev.review_text && (
                          <p className="text-slate-300 text-sm leading-relaxed">{rev.review_text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal — admin only */}
      {showEditModal && product && role === 'admin' && (
        <EditProductModal product={product} onClose={() => setShowEditModal(false)} onSaved={handleProductSaved} />
      )}

      {/* Delete Modal — admin only */}
      {showDeleteModal && product && role === 'admin' && (
        <DeleteConfirmModal
          productName={product.name}
          productId={product.id}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => router.push('/products')}
        />
      )}
    </>
  );
}

// ─── Delete Confirm Modal ───────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  productName: string;
  productId: string;
  onClose: () => void;
  onDeleted: () => void;
}

function DeleteConfirmModal({ productName, productId, onClose, onDeleted }: DeleteConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await authFetch(`${BACKEND}/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menghapus produk');
      onDeleted();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus produk');
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 top-[73px] bg-black/70 z-40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md p-6">
        {/* Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 mx-auto mb-5">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-white text-center mb-2">Hapus Produk</h2>
        <p className="text-slate-400 text-center text-sm mb-1">
          Apakah kamu yakin ingin menghapus produk ini?
        </p>
        <p className="text-white font-semibold text-center text-sm mb-6 px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
          &quot;{productName}&quot;
        </p>
        <p className="text-red-400/80 text-xs text-center mb-5">
          Tindakan ini tidak dapat diurungkan. Semua data produk termasuk spesifikasi akan dihapus permanen.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 rounded-lg font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? 'Menghapus...' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Product Modal ─────────────────────────────────────────────────────

interface EditProductModalProps {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}

function EditProductModal({ product, onClose, onSaved }: EditProductModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>(product.image ?? '');

  // Helper: extract spec value by key
  const sv = (key: string) => product.specifications?.find(s => s.key === key)?.value ?? '';
  // Extract the first number from a spec string (e.g. "120 Hz" → "120", "6.7 inch" → "6.7")
  const parseNum = (val: string) => { const m = val.match(/[\d.]+/); return m ? m[0] : ''; };
  // Extract unit keyword from a spec value
  const hasUnit = (val: string, unit: string) => val.includes(unit);
  // Strip a unit suffix (e.g. "32 Ω" → "32")
  const strip = (val: string, unit: string) => val.replace(unit, '').trim();

  // Category is fixed (read-only) on edit
  const category = product.category;

  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price),
    stock: String(product.stock),
    brand: product.brand ?? '',
    description: product.description ?? '',
    rating: String(product.rating ?? 0),
  });

  // Parse RAM: e.g. "8 GB DDR5" or "8 GB"
  const ramRaw = sv('RAM');
  const ramGB = parseNum(ramRaw);
  const ramDdr = ramRaw.includes('DDR4') ? 'DDR4' : 'DDR5';

  // Parse ROM: e.g. "256 GB" or "1 TB SSD"
  const romRaw = sv('ROM');
  const romValue = parseNum(romRaw);
  const romUnit = romRaw.includes('TB') ? 'TB' : 'GB';

  // Parse Display: e.g. "6.7 inch"
  const displayRaw = sv('Display');
  const displayInch = parseNum(displayRaw);

  // Parse Refresh Rate: e.g. "120 Hz"
  const refreshRaw = sv('Refresh Rate');
  const refreshHz = parseNum(refreshRaw);

  // Parse Battery for smartphones: e.g. "5000 mAh" or just "5000"
  const batteryRaw = sv('Battery');
  const batteryMah = parseNum(batteryRaw);

  // Parse Laptop storage: e.g. "512 GB SSD" or "1 TB HDD"
  const storageRaw = sv('ROM');
  const storageValue = parseNum(storageRaw);
  const storageUnit = storageRaw.includes('TB') ? 'TB' : 'GB';
  const storageType = storageRaw.includes('HDD') ? 'HDD' : 'SSD';

  // Parse Laptop battery: e.g. "56 Wh"
  const batteryWhRaw = sv('Battery');
  const batteryWh = parseNum(batteryWhRaw);

  const [smartSpec, setSmartSpec] = useState({
    chipset: sv('Chipset'),
    ram_gb: ramGB,
    rom_value: romValue,
    rom_unit: romUnit as 'GB' | 'TB',
    display_inch: displayInch,
    refresh_rate_hz: refreshHz,
    battery: batteryMah,
    charging: sv('Charging') || 'Standard Charging',
    camera: sv('Camera'),
    connectivity: {
      network5g: sv('Connectivity').includes('5G'),
      wifi: sv('Connectivity').includes('Wi-Fi'),
      nfc: sv('Connectivity').includes('NFC'),
    },
    os_name: (sv('Operating System').startsWith('iOS') ? 'iOS' : 'Android') as 'Android' | 'iOS',
    os_version: sv('Operating System').replace(/^(Android|iOS)\s*/, ''),
  });

  const [laptopSpec, setLaptopSpec] = useState({
    cpu: sv('Chipset'),
    ram_gb: ramGB,
    ram_ddr: ramDdr as 'DDR5' | 'DDR4',
    storage_value: storageValue,
    storage_unit: storageUnit as 'GB' | 'TB',
    storage_type: storageType as 'SSD' | 'HDD',
    display: displayRaw || sv('Display'),
    gpu: '',
    battery_wh: batteryWh,
    ports: { usb: false, hdmi: false, wifi6: sv('Connectivity').includes('Wi-Fi'), other: false },
    os_name: (sv('Operating System').startsWith('macOS') ? 'macOS' : 'Windows') as 'Windows' | 'macOS',
    os_version: sv('Operating System').replace(/^(Windows|macOS)\s*/, ''),
  });

  const [audioSpec, setAudioSpec] = useState({
    frequency_response: sv('Respon Frekuensi'),
    impedance: parseNum(sv('Impedansi')),
    sensitivity: parseNum(sv('Sensitivitas')),
    driver_size: parseNum(sv('Ukuran Driver')),
  });

  // suppress unused variable warning
  void hasUnit;


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageClear = () => {
    setImageFile(null);
    setImagePreview('');
    setImageUrl('');
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    if (!form.name.trim()) { setStepError('Nama produk wajib diisi.'); return; }
    if (!form.price || parseInt(form.price) <= 0) { setStepError('Harga produk wajib diisi dan harus lebih dari 0.'); return; }
    if (form.stock === '' || parseInt(form.stock) < 0) { setStepError('Stok produk wajib diisi.'); return; }
    if (!form.brand.trim()) { setStepError('Brand wajib diisi.'); return; }
    if (!form.description.trim()) { setStepError('Deskripsi wajib diisi.'); return; }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalImageUrl = imageUrl;

      // Upload new image if provided
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const catMap: Record<string, string> = { Smartphones: 'smartphones', Laptops: 'laptops', Audio: 'audio' };
        fd.append('category', catMap[category] ?? category.toLowerCase());
        const uploadRes = await authFetch(`${BACKEND}/api/upload`, { method: 'POST', body: fd });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          // Try both possible structures
          if (uploadData.data?.url) {
            finalImageUrl = uploadData.data.url;
          } else if (uploadData.url) {
            finalImageUrl = uploadData.url;
          }
        }
      }

      // Build spec payload
      let specPayload: Record<string, unknown> = {};
      if (category === 'Smartphones') {
        specPayload = {
          chipset: smartSpec.chipset,
          ram_gb: smartSpec.ram_gb ? parseInt(smartSpec.ram_gb) : 0,
          rom_value: smartSpec.rom_value ? parseInt(smartSpec.rom_value) : 0,
          rom_unit: smartSpec.rom_unit,
          display_inch: smartSpec.display_inch ? parseFloat(smartSpec.display_inch) : 0,
          refresh_rate_hz: smartSpec.refresh_rate_hz ? parseInt(smartSpec.refresh_rate_hz) : 0,
          battery: smartSpec.battery,
          charging: smartSpec.charging,
          camera: smartSpec.camera,
          connectivity_5g: smartSpec.connectivity.network5g,
          connectivity_wifi: smartSpec.connectivity.wifi,
          connectivity_nfc: smartSpec.connectivity.nfc,
          os_name: smartSpec.os_name,
          os_version: smartSpec.os_version,
        };
      } else if (category === 'Laptops') {
        specPayload = {
          chipset: laptopSpec.cpu,
          ram_gb: laptopSpec.ram_gb ? parseInt(laptopSpec.ram_gb) : 0,
          rom_value: laptopSpec.storage_value ? parseInt(laptopSpec.storage_value) : 0,
          rom_unit: laptopSpec.storage_unit,
          storage_type: laptopSpec.storage_type,
          battery: laptopSpec.battery_wh ? `${laptopSpec.battery_wh} Wh` : '',
          display: laptopSpec.display,
          gpu: laptopSpec.gpu,
          os_name: laptopSpec.os_name,
          os_version: laptopSpec.os_version,
          ram_ddr: laptopSpec.ram_ddr,
          connectivity_wifi: laptopSpec.ports.wifi6,
        };
      } else if (category === 'Audio') {
        specPayload = {
          frequency_response: audioSpec.frequency_response,
          impedance: audioSpec.impedance,
          sensitivity: audioSpec.sensitivity,
          driver_size: audioSpec.driver_size,
        };
      }

      const res = await authFetch(`${BACKEND}/api/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: form.name,
          price: parseInt(form.price),
          stock: parseInt(form.stock),
          category: category,
          brand: form.brand,
          description: form.description,
          image: finalImageUrl,
          rating: parseFloat(form.rating),
          ...specPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal memperbarui produk');
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui produk');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50";
  const labelCls = "block text-slate-300 text-sm font-medium mb-2";

  // Current image to display (new preview OR existing URL)
  const displayImage = imagePreview || (imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `${BACKEND}${imageUrl}`) : '');

  return (
    <div className="fixed inset-0 top-[73px] bg-black/70 z-40 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-73px-2rem)] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit Product</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${step === 1 ? 'bg-primary-400 text-white' : 'bg-slate-700 text-slate-400'}`}>
                1. Informasi Dasar
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${step === 2 ? 'bg-primary-400 text-white' : 'bg-slate-700 text-slate-400'}`}>
                2. Spesifikasi
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Error banners */}
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>}
          {stepError && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">{stepError}</div>}

          {/* ── STEP 1: Basic Info ── */}
          {step === 1 && (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className={labelCls}>Nama Produk *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g., Sony WH-1000XM5" />
                </div>
                {/* Price */}
                <div>
                  <label className={labelCls}>Harga (IDR) *</label>
                  <input type="number" required min="1" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inputCls} />
                </div>
                {/* Stock */}
                <div>
                  <label className={labelCls}>Stok *</label>
                  <input type="number" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inputCls} />
                </div>
                {/* Category - Read Only */}
                <div>
                  <label className={labelCls}>Kategori</label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/60 border border-slate-700 rounded-lg cursor-not-allowed">
                    <span className="px-2 py-0.5 bg-primary-400/20 border border-primary-400/40 text-primary-400 rounded-full text-xs font-semibold">{category}</span>
                    <span className="text-slate-500 text-xs">Kategori tidak dapat diubah</span>
                  </div>
                </div>
                {/* Brand */}
                <div>
                  <label className={labelCls}>Brand *</label>
                  <input type="text" required value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} className={inputCls} placeholder="e.g., Sony" />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className={labelCls}>Gambar Produk</label>
                  <div className="flex items-center gap-4">
                    {displayImage && (
                      <div className="relative shrink-0">
                        <img src={displayImage} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-700" />
                        <button
                          type="button"
                          onClick={handleImageClear}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-slate-700 hover:border-primary-400/50 rounded-lg p-5 text-center transition-colors">
                        <svg className="w-7 h-7 text-slate-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-400 text-sm">{imageFile ? imageFile.name : displayImage ? 'Klik untuk ganti gambar' : 'Klik untuk upload gambar'}</p>
                        <p className="text-slate-500 text-xs mt-1">JPG, PNG (Max 5MB)</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className={labelCls}>Deskripsi *</label>
                  <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className={inputCls} placeholder="Deskripsi produk..." />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white rounded-lg font-medium transition-all">
                  Selanjutnya: Spesifikasi →
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Specifications ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-base font-bold text-white pb-2 border-b border-slate-700">Spesifikasi — {category}</h3>

              {/* Smartphone */}
              {category === 'Smartphones' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Chipset</label><input type="text" value={smartSpec.chipset} onChange={e => setSmartSpec({ ...smartSpec, chipset: e.target.value })} className={inputCls} placeholder="e.g., Snapdragon 8 Gen 3" /></div>
                  <div>
                    <label className={labelCls}>RAM (GB)</label>
                    <input type="number" min="1" value={smartSpec.ram_gb} onChange={e => setSmartSpec({ ...smartSpec, ram_gb: e.target.value })} className={inputCls} placeholder="e.g., 8" />
                  </div>
                  <div>
                    <label className={labelCls}>ROM (Storage)</label>
                    <div className="flex gap-2">
                      <input type="number" min="1" value={smartSpec.rom_value} onChange={e => setSmartSpec({ ...smartSpec, rom_value: e.target.value })} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50" placeholder="256" />
                      <select value={smartSpec.rom_unit} onChange={e => setSmartSpec({ ...smartSpec, rom_unit: e.target.value as 'GB' | 'TB' })} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white focus:outline-none"><option>GB</option><option>TB</option></select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Display (inch)</label>
                    <input type="number" step="0.1" value={smartSpec.display_inch} onChange={e => setSmartSpec({ ...smartSpec, display_inch: e.target.value })} className={inputCls} placeholder="6.7" />
                  </div>
                  <div>
                    <label className={labelCls}>Refresh Rate (Hz)</label>
                    <input type="number" value={smartSpec.refresh_rate_hz} onChange={e => setSmartSpec({ ...smartSpec, refresh_rate_hz: e.target.value })} className={inputCls} placeholder="120" />
                  </div>
                  <div>
                    <label className={labelCls}>Battery (mAh)</label>
                    <input type="number" value={smartSpec.battery} onChange={e => setSmartSpec({ ...smartSpec, battery: e.target.value })} className={inputCls} placeholder="5000" />
                  </div>
                  <div>
                    <label className={labelCls}>Charging</label>
                    <select value={smartSpec.charging} onChange={e => setSmartSpec({ ...smartSpec, charging: e.target.value })} className={inputCls}>
                      <option>Standard Charging</option><option>Fast Charging</option><option>Super Fast Charging</option><option>Wireless Charging</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Operating System</label>
                    <div className="flex gap-2">
                      <select value={smartSpec.os_name} onChange={e => setSmartSpec({ ...smartSpec, os_name: e.target.value as 'Android' | 'iOS' })} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white focus:outline-none"><option>Android</option><option>iOS</option></select>
                      <input type="text" value={smartSpec.os_version} onChange={e => setSmartSpec({ ...smartSpec, os_version: e.target.value })} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none" placeholder="e.g., 14" />
                    </div>
                  </div>
                  <div className="md:col-span-2"><label className={labelCls}>Camera</label><input type="text" value={smartSpec.camera} onChange={e => setSmartSpec({ ...smartSpec, camera: e.target.value })} className={inputCls} placeholder="50MP + 12MP + 10MP" /></div>
                  <div className="md:col-span-2 bg-slate-800/50 rounded-lg p-4">
                    <label className={labelCls}>Connectivity</label>
                    <div className="flex gap-6">
                      {[{ key: 'network5g', label: '5G' }, { key: 'wifi', label: 'Wi-Fi' }, { key: 'nfc', label: 'NFC' }].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={smartSpec.connectivity[key as keyof typeof smartSpec.connectivity]} onChange={e => setSmartSpec({ ...smartSpec, connectivity: { ...smartSpec.connectivity, [key]: e.target.checked } })} className="w-4 h-4 rounded bg-slate-700" />
                          <span className="text-slate-300 text-sm">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Laptop */}
              {category === 'Laptops' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Processor (CPU)</label><input type="text" value={laptopSpec.cpu} onChange={e => setLaptopSpec({ ...laptopSpec, cpu: e.target.value })} className={inputCls} placeholder="Intel Core i7-13700H" /></div>
                  <div>
                    <label className={labelCls}>RAM</label>
                    <div className="flex gap-2">
                      <input type="number" value={laptopSpec.ram_gb} onChange={e => setLaptopSpec({ ...laptopSpec, ram_gb: e.target.value })} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none" placeholder="16" />
                      <span className="bg-slate-700 px-3 py-3 rounded-lg text-white text-sm">GB</span>
                      <select value={laptopSpec.ram_ddr} onChange={e => setLaptopSpec({ ...laptopSpec, ram_ddr: e.target.value as 'DDR5' | 'DDR4' })} className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-3 text-white text-sm focus:outline-none"><option>DDR5</option><option>DDR4</option></select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Storage</label>
                    <div className="flex gap-2">
                      <input type="number" value={laptopSpec.storage_value} onChange={e => setLaptopSpec({ ...laptopSpec, storage_value: e.target.value })} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-3 text-white focus:outline-none" placeholder="512" />
                      <select value={laptopSpec.storage_unit} onChange={e => setLaptopSpec({ ...laptopSpec, storage_unit: e.target.value as 'GB' | 'TB' })} className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-3 text-white text-sm focus:outline-none"><option>GB</option><option>TB</option></select>
                      <select value={laptopSpec.storage_type} onChange={e => setLaptopSpec({ ...laptopSpec, storage_type: e.target.value as 'SSD' | 'HDD' })} className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-3 text-white text-sm focus:outline-none"><option>SSD</option><option>HDD</option></select>
                    </div>
                  </div>
                  <div><label className={labelCls}>Display</label><input type="text" value={laptopSpec.display} onChange={e => setLaptopSpec({ ...laptopSpec, display: e.target.value })} className={inputCls} placeholder="15.6 inch FHD IPS" /></div>
                  <div><label className={labelCls}>GPU</label><input type="text" value={laptopSpec.gpu} onChange={e => setLaptopSpec({ ...laptopSpec, gpu: e.target.value })} className={inputCls} placeholder="NVIDIA RTX 4050" /></div>
                  <div><label className={labelCls}>Battery (Wh)</label><input type="number" value={laptopSpec.battery_wh} onChange={e => setLaptopSpec({ ...laptopSpec, battery_wh: e.target.value })} className={inputCls} placeholder="56" /></div>
                  <div>
                    <label className={labelCls}>Operating System</label>
                    <div className="flex gap-2">
                      <select value={laptopSpec.os_name} onChange={e => setLaptopSpec({ ...laptopSpec, os_name: e.target.value as 'Windows' | 'macOS' })} className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white focus:outline-none"><option>Windows</option><option>macOS</option></select>
                      <input type="text" value={laptopSpec.os_version} onChange={e => setLaptopSpec({ ...laptopSpec, os_version: e.target.value })} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none" placeholder="11 Pro" />
                    </div>
                  </div>
                </div>
              )}

              {/* Audio */}
              {category === 'Audio' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Respon Frekuensi (Hz)</label>
                    <input type="text" value={audioSpec.frequency_response} onChange={e => setAudioSpec({ ...audioSpec, frequency_response: e.target.value })} className={inputCls} placeholder="20Hz - 20kHz" />
                  </div>
                  <div>
                    <label className={labelCls}>Impedansi (Ω)</label>
                    <div className="flex gap-2">
                      <input type="number" value={audioSpec.impedance} onChange={e => setAudioSpec({ ...audioSpec, impedance: e.target.value })} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50" placeholder="32" />
                      <span className="bg-slate-700 px-3 py-3 rounded-lg text-white text-sm">Ω</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Sensitivitas (dB)</label>
                    <div className="flex gap-2">
                      <input type="number" step="0.1" value={audioSpec.sensitivity} onChange={e => setAudioSpec({ ...audioSpec, sensitivity: e.target.value })} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50" placeholder="108" />
                      <span className="bg-slate-700 px-3 py-3 rounded-lg text-white text-sm">dB</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Ukuran Driver (mm)</label>
                    <div className="flex gap-2">
                      <input type="number" value={audioSpec.driver_size} onChange={e => setAudioSpec({ ...audioSpec, driver_size: e.target.value })} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50" placeholder="40" />
                      <span className="bg-slate-700 px-3 py-3 rounded-lg text-white text-sm">mm</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors">← Kembali</button>
                <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed">
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
