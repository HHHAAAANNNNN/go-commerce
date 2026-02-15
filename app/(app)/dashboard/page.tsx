"use client";

export default function DashboardPage() {
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good Morning" : currentHour < 18 ? "Good Afternoon" : "Good Evening";
  
  // Mock data for membership
  const membershipData = {
    currentTier: "Premium",
    memberSince: "January 2025",
    totalSpent: 45200000,
    nextTier: "VIP",
    nextTierTarget: 50000000,
    benefits: [
      { name: "Discount", value: "10% Off", active: true },
      { name: "Free Shipping", value: "Unlimited", active: true },
      { name: "Priority Support", value: "24/7", active: true },
      { name: "Early Access", value: "New Products", active: true },
    ]
  };

  const progress = (membershipData.totalSpent / membershipData.nextTierTarget) * 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 border border-primary-400/20 rounded-2xl p-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/10 rounded-full filter blur-3xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{greeting},</p>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent mb-2">
              Farhan Nugraha
            </h1>
            <p className="text-slate-300 text-lg">Welcome back to your dashboard! 👋</p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="px-4 py-2 bg-gradient-to-r from-accent-400/20 to-accent-400/10 border border-accent-400/30 rounded-full">
              <p className="text-accent-400 font-semibold text-sm">✨ Premium Member</p>
            </div>
            <p className="text-slate-400 text-sm">Member since {membershipData.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Membership Status */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Membership Status</h2>
            <p className="text-slate-400">Track your progress and unlock exclusive benefits</p>
          </div>
          <div className="px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full">
            <p className="text-white font-bold">{membershipData.currentTier}</p>
          </div>
        </div>

        {/* Current Benefits */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {membershipData.benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-slate-300 font-semibold text-sm">{benefit.name}</p>
              </div>
              <p className="text-primary-400 font-bold">{benefit.value}</p>
            </div>
          ))}
        </div>

        {/* Next Tier Progress */}
        <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-slate-400 text-sm mb-1">Next Tier: <span className="text-accent-400 font-semibold">{membershipData.nextTier}</span></p>
              <p className="text-slate-500 text-xs">Unlock even more exclusive benefits</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-lg">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(membershipData.totalSpent)}
              </p>
              <p className="text-slate-500 text-xs">
                of {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(membershipData.nextTierTarget)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-slate-400 text-sm">
              {progress.toFixed(1)}% Complete • 
              <span className="text-accent-400 font-semibold">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(membershipData.nextTierTarget - membershipData.totalSpent)}
              </span> to go!
            </p>
            <a
              href="/products"
              className="px-6 py-2 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-full font-semibold text-sm hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary-400/20"
            >
              Shop Now →
            </a>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Placeholder */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/40 rounded-xl p-4">
            <p className="text-slate-400">Stat Card {i}</p>
          </div>
        ))}
      </div>

      {/* Charts & Tables - Placeholder */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-slate-800/40 rounded-xl p-4 h-64">
          <p className="text-slate-400">Activity Chart</p>
        </div>
        <div className="col-span-2 bg-slate-800/40 rounded-xl p-4 h-64">
          <p className="text-slate-400">Recent Orders</p>
        </div>
      </div>

      {/* Recommendations & Donut Chart - Placeholder */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-slate-800/40 rounded-xl p-4 h-64">
          <p className="text-slate-400">Product Recommendations</p>
        </div>
        <div className="col-span-1 bg-slate-800/40 rounded-xl p-4 h-64">
          <p className="text-slate-400">Donut Chart</p>
        </div>
      </div>

      {/* Vouchers - Placeholder */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <p className="text-slate-400">Active Vouchers</p>
      </div>
    </div>
  );
}
