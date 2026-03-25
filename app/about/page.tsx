"use client";

import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
    const router = useRouter();

    return (
        <>
            <Navbar onLoginClick={() => router.push("/")} />
            <main className="min-h-screen pt-24 pb-16 bg-[#0A0A0F]">
                <div className="max-w-4xl mx-auto space-y-8 px-4">
                    <div className="fade-up">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-6">About Us</h1>
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
                            <p className="text-slate-300 leading-relaxed mb-6">
                                Welcome to <strong className="text-white">Logo Ipsum</strong>, your trusted destination for premium tech products. This website is a
                                professional portfolio project developed by <strong className="text-white">Farhan Nugraha Sasongko Putra</strong>.
                            </p>
                            <p className="text-slate-300 leading-relaxed mb-6">
                                Designed as an end-to-end full-stack development showcase, this project demonstrates the integration of a modern React/Next.js front-end with a robust Golang backend. The goal is to provide a seamless, secure, and visually engaging e-commerce experience.
                            </p>
                            <p className="text-slate-300 leading-relaxed mb-8">
                                This platform acts as a professional credit to highlight technical competencies in building independent, real-world web applications. Thank you for visiting and exploring the project!
                            </p>
                            <div className="pt-6 border-t border-slate-700/50">
                                <h3 className="text-xl font-semibold text-white mb-4">Connect with Developer</h3>
                                <div className="flex gap-4">
                                    <a
                                        href="https://www.linkedin.com/in/farhan-nugraha-175378393/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-3 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 border border-[#0077b5]/50 text-[#0077b5] hover:text-[#0077b5] rounded-xl font-medium transition-all duration-300 flex items-center gap-2 max-w-max"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        LinkedIn
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer onLoginClick={() => router.push("/")} />
        </>
    );
}
