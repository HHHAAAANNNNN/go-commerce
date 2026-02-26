"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  rating: number;
  stock: number;
  image?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ["All", "Smartphones", "Laptops", "Audio", "Accessories"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/products");
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setProducts(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
      const minPriceNum = minPrice ? parseFloat(minPrice) : 0;
      const maxPriceNum = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = product.price >= minPriceNum && product.price <= maxPriceNum;
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Price Filter Modal */}
      {showPriceFilter && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowPriceFilter(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Price Range</h3>
              <button
                onClick={() => setShowPriceFilter(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Max Price</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setShowPriceFilter(false)}
                className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg font-medium transition-all hover:opacity-90"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </>
      )}

      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="relative bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 border border-primary-400/20 rounded-2xl p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/10 rounded-full filter blur-3xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent mb-2">
                Browse Products
              </h1>
              <p className="text-slate-300 text-lg">Discover amazing products with great deals!</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Add Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-primary-400/20 hover:shadow-primary-400/40 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 transition-all"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 text-sm font-medium">Category:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-primary-400/20 to-secondary-400/20 text-primary-400 border border-primary-400/30"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-600"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-700"></div>

            {/* Price Filter */}
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                minPrice || maxPrice
                  ? "bg-primary-400/20 text-primary-400 border-primary-400/30"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-slate-600"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Price
              {(minPrice || maxPrice) && (
                <span className="ml-1 px-2 py-0.5 bg-primary-400/20 text-primary-400 rounded text-xs font-semibold">
                  Active
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-slate-700"></div>

            {/* Sort */}
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-white border border-slate-700 hover:border-primary-400/50 transition-all"
            >
              {sortOrder === "asc" ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Low to High
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  High to Low
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Showing <span className="text-white font-semibold">{filteredProducts.length}</span> {filteredProducts.length === 1 ? 'product' : 'products'}
          </p>
          {(searchQuery || selectedCategory !== "All" || minPrice || maxPrice) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group bg-slate-900 rounded-xl overflow-hidden border border-slate-800 hover:border-primary-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary-400/10"
            >
              {/* Image Container */}
              <div className="relative aspect-square bg-slate-800 overflow-hidden">
                {product.image && !imageErrors[product.id] ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={() => setImageErrors(prev => ({ ...prev, [product.id]: true }))}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-20 h-20 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-primary-400/90 to-secondary-400/90 backdrop-blur-sm rounded-full text-white text-xs font-semibold shadow-lg">
                  {product.category}
                </div>

                {/* Stock Badge */}
                {product.stock > 0 && product.stock <= 5 && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-amber-500/90 backdrop-blur-sm rounded-md text-white text-xs font-semibold">
                    Only {product.stock} left
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-3">
                {/* Name */}
                <h3 className="text-white font-semibold text-base line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-slate-600'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-slate-400 text-xs">{product.rating}</span>
                </div>

                {/* Price */}
                <div className="flex items-end justify-between">
                  <p className="text-primary-400 font-bold text-lg">
                    {formatPrice(product.price)}
                  </p>
                  {product.stock === 0 ? (
                    <span className="text-red-400 text-xs font-medium">Out of Stock</span>
                  ) : (
                    <span className="text-green-400 text-xs font-medium">In Stock</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
            <p className="text-slate-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setMinPrice("");
                setMaxPrice("");
              }}
              className="px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onProductAdded={() => {
            fetchProducts();
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

// Add Product Modal Component
interface AddProductModalProps {
  onClose: () => void;
  onProductAdded: () => void;
}

interface BasicFormData {
  name: string;
  price: string;
  stock: string;
  category: string;
  brand: string;
  description: string;
}

interface SmartphoneSpecs {
  chipset: string;
  ram: string;
  rom: string;
  display: string;
  battery: string;
  charging: string;
  camera: string;
  connectivity: {
    network5g: boolean;
    wifi: boolean;
    nfc: boolean;
  };
  os: string;
}

interface LaptopSpecs {
  cpu: string;
  ram: string;
  storage: {
    size: string;
    type: 'SSD' | 'HDD';
  };
  display: string;
  gpu: string;
  battery: string;
  ports: {
    usb: boolean;
    hdmi: boolean;
    wifi6: boolean;
    other: boolean;
  };
  os: string;
}

function AddProductModal({ onClose, onProductAdded }: AddProductModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [basicData, setBasicData] = useState<BasicFormData>({
    name: '',
    price: '',
    stock: '',
    category: 'Smartphones',
    brand: '',
    description: '',
  });

  const [smartphoneSpecs, setSmartphoneSpecs] = useState<SmartphoneSpecs>({
    chipset: '',
    ram: '',
    rom: '',
    display: '',
    battery: '',
    charging: 'Standard Charging',
    camera: '',
    connectivity: {
      network5g: false,
      wifi: false,
      nfc: false,
    },
    os: '',
  });

  const [laptopSpecs, setLaptopSpecs] = useState<LaptopSpecs>({
    cpu: '',
    ram: '',
    storage: {
      size: '',
      type: 'SSD',
    },
    display: '',
    gpu: '',
    battery: '',
    ports: {
      usb: false,
      hdmi: false,
      wifi6: false,
      other: false,
    },
    os: '',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload image first
      let imageUrl = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('category', basicData.category.toLowerCase());
        
        const uploadResponse = await fetch('http://localhost:8080/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          imageUrl = uploadData.url;
        }
      }

      // Prepare specs based on category
      let specs = {};
      if (basicData.category === 'Smartphones') {
        specs = { smartphoneSpecs };
      } else if (basicData.category === 'Laptops') {
        specs = { laptopSpecs };
      }

      // Create product
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: basicData.name,
          price: parseInt(basicData.price),
          stock: parseInt(basicData.stock),
          category: basicData.category,
          brand: basicData.brand,
          description: basicData.description,
          image: imageUrl,
          rating: 0,
          ...specs,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to add product');
      }

      onProductAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const closeModalOnBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={closeModalOnBackdrop}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Add New Product</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${step === 1 ? 'bg-primary-400 text-white' : 'bg-slate-800 text-slate-400'}`}>
                1. Basic Info
              </span>
              <span className="text-slate-600">→</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${step === 2 ? 'bg-primary-400 text-white' : 'bg-slate-800 text-slate-400'}`}>
                2. Specifications
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 text-sm font-medium mb-2">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={basicData.name}
                    onChange={(e) => setBasicData({ ...basicData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                    placeholder="e.g., iPhone 15 Pro"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Price (IDR) *</label>
                  <input
                    type="number"
                    required
                    value={basicData.price}
                    onChange={(e) => setBasicData({ ...basicData, price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                    placeholder="e.g., 15000000"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Stock *</label>
                  <input
                    type="number"
                    required
                    value={basicData.stock}
                    onChange={(e) => setBasicData({ ...basicData, stock: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                    placeholder="e.g., 25"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Category *</label>
                  <select
                    required
                    value={basicData.category}
                    onChange={(e) => setBasicData({ ...basicData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                  >
                    <option value="Smartphones">Smartphones</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Brand</label>
                  <input
                    type="text"
                    value={basicData.brand}
                    onChange={(e) => setBasicData({ ...basicData, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                    placeholder="e.g., Apple"
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 text-sm font-medium mb-2">Product Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-700" />
                    )}
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-slate-700 hover:border-primary-400/50 rounded-lg p-6 text-center transition-colors">
                        <svg className="w-8 h-8 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-400 text-sm">Click to upload image</p>
                        <p className="text-slate-500 text-xs mt-1">JPG, PNG (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={basicData.description}
                    onChange={(e) => setBasicData({ ...basicData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                    placeholder="Product description..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleBasicSubmit}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white rounded-lg font-medium transition-all"
                >
                  Next: Specifications
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {basicData.category === 'Smartphones' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Smartphone Specifications</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Chipset</label>
                      <input
                        type="text"
                        value={smartphoneSpecs.chipset}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, chipset: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., Snapdragon 8 Gen 3"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">RAM</label>
                      <input
                        type="text"
                        value={smartphoneSpecs.ram}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, ram: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 8GB"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">ROM (Storage)</label>
                      <input
                        type="text"
                        value={smartphoneSpecs.rom}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, rom: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 256GB"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Display & Refresh Rate</label>
                      <input
                        type="text"
                        value={smartphoneSpecs.display}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, display: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 6.7 inch AMOLED, 120Hz"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Battery Capacity</label>
                      <input
                        type="text"
                        value={smartphoneSpecs.battery}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, battery: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 5000mAh"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Charging</label>
                      <select
                        value={smartphoneSpecs.charging}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, charging: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                      >
                        <option value="Standard Charging">Standard Charging</option>
                        <option value="Fast Charging">Fast Charging</option>
                        <option value="Super Fast Charging">Super Fast Charging</option>
                        <option value="Wireless Charging">Wireless Charging</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 text-sm font-medium mb-2">Camera</label>
                      <input
                        type="text"
                        value={smartphoneSpecs.camera}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, camera: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 50MP Main + 12MP Ultra Wide + 10MP Telephoto"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 text-sm font-medium mb-2">Operating System</label>
                      <input
                        type="text"
                        value={smartphoneSpecs.os}
                        onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, os: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., Android 14, iOS 17"
                      />
                    </div>
                  </div>

                  {/* Connectivity Checkboxes */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <label className="block text-slate-300 text-sm font-medium mb-3">Connectivity & Network</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smartphoneSpecs.connectivity.network5g}
                          onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, connectivity: { ...smartphoneSpecs.connectivity, network5g: e.target.checked } })}
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-400 focus:ring-primary-400/50"
                        />
                        <span className="text-slate-300 text-sm">5G Support</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smartphoneSpecs.connectivity.wifi}
                          onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, connectivity: { ...smartphoneSpecs.connectivity, wifi: e.target.checked } })}
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-400 focus:ring-primary-400/50"
                        />
                        <span className="text-slate-300 text-sm">Wi-Fi Stable</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smartphoneSpecs.connectivity.nfc}
                          onChange={(e) => setSmartphoneSpecs({ ...smartphoneSpecs, connectivity: { ...smartphoneSpecs.connectivity, nfc: e.target.checked } })}
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-400 focus:ring-primary-400/50"
                        />
                        <span className="text-slate-300 text-sm">NFC (e-money)</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {basicData.category === 'Laptops' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white">Laptop Specifications</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Processor (CPU)</label>
                      <input
                        type="text"
                        value={laptopSpecs.cpu}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, cpu: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., Intel Core i7-13700H"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">RAM</label>
                      <input
                        type="text"
                        value={laptopSpecs.ram}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, ram: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 16GB DDR5"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Storage Size</label>
                      <input
                        type="text"
                        value={laptopSpecs.storage.size}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, storage: { ...laptopSpecs.storage, size: e.target.value } })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 512GB"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Storage Type</label>
                      <select
                        value={laptopSpecs.storage.type}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, storage: { ...laptopSpecs.storage, type: e.target.value as 'SSD' | 'HDD' } })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                      >
                        <option value="SSD">SSD</option>
                        <option value="HDD">HDD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Display</label>
                      <input
                        type="text"
                        value={laptopSpecs.display}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, display: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 15.6 inch FHD IPS"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">GPU</label>
                      <input
                        type="text"
                        value={laptopSpecs.gpu}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, gpu: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., NVIDIA RTX 4050"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Battery</label>
                      <input
                        type="text"
                        value={laptopSpecs.battery}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, battery: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., 56Wh"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2">Operating System</label>
                      <input
                        type="text"
                        value={laptopSpecs.os}
                        onChange={(e) => setLaptopSpecs({ ...laptopSpecs, os: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                        placeholder="e.g., Windows 11 Pro"
                      />
                    </div>
                  </div>

                  {/* Ports Checkboxes */}
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <label className="block text-slate-300 text-sm font-medium mb-3">Ports & Connectivity</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={laptopSpecs.ports.usb}
                          onChange={(e) => setLaptopSpecs({ ...laptopSpecs, ports: { ...laptopSpecs.ports, usb: e.target.checked } })}
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-400 focus:ring-primary-400/50"
                        />
                        <span className="text-slate-300 text-sm">USB 3.0 / Type-C</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={laptopSpecs.ports.hdmi}
                          onChange={(e) => setLaptopSpecs({ ...laptopSpecs, ports: { ...laptopSpecs.ports, hdmi: e.target.checked } })}
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-400 focus:ring-primary-400/50"
                        />
                        <span className="text-slate-300 text-sm">HDMI Port</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={laptopSpecs.ports.wifi6}
                          onChange={(e) => setLaptopSpecs({ ...laptopSpecs, ports: { ...laptopSpecs.ports, wifi6: e.target.checked } })}
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-400 focus:ring-primary-400/50"
                        />
                        <span className="text-slate-300 text-sm">Wi-Fi 6</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={laptopSpecs.ports.other}
                          onChange={(e) => setLaptopSpecs({ ...laptopSpecs, ports: { ...laptopSpecs.ports, other: e.target.checked } })}
                          className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-primary-400 focus:ring-primary-400/50"
                        />
                        <span className="text-slate-300 text-sm">Other Ports</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {(basicData.category === 'Audio' || basicData.category === 'Accessories') && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-400">Specifications for {basicData.category} will be available soon.</p>
                  <p className="text-slate-500 text-sm mt-2">You can proceed to add the product with basic information only.</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-lg font-medium transition-all disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
