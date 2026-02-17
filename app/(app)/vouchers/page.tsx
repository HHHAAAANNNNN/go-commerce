"use client";

import { useState } from 'react';

type VoucherType = 'percentage' | 'fixed' | 'shipping';
type VoucherCategory = 'all' | 'percentage' | 'fixed' | 'shipping';

interface Voucher {
  id: number;
  code: string;
  discount: string;
  description: string;
  minPurchase: number;
  expiry: string;
  type: VoucherType;
  tagColor: string;
  glowColor: string;
  isClaimed?: boolean;
  isUsed?: boolean;
}

export default function VouchersPage() {
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory>('all');

  // Mock data for my vouchers (user's claimed vouchers)
  const myVouchers: Voucher[] = [
    { 
      id: 1,
      code: 'WELCOME10', 
      discount: '10% OFF', 
      description: 'Welcome discount for new users', 
      minPurchase: 200000,
      expiry: '10 days left',
      type: 'percentage',
      tagColor: 'from-purple-500 to-purple-600',
      glowColor: 'purple-500',
      isClaimed: true,
      isUsed: false
    },
    { 
      id: 2,
      code: 'BIRTHDAY50', 
      discount: 'Rp 50,000', 
      description: 'Birthday special voucher', 
      minPurchase: 500000,
      expiry: '15 days left',
      type: 'fixed',
      tagColor: 'from-amber-400 to-yellow-500',
      glowColor: 'amber-400',
      isClaimed: true,
      isUsed: false
    },
    { 
      id: 3,
      code: 'FASTSHIP', 
      discount: 'FREE SHIPPING', 
      description: 'Free standard shipping', 
      minPurchase: 0,
      expiry: 'Used',
      type: 'shipping',
      tagColor: 'from-cyan-500 to-cyan-600',
      glowColor: 'cyan-500',
      isClaimed: true,
      isUsed: true
    },
    { 
      id: 4,
      code: 'TECH20', 
      discount: '20% OFF', 
      description: 'Maximum discount Rp 100,000', 
      minPurchase: 500000,
      expiry: '3 days left',
      type: 'percentage',
      tagColor: 'from-purple-500 to-purple-600',
      glowColor: 'purple-500',
      isClaimed: true,
      isUsed: false
    },
    { 
      id: 5,
      code: 'FREESHIP', 
      discount: 'FREE SHIPPING', 
      description: 'No minimum purchase required', 
      minPurchase: 0,
      expiry: '1 week left',
      type: 'shipping',
      tagColor: 'from-cyan-500 to-cyan-600',
      glowColor: 'cyan-500',
      isClaimed: true,
      isUsed: false
    },
    { 
      id: 6,
      code: 'SAVE50K', 
      discount: 'Rp 50,000', 
      description: 'Discount for all products', 
      minPurchase: 1000000,
      expiry: '2 weeks left',
      type: 'fixed',
      tagColor: 'from-amber-400 to-yellow-500',
      glowColor: 'amber-400',
      isClaimed: true,
      isUsed: false
    },
  ];

  const filteredVouchers = selectedCategory === 'all' 
    ? myVouchers 
    : myVouchers.filter(v => v.type === selectedCategory);

  const handleUseVoucher = (voucherId: number) => {
    console.log('Using voucher:', voucherId);
    // Add use logic here
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Add toast notification here
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 border border-primary-400/20 rounded-2xl p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/10 rounded-full filter blur-3xl"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent mb-2">
            My Vouchers
          </h1>
          <p className="text-slate-300 text-lg">Manage your vouchers and save more on your purchases!</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-primary-400/10 to-primary-400/5 border border-primary-400/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-400/10 rounded-lg">
              <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{myVouchers.length}</p>
              <p className="text-slate-400 text-sm">Total Vouchers</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-400/10 to-green-400/5 border border-green-400/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-400/10 rounded-lg">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{myVouchers.filter(v => !v.isUsed).length}</p>
              <p className="text-slate-400 text-sm">Active Vouchers</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-400/10 to-slate-400/5 border border-slate-400/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-400/10 rounded-lg">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{myVouchers.filter(v => v.isUsed).length}</p>
              <p className="text-slate-400 text-sm">Used Vouchers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h3 className="text-white font-semibold">Filter by Category</h3>
          </div>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All', icon: '🎯' },
              { value: 'percentage', label: 'Percentage'},
              { value: 'fixed', label: 'Fixed Amount'},
              { value: 'shipping', label: 'Free Shipping'},
            ].map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value as VoucherCategory)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-primary-400/20 to-secondary-400/20 text-white border border-primary-400/40'
                    : 'bg-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{category.icon}</span>
                  {category.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vouchers Grid */}
      {filteredVouchers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVouchers.map((voucher) => (
            <div
              key={voucher.id}
              className={`relative group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-accent-400/50 hover:shadow-xl hover:shadow-accent-400/10 transition-all duration-300 ${
                voucher.isUsed ? 'opacity-60' : ''
              }`}
            >
              {/* Animated Gold Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-400/10 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
              
              {/* Gold accent line at top with shimmer */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-400 to-transparent animate-pulse"></div>
              
              {/* Decorative corner with sparkle */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent-400/10 to-transparent rounded-bl-[100px] group-hover:from-accent-400/20 transition-all duration-500"></div>
              
              {/* Used Badge */}
              {voucher.isUsed && (
                <div className="absolute top-3 left-3 z-20">
                  <span className="px-3 py-1 bg-slate-700/90 text-slate-400 text-xs font-bold rounded-full border border-slate-600">
                    ✓ Used
                  </span>
                </div>
              )}
              
              <div className="p-5 relative z-10">
                {/* Voucher Code Tag */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`px-2.5 py-1 bg-gradient-to-r ${voucher.tagColor} rounded-lg shadow-lg`}>
                    <p className="text-white font-bold text-[10px] tracking-wider">{voucher.code}</p>
                  </div>
                  <button 
                    onClick={() => handleCopyCode(voucher.code)}
                    className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all hover:scale-110"
                    title="Copy code"
                  >
                    <svg className="w-3.5 h-3.5 text-slate-400 hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>

                {/* Discount Amount */}
                <h4 className="text-xl font-bold text-white mb-1.5 drop-shadow-lg">
                  {voucher.discount}
                </h4>
                <p className="text-slate-300 text-xs mb-3 min-h-[32px]">{voucher.description}</p>

                {/* Divider with gold shimmer */}
                <div className="relative my-3">
                  <div className="border-t border-slate-700/50 border-dashed"></div>
                  <div className="absolute inset-0 border-t border-accent-400/20 border-dashed shimmer-animation"></div>
                </div>

                {/* Details */}
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
                  <div className={`flex items-center gap-2 text-[11px] ${voucher.isUsed ? 'text-slate-500' : 'text-amber-300'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold">{voucher.expiry}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => !voucher.isUsed && handleUseVoucher(voucher.id)}
                  disabled={voucher.isUsed}
                  className={`relative w-full py-2.5 rounded-lg text-xs font-bold transition-all duration-300 overflow-hidden ${
                    voucher.isUsed
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-accent-400/20 to-accent-500/20 text-accent-300 hover:from-accent-400 hover:to-accent-500 hover:text-slate-900 hover:shadow-xl hover:shadow-accent-400/40 border border-accent-400/40 hover:border-accent-400 group'
                  }`}
                >
                  {!voucher.isUsed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent shimmer-animation opacity-0 group-hover:opacity-100"></div>
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    {voucher.isUsed ? 'Already Used' : 'Use Voucher'}
                    {!voucher.isUsed && (
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-700/30 rounded-full">
              <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No vouchers found</h3>
              <p className="text-slate-400">Try changing your filter or check back later for new vouchers</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
