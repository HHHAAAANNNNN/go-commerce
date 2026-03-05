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
}

interface OrderDetailItem {
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

                <button
                  onClick={() => openDetail(order.id)}
                  className="flex-shrink-0 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500 text-white text-sm font-medium rounded-xl transition-all"
                >
                  View Detail
                </button>
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
    </div>
  );
}
