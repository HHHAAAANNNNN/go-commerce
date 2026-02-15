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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'done' ? 'bg-green-400/10 text-green-400 border border-green-400/20' :
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
                      <button className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        order.status === 'done' ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700' :
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
