export default function VouchersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Vouchers</h1>
      
      {/* Tabs & Filters - Placeholder */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <p className="text-slate-400">Tabs (My Vouchers / Available) & Filters - Coming soon</p>
      </div>

      {/* Vouchers Grid - Placeholder */}
      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-slate-800/40 rounded-xl p-4 h-48">
            <p className="text-slate-400">Voucher Card {i}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
