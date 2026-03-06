"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const BACKEND = "http://localhost:8080";

interface Order {
  id: string;
  products: string;
  total_qty: number;
  total: number;
  status: string;
  created_at: string;
  has_reviewed: boolean;
}

interface OrderDetailItem {
  product_id: number;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderDetail {
  order: {
    order_number: string;
    status: string;
    subtotal: number;
    discount: number;
    total: number;
    created_at: string;
  };
  items: OrderDetailItem[];
}

const STATUS_TABS = ["All", "pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-amber-500/20 border border-amber-500/40 text-amber-400",
  processing: "bg-blue-500/20 border border-blue-500/40 text-blue-400",
  shipped:    "bg-purple-500/20 border border-purple-500/40 text-purple-400",
  delivered:  "bg-green-500/20 border border-green-500/40 text-green-400",
  cancelled:  "bg-red-500/20 border border-red-500/40 text-red-400",
};

const STATUS_NEXT: Record<string, { label: string; next: string; style: string }[]> = {
  pending:    [
    { label: "Mark as Processing", next: "processing", style: "border-blue-500/40 text-blue-400 hover:bg-blue-500/20" },
    { label: "Cancel Order",       next: "cancelled",  style: "border-red-500/40 text-red-400 hover:bg-red-500/20" },
  ],
  processing: [
    { label: "Mark as Shipped",    next: "shipped",    style: "border-purple-500/40 text-purple-400 hover:bg-purple-500/20" },
    { label: "Cancel Order",       next: "cancelled",  style: "border-red-500/40 text-red-400 hover:bg-red-500/20" },
  ],
  shipped:    [
    { label: "Confirm Delivery",   next: "delivered",  style: "border-green-500/40 text-green-400 hover:bg-green-500/20" },
  ],
  delivered:  [],
  cancelled:  [],
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{
    open: boolean;
    orderNumber: string;
    items: OrderDetailItem[];
  }>({ open: false, orderNumber: "", items: [] });
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [hoverRatings, setHoverRatings] = useState<Record<number, number>>({});
  const [reviewTexts, setReviewTexts] = useState<Record<number, string>>({});
  const [submittingRating, setSubmittingRating] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${BACKEND}/api/users/${user.id}/orders?limit=100`);
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (orderNumber: string) => {
    setShowModal(true);
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${BACKEND}/api/users/${user.id}/orders/${orderNumber}`);
      const data = await res.json();
      if (data.success) setSelectedOrder(data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const updateOrderStatus = async (orderNumber: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${BACKEND}/api/users/${user.id}/orders/${orderNumber}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedOrder((prev) =>
          prev ? { ...prev, order: { ...prev.order, status: newStatus } } : prev
        );
        setOrders((prev) =>
          prev.map((o) => (o.id === orderNumber ? { ...o, status: newStatus } : o))
        );
        if (newStatus === "delivered") {
          setShowModal(false);
          setToast("🎉 Order delivered! Your dashboard stats have been updated.");
          setTimeout(() => setToast(""), 5000);
        }
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openRatingModal = async (orderNumber: string) => {
    setRatingModal({ open: false, orderNumber: "", items: [] });
    setRatings({});
    setHoverRatings({});
    setReviewTexts({});
    setDetailLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const res = await fetch(`${BACKEND}/api/users/${user.id}/orders/${orderNumber}`);
      const data = await res.json();
      if (data.success) {
        setRatingModal({ open: true, orderNumber, items: data.data.items || [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDetailLoading(false);
    }
  };

  const submitRatings = async () => {
    if (Object.keys(ratings).length === 0) return;
    setSubmittingRating(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = Object.entries(ratings).map(([productId, rating]) => ({
        product_id: Number(productId),
        rating,
        review_text: reviewTexts[Number(productId)] ?? "",
      }));
      const res = await fetch(
        `${BACKEND}/api/users/${user.id}/orders/${ratingModal.orderNumber}/reviews`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
      );
      const data = await res.json();
      if (data.success) {
        setReviewedOrders((prev) => new Set(prev).add(ratingModal.orderNumber));
        setOrders((prev) =>
          prev.map((o) => (o.id === ratingModal.orderNumber ? { ...o, has_reviewed: true } : o))
        );
        setRatingModal({ open: false, orderNumber: "", items: [] });
        setToast("⭐ Thanks for your review!");
        setTimeout(() => setToast(""), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingRating(false);
    }
  };

  const formatIDR = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const imageSrc = (path?: string) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BACKEND}${path}`;
  };

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "All" || o.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.products.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const countFor = (tab: string) =>
    tab === "All" ? orders.length : orders.filter((o) => o.status === tab).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[60] bg-green-500/20 border border-green-500/40 text-green-300 px-5 py-3 rounded-xl backdrop-blur-sm text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Order History</h1>
          <p className="text-slate-400 mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                activeTab === tab
                  ? "bg-gradient-to-r from-primary-400/20 to-secondary-400/20 border-primary-400/40 text-primary-400"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-xs opacity-60">({countFor(tab)})</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by order number or product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-primary-400/50 transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="text-6xl">📦</div>
          <h3 className="text-xl font-semibold text-white">No orders found</h3>
          <p className="text-slate-400 max-w-sm text-sm">
            {orders.length === 0
              ? "You haven't placed any orders yet. Start shopping!"
              : "No orders match your current filter or search."}
          </p>
          {orders.length === 0 && (
            <Link
              href="/products"
              className="mt-2 px-6 py-2.5 bg-gradient-to-r from-primary-400 to-secondary-400 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
            >
              Shop Now
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-white text-sm font-mono tracking-wide">{order.id}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                        STATUS_STYLE[order.status] ?? "bg-slate-700 border border-slate-600 text-slate-300"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-slate-500 text-xs">{order.created_at}</span>
                  </div>

                  {/* Products */}
                  <p className="text-slate-300 text-sm truncate">{order.products}</p>

                  {/* Bottom row */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      {order.total_qty} item{order.total_qty > 1 ? "s" : ""}
                    </span>
                    <span className="text-white font-semibold">{formatIDR(order.total)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => openDetail(order.id)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white text-sm font-medium rounded-xl transition-all"
                  >
                    View Detail
                  </button>
                  {order.status === "delivered" && (
                    <button
                      onClick={() => openRatingModal(order.id)}
                      disabled={order.has_reviewed || reviewedOrders.has(order.id)}
                      className={`px-4 py-2 border text-sm font-medium rounded-xl transition-all ${
                        order.has_reviewed || reviewedOrders.has(order.id)
                          ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed"
                          : "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500/60 text-amber-400"
                      }`}
                    >
                      {order.has_reviewed || reviewedOrders.has(order.id) ? "✓ Reviewed" : "⭐ Rate Products"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/80">
              <div>
                <h2 className="text-white font-bold text-lg">Order Detail</h2>
                {selectedOrder && (
                  <p className="text-slate-400 text-xs mt-0.5 font-mono">{selectedOrder.order.order_number}</p>
                )}
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {detailLoading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : selectedOrder ? (
                <>
                  {/* Status + Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        STATUS_STYLE[selectedOrder.order.status] ?? "bg-slate-700 border border-slate-600 text-slate-300"
                      }`}
                    >
                      {selectedOrder.order.status}
                    </span>
                    <span className="text-slate-400 text-sm">{selectedOrder.order.created_at}</span>
                  </div>

                  {/* Items list */}
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, i) => {
                      const src = imageSrc(item.product_image);
                      return (
                        <div key={i} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3">
                          <div className="w-14 h-14 rounded-lg bg-slate-700/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {src ? (
                              <img
                                src={src}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-2xl">📦</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{item.product_name}</p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              {item.quantity} × {formatIDR(item.price)}
                            </p>
                          </div>
                          <p className="text-white text-sm font-semibold flex-shrink-0">{formatIDR(item.subtotal)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Price summary */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal</span>
                      <span>{formatIDR(selectedOrder.order.subtotal)}</span>
                    </div>
                    {selectedOrder.order.discount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Voucher Discount</span>
                        <span>-{formatIDR(selectedOrder.order.discount)}</span>
                      </div>
                    )}
                    <div className="border-t border-slate-700 pt-2 flex justify-between text-white font-bold text-base">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                        {formatIDR(selectedOrder.order.total)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-slate-400 text-center py-10">Failed to load order detail.</p>
              )}
            </div>

            {/* Modal Footer — Status Actions */}
            {!detailLoading && selectedOrder && (
              <div className="border-t border-slate-700/80 p-4">
                {STATUS_NEXT[selectedOrder.order.status]?.length > 0 ? (
                  <div className="flex gap-3">
                    {STATUS_NEXT[selectedOrder.order.status].map((action) => (
                      <button
                        key={action.next}
                        onClick={() => updateOrderStatus(selectedOrder.order.order_number, action.next)}
                        disabled={updatingStatus}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${action.style}`}
                      >
                        {updatingStatus ? "Updating..." : action.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={`text-center text-sm font-medium ${
                    selectedOrder.order.status === "delivered" ? "text-green-400" : "text-slate-500"
                  }`}>
                    {selectedOrder.order.status === "delivered" ? "✓ Order Completed" : "✗ Order Cancelled"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Rating Modal */}
      {ratingModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setRatingModal({ open: false, orderNumber: "", items: [] })}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/80">
              <div>
                <h2 className="text-white font-bold text-lg">Rate Your Products</h2>
                <p className="text-slate-400 text-xs mt-0.5">Share your experience with each item</p>
              </div>
              <button
                onClick={() => setRatingModal({ open: false, orderNumber: "", items: [] })}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Product list */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {ratingModal.items.map((item) => {
                const src = imageSrc(item.product_image);
                const currentRating = ratings[item.product_id] ?? 0;
                const hovered = hoverRatings[item.product_id] ?? 0;
                const displayRating = hovered || currentRating;
                return (
                  <div key={item.product_id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
                    {/* Product row */}
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-lg bg-slate-700/50 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {src ? (
                          <img src={src} alt={item.product_name} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.product_name}</p>
                        <p className="text-slate-400 text-xs mt-0.5">{item.quantity} × {formatIDR(item.price)}</p>
                      </div>
                    </div>

                    {/* Star rating */}
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-medium">Your Rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onMouseEnter={() => setHoverRatings((prev) => ({ ...prev, [item.product_id]: star }))}
                            onMouseLeave={() => setHoverRatings((prev) => { const n = { ...prev }; delete n[item.product_id]; return n; })}
                            onClick={() => setRatings((prev) => ({ ...prev, [item.product_id]: star }))}
                            className="transition-transform hover:scale-110 active:scale-95"
                          >
                            <svg
                              className={`w-8 h-8 transition-colors ${star <= displayRating ? "text-amber-400" : "text-slate-600"}`}
                              viewBox="0 0 20 20"
                              fill={star <= displayRating ? "currentColor" : "none"}
                              stroke="currentColor"
                              strokeWidth={star <= displayRating ? 0 : 1}
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                        {currentRating > 0 && (
                          <span className="text-amber-400 text-sm font-semibold ml-2">
                            {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][currentRating]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Optional review text */}
                    <textarea
                      rows={2}
                      placeholder="Write a review (optional)..."
                      value={reviewTexts[item.product_id] ?? ""}
                      onChange={(e) => setReviewTexts((prev) => ({ ...prev, [item.product_id]: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-400/50 resize-none transition-colors"
                    />
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700/80 p-4 flex gap-3">
              <button
                onClick={() => setRatingModal({ open: false, orderNumber: "", items: [] })}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitRatings}
                disabled={submittingRating || Object.keys(ratings).length === 0}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submittingRating ? "Saving..." : "Save Ratings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
