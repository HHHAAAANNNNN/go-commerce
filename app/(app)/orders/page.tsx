export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Order History</h1>
      
      {/* Filter Tabs - Placeholder */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <p className="text-slate-400">Filter Tabs & Search - Coming soon</p>
      </div>

      {/* Order Cards - Placeholder */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-slate-800/40 rounded-xl p-6">
            <p className="text-slate-400">Order Card {i} - Coming soon</p>
          </div>
        ))}
      </div>

      {/* Pagination - Placeholder */}
      <div className="flex justify-center">
        <p className="text-slate-400">Pagination - Coming soon</p>
      </div>
    </div>
  );
}
