"use client";

interface FloatingButtonsProps {
  onCartClick: () => void;
  cartItemCount: number;
}

export default function FloatingButtons({ onCartClick, cartItemCount }: FloatingButtonsProps) {
  const handleWhatsAppClick = () => {
    window.open('https://wa.me/6281238474150', '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      {/* Cart Button */}
      <button
        onClick={onCartClick}
        className="relative group bg-gradient-to-r from-primary-400 to-secondary-400 text-white w-14 h-14 rounded-full shadow-lg shadow-primary-400/30 hover:shadow-xl hover:shadow-primary-400/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Shopping Cart"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {cartItemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent-400 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {cartItemCount}
          </span>
        )}
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Shopping Cart
        </span>
      </button>

      {/* WhatsApp Button */}
      <button
        onClick={handleWhatsAppClick}
        className="group bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg shadow-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/50 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        aria-label="Contact WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        {/* Tooltip */}
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat WhatsApp
        </span>
      </button>
    </div>
  );
}
