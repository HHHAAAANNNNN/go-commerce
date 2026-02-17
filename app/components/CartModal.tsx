"use client";

import { useEffect } from "react";
import Image from "next/image";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: number) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onCheckout: () => void;
}

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems, 
  onRemoveItem,
  onUpdateQuantity,
  onCheckout 
}: CartModalProps) {
  // Close modal on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 z-[60] transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-start justify-end pt-0 px-0 pointer-events-none">
        <div 
          className="bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 h-full w-full max-w-md pointer-events-auto animate-slide-in-right flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div>
              <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
              <p className="text-slate-400 text-sm mt-1">{cartItems.length} items</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800/50 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-20 h-20 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-slate-400 text-lg mb-2">Your cart is empty</p>
                <p className="text-slate-500 text-sm">Add products to get started</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/products/placeholder.jpg';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm mb-1 truncate">{item.name}</h3>
                    <p className="text-slate-400 text-xs mb-2">{item.category}</p>
                    <p className="text-primary-400 font-bold text-sm">{formatPrice(item.price)}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg">
                      <button
                        onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-slate-300 hover:text-white px-2 py-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="text-white font-semibold text-sm min-w-[1.5rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="text-slate-300 hover:text-white px-2 py-1 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer - Checkout */}
          {cartItems.length > 0 && (
            <div className="border-t border-slate-700/50 p-6 space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total</span>
                <span className="text-2xl font-bold text-white">{formatPrice(totalPrice)}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={onCheckout}
                className="w-full py-3 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-lg font-semibold hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary-400/30 flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <p className="text-slate-500 text-xs text-center">Secure checkout with end-to-end encryption</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
