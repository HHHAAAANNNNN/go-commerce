"use client";

export default function WhyUs() {
  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Premium Quality",
      description: "100% original products from authorized distributors with official warranty",
      color: "primary"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Fast Delivery",
      description: "Same-day delivery in Jakarta area, free shipping for all members",
      color: "secondary"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Best Price",
      description: "Price match guarantee plus exclusive member discounts up to 15%",
      color: "accent"
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Secure Payment",
      description: "Protected transactions with multiple payment options and buyer protection",
      color: "secondary"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Happy Customers" },
    { number: "500+", label: "Premium Products" },
    { number: "4.9/5", label: "Customer Rating" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <section id="why-us" className="relative py-24 bg-gradient-to-b from-[#1a0a2e] via-[#150a24] to-[#0A0A0F] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-400/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-400/5 rounded-full filter blur-3xl"></div>
      {/* Bottom gradient fade to base color */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-b from-transparent via-[#0A0A0F]/50 to-[#0A0A0F] pointer-events-none"></div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
            Why Choose Us?
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Experience the difference with our premium service and unbeatable value
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-primary-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-400/10"
            >
              {/* Icon Container */}
              <div className={`inline-flex p-4 rounded-xl bg-${feature.color}-400/10 text-${feature.color}-400 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${feature.color}-400/0 to-${feature.color}-400/0 group-hover:from-${feature.color}-400/5 group-hover:to-transparent transition-all duration-300 pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 backdrop-blur-md rounded-2xl p-8 border border-primary-400/20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
