"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND = "http://localhost:8080";

const PAYMENT_METHODS = [
  { id: "gopay", label: "GoPay" },
  { id: "ovo", label: "OVO" },
  { id: "debit", label: "Kartu Debit" },
  { id: "kredit", label: "Kartu Kredit" },
];

interface CartEntry {
  productId: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  image?: string;
  brand: string;
}

interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string; // "percentage" | "fixed_amount" | "free_shipping"
  discount_value: number;
  min_purchase: number;
  max_discount: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

function imageSrc(path?: string) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${BACKEND}${path}`;
}

export default function CartPage() {
  const router = useRouter();

  // Cart data
  const [cartEntries, setCartEntries] = useState<CartEntry[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Vouchers
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [voucherOpen, setVoucherOpen] = useState(false);

  // User & Balance
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  // Top-up modal
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("gopay");
  const [topupLoading, setTopupLoading] = useState(false);
  const topupModalRef = useRef<HTMLDivElement>(null);

  // Load cart from database + fetch product details
  const loadCart = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { setLoading(false); return; }
    try {
      const u = JSON.parse(storedUser);
      setUserId(u.id);

      // Fetch cart items from backend
      const cartRes = await fetch(`${BACKEND}/api/users/${u.id}/cart`);
      const cartData = await cartRes.json();
      const entries: CartEntry[] = cartData.success && cartData.data
        ? cartData.data.map((item: { product_id: string; quantity: number }) => ({ productId: item.product_id, quantity: item.quantity }))
        : [];
      setCartEntries(entries);

      // Fetch product details for each entry
      const productMap: Record<string, Product> = {};
      await Promise.all(
        entries.map(async (entry) => {
          try {
            const res = await fetch(`${BACKEND}/api/products/${entry.productId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data) {
                productMap[entry.productId] = data.data;
              }
            }
          } catch {
            // skip failed fetches
          }
        })
      );
      setProducts(productMap);

      // Fetch balance
      fetch(`${BACKEND}/api/users/${u.id}/balance`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setBalance(d.data.balance); })
        .catch(() => { });
    } catch {
      setCartEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load user, balance, vouchers
  useEffect(() => {
    loadCart();

    // Vouchers
    fetch(`${BACKEND}/api/vouchers`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) {
          const now = new Date();
          const active = (d.data as Voucher[]).filter(
            (v) =>
              v.is_active &&
              new Date(v.valid_until) > now &&
              (v.usage_limit === 0 || v.used_count < v.usage_limit)
          );
          setVouchers(active);
        }
      })
      .catch(() => { });
  }, [loadCart]);

  // Derived data
  const validEntries = cartEntries.filter((e) => products[e.productId]);

  const selectedEntries = validEntries.filter((e) => selectedIds.has(e.productId));
  const subtotal = selectedEntries.reduce((sum, e) => {
    const p = products[e.productId];
    return sum + (p ? p.price * e.quantity : 0);
  }, 0);

  // Calculate discount
  let discount = 0;
  if (selectedVoucher && subtotal >= selectedVoucher.min_purchase) {
    if (selectedVoucher.type === "percentage") {
      discount = (subtotal * selectedVoucher.discount_value) / 100;
      if (selectedVoucher.max_discount > 0 && discount > selectedVoucher.max_discount) {
        discount = selectedVoucher.max_discount;
      }
    } else if (selectedVoucher.type === "fixed_amount") {
      discount = selectedVoucher.discount_value;
    }
    // free_shipping: discount stays 0 (no price reduction, just free shipping)
  }
  const total = Math.max(0, subtotal - discount);

  // Handlers
  const toggleSelect = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === validEntries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(validEntries.map((e) => e.productId)));
    }
  };

  const removeItem = async (productId: string) => {
    if (!userId) return;
    try {
      await fetch(`${BACKEND}/api/users/${userId}/cart/${productId}`, { method: "DELETE" });
      setCartEntries((prev) => prev.filter((e) => e.productId !== productId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch { }
  };

  const updateQuantity = async (productId: string, qty: number) => {
    const newQty = Math.max(1, qty);
    if (!userId) return;
    try {
      await fetch(`${BACKEND}/api/users/${userId}/cart/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQty }),
      });
      setCartEntries((prev) =>
        prev.map((e) => e.productId === productId ? { ...e, quantity: newQty } : e)
      );
    } catch { }
  };

  const allSelected = validEntries.length > 0 && selectedIds.size === validEntries.length;

  // Checkout handler
  const handleCheckout = async () => {
    if (!userId || selectedEntries.length === 0) return;
    if (balance < total) return;
    try {
      const res = await fetch(`${BACKEND}/api/users/${userId}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_ids: selectedEntries.map((e) => e.productId),
          voucher_id: selectedVoucher ? String(selectedVoucher.id) : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || data.message || "Checkout gagal");
        return;
      }
      // Update local balance
      setBalance((prev) => prev - total);
      const raw = localStorage.getItem("user");
      if (raw) {
        try { localStorage.setItem("user", JSON.stringify({ ...JSON.parse(raw), balance: balance - total })); } catch { }
      }
      // Redirect to dashboard
      router.push("/dashboard?checkout=success");
    } catch {
      alert("Network error. Coba lagi.");
    }
  };

  // Top-up handler
  const handleTopup = async () => {
    if (!userId || !topupAmount) return;
    const amount = parseInt(topupAmount);
    if (amount <= 0) return;
    setTopupLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/users/${userId}/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.data.balance);
        setShowTopup(false);
        setTopupAmount("");
      }
    } catch {
      // handle error
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <div className="text-slate-400 text-sm mt-1">
            <Link href="/" className="hover:text-primary-400 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Shopping Cart</span>
          </div>
        </div>

        {validEntries.length === 0 ? (
          /* ── Empty Cart ── */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-2xl"></div>
              <div className="relative w-28 h-28 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center">
                <svg className="w-14 h-14 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-slate-400 mb-6 text-center max-w-md">Start shopping and add products to your cart to see them here.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-xl font-semibold hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary-400/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Browse Products
            </Link>
          </div>
        ) : (
          /* ── Two Column Layout ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ─── Cart Items Column ─── */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cart Header */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:border-primary-400 peer-checked:bg-primary-400 transition-all flex items-center justify-center group-hover:border-slate-400">
                      {allSelected && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-white font-semibold text-sm">
                    Select All ({validEntries.length} items)
                  </span>
                </label>
                {selectedIds.size > 0 && (
                  <span className="text-primary-400 text-sm font-medium">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>

              {/* Cart Item Cards */}
              {validEntries.map((entry) => {
                const product = products[entry.productId];
                if (!product) return null;
                const isSelected = selectedIds.has(entry.productId);
                const imgUrl = imageSrc(product.image);

                return (
                  <div
                    key={entry.productId}
                    className={`group bg-slate-800/30 backdrop-blur-sm rounded-xl border transition-all duration-300 hover:shadow-lg ${isSelected
                      ? "border-primary-400/40 shadow-primary-400/10"
                      : "border-slate-700/50 hover:border-slate-600/60"
                      }`}
                  >
                    <div className="flex items-start gap-4 p-4">
                      {/* Checkbox */}
                      <div className="pt-1 flex-shrink-0">
                        <label className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(entry.productId)}
                            className="sr-only peer"
                          />
                          <div className="w-5 h-5 rounded-md border-2 border-slate-600 peer-checked:border-primary-400 peer-checked:bg-primary-400 transition-all flex items-center justify-center hover:border-slate-400">
                            {isSelected && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Product Link Area */}
                      <Link
                        href={`/products/${entry.productId}`}
                        className="flex items-start gap-4 flex-1 min-w-0"
                      >
                        {/* Product Image */}
                        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-slate-700/50">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0 py-1">
                          {/* Category Badge */}
                          <span className="inline-block px-2.5 py-0.5 bg-primary-400/10 border border-primary-400/20 text-primary-400 rounded-full text-xs font-semibold mb-2">
                            {product.category}
                          </span>

                          {/* Product Name + Brand */}
                          <h3 className="text-white font-semibold text-base md:text-lg leading-tight mb-1 truncate group-hover:text-primary-400 transition-colors">
                            {product.name}
                          </h3>
                          {product.brand && (
                            <p className="text-slate-400 text-sm mb-3">
                              by <span className="text-slate-300 font-medium">{product.brand}</span>
                            </p>
                          )}

                          {/* Price */}
                          <p className="text-lg font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>

                      {/* Controls (Quantity + Remove) */}
                      <div className="flex flex-col items-end gap-3 flex-shrink-0 pt-1">
                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeItem(entry.productId);
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 bg-slate-800/60 border border-slate-700/50 rounded-lg">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(entry.productId, entry.quantity - 1);
                            }}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="text-white font-semibold text-sm min-w-[2rem] text-center">
                            {entry.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(entry.productId, entry.quantity + 1);
                            }}
                            className="px-2.5 py-1.5 text-slate-400 hover:text-white transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ─── Order Summary Column ─── */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700/50 sticky top-24 overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-700/50">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Order Summary
                  </h2>
                </div>

                <div className="p-5 space-y-4">
                  {/* Selected Items List */}
                  {selectedEntries.length === 0 ? (
                    <div className="text-center py-6">
                      <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      <p className="text-slate-400 text-sm">Select items to see the summary</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                        {selectedEntries.map((entry) => {
                          const product = products[entry.productId];
                          if (!product) return null;
                          return (
                            <div
                              key={entry.productId}
                              className="flex items-start justify-between gap-3 pb-3 border-b border-slate-700/30 last:border-b-0 last:pb-0"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-white text-sm font-medium truncate">{product.name}</p>
                                {product.brand && (
                                  <p className="text-slate-400 text-xs">
                                    by {product.brand}
                                  </p>
                                )}
                                {entry.quantity > 1 && (
                                  <p className="text-slate-500 text-xs mt-0.5">×{entry.quantity}</p>
                                )}
                              </div>
                              <p className="text-white text-sm font-semibold whitespace-nowrap">
                                {formatPrice(product.price * entry.quantity)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Divider */}
                      <div className="border-t border-slate-700/50"></div>

                      {/* ── Voucher Dropdown ── */}
                      <div className="rounded-xl border border-slate-700/50 overflow-hidden">
                        <button
                          onClick={() => setVoucherOpen(!voucherOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/60 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-white text-sm font-medium">
                              {selectedVoucher ? selectedVoucher.name : "Select Voucher"}
                            </span>
                          </div>
                          <svg
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${voucherOpen ? "rotate-180" : ""}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {voucherOpen && (
                          <div className="border-t border-slate-700/50 bg-slate-900/40 max-h-48 overflow-y-auto">
                            {/* No voucher option */}
                            <button
                              onClick={() => {
                                setSelectedVoucher(null);
                                setVoucherOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-slate-800/40 transition-colors border-b border-slate-700/20 ${!selectedVoucher ? "bg-primary-400/5" : ""
                                }`}
                            >
                              <p className="text-slate-400 text-sm">No voucher</p>
                            </button>

                            {vouchers.length === 0 ? (
                              <div className="px-4 py-4 text-center">
                                <p className="text-slate-500 text-xs">No vouchers available</p>
                              </div>
                            ) : (
                              vouchers.map((v) => {
                                const isDisabled = subtotal < v.min_purchase;
                                const typeLabel =
                                  v.type === "percentage"
                                    ? `${v.discount_value}% off`
                                    : v.type === "fixed_amount"
                                      ? `${formatPrice(v.discount_value)} off`
                                      : "Free Shipping";
                                const typeColor =
                                  v.type === "percentage"
                                    ? "text-green-400 bg-green-400/10 border-green-400/20"
                                    : v.type === "fixed_amount"
                                      ? "text-blue-400 bg-blue-400/10 border-blue-400/20"
                                      : "text-purple-400 bg-purple-400/10 border-purple-400/20";

                                return (
                                  <button
                                    key={v.id}
                                    onClick={() => {
                                      if (!isDisabled) {
                                        setSelectedVoucher(v);
                                        setVoucherOpen(false);
                                      }
                                    }}
                                    disabled={isDisabled}
                                    className={`w-full text-left px-4 py-3 transition-colors border-b border-slate-700/20 last:border-b-0 ${isDisabled
                                      ? "opacity-40 cursor-not-allowed"
                                      : "hover:bg-slate-800/40 cursor-pointer"
                                      } ${selectedVoucher?.id === v.id ? "bg-primary-400/5" : ""}`}
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{v.name}</p>
                                        <p className="text-slate-500 text-xs truncate">{v.code}</p>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap ${typeColor}`}>
                                        {typeLabel}
                                      </span>
                                    </div>
                                    {isDisabled && (
                                      <p className="text-amber-500/70 text-xs mt-1">
                                        Min. purchase {formatPrice(v.min_purchase)}
                                      </p>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>

                      {/* ── Balance Payment Card ── */}
                      <div className="rounded-xl border border-slate-700/50 bg-gradient-to-r from-primary-400/5 to-secondary-400/5 p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary-400/10 rounded-lg border border-primary-400/20">
                            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-400 text-xs font-medium">Pay with Balance</p>
                            <p className="text-white font-bold text-lg">{formatPrice(balance)}</p>
                          </div>
                          {balance < total && (
                            <button
                              onClick={() => setShowTopup(true)}
                              className="px-3 py-1.5 bg-primary-400/10 border border-primary-400/30 text-primary-400 rounded-lg text-xs font-semibold hover:bg-primary-400/20 transition-colors"
                            >
                              Top Up
                            </button>
                          )}
                        </div>
                        {balance < total && (
                          <p className="text-amber-400/80 text-xs mt-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.963-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Insufficient balance
                          </p>
                        )}
                      </div>

                      {/* ── Price Breakdown ── */}
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">
                            Subtotal ({selectedEntries.length} {selectedEntries.length === 1 ? "item" : "items"})
                          </span>
                          <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-green-400">Voucher Discount</span>
                            <span className="text-green-400 font-medium">-{formatPrice(discount)}</span>
                          </div>
                        )}

                        {selectedVoucher?.type === "free_shipping" && subtotal >= selectedVoucher.min_purchase && (
                          <div className="flex justify-between text-sm">
                            <span className="text-purple-400">Shipping</span>
                            <span className="text-purple-400 font-medium">Free</span>
                          </div>
                        )}

                        <div className="border-t border-slate-700/50 pt-3 mt-3">
                          <div className="flex justify-between">
                            <span className="text-white font-semibold">Total</span>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                              {formatPrice(total)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Checkout Button */}
                      <button
                        onClick={handleCheckout}
                        disabled={selectedEntries.length === 0 || balance < total}
                        className="w-full py-3.5 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-xl font-bold hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-primary-400/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        Proceed to Checkout
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>

                      <p className="text-slate-500 text-xs text-center">
                        Secure checkout with end-to-end encryption
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showTopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div
            ref={topupModalRef}
            className="bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary-400/10 to-secondary-400/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">Top Up Balance</h3>
                  <p className="text-slate-400 text-sm mt-0.5">Saldo saat ini:&nbsp;
                    <span className="text-primary-400 font-semibold">{formatPrice(balance)}</span>
                  </p>
                </div>
                <button onClick={() => setShowTopup(false)} className="p-2 hover:bg-slate-700/40 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Payment method */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-3">Metode Pembayaran</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === m.id
                        ? "bg-primary-400/20 border-primary-400/60 text-white shadow-md shadow-primary-400/20"
                        : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:border-slate-600"
                        }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Nominal Top Up</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">Rp</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={topupAmount}
                    onChange={e => setTopupAmount(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 transition-all"
                    placeholder="50.000"
                  />
                </div>
                {/* Quick amounts — cumulative */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[50000, 100000, 200000, 500000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(prev => String((parseInt(prev) || 0) + amt))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all bg-slate-800 border-slate-700 text-slate-400 hover:border-primary-400/50 hover:text-primary-300 hover:bg-primary-400/10"
                    >
                      +{formatPrice(amt)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => { setShowTopup(false); setTopupAmount(""); }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleTopup}
                disabled={topupLoading || !topupAmount}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white font-bold shadow-lg shadow-primary-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {topupLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : "Topup!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

