"use client";

import { useState } from "react";

interface CTASectionProps {
  onLoginClick: () => void;
}

export default function CTASection({ onLoginClick }: CTASectionProps) {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const handleToggleForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setShowRegisterForm(!showRegisterForm);
    if (!showRegisterForm) {
      setCurrentStep(1); // Reset to step 1 when opening form
    }
  };

  const handleNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handlePrevStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCurrentStep(1);
  };

  const handleLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onLoginClick();
  };

  const handleRegisterFromLogin = () => {
    setShowRegisterForm(true);
    setCurrentStep(1);
  };

  return (
    <section id="cta" className="relative py-32 bg-gradient-to-b from-[#0A0A0F] via-[#0f0a1a] to-[#0A0A0F] overflow-hidden">
      {/* Top gradient transition from previous section */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#0A0A0F] via-[#0A0A0F]/50 to-transparent pointer-events-none"></div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-400/5 via-transparent to-secondary-400/5"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-400/10 via-accent-400/10 to-secondary-400/10 rounded-full filter blur-3xl"></div>
      
      {/* Animated blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-400/10 rounded-full filter blur-3xl animate-blob"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-secondary-400/10 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-accent-400/10 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>

      <div className="relative container mx-auto px-4 -mt-8">
        <div className={`mx-auto transition-all duration-700 ease-in-out ${showRegisterForm ? 'max-w-7xl' : 'max-w-4xl'}`}>
          <div className={`grid transition-all duration-700 ease-in-out items-center ${showRegisterForm ? 'grid-cols-1 lg:grid-cols-3 gap-8' : 'grid-cols-1'}`}>
            
            {/* Main CTA Content - Takes 2/3 when form is shown */}
            <div className={`transition-all duration-700 flex items-center ${showRegisterForm ? 'lg:col-span-2' : 'col-span-1'}`}>
              {/* Main Content */}
              <div className="text-center mb-8 w-full">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-400/10 to-secondary-400/10 backdrop-blur-sm rounded-full border border-primary-400/20 mb-6">
                  <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-slate-300 font-medium">Premium Shopping Experience</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent leading-tight">
                  Ready to Shop?
                </h2>
                
                <p className="text-slate-400 text-lg mb-6 leading-relaxed">
                  Join thousands of satisfied customers and enjoy exclusive benefits
                </p>
                
                {/* Benefits List */}
                <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8 text-slate-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>10% Member Discount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Order Tracking</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col items-center justify-center gap-4">
                  {/* Primary CTA - Create Account */}
                  <a
                    href="#"
                    id="register-trigger"
                    onClick={handleToggleForm}
                    className="group relative px-8 py-4 bg-gradient-to-r from-primary-400 to-secondary-400 text-white rounded-full font-semibold text-lg hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 shadow-2xl shadow-primary-400/30 hover:shadow-primary-400/50 min-w-[280px] inline-block"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {showRegisterForm ? 'Hide Form' : 'Create Free Account'}
                      <svg 
                        className={`w-5 h-5 transition-transform duration-300 ${showRegisterForm ? 'rotate-180' : 'group-hover:translate-x-1'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        {showRegisterForm ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        )}
                      </svg>
                    </span>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/50 to-secondary-400/50 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-50 group-hover:opacity-100"></div>
                  </a>

                  {/* Secondary CTA - Login */}
                  <a
                    href="#"
                    onClick={handleLoginClick}
                    className="group text-slate-400 hover:text-white transition-colors duration-300 text-sm"
                  >
                    <span className="flex items-center gap-1">
                      Already Member? 
                      <span className="text-primary-400 group-hover:text-secondary-400 transition-colors underline underline-offset-2">Login Here</span>
                    </span>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Data Protected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Register Form - Slides in from right (1/3 width) */}
            <div className={`transition-all duration-700 ease-in-out ${
              showRegisterForm 
                ? 'opacity-100 translate-x-0 visible' 
                : 'opacity-0 translate-x-full invisible lg:absolute lg:right-0'
            }`}>
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
                {/* Header */}
                <h3 className="text-xl font-bold text-white mb-1">Create Account</h3>
                <p className="text-slate-400 text-xs mb-4">Join us and start shopping today!</p>
                
                {/* Progress Indicator */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Step {currentStep} of 2</span>
                    <span className="text-xs text-slate-400">{currentStep === 1 ? 'Personal Info' : 'Account Security'}</span>
                  </div>
                  <div className="w-full bg-slate-800/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentStep / 2) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <form className="space-y-3">
                  {/* Step 1: Name + Phone */}
                  {currentStep === 1 && (
                    <div className="space-y-3 animate-fade-in-up">
                      {/* Full Name */}
                      <div>
                        <label htmlFor="fullName" className="block text-slate-300 text-xs font-medium mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className="block text-slate-300 text-xs font-medium mb-1.5">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          placeholder="+62 812 3456 7890"
                          required
                        />
                      </div>

                      {/* Next Button */}
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-2.5 mt-1 bg-gradient-to-r from-primary-400 to-secondary-400 text-white text-sm rounded-lg font-semibold hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary-400/30 flex items-center justify-center gap-2"
                      >
                        Next Step
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Step 2: Email + Password + Confirm Password */}
                  {currentStep === 2 && (
                    <div className="space-y-3 animate-fade-in-up">
                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-slate-300 text-xs font-medium mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          placeholder="john@example.com"
                          required
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-slate-300 text-xs font-medium mb-1.5">
                          Password *
                        </label>
                        <input
                          type="password"
                          id="password"
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-slate-300 text-xs font-medium mb-1.5">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-primary-400/50 focus:ring-2 focus:ring-primary-400/20 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm rounded-lg font-semibold hover:bg-slate-800 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                          </svg>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-gradient-to-r from-primary-400 to-secondary-400 text-white text-sm rounded-lg font-semibold hover:from-primary-500 hover:to-secondary-500 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary-400/30"
                        >
                          Create Account
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Already Member - Centered */}
                  <div className="text-center pt-3">
                    <a
                      href="#"
                      onClick={handleLoginClick}
                      className="group text-slate-400 hover:text-white transition-colors duration-300 text-xs inline-block"
                    >
                      <span className="flex items-center gap-1">
                        Already Member? 
                        <span className="text-primary-400 group-hover:text-secondary-400 transition-colors underline underline-offset-2">Login Here</span>
                      </span>
                    </a>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
