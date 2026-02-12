export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      
      {/* Welcome Banner - Placeholder */}
      <div className="bg-gradient-to-r from-primary-400/10 to-secondary-400/10 border border-primary-400/20 rounded-2xl p-6">
        <p className="text-white">Welcome Banner - Coming soon</p>
      </div>

      {/* Membership Status - Placeholder */}
      <div className="bg-slate-800/40 rounded-2xl p-6">
        <p className="text-white">Membership Status - Coming soon</p>
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
