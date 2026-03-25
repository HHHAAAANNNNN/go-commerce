"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// We keep this just in case we need generic placeholders anywhere else, but mostly we use real images now.
const ImagePlaceholder = ({ className }: { className?: string }) => (
    <div className={`bg-slate-800/80 flex items-center justify-center ${className}`}>
        <svg className="w-12 h-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    </div>
);

export default function AboutPage() {
    const router = useRouter();
    const [activeImage, setActiveImage] = useState(0);

    const aboutImages = [0, 1, 2];
    const aboutImagePaths = [
        "/assets/aboutus/aboutme1.jpeg",
        "/assets/aboutus/aboutme2.jpeg",
        "/assets/aboutus/aboutme3.jpeg"
    ];

    const handleLoginClick = () => {
        router.push("/");
    };

    return (
        <>
            <Navbar onLoginClick={handleLoginClick} />
            <main className="min-h-screen pt-24 pb-20 bg-[#0A0A0F] text-slate-300">

                <div className="max-w-5xl mx-auto px-4 space-y-20">
                    {/* Header */}
                    <div className="text-center fade-up">
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent mb-4 tracking-tight">
                            Farhan Nugraha S. P.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400">
                            Software Engineer • Full-Stack Developer • Mobile & AI Enthusiast
                        </p>
                    </div>

                    {/* 1. About Me Section */}
                    <section className="fade-up animate-delay-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl font-bold text-white border-b border-slate-700/50 pb-3 inline-block">About Me</h2>
                                <div className="space-y-4 text-base leading-relaxed">
                                    <p>
                                        I am a <strong className="text-white">22-year-old Software Engineer</strong> who graduated with a Bachelor's Degree in Software Engineering (GPA 3.85/4.00) from Telkom University Surabaya in 3.5 years.
                                    </p>
                                    <p>
                                        My professional focus lies heavily on full-stack web development, mobile software engineering, and integrating AI to create impactful and beneficial applications.
                                    </p>
                                    <p>
                                        This very website, <strong className="text-primary-400">GO-COMMERCE</strong>, serves not only as an end-to-end full-stack portfolio but also as a powerful demonstration of bridging a modern Next.js front-end with an efficient Golang REST API backend to build high-performance e-commerce platforms.
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic Image Gallery */}
                            <div className="space-y-4">
                                <div className="w-full relative rounded-2xl overflow-hidden ring-1 ring-slate-700/50 shadow-2xl transition-all duration-300 bg-slate-800" style={{ aspectRatio: '2/1' }}>
                                    <img
                                        src={aboutImagePaths[activeImage]}
                                        alt="Farhan Nugraha"
                                        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                    {aboutImages.map((idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            className={`relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 bg-slate-800 ${activeImage === idx
                                                ? 'ring-2 ring-primary-500 scale-[1.02] shadow-lg shadow-primary-500/20'
                                                : 'ring-1 ring-slate-700/50 opacity-60 hover:opacity-100 hover:scale-[1.02]'
                                                }`}
                                            style={{ aspectRatio: '2/1' }}
                                        >
                                            <img
                                                src={aboutImagePaths[idx]}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Professional Experience & Projects */}
                    <section className="fade-up animate-delay-200">
                        <h2 className="text-3xl font-bold text-white mb-10 text-center">Professional Experience & Projects</h2>

                        <div className="space-y-12">
                            {/* Project 1 */}
                            <div className="group flex flex-col md:flex-row items-center gap-8 bg-slate-800/20 rounded-2xl border border-slate-800/50 p-6 hover:bg-slate-800/40 hover:border-slate-700/80 transition-all duration-300">
                                <div className="w-full md:w-1/3 aspect-video shrink-0 rounded-xl overflow-hidden ring-1 ring-slate-700/50 relative bg-slate-800">
                                    <img
                                        src="/assets/aboutus/project-kominfo-intern.jpeg"
                                        alt="Diskominfo Project"
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="w-full md:w-2/3 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">Project Manager & Full-Stack Developer Intern</h3>
                                        <p className="text-sm font-medium text-slate-400">Diskominfo (Kominfo), Probolinggo • Aug 2025 – Nov 2025</p>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed italic">
                                        "Accomplished the complete digitization of manual scheduling workflows as measured by the total elimination of resource conflicts, by engineering a centralized digital ecosystem utilizing the PHP Laravel framework."
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-primary-500/10 text-primary-300 text-xs rounded-full border border-primary-500/20">PHP Laravel</span>
                                        <span className="px-3 py-1 bg-secondary-500/10 text-secondary-300 text-xs rounded-full border border-secondary-500/20">Full-Stack Architecture</span>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-300 text-xs rounded-full border border-emerald-500/20">Agile Development</span>
                                    </div>
                                </div>
                            </div>

                            {/* Project 2 */}
                            <div className="group flex flex-col md:flex-row items-center gap-8 bg-slate-800/20 rounded-2xl border border-slate-800/50 p-6 hover:bg-slate-800/40 hover:border-slate-700/80 transition-all duration-300">
                                <div className="w-full md:w-1/3 aspect-video shrink-0 rounded-xl overflow-hidden ring-1 ring-slate-700/50 md:order-2 relative bg-slate-800">
                                    <img
                                        src="/assets/aboutus/project-pelindo-intern.png"
                                        alt="Pelindo Intern"
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="w-full md:w-2/3 space-y-4 md:order-1">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">Software Engineer Intern</h3>
                                        <p className="text-sm font-medium text-slate-400">PT Pelindo (Persero), Surabaya • Jan 2026 – Mar 2026</p>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed italic">
                                        "Accomplished 96% accuracy in employee performance metrics as measured by rigorous data validation outputs, by successfully verifying and implementing intricate Workload Priority Time (WPT) calculation formulas."
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-primary-500/10 text-primary-300 text-xs rounded-full border border-primary-500/20">Data Validation</span>
                                        <span className="px-3 py-1 bg-secondary-500/10 text-secondary-300 text-xs rounded-full border border-secondary-500/20">Algorithm Optimization</span>
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-300 text-xs rounded-full border border-amber-500/20">GAS Development</span>
                                    </div>
                                </div>
                            </div>

                            {/* Project 3 */}
                            <div className="group flex flex-col md:flex-row items-center gap-8 bg-slate-800/20 rounded-2xl border border-slate-800/50 p-6 hover:bg-slate-800/40 hover:border-slate-700/80 transition-all duration-300">
                                <div className="w-full md:w-1/3 aspect-video shrink-0 rounded-xl overflow-hidden ring-1 ring-slate-700/50 relative bg-slate-800">
                                    <img
                                        src="/assets/aboutus/project-nourishhub.png"
                                        alt="NOURISH-HUB"
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 object-top"
                                    />
                                </div>
                                <div className="w-full md:w-2/3 space-y-4">
                                    <div>
                                        <h3 className="text-2xl font-bold text-white group-hover:text-primary-400 transition-colors">NOURISH-HUB Zero-Waste Ecosystem</h3>
                                        <p className="text-sm font-medium text-slate-400">Competition Output Platform</p>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed italic">
                                        "Accomplished international prestige as the Runner-Up at the ASEAN Impact Challenge 2025 as measured by prevailing over 50+ ASEAN and international candidates, by architecting a scalable Zero-Waste Food Ecosystem Platform resolving food insecurity issues around the world."
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-primary-500/10 text-primary-300 text-xs rounded-full border border-primary-500/20">Vue.js & Vite</span>
                                        <span className="px-3 py-1 bg-secondary-500/10 text-secondary-300 text-xs rounded-full border border-secondary-500/20">Social Innovation</span>
                                        <span className="px-3 py-1 bg-rose-500/10 text-rose-300 text-xs rounded-full border border-rose-500/20">International-Winning App</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Achievements */}
                    <section className="fade-up animate-delay-300">
                        <h2 className="text-3xl font-bold text-white mb-8 text-center">Key Achievements</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Achievement 1 */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60 p-6 rounded-2xl border border-slate-700/50 hover:border-primary-500/50 hover:-translate-y-1 transition-transform duration-500 flex flex-col items-center text-center min-h-[280px]">
                                <div className="absolute inset-0 z-0">
                                    <img src="/assets/aboutus/achievement1.jpeg" alt="Achievement 1" className="w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="relative z-10 flex flex-col items-center justify-center flex-1 transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform duration-500">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 15.39l-3.76 2.27.99-4.28L6 10.45l4.38-.37L12 6.09l1.62 3.99 4.38.37-3.23 2.93.99 4.28z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">International Runner-Up</h3>
                                    <p className="text-sm text-primary-400 mb-4 font-medium">ASEAN Impact Challenge 2025</p>
                                    <p className="text-sm text-slate-300 italic group-hover:text-white transition-colors duration-300">"Accomplished the Runner-Up title as measured by a top placement among 50+ candidates, by developing a high-impact social innovation."</p>
                                </div>
                            </div>

                            {/* Achievement 2 */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60 p-6 rounded-2xl border border-slate-700/50 hover:border-primary-500/50 hover:-translate-y-1 transition-transform duration-500 flex flex-col items-center text-center min-h-[280px]">
                                <div className="absolute inset-0 z-0">
                                    <img src="/assets/aboutus/achievement2.jpg" alt="Achievement 2" className="w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="relative z-10 flex flex-col items-center justify-center flex-1 transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">National 3rd Best Project</h3>
                                    <p className="text-sm text-primary-400 mb-4 font-medium">Software Engineering Festival 2025</p>
                                    <p className="text-sm text-slate-300 italic group-hover:text-white transition-colors duration-300">"Accomplished national recognition as measured by an award for superior technical execution, by applying rigorous software engineering principles."</p>
                                </div>
                            </div>

                            {/* Achievement 3 */}
                            <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/60 p-6 rounded-2xl border border-slate-700/50 hover:border-primary-500/50 hover:-translate-y-1 transition-transform duration-500 flex flex-col items-center text-center min-h-[280px]">
                                <div className="absolute inset-0 z-0">
                                    <img src="/assets/aboutus/achievement3.jpg" alt="Achievement 3" className="w-full h-full object-cover opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                <div className="relative z-10 flex flex-col items-center justify-center flex-1 transition-transform duration-500 group-hover:-translate-y-2">
                                    <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform duration-500">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Regional 2nd Runner-Up</h3>
                                    <p className="text-sm text-primary-400 mb-4 font-medium">PIM Telkom University 2023</p>
                                    <p className="text-sm text-slate-300 italic group-hover:text-white transition-colors duration-300">"Accomplished a 2nd Runner-Up placement as measured by university-wide evaluation, by engineering an AI-integrated English learning platform."</p>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* 4. Connect With Me Section */}
                    <section className="fade-up animate-delay-400 pt-6">
                        <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/80 rounded-3xl p-10 border border-slate-700/50 text-center shadow-xl">
                            <h2 className="text-3xl font-bold text-white mb-4">Let's Build Something Great Together!</h2>
                            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
                                Whether you're an HR recruiter looking for top engineering talent, or a collaborator aiming to create impactful digital products, I’m always open to meaningful connections.
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-4">
                                <a href="https://www.linkedin.com/in/farhan-nugraha/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#0a66c2]/10 hover:bg-[#0a66c2]/20 border border-[#0a66c2]/40 text-[#0a66c2] hover:text-[#0a66c2] rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                    LinkedIn
                                </a>

                                <a href="https://wa.me/6281238474150" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] hover:text-[#25D366] rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.022-.967-.264-.099-.457-.149-.649.149-.191.298-.763.967-.935 1.164-.171.199-.343.224-.64.075-.297-.15-1.255-.463-2.39-1.305-.882-.653-1.477-1.46-1.649-1.758-.172-.298-.018-.46.13-.609.133-.133.298-.344.446-.517.15-.173.199-.297.299-.497.099-.198.05-.373-.024-.521-.075-.149-.648-1.564-.888-2.141-.233-.561-.47-.485-.648-.494-.17-.008-.363-.01-.555-.01s-.502.073-.765.372C6.918 8.167 6.075 8.961 6.075 10.575s1.782 3.167 2.03 3.5c.248.333 2.38 3.639 5.767 5.097.808.349 1.439.557 1.93.714.811.257 1.549.22 2.128.133.649-.098 1.993-.815 2.274-1.602.28-.787.28-1.46.196-1.603-.083-.142-.311-.225-.609-.373l-.001.001zm-5.467 7.424h-.005c-1.493 0-2.956-.401-4.237-1.16l-.304-.179-3.149.826.84-3.072-.197-.313c-.832-1.326-1.272-2.859-1.272-4.437 0-4.664 3.795-8.455 8.465-8.455 2.26 0 4.385.88 5.986 2.477A8.411 8.411 0 0120.468 12.01c-.001 4.662-3.796 8.455-8.463 8.455v-.002a20.076 20.076 0 00-.001-.659v.659zM12.005 2C6.48 2 2 6.477 2 12c0 1.764.463 3.486 1.34 5l-1.921 7.02 7.182-1.884c1.46.797 3.125 1.218 4.82 1.219h.005c5.523 0 10-4.477 10-10S17.528 2 12.005 2z" /></svg>
                                    206:                                     WhatsApp
                                    207:                                 </a>
                                208:
                                209:                                 <a href="https://github.com/HHHAAAANNNNN/" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-slate-700/30 hover:bg-slate-700/60 border border-slate-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2">
                                    210:                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.123-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23.957-.266 1.98-.398 3-.403 1.02.005 2.043.137 3 .403 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.625-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12" /></svg>
                                    211:                                     GitHub Profile
                                    212:                                 </a>
                                213:                             </div>
                            214:
                            215:                             <div className="mt-8">
                                216:                                 <Link href="/" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full font-bold hover:shadow-lg transition-all hover:-translate-y-0.5">
                                    217:                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                    218:                                     Back to Home
                                    219:                                 </Link>
                                220:                             </div>
                            221:                         </div>
                        222:                     </section>
                    223:
                    224:                 </div>
                225:             </main>
            226:             <Footer onLoginClick={handleLoginClick} />
            227:
            228:             <style jsx global>{`
229:         @keyframes fadeUp {
230:           from { opacity: 0; transform: translateY(20px); }
231:           to   { opacity: 1; transform: translateY(0); }
232:         }
233:         .fade-up { animation: fadeUp 0.6s ease-out forwards; }
234:         .animate-delay-100 { animation-delay: 100ms; }
235:         .animate-delay-200 { animation-delay: 200ms; }
236:         .animate-delay-300 { animation-delay: 300ms; }
237:         .animate-delay-400 { animation-delay: 400ms; }
238:       `}</style>
            239:         </>
240:     );
    241:
}
