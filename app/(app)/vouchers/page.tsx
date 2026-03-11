"use client";

import { useState, useEffect, useCallback } from 'react';
import { authFetch, BACKEND, publicFetch } from "../../utils/api";

type VoucherType = 'percentage' | 'fixed_amount';
type VoucherCategory = 'all' | VoucherType;

interface Voucher {
  id: number;
  code: string;
  name: string;
  description: string;
  type: VoucherType;
  discount_value: number;
  min_purchase: number;
  max_discount: number;
  usage_limit: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
}

// ─── helpers ────────────────────────────────────────────────
const typeStyle = (type: VoucherType) => {
  if (type === 'percentage') return 'from-purple-500 to-purple-600';
  if (type === 'fixed_amount') return 'from-amber-400 to-yellow-500';
  return 'from-cyan-500 to-cyan-600';
};

const formatDiscount = (v: Voucher) => {
  if (v.type === 'percentage') return `${v.discount_value}% OFF`;
  return `Rp ${new Intl.NumberFormat('id-ID').format(v.discount_value)}`;
};

const daysLeft = (validUntil: string) => {
  const diff = Math.ceil((new Date(validUntil).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Expired';
  if (diff === 0) return 'Expires today';
  return `${diff} days left`;
};

// ─── Add Voucher Modal ───────────────────────────────────────
function AddVoucherModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    code: '', name: '', description: '',
    type: 'percentage' as VoucherType,
    discount_value: '', max_discount: '', min_purchase: '',
    usage_limit: '', duration_days: '30',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.code.trim()) { setError('Kode voucher wajib diisi.'); return; }
    if (!form.discount_value || parseFloat(form.discount_value) <= 0) {
      setError('Jumlah diskon wajib diisi.'); return;
    }
    if (!form.duration_days || parseInt(form.duration_days) <= 0) {
      setError('Durasi wajib diisi.'); return;
    }
    setLoading(true);
    try {
      const res = await authFetch(`${BACKEND}/api/vouchers`, {
        method: 'POST',
        body: JSON.stringify({
          code: form.code.toUpperCase(),
          name: form.name,
          description: form.description,
          type: form.type,
          discount_value: parseFloat(form.discount_value),
          max_discount: form.max_discount ? parseFloat(form.max_discount) : 0,
          min_purchase: form.min_purchase ? parseFloat(form.min_purchase) : 0,
          usage_limit: form.usage_limit ? parseInt(form.usage_limit) : 0,
          duration_days: parseInt(form.duration_days),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Gagal menambah voucher');
      onAdded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menambah voucher');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400/50";
  const labelCls = "block text-slate-300 text-sm font-medium mb-2";

  return (
    <div
      className="fixed inset-0 top-[73px] bg-black/70 z-40 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg max-h-[calc(100vh-73px-2rem)] overflow-y-auto mx-2 sm:mx-auto">
        <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <h2 className="text-lg sm:text-xl font-bold text-white">Add Voucher</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-3 rounded-lg text-sm">{error}</div>}

          {/* Code */}
          <div>
            <label className={labelCls}>Voucher Code *</label>
            <div className="relative">
              <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className={`${inputCls} pr-32`} placeholder="e.g., SAVE20" />
              {form.code && (
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-gradient-to-r ${typeStyle(form.type)} rounded-lg text-white font-bold text-[10px] tracking-widest`}>
                  {form.code}
                </span>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className={labelCls}>Nama Voucher</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className={inputCls} placeholder="e.g., Diskon Akhir Tahun" />
          </div>

          {/* Type */}
          <div>
            <label className={labelCls}>Tipe Voucher *</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { v: 'percentage', label: 'Persentase', icon: '%', sel: 'purple' },
                { v: 'fixed_amount', label: 'Fixed Amount', icon: 'Rp', sel: 'amber' },
              ] as const).map(({ v, label, icon, sel }) => (
                <button key={v} type="button" onClick={() => setForm({ ...form, type: v })}
                  className={`flex flex-col items-center gap-1 py-3 rounded-lg border text-sm font-semibold transition-all ${form.type === v
                      ? sel === 'purple' ? 'bg-purple-500/20 border-purple-500/60 text-purple-300'
                        : sel === 'amber' ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                          : 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}>
                  <span className="text-lg">{icon}</span>
                  <span className="text-xs">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Discount value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className={labelCls}>{form.type === 'percentage' ? 'Persentase (%) *' : 'Jumlah Diskon (Rp) *'}</label>
                <div className="relative">
                  <input type="number" min="0" step={form.type === 'percentage' ? '0.1' : '1000'}
                    max={form.type === 'percentage' ? '100' : undefined}
                    value={form.discount_value} onChange={e => setForm({ ...form, discount_value: e.target.value })}
                    className={`${inputCls} pr-10`} placeholder={form.type === 'percentage' ? '20' : '50000'} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{form.type === 'percentage' ? '%' : 'Rp'}</span>
                </div>
              </div>
              {form.type === 'percentage' && (
                <div>
                  <label className={labelCls}>Max Diskon (Rp)</label>
                  <input type="number" min="0" step="1000" value={form.max_discount}
                    onChange={e => setForm({ ...form, max_discount: e.target.value })}
                    className={inputCls} placeholder="100000" />
                </div>
              )}
            </div>

          {/* Description */}
          <div>
            <label className={labelCls}>Deskripsi</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              rows={2} className={inputCls} placeholder="Keterangan singkat voucher" />
          </div>

          {/* Min purchase / Usage limit / Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className={labelCls}>Min. Pembelian (Rp)</label>
              <input type="number" min="0" step="1000" value={form.min_purchase}
                onChange={e => setForm({ ...form, min_purchase: e.target.value })}
                className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Batas Pemakaian</label>
              <input type="number" min="0" value={form.usage_limit}
                onChange={e => setForm({ ...form, usage_limit: e.target.value })}
                className={inputCls} placeholder="0 = unlimited" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Durasi (hari) *</label>
            <input type="number" min="1" value={form.duration_days}
              onChange={e => setForm({ ...form, duration_days: e.target.value })}
              className={inputCls} placeholder="30" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 pt-2 border-t border-slate-700">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors min-h-[44px]">
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-all min-h-[44px]">
              {loading ? 'Menyimpan...' : '+ Add Voucher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function VouchersPage() {
  const [selectedCategory, setSelectedCategory] = useState<VoucherCategory>('all');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loadingVouchers, setLoadingVouchers] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');

  const fetchVouchers = useCallback(async () => {
    setLoadingVouchers(true);
    try {
      const res = await publicFetch(`${BACKEND}/api/vouchers`);
      const data = await res.json();
      if (data.success) setVouchers(data.data || []);
    } catch { /* silent */ } finally { setLoadingVouchers(false); }
  }, []);

  useEffect(() => { fetchVouchers(); }, [fetchVouchers]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const nonFreeShipping = vouchers.filter(v => (v.type as string) !== 'free_shipping');
  const filtered = selectedCategory === 'all' ? nonFreeShipping : nonFreeShipping.filter(v => v.type === selectedCategory);
  const active = nonFreeShipping.filter(v => new Date(v.valid_until) > new Date());
  const expired = nonFreeShipping.filter(v => new Date(v.valid_until) <= new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 border border-primary-400/20 rounded-2xl p-5 sm:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-400/10 rounded-full filter blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-400/10 rounded-full filter blur-3xl" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent mb-1 sm:mb-2">Vouchers</h1>
            <p className="text-slate-300 text-sm sm:text-base">Manage all vouchers in the system.</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-primary-400 to-secondary-400 hover:from-primary-500 hover:to-secondary-500 text-white rounded-xl text-sm sm:text-base font-semibold shadow-lg shadow-primary-400/25 hover:scale-105 active:scale-95 transition-all min-h-[44px]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Voucher
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { label: 'Total Vouchers', value: vouchers.length, colorClass: 'primary' },
          { label: 'Active', value: active.length, colorClass: 'green' },
          { label: 'Expired', value: expired.length, colorClass: 'slate' },
        ].map(({ label, value, colorClass }) => (
          <div key={label} className={`bg-${colorClass}-400/5 border border-${colorClass}-400/20 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3`}>
            <div className={`p-1.5 sm:p-2 bg-${colorClass}-400/10 rounded-lg hidden sm:block`}>
              <svg className={`w-5 h-5 text-${colorClass}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
              <p className="text-slate-400 text-[10px] sm:text-sm">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className="text-white font-semibold text-xs sm:text-sm">Filter</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[
              { v: 'all', l: 'All' },
              { v: 'percentage', l: 'Persentase' },
              { v: 'fixed_amount', l: 'Fixed Amount' },
            ].map(({ v, l }) => (
              <button key={v} onClick={() => setSelectedCategory(v as VoucherCategory)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all min-h-[36px] sm:min-h-0 ${selectedCategory === v
                    ? 'bg-gradient-to-r from-primary-400/20 to-secondary-400/20 text-white border border-primary-400/40'
                    : 'bg-slate-700/30 text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loadingVouchers ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-slate-800/40 border border-slate-700/50 rounded-xl h-52 animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(v => {
            const expiry = daysLeft(v.valid_until);
            const isExpired = expiry === 'Expired';
            return (
              <div key={v.id} className={`relative group bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-slate-700/50 rounded-xl overflow-hidden hover:border-accent-400/50 hover:shadow-xl hover:shadow-accent-400/10 transition-all duration-300 ${isExpired ? 'opacity-60' : ''}`}>
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-400 to-transparent" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-accent-400/10 to-transparent rounded-bl-[100px] group-hover:from-accent-400/20 transition-all duration-500" />

                {isExpired && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="px-2.5 py-1 bg-slate-700/90 text-slate-400 text-[10px] font-bold rounded-full border border-slate-600">Expired</span>
                  </div>
                )}

                <div className="p-5 relative z-10">
                  {/* Badge + copy */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`px-2.5 py-1 bg-gradient-to-r ${typeStyle(v.type)} rounded-lg shadow-lg`}>
                      <p className="text-white font-bold text-[10px] tracking-widest">{v.code}</p>
                    </div>
                    <button onClick={() => handleCopy(v.code)} className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-all hover:scale-110" title="Copy code">
                      {copiedCode === v.code
                        ? <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        : <svg className="w-3.5 h-3.5 text-slate-400 hover:text-accent-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      }
                    </button>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-0.5">{formatDiscount(v)}</h4>
                  {v.name && <p className="text-slate-300 text-xs font-medium mb-1">{v.name}</p>}
                  <p className="text-slate-400 text-xs mb-3 min-h-[28px] line-clamp-2">{v.description || '—'}</p>

                  <div className="border-t border-dashed border-slate-700/60 my-3" />

                  <div className="space-y-1.5">
                    {v.min_purchase > 0 ? (
                      <div className="flex items-center gap-2 text-[11px] text-slate-300">
                        <svg className="w-3.5 h-3.5 text-accent-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        Min. <span className="text-white font-semibold ml-1">Rp {new Intl.NumberFormat('id-ID').format(v.min_purchase)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[11px] text-green-400">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        No Minimum Purchase
                      </div>
                    )}
                    <div className={`flex items-center gap-2 text-[11px] ${isExpired ? 'text-slate-500' : 'text-amber-300'}`}>
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="font-semibold">{expiry}</span>
                    </div>
                    {v.usage_limit > 0 && (
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <span>{v.used_count}/{v.usage_limit} used</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-slate-700/30 rounded-full">
              <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">No vouchers found</h3>
              <p className="text-slate-400 mb-6">Tambahkan voucher pertama!</p>
              <button onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg font-semibold hover:opacity-90 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddVoucherModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); fetchVouchers(); }}
        />
      )}
    </div>
  );
}
