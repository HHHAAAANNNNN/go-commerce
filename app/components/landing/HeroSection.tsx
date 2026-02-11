"use client";

export default function HeroSection() {
  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-[#0A0A0F]">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f2e] via-[#0e1628] to-[#0A0A0F]">
        {/* Floating Blur Circles */}
        <div className="absolute top-10 -left-20 w-96 h-96 bg-primary-300 rounded-full mix-blend-screen filter blur-2xl opacity-40 animate-blob"></div>
        <div className="absolute top-20 -right-20 w-80 h-80 bg-secondary-300 rounded-full mix-blend-screen filter blur-2xl opacity-35 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-40 w-96 h-96 bg-accent-300 rounded-full mix-blend-screen filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-40 right-20 w-72 h-72 bg-primary-400 rounded-full mix-blend-screen filter blur-xl opacity-40 animate-blob animation-delay-6000"></div>
        
        {/* Mesh Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        
        {/* Grain Texture */}
        <div className="absolute inset-0 opacity-20 mix-blend-soft-light">
          <div className="absolute inset-0 bg-noise"></div>
        </div>
        
        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60"></div>
        
        {/* Bottom Fade to Next Section */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent via-[#0A0A0F]/50 to-[#0A0A0F]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center text-center text-white pt-20">
        {/* Trust Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-primary-400/30 animate-fade-in-down">
          <span className="w-2 h-2 bg-accent-400 rounded-full animate-pulse shadow-lg shadow-accent-400/50"></span>
          <span className="text-sm font-medium text-slate-300">Trusted by 10,000+ Customers</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 max-w-5xl leading-tight animate-fade-in-up">
          <span className="text-slate-100">Discover Your</span>
          <span className="block mt-2 bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-300 bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
            Perfect Product
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl mb-12 max-w-2xl text-slate-400 leading-relaxed animate-fade-in-up animation-delay-200">
          Shop 1000+ premium products with exclusive member deals and free shipping
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-in-up animation-delay-400">
          <a
            href="#products"
            className="group relative px-8 py-4 bg-gradient-to-r from-primary-400 to-primary-500 text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary-400/30"
          >
            <span className="relative z-10">Start Shopping</span>
            <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-300 to-accent-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </a>
          <a
            href="#products"
            className="px-8 py-4 bg-white/5 backdrop-blur-md text-slate-200 rounded-full font-semibold text-lg border-2 border-primary-400/30 hover:bg-white/10 hover:border-primary-400/60 transition-all duration-300 hover:scale-105"
          >
            View Deals
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}
