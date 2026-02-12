export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Products</h1>
      
      {/* Breadcrumb - Placeholder */}
      <div className="text-slate-400 text-sm">
        Home &gt; Products
      </div>

      {/* Filter & Search Bar - Placeholder */}
      <div className="bg-slate-800/40 rounded-xl p-4">
        <p className="text-slate-400">Filter & Search Bar - Coming soon</p>
      </div>

      {/* Product Grid - Placeholder */}
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-slate-800/40 rounded-xl p-4 h-80">
            <p className="text-slate-400">Product Card {i}</p>
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
