"use client";

import Image from "next/image";

export default function SocialProof() {
  const testimonials = [
    {
      id: 1,
      name: "Budi Santoso",
      role: "Tech Enthusiast",
      image: "/assets/people/man6.jpg",
      rating: 5,
      comment: "Harga laptop yang saya beli sangat kompetitif! Kualitas produk original dan pelayanan sangat memuaskan. Highly recommended!"
    },
    {
      id: 2,
      name: "Sarah Wijaya",
      role: "Content Creator",
      image: "/assets/people/woman1.jpg",
      rating: 4,
      comment: "iPhone yang saya pesan sampai dengan cepat dan kondisi perfect. Harga lebih murah dari toko lain, plus dapat member discount 10%!"
    },
    {
      id: 3,
      name: "Rizky Pratama",
      role: "Software Developer",
      image: "/assets/people/man2.jpg",
      rating: 4,
      comment: "Sangat puas dengan MacBook Pro M3 yang saya beli. Proses transaksi mudah, barang sampai dengan aman, dan harga sangat worth it!"
    },
    {
      id: 4,
      name: "Amanda Putri",
      role: "Digital Marketer",
      image: "/assets/people/woman2.jpg",
      rating: 5,
      comment: "Pelayanan customer service sangat responsif! Samsung S24 Ultra yang saya beli kualitasnya mantap dan harganya paling murah se-Indonesia."
    },
    {
      id: 5,
      name: "Dimas Aditya",
      role: "Gaming Enthusiast",
      image: "/assets/people/man3.jpg",
      rating: 5,
      comment: "ASUS ROG Zephyrus yang saya order benar-benar premium quality. Packaging rapi, garansi resmi, dan fast shipping. Best decision ever!"
    },
    {
      id: 6,
      name: "Nadya Kartika",
      role: "Graphic Designer",
      image: "/assets/people/woman3.jpg",
      rating: 4,
      comment: "Kualitas produk IT di sini benar-benar terjamin original. Dell XPS 15 saya beli untuk kerja design, performanya luar biasa!"
    }
  ];

  return (
    <section id="testimonials" className="relative py-24 bg-gradient-to-b from-[#150a24] via-[#1a0a2e] to-[#1a0a2e] overflow-hidden">
      {/* Top gradient transition from previous section */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#0A0A0F] via-[#0f0a1a]/80 to-transparent pointer-events-none"></div>
      
      {/* Background Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-400/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-secondary-400/5 rounded-full filter blur-3xl"></div>
      
      {/* Bottom gradient transition to next section */}
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-b from-transparent via-[#1a0a2e]/80 to-[#1a0a2e] pointer-events-none"></div>

      <div className="relative container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 mt-[-50px]">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
            Customer Testimonials
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their tech needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-primary-400/10 hover:border-primary-400/30 transition-all duration-300 hover:scale-105"
            >
              {/* Rating Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-accent-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-300 mb-6 leading-relaxed">
                "{testimonial.comment}"
              </p>

              {/* Customer Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50">
                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary-400/20">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-slate-400">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">10,000+ Happy Customers</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="font-medium">4.9/5 Average Rating</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-medium">100% Original Products</span>
          </div>
        </div>
      </div>
    </section>
  );
}
