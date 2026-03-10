"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { authFetch } from "../../utils/api";

const BACKEND = "http://localhost:8080";

const PAYMENT_METHODS = [
  { id: "gopay", label: "GoPay" },
  { id: "ovo", label: "OVO" },
  { id: "debit", label: "Kartu Debit" },
  { id: "kredit", label: "Kartu Kredit" },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n).replace('Rp', 'Rp ');
}

interface User {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  balance: number;
  is_member: boolean;
  created_at: string;
}

interface OrderRow {
  id: string;
  products: string;
  total_qty: number;
  total: number;
  status: string;
  created_at: string;
}

interface MonthData {
  month: string;
  amount: number;
  percentage: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

interface StatsData {
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  this_year_orders: number;
  monthly_spending: MonthData[];
  category_breakdown: CategoryData[];
}

interface VoucherRow {
  id: number;
  code: string;
  name: string;
  description: string;
  type: string;
  discount_value: number;
  min_purchase: number;
  max_discount: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

interface RecommendedProduct {
  id: number;
  name: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  image: string;
  brand: string;
}

const PIE_COLORS = ["#a78bfa", "#22d3ee", "#fbbf24", "#f87171", "#34d399"];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Balance
  const [balance, setBalance] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(false);

  // Top-up modal
  const [showTopup, setShowTopup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("gopay");
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [role, setRole] = useState<string>('customer');
  const [totalUsers, setTotalUsers] = useState(0);

  // Live data
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderRow[]>([]);
  const [activeVouchers, setActiveVouchers] = useState<VoucherRow[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchDashboardData = useCallback(async (uid: number) => {
    try {
      const res = await authFetch(`${BACKEND}/api/users/${uid}/dashboard`);
      const json = await res.json();
      if (!json.success) return;
      const d = json.data;

      setBalance(d.balance ?? 0);
      setTotalSpent(d.total_spent ?? 0);
      if (d.total_users !== undefined) setTotalUsers(d.total_users);
      if (d.stats) setStats(d.stats);
      if (d.recent_orders) setRecentOrders(d.recent_orders);
      if (d.vouchers) {
        const now = new Date();
        setActiveVouchers((d.vouchers as VoucherRow[]).filter(
          v => v.is_active && new Date(v.valid_until) > now && (v.usage_limit === 0 || v.used_count < v.usage_limit)
        ));
      }
      if (d.products) {
        const shuffled = [...d.products].sort(() => Math.random() - 0.5).slice(0, 3);
        setRecommendedProducts(shuffled);
      }
    } catch (e) {
      console.error("Dashboard fetch failed", e);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { router.push("/(auth)/login"); return; }
    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setRole(parsed?.role ?? 'customer');
      if (parsed?.id) {
        fetchDashboardData(parsed.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } catch {
      router.push("/(auth)/login");
    }
  }, [router, fetchDashboardData]);

  // Show checkout success toast if redirected from cart
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      showToast("Pesanan berhasil! Terima kasih telah berbelanja 🎉", true);
      // Remove query param without full reload
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  // Close modal on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (showTopup && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowTopup(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTopup]);

  const handleTopup = async () => {
    if (!user) return;
    const amount = parseInt(topupAmount.replace(/\D/g, ""), 10);
    if (!amount || amount < 1000) {
      showToast("Masukkan nominal minimal Rp 1.000", false);
      return;
    }
    setTopupLoading(true);
    try {
      const res = await authFetch(`${BACKEND}/api/users/${user.id}/topup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Top-up gagal. Coba lagi.", false);
        return;
      }
      const newBal: number = data.data.balance;
      setBalance(newBal);
      const raw = localStorage.getItem("user");
      if (raw) {
        try { localStorage.setItem("user", JSON.stringify({ ...JSON.parse(raw), balance: newBal })); } catch { }
      }
      showToast(`Top-up ${formatIDR(amount)} berhasil! 🎉`, true);
      setShowTopup(false);
      setTopupAmount("");
    } catch {
      showToast("Network error. Coba lagi.", false);
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";

  // Dynamic tier calculation
  const TIER_BRONZE_MIN = 0;
  const TIER_GOLD_MIN = 10000000;
  const TIER_VIP_MIN = 50000000;

  const getTier = (spent: number) => {
    if (spent >= TIER_VIP_MIN) return 'VIP';
    if (spent >= TIER_GOLD_MIN) return 'Gold';
    return 'Bronze';
  };

  const currentTier = getTier(totalSpent);

  const getNextTier = (tier: string) => {
    if (tier === 'Bronze') return { name: 'Gold', target: TIER_GOLD_MIN };
    if (tier === 'Gold') return { name: 'VIP', target: TIER_VIP_MIN };
    return null; // VIP is max
  };

  const nextTierInfo = getNextTier(currentTier);

  const membershipData = {
    currentTier,
    memberSince: new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    totalSpent,
    nextTier: nextTierInfo?.name ?? 'MAX',
    nextTierTarget: nextTierInfo?.target ?? totalSpent,
    benefits: [
      {
        name: "Discount Vouchers",
        value: "Unlocked",
        active: true, // All tiers
      },
      {
        name: "Free Shipping",
        value: "Unlocked",
        active: true, // All tiers
      },
      {
        name: "Priority Support",
        value: currentTier === 'Gold' || currentTier === 'VIP' ? '24/7' : 'Locked',
        active: currentTier === 'Gold' || currentTier === 'VIP',
      },
      {
        name: "Early Access",
        value: currentTier === 'VIP' ? 'Unlocked' : 'Locked',
        active: currentTier === 'VIP',
      },
    ]
  };

  const progress = nextTierInfo
    ? Math.min(100, (totalSpent / nextTierInfo.target) * 100)
    : 100;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border backdrop-blur-md animate-fadeIn
          ${toast.ok
            ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300"
            : "bg-red-500/20 border-red-400/40 text-red-300"}`}
          style={{ animation: "slideIn .3s ease-out" }}
        >
          <span className="text-sm font-medium">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="opacity-60 hover:opacity-100 transition-opacity">✕</button>
        </div>
      )}

      {/* Top-up Modal */}
      {showTopup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div ref={modalRef} className="w-full max-w-md mx-4 bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-primary-400/10 to-secondary-400/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-lg">Top Up Balance</h3>
                  <p className="text-slate-400 text-sm mt-0.5">Saldo saat ini:&nbsp;
                    <span className="text-primary-400 font-semibold">{formatIDR(balance)}</span>
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
                      +{formatIDR(amt)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setShowTopup(false)}
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

      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 border border-primary-400/20 rounded-2xl p-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/10 rounded-full filter blur-3xl"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{greeting},</p>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent mb-2">
              {user.full_name}
            </h1>
            <p className="text-slate-300 text-lg">Welcome back to your dashboard!</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            {role === 'admin' ? (
              <>
                <div className="px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full">
                  <p className="text-red-400 font-semibold text-sm">🛡️ Administrator</p>
                </div>
                <p className="text-slate-400 text-sm">Platform Management Access</p>
              </>
            ) : (
              <>
            <div className="px-4 py-2 bg-gradient-to-r from-accent-400/20 to-accent-400/10 border border-accent-400/30 rounded-full">
              <p className="text-accent-400 font-semibold text-sm">✨ {currentTier} Member</p>
            </div>
            <p className="text-slate-400 text-sm">Member since {membershipData.memberSince}</p>
            {/* Balance row */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-300 text-sm font-medium">
                {balanceVisible ? formatIDR(balance) : "Rp ••••••"}
              </span>
              <button
                onClick={() => setBalanceVisible(v => !v)}
                className="p-1 hover:bg-slate-700/50 rounded-md transition-colors text-slate-400 hover:text-white"
                title={balanceVisible ? "Sembunyikan" : "Tampilkan saldo"}
              >
                {balanceVisible ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowTopup(true)}
                className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 hover:from-primary-500/50 hover:to-secondary-500/50 border border-primary-400/40 text-primary-300 hover:text-white rounded-full text-xs font-semibold transition-all"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Top Up
              </button>
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Admin Platform Overview (admin only) */}
      {role === 'admin' && (
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-primary-400/20 rounded-2xl p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-primary-400/10 rounded-xl border border-primary-400/30">
                  <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Platform Overview</h2>
              </div>
              <p className="text-slate-400 text-sm">Real-time business metrics across all users</p>
            </div>
            <div className="px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full">
              <p className="text-red-400 font-semibold text-sm">🛡️ Admin View</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 rounded-xl p-4 border border-primary-400/10 hover:border-primary-400/30 transition-all">
              <p className="text-slate-400 text-xs mb-1">Total Revenue</p>
              <p className="text-primary-400 font-bold text-xl">{formatIDR(totalSpent)}</p>
              <p className="text-slate-500 text-xs mt-1">From delivered orders</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 border border-cyan-400/10 hover:border-cyan-400/30 transition-all">
              <p className="text-slate-400 text-xs mb-1">Total Customers</p>
              <p className="text-cyan-400 font-bold text-xl">{totalUsers}</p>
              <p className="text-slate-500 text-xs mt-1">Registered accounts</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 border border-amber-400/10 hover:border-amber-400/30 transition-all">
              <p className="text-slate-400 text-xs mb-1">Orders This Year</p>
              <p className="text-amber-400 font-bold text-xl">{stats?.this_year_orders ?? 0}</p>
              <p className="text-slate-500 text-xs mt-1">Since Jan 1st</p>
            </div>
            <div className="bg-slate-900/60 rounded-xl p-4 border border-green-400/10 hover:border-green-400/30 transition-all">
              <p className="text-slate-400 text-xs mb-1">Avg Order Value</p>
              <p className="text-green-400 font-bold text-xl">
                {stats && stats.total_orders > 0 ? formatIDR(Math.round(totalSpent / stats.total_orders)) : 'N/A'}
              </p>
              <p className="text-slate-500 text-xs mt-1">Per order average</p>
            </div>
          </div>
        </div>
      )}

      {/* Membership Status - Royal Gold & Purple Theme */}
      {role !== 'admin' && (
      <div className="relative bg-gradient-to-br from-purple-950/90 via-indigo-950/80 to-slate-900/90 backdrop-blur-sm border-2 border-amber-500/40 rounded-2xl p-6 overflow-hidden shadow-2xl shadow-purple-900/20">
        {/* Animated Background Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/15 to-purple-600/15 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-600/10 to-amber-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent shimmer-animation"></div>

        {/* Elegant Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>

        {/* Top decorative border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative p-2.5 bg-gradient-to-br from-amber-500/20 to-purple-600/20 rounded-xl backdrop-blur-sm border border-amber-400/40 shadow-lg shadow-amber-500/20">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent rounded-xl animate-pulse"></div>
                  <svg className="w-6 h-6 text-amber-400 relative z-10" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-lg">
                  Premium Membership
                </h2>
              </div>
              <p className="text-amber-100/70 text-sm font-medium">Exclusive access to premium benefits and rewards</p>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/40 to-purple-500/40 blur-xl rounded-full animate-pulse"></div>
              <div className="relative px-6 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 rounded-full border-2 border-amber-400/60 shadow-xl shadow-amber-500/40 group-hover:scale-105 transition-transform">
                <p className="text-white font-black tracking-wider text-sm">{membershipData.currentTier}</p>
              </div>
            </div>
          </div>

          {/* Current Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {membershipData.benefits.map((benefit, index) => (
              <div
                key={index}
                className={`relative group backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 hover:scale-105 overflow-hidden ${benefit.active
                  ? 'bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900/40 border-amber-500/20 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/20'
                  : 'bg-gradient-to-br from-slate-900/60 via-slate-900/40 to-slate-900/60 border-slate-700/30 opacity-60'
                  }`}
              >
                {/* Shimmer effect on hover */}
                {benefit.active && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>}
                {/* Corner accent */}
                <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-3xl ${benefit.active ? 'bg-gradient-to-br from-amber-400/10 to-transparent' : 'bg-gradient-to-br from-slate-600/10 to-transparent'}`}></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded-lg border ${benefit.active ? 'bg-amber-500/20 border-amber-400/30' : 'bg-slate-700/30 border-slate-600/30'}`}>
                      {benefit.active ? (
                        <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                    <p className={`font-semibold text-sm ${benefit.active ? 'text-amber-50' : 'text-slate-400'}`}>{benefit.name}</p>
                  </div>
                  <p className={`font-bold text-lg ${benefit.active ? 'text-amber-400' : 'text-slate-500'}`}>{benefit.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Next Tier Progress */}
          <div className="relative bg-gradient-to-br from-slate-900/80 via-purple-950/60 to-indigo-950/60 rounded-xl p-6 border-2 border-amber-500/30 backdrop-blur-sm overflow-hidden shadow-inner">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/10 to-purple-600/10 rounded-full filter blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-600/10 to-amber-400/10 rounded-full filter blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="text-amber-100/80 text-sm font-medium">Next Tier:</p>
                    <span className="relative px-4 py-1.5 bg-gradient-to-br from-amber-600/30 via-yellow-500/30 to-amber-600/30 border-2 border-amber-400/50 rounded-full font-bold text-sm shadow-lg shadow-amber-500/30 overflow-hidden">
                      {/* Glossy shine overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-full"></div>
                      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full"></div>
                      {/* Animated shimmer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer-animation rounded-full"></div>
                      <span className="relative flex items-center gap-1.5 drop-shadow-lg">
                        <svg className="w-4 h-4 text-yellow-300 drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-white tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-yellow-200 to-amber-200">
                          {membershipData.nextTier}
                        </span>
                      </span>
                    </span>
                  </div>
                  <p className="text-purple-200/60 text-xs">
                    {nextTierInfo
                      ? `Unlock ${nextTierInfo.name} exclusive benefits`
                      : 'You have reached the highest tier!'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold text-xl bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(membershipData.totalSpent)}
                  </p>
                  <p className="text-purple-300/60 text-xs">
                    of {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(membershipData.nextTierTarget)}
                  </p>
                </div>
              </div>

              {/* Progress Bar with Gold & Purple Theme */}
              <div className="relative w-full h-4 bg-slate-950/80 rounded-full overflow-hidden mb-4 border-2 border-purple-900/50 shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-500 rounded-full transition-all duration-500 shadow-lg shadow-amber-500/60"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer-animation"></div>
                  {/* Sparkle effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/30 via-amber-300/30 to-yellow-300/30 animate-pulse"></div>
                </div>
                {/* Progress indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full shadow-xl shadow-amber-400/60 border-2 border-white/50 transition-all duration-500"
                  style={{ left: `calc(${progress}% - 8px)` }}
                >
                  <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-amber-100/80 text-sm">
                  <span className="text-white font-bold text-base">{progress.toFixed(1)}%</span> Complete
                  {nextTierInfo && (
                    <>
                      {' • '}
                      <span className="text-amber-400 font-bold ml-1">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nextTierInfo.target - totalSpent)}
                      </span>
                      <span className="text-purple-300/60"> to {nextTierInfo.name}!</span>
                    </>
                  )}
                </p>
                <a
                  href="/products"
                  className="relative group px-6 py-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white rounded-full font-bold text-sm hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 transition-all duration-300 hover:scale-105 shadow-xl shadow-amber-500/40 overflow-hidden border border-amber-400/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
                  <span className="relative flex items-center gap-2 font-black tracking-wide">
                    Shop Now
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-gradient-to-br from-primary-400/10 to-primary-400/5 border border-primary-400/20 rounded-xl p-6 hover:border-primary-400/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary-400/10 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-primary-400/60 text-xs font-semibold">ALL TIME</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats?.total_orders ?? 0}</h3>
          <p className="text-slate-400 text-sm">Total Orders</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-gradient-to-br from-amber-400/10 to-amber-400/5 border border-amber-400/20 rounded-xl p-6 hover:border-amber-400/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-400/10 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-amber-400/60 text-xs font-semibold">PENDING</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats?.pending_orders ?? 0}</h3>
          <p className="text-slate-400 text-sm">Pending Orders</p>
          <a href="/orders" className="mt-3 inline-block text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors">
            Review Now →
          </a>
        </div>

        {/* Completed Orders */}
        <div className="bg-gradient-to-br from-green-400/10 to-green-400/5 border border-green-400/20 rounded-xl p-6 hover:border-green-400/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-400/10 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-green-400/60 text-xs font-semibold">SUCCESS</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{stats?.completed_orders ?? 0}</h3>
          <p className="text-slate-400 text-sm">Completed Orders</p>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span className="text-slate-500">
              {stats && stats.total_orders > 0
                ? `${((stats.completed_orders / stats.total_orders) * 100).toFixed(1)}% success rate`
                : 'No orders yet'}
            </span>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-gradient-to-br from-secondary-400/10 to-secondary-400/5 border border-secondary-400/20 rounded-xl p-6 hover:border-secondary-400/40 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-secondary-400/10 rounded-lg group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-secondary-400/60 text-xs font-semibold">THIS YEAR</span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">
            {formatIDR(totalSpent)}
          </h3>
          <p className="text-slate-400 text-sm">{role === 'admin' ? 'Total Revenue' : 'Total Spent'}</p>
        </div>
      </div>

      {/* Activity Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{role === 'admin' ? 'Revenue Activity' : 'Spending Activity'}</h3>
              <p className="text-slate-400 text-sm">{role === 'admin' ? 'Platform-wide, last 6 months' : 'Last 6 months'}</p>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {(stats?.monthly_spending ?? []).length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-6">No spending data yet</p>
            ) : (() => {
              const maxAmount = Math.max(...(stats?.monthly_spending ?? []).map(d => d.amount), 1);
              return (stats?.monthly_spending ?? []).map((data, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm font-medium">{data.month}</span>
                    <span className="text-white text-sm font-semibold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(data.amount).replace('Rp', 'Rp ')}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all duration-500 group-hover:from-primary-300 group-hover:to-secondary-300"
                      style={{ width: `${Math.round((data.amount / maxAmount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-1">Average Monthly</p>
                <p className="text-white font-bold text-lg">
                  {(() => {
                    const months = stats?.monthly_spending ?? [];
                    const avg = months.length > 0 ? months.reduce((s, d) => s + d.amount, 0) / months.length : 0;
                    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(avg).replace('Rp', 'Rp ');
                  })()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs mb-1">Orders</p>
                <p className="text-primary-400 font-bold text-lg">{stats?.total_orders ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Recent Orders</h3>
              <p className="text-slate-400 text-sm">{role === 'admin' ? 'Latest orders across all customers' : 'Your latest transactions'}</p>
            </div>
            <a
              href="/orders"
              className="text-primary-400 text-sm font-semibold hover:text-secondary-400 transition-colors"
            >
              View All →
            </a>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase pb-3">Order ID</th>
                  <th className="text-center text-slate-400 text-xs font-semibold uppercase pb-3">Qty</th>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase pb-3">Date</th>
                  <th className="text-right text-slate-400 text-xs font-semibold uppercase pb-3">Total</th>
                  <th className="text-center text-slate-400 text-xs font-semibold uppercase pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500 text-sm">
                      No orders yet. <a href="/products" className="text-primary-400 hover:underline">Start shopping!</a>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4">
                        <span className="text-primary-400 font-semibold text-sm">#{order.id}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-slate-300 text-sm">×{order.total_qty}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-slate-400 text-sm">{order.created_at}</span>
                      </td>
                      <td className="py-4 text-right">
                        <span className="text-white text-sm font-semibold">{formatIDR(order.total)}</span>
                      </td>
                      <td className="py-4 text-center">
                        {(() => {
                          const s = order.status;
                          const cfg: Record<string, { style: string; label: string }> = {
                            pending: { style: 'bg-amber-400/10 text-amber-400 border border-amber-400/20', label: 'Pending' },
                            processing: { style: 'bg-blue-400/10 text-blue-400 border border-blue-400/20', label: 'Processing' },
                            shipped: { style: 'bg-purple-400/10 text-purple-400 border border-purple-400/20', label: 'Shipped' },
                            delivered: { style: 'bg-green-400/10 text-green-400 border border-green-400/20', label: 'Delivered' },
                            cancelled: { style: 'bg-red-400/10 text-red-400 border border-red-400/20', label: 'Cancelled' },
                          };
                          const c = cfg[s] ?? { style: 'bg-slate-400/10 text-slate-400 border border-slate-400/20', label: s };
                          return (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${c.style}`}>
                              {c.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recommendations & Spending Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Recommendations */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{role === 'admin' ? 'Product Catalog' : 'Recommended for You'}</h3>
              <p className="text-slate-400 text-sm">{role === 'admin' ? 'Browse all available products' : 'Based on your purchase history'}</p>
            </div>
            <button className="px-4 py-2 bg-primary-400/10 text-primary-400 rounded-lg text-sm font-semibold hover:bg-primary-400/20 transition-colors border border-primary-400/20">
              View All
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
            {recommendedProducts.length === 0 ? (
              <div className="col-span-3 py-8 text-center text-slate-500 text-sm">Loading products...</div>
            ) : (
              recommendedProducts.map((product) => (
                <a
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-primary-400/40 transition-all duration-300 hover:scale-105 flex flex-col"
                >
                  {/* Product Image */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image.startsWith('http') ? product.image : `${BACKEND}${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-5xl">📦</span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                          Low Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-slate-400 text-xs mb-1">{product.category}</p>
                    <h4 className="text-white font-semibold mb-2 line-clamp-1">{product.name}</h4>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3 h-3 fill-current ${i < Math.round(product.rating) ? 'text-accent-400' : 'text-slate-600'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-slate-400 text-xs ml-1">{Number(product.rating).toFixed(1)}</span>
                    </div>

                    {/* Price */}
                    <p className="text-primary-400 font-bold text-lg mb-3">
                      {formatIDR(product.price)}
                    </p>

                    {/* View Button */}
                    <div className="mt-auto w-full py-2 bg-primary-400/10 text-primary-400 rounded-lg text-sm font-semibold text-center group-hover:bg-primary-400 group-hover:text-white transition-all duration-300 border border-primary-400/20">
                      View Product
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        {/* Spending by Category - Donut Chart */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">{role === 'admin' ? 'Revenue by Category' : 'Spending by Category'}</h3>
            <p className="text-slate-400 text-sm">{role === 'admin' ? 'Platform-wide breakdown' : 'This year breakdown'}</p>
          </div>

          {/* Interactive Donut Chart - Larger */}
          <div className="flex items-center justify-center mb-4">
            {(stats?.category_breakdown ?? []).length === 0 ? (
              <div className="h-[280px] flex items-center justify-center">
                <p className="text-slate-500 text-sm">No category data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats?.category_breakdown ?? []}
                    cx="50%"
                    cy="50%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.category_breakdown ?? []).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const total = (stats?.category_breakdown ?? []).reduce((s, d) => s + d.value, 0);
                        const pct = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0.0';
                        return (
                          <div style={{
                            backgroundColor: 'rgba(15, 23, 42, 0.98)',
                            border: '1px solid rgba(100, 116, 139, 0.4)',
                            borderRadius: '12px',
                            padding: '16px',
                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'
                          }}>
                            <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                              <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '15px' }}>{data.name}</span>
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Amount: </span>
                              <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>
                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(data.value).replace('Rp', 'Rp ')}
                              </span>
                            </div>
                            <div>
                              <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Percentage: </span>
                              <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '14px' }}>{pct}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          {(stats?.category_breakdown ?? []).length > 0 && (
            <div className="space-y-2 mb-4">
              {(stats?.category_breakdown ?? []).map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>
                    <span className="text-slate-300">{cat.name}</span>
                  </div>
                  <span className="text-slate-400">{formatIDR(cat.value)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Total Spent Below Chart */}
          <div className="text-center pt-4 border-t border-slate-700/30">
            <p className="text-slate-400 text-xs mb-1">{role === 'admin' ? 'Total Revenue' : 'Total Spent'}</p>
            <p className="text-white font-bold text-2xl">
              {formatIDR((stats?.category_breakdown ?? []).reduce((s, d) => s + d.value, 0))}
            </p>
          </div>
        </div>
      </div>

      {/* Active Vouchers - Gold Royal Theme */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Active Vouchers</h3>
            <p className="text-slate-400 text-sm">{role === 'admin' ? 'Currently active vouchers on the platform' : 'Save more on your next purchase'}</p>
          </div>
          <a
            href="/vouchers"
            className="text-accent-400 text-sm font-semibold hover:text-accent-300 transition-colors flex items-center gap-1"
          >
            View All Vouchers
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

        {/* Voucher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {activeVouchers.length === 0 ? (
            <div className="col-span-3 py-10 text-center">
              <p className="text-slate-500 text-sm">No active vouchers available.</p>
              <a href="/vouchers" className="mt-2 inline-block text-accent-400 text-sm hover:underline">Browse all vouchers →</a>
            </div>
          ) : (
            activeVouchers.map((voucher) => {
              const daysLeft = Math.ceil((new Date(voucher.valid_until).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              const expiryText = daysLeft <= 1 ? 'Expires today!' : daysLeft <= 7 ? `${daysLeft} days left` : daysLeft <= 30 ? `${Math.ceil(daysLeft / 7)} weeks left` : new Date(voucher.valid_until).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
              const discountLabel = voucher.type === 'percentage' ? `${voucher.discount_value}% OFF` : voucher.type === 'free_shipping' ? 'FREE SHIPPING' : formatIDR(voucher.discount_value);
              const tagColor = voucher.type === 'percentage' ? 'from-purple-500 to-purple-600' : voucher.type === 'free_shipping' ? 'from-cyan-500 to-cyan-600' : 'from-amber-400 to-yellow-500';

              return (
                <div
                  key={voucher.id}
                  className="relative group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-accent-400/50 hover:shadow-xl hover:shadow-accent-400/10 transition-all duration-300"
                >
                  {/* Animated Gold Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-400/10 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
                  {/* Gold accent line at top */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-400 to-transparent animate-pulse"></div>
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent-400/10 to-transparent rounded-bl-[100px] group-hover:from-accent-400/20 transition-all duration-500"></div>

                  <div className="p-5 relative z-10">
                    {/* Voucher Code Tag */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`px-2.5 py-1 bg-gradient-to-r ${tagColor} rounded-lg shadow-lg`}>
                        <p className="text-white font-bold text-[10px] tracking-wider">{voucher.code}</p>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(voucher.code)}
                        className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all hover:scale-110"
                        title="Copy code"
                      >
                        <svg className="w-3.5 h-3.5 text-slate-400 hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>

                    {/* Discount Amount */}
                    <h4 className="text-xl font-bold text-white mb-1.5 drop-shadow-lg">{discountLabel}</h4>
                    <p className="text-slate-300 text-xs mb-3 min-h-[32px]">{voucher.description || voucher.name}</p>

                    {/* Divider */}
                    <div className="relative my-3">
                      <div className="border-t border-slate-700/50 border-dashed"></div>
                      <div className="absolute inset-0 border-t border-accent-400/20 border-dashed shimmer-animation"></div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-3">
                      {voucher.min_purchase > 0 ? (
                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <span>Min. purchase: <span className="text-white font-bold">{formatIDR(voucher.min_purchase)}</span></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[11px] text-green-400">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-bold">No Minimum Purchase</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-[11px] text-amber-300">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-bold">{expiryText}</span>
                      </div>
                    </div>

                    {/* Use Button */}
                    <a href="/cart" className="relative w-full py-2.5 bg-gradient-to-r from-accent-400/20 to-accent-500/20 text-accent-300 rounded-lg text-xs font-bold hover:from-accent-400 hover:to-accent-500 hover:text-slate-900 hover:shadow-xl hover:shadow-accent-400/40 transition-all duration-300 border border-accent-400/40 hover:border-accent-400 group overflow-hidden flex items-center justify-center gap-2">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
                      <span className="relative flex items-center justify-center gap-2">
                        Use Voucher
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
