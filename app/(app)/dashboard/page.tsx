"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const BACKEND = "http://localhost:8080";

const PAYMENT_METHODS = [
  { id: "gopay", label: "GoPay", icon: "💚" },
  { id: "ovo", label: "OVO", icon: "💜" },
  { id: "debit", label: "Kartu Debit", icon: "💳" },
  { id: "kredit", label: "Kartu Kredit", icon: "🏦" },
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

export default function DashboardPage() {
  const router = useRouter();
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

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) { router.push("/(auth)/login"); return; }
    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Fetch fresh balance from API (localStorage may not have it after login)
      if (parsed?.id) {
        fetch(`${BACKEND}/api/users/${parsed.id}/balance`)
          .then(r => r.json())
          .then(d => { if (d.success) setBalance(d.data.balance); })
          .catch(() => { });
      }
    } catch {
      router.push("/(auth)/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

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
      const res = await fetch(`${BACKEND}/api/users/${user.id}/topup`, {
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
      // Sync to localStorage
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

  // Mock data for membership
  const membershipData = {
    currentTier: user.is_member ? "Premium" : "Free",
    memberSince: new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    totalSpent: 45200000,
    nextTier: "VIP",
    nextTierTarget: 50000000,
    benefits: [
      { name: "Discount", value: user.is_member ? "10% Off" : "None", active: user.is_member },
      { name: "Free Shipping", value: user.is_member ? "Unlimited" : "Standard", active: user.is_member },
      { name: "Priority Support", value: "24/7", active: true },
      { name: "Early Access", value: "New Products", active: user.is_member },
    ]
  };

  const progress = (membershipData.totalSpent / membershipData.nextTierTarget) * 100;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
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
                      <span className="text-lg">{m.icon}</span>
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
                {/* Quick amounts */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {[50000, 100000, 200000, 500000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setTopupAmount(String(amt))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${topupAmount === String(amt)
                          ? "bg-primary-400/20 border-primary-400/50 text-primary-300"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                        }`}
                    >
                      {formatIDR(amt)}
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
                ) : "💰 Topup!"}
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
            <div className="px-4 py-2 bg-gradient-to-r from-accent-400/20 to-accent-400/10 border border-accent-400/30 rounded-full">
              <p className="text-accent-400 font-semibold text-sm">✨ {user.is_member ? "Premium Member" : "Free Member"}</p>
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
          </div>
        </div>
      </div>

      {/* Membership Status - Royal Gold & Purple Theme */}
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
                className="relative group bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-slate-900/40 backdrop-blur-sm rounded-xl p-4 border border-amber-500/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 overflow-hidden"
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-400/10 to-transparent rounded-bl-3xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 bg-amber-500/20 rounded-lg border border-amber-400/30">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-amber-50 font-semibold text-sm">{benefit.name}</p>
                  </div>
                  <p className="text-amber-400 font-bold text-lg">{benefit.value}</p>
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
                  <p className="text-purple-200/60 text-xs">Unlock VIP exclusive benefits and priority support</p>
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
                  <span className="text-white font-bold text-base">{progress.toFixed(1)}%</span> Complete •
                  <span className="text-amber-400 font-bold ml-1">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(membershipData.nextTierTarget - membershipData.totalSpent)}
                  </span>
                  <span className="text-purple-300/60"> to VIP!</span>
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
          <h3 className="text-3xl font-bold text-white mb-1">24</h3>
          <p className="text-slate-400 text-sm">Total Orders</p>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span className="text-green-400">↗ +3</span>
            <span className="text-slate-500">this month</span>
          </div>
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
          <h3 className="text-3xl font-bold text-white mb-1">2</h3>
          <p className="text-slate-400 text-sm">Pending Orders</p>
          <button className="mt-3 text-amber-400 text-xs font-semibold hover:text-amber-300 transition-colors">
            Review Now →
          </button>
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
          <h3 className="text-3xl font-bold text-white mb-1">22</h3>
          <p className="text-slate-400 text-sm">Completed Orders</p>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span className="text-slate-500">91.7% success rate</span>
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
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(45200000).replace('Rp', 'Rp ')}
          </h3>
          <p className="text-slate-400 text-sm">Total Spent</p>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span className="text-green-400">↗ +12%</span>
            <span className="text-slate-500">vs last year</span>
          </div>
        </div>
      </div>

      {/* Activity Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Chart */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Spending Activity</h3>
              <p className="text-slate-400 text-sm">Last 6 months</p>
            </div>
            <button className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {[
              { month: 'Sep', amount: 5200000, percentage: 52 },
              { month: 'Oct', amount: 8100000, percentage: 81 },
              { month: 'Nov', amount: 6800000, percentage: 68 },
              { month: 'Dec', amount: 9500000, percentage: 95 },
              { month: 'Jan', amount: 7200000, percentage: 72 },
              { month: 'Feb', amount: 8400000, percentage: 84 },
            ].map((data, index) => (
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
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs mb-1">Average Monthly</p>
                <p className="text-white font-bold text-lg">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(7533333).replace('Rp', 'Rp ')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs mb-1">Trend</p>
                <p className="text-green-400 font-bold text-lg flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  +18%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Recent Orders</h3>
              <p className="text-slate-400 text-sm">Your latest transactions</p>
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
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase pb-3">Product</th>
                  <th className="text-center text-slate-400 text-xs font-semibold uppercase pb-3">Qty</th>
                  <th className="text-left text-slate-400 text-xs font-semibold uppercase pb-3">Date</th>
                  <th className="text-center text-slate-400 text-xs font-semibold uppercase pb-3">Status</th>
                  <th className="text-center text-slate-400 text-xs font-semibold uppercase pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {[
                  { id: '#ORD-1234', product: 'iPhone 15 Pro Max', qty: 1, date: 'Feb 10, 2026', status: 'done', statusText: 'Delivered' },
                  { id: '#ORD-1235', product: 'MacBook Pro M3', qty: 1, date: 'Feb 08, 2026', status: 'ship', statusText: 'Shipping' },
                  { id: '#ORD-1236', product: 'Samsung S24 Ultra', qty: 2, date: 'Feb 05, 2026', status: 'pend', statusText: 'Pending' },
                  { id: '#ORD-1237', product: 'Dell XPS 15', qty: 1, date: 'Feb 01, 2026', status: 'done', statusText: 'Delivered' },
                  { id: '#ORD-1238', product: 'Google Pixel 8 Pro', qty: 1, date: 'Jan 28, 2026', status: 'done', statusText: 'Delivered' },
                ].map((order, index) => (
                  <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4">
                      <span className="text-primary-400 font-semibold text-sm">{order.id}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-white font-medium text-sm">{order.product}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className="text-slate-300 text-sm">×{order.qty}</span>
                    </td>
                    <td className="py-4">
                      <span className="text-slate-400 text-sm">{order.date}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${order.status === 'done' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
                          order.status === 'ship' ? 'bg-secondary-400/10 text-secondary-400 border border-secondary-400/20' :
                            'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                        }`}>
                        {order.status === 'done' && '✓ '}
                        {order.status === 'ship' && '🚚 '}
                        {order.status === 'pend' && '⏳ '}
                        {order.statusText}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${order.status === 'done' ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' :
                          order.status === 'ship' ? 'bg-secondary-400/10 text-secondary-400 hover:bg-secondary-400/20 border border-secondary-400/20' :
                            'bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border border-amber-400/20'
                        }`}>
                        {order.status === 'done' ? 'View' : order.status === 'ship' ? 'Track' : 'Pay'}
                      </button>
                    </td>
                  </tr>
                ))}
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
              <h3 className="text-xl font-bold text-white mb-1">Recommended for You</h3>
              <p className="text-slate-400 text-sm">Based on your purchase history</p>
            </div>
            <button className="px-4 py-2 bg-primary-400/10 text-primary-400 rounded-lg text-sm font-semibold hover:bg-primary-400/20 transition-colors border border-primary-400/20">
              View All
            </button>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'AirPods Pro 2', category: 'Accessories', price: 3799000, image: '🎧', discount: 15, tag: 'Hot' },
              { name: 'iPad Air M2', category: 'Tablets', price: 9999000, image: '📱', discount: 10, tag: 'New' },
              { name: 'Magic Keyboard', category: 'Accessories', price: 4499000, image: '⌨️', discount: 0, tag: '' },
            ].map((product, index) => (
              <div
                key={index}
                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/30 rounded-xl overflow-hidden hover:border-primary-400/40 transition-all duration-300 hover:scale-105"
              >
                {/* Product Image */}
                <div className="relative h-40 bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center">
                  <span className="text-6xl">{product.image}</span>
                  {product.tag && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-accent-400/90 backdrop-blur-sm text-slate-900 text-xs font-bold rounded-full">
                        {product.tag}
                      </span>
                    </div>
                  )}
                  {product.discount > 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                        -{product.discount}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-slate-400 text-xs mb-1">{product.category}</p>
                  <h4 className="text-white font-semibold mb-2 line-clamp-1">{product.name}</h4>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 text-accent-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-slate-400 text-xs ml-1">4.8</span>
                  </div>

                  {/* Price */}
                  <p className="text-primary-400 font-bold text-lg mb-3">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price).replace('Rp', 'Rp ')}
                  </p>

                  {/* Add to Cart Button */}
                  <button className="w-full py-2 bg-primary-400/10 text-primary-400 rounded-lg text-sm font-semibold hover:bg-primary-400 hover:text-white transition-all duration-300 border border-primary-400/20">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending by Category - Donut Chart */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-1">Spending by Category</h3>
            <p className="text-slate-400 text-sm">This year breakdown</p>
          </div>

          {/* Interactive Donut Chart - Larger */}
          <div className="flex items-center justify-center mb-4">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Phones', value: 20340000, percentage: 45 },
                    { name: 'Laptops', value: 15820000, percentage: 35 },
                    { name: 'Accessories', value: 9040000, percentage: 20 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#a78bfa" />
                  <Cell fill="#22d3ee" />
                  <Cell fill="#fbbf24" />
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div style={{
                          backgroundColor: 'rgba(15, 23, 42, 0.98)',
                          border: '1px solid rgba(100, 116, 139, 0.4)',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)'
                        }}>
                          {/* Category Name */}
                          <div style={{ marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '15px' }}>{data.name}</span>
                          </div>
                          {/* Amount */}
                          <div style={{ marginBottom: '6px' }}>
                            <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Amount: </span>
                            <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontSize: '14px' }}>
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                              }).format(data.value).replace('Rp', 'Rp ')}
                            </span>
                          </div>
                          {/* Percentage */}
                          <div>
                            <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Percentage: </span>
                            <span style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '14px' }}>
                              {data.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Total Spent Below Chart */}
          <div className="text-center pt-4 border-t border-slate-700/30">
            <p className="text-slate-400 text-xs mb-1">Total Spent</p>
            <p className="text-white font-bold text-2xl">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(45200000).replace('Rp', 'Rp ')}
            </p>
          </div>
        </div>
      </div>

      {/* Active Vouchers - Gold Royal Theme */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Active Vouchers</h3>
            <p className="text-slate-400 text-sm">Save more on your next purchase</p>
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
          {[
            {
              code: 'TECH20',
              discount: '20% OFF',
              description: 'Maximum discount Rp 100,000',
              minPurchase: 500000,
              expiry: '3 days left',
              type: 'percentage',
              tagColor: 'from-purple-500 to-purple-600',
              glowColor: 'purple-500'
            },
            {
              code: 'FREESHIP',
              discount: 'FREE SHIPPING',
              description: 'No minimum purchase required',
              minPurchase: 0,
              expiry: '1 week left',
              type: 'shipping',
              tagColor: 'from-cyan-500 to-cyan-600',
              glowColor: 'cyan-500'
            },
            {
              code: 'SAVE50K',
              discount: 'Rp 50,000',
              description: 'Discount for all products',
              minPurchase: 1000000,
              expiry: '2 weeks left',
              type: 'fixed',
              tagColor: 'from-amber-400 to-yellow-500',
              glowColor: 'amber-400'
            },
          ].map((voucher, index) => (
            <div
              key={index}
              className="relative group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-accent-400/50 hover:shadow-xl hover:shadow-accent-400/10 transition-all duration-300"
            >
              {/* Animated Gold Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-400/10 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>

              {/* Gold accent line at top with shimmer */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-400 to-transparent animate-pulse"></div>

              {/* Decorative corner with sparkle */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent-400/10 to-transparent rounded-bl-[100px] group-hover:from-accent-400/20 transition-all duration-500"></div>

              <div className="p-5 relative z-10">
                {/* Voucher Code Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2.5 py-1 bg-gradient-to-r ${voucher.tagColor} rounded-lg shadow-lg`}>
                    <p className="text-white font-bold text-[10px] tracking-wider">{voucher.code}</p>
                  </div>
                  <button
                    className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all hover:scale-110"
                    title="Copy code"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400 hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                {/* Discount Amount - Better Contrast */}
                <h4 className="text-xl font-bold text-white mb-1.5 drop-shadow-lg">
                  {voucher.discount}
                </h4>
                <p className="text-slate-300 text-xs mb-3 min-h-[32px]">{voucher.description}</p>

                {/* Divider with gold shimmer */}
                <div className="relative my-3">
                  <div className="border-t border-slate-700/50 border-dashed"></div>
                  <div className="absolute inset-0 border-t border-accent-400/20 border-dashed shimmer-animation"></div>
                </div>

                {/* Details - Better Visibility */}
                <div className="space-y-2 mb-3">
                  {voucher.minPurchase > 0 ? (
                    <div className="flex items-center gap-2 text-[11px] text-slate-300">
                      <svg className="w-3.5 h-3.5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Min. purchase: <span className="text-white font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(voucher.minPurchase).replace('Rp', 'Rp ')}</span></span>
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
                    <span className="font-bold">{voucher.expiry}</span>
                  </div>
                </div>

                {/* Use Button - Gold Shimmer Theme */}
                <button className="relative w-full py-2.5 bg-gradient-to-r from-accent-400/20 to-accent-500/20 text-accent-300 rounded-lg text-xs font-bold hover:from-accent-400 hover:to-accent-500 hover:text-slate-900 hover:shadow-xl hover:shadow-accent-400/40 transition-all duration-300 border border-accent-400/40 hover:border-accent-400 group overflow-hidden">
                  {/* Button shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    Use Voucher
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
