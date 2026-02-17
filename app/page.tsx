"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/landing/HeroSection";
import FeaturedCategories from "./components/landing/FeaturedCategories";
import WhyUs from "./components/landing/WhyUs";
import SocialProof from "./components/landing/SocialProof";
import CTASection from "./components/landing/CTASection";
import Footer from "./components/Footer";
import FloatingButtons from "./components/FloatingButtons";
import CartModal, { CartItem } from "./components/CartModal";
import LoginModal from "./components/LoginModal";

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenCart = () => {
    setIsLoginModalOpen(false);
    setIsCartModalOpen(true);
  };

  const handleOpenLogin = () => {
    setIsCartModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsCartModalOpen(false);
    setIsLoginModalOpen(false);
  };

  const handleRemoveItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: number, quantity: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const handleCheckout = () => {
    setIsCartModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleAddToCart = (product: CartItem) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      handleUpdateQuantity(product.id, existingItem.quantity + 1);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleRegisterClick = () => {
    handleCloseModals();
    // Scroll to CTA section
    const ctaElement = document.getElementById("cta");
    if (ctaElement) {
      const offsetTop = ctaElement.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
      // Trigger the register form to open
      setTimeout(() => {
        const registerButton = document.getElementById("register-trigger");
        if (registerButton) registerButton.click();
      }, 500);
    }
  };

  return (
    <>
      <Navbar onLoginClick={handleOpenLogin} />
      <main>
        <HeroSection />
        <FeaturedCategories onAddToCart={handleAddToCart} />
        <WhyUs />
        <SocialProof />
        <CTASection onLoginClick={handleOpenLogin} />
      </main>
      <Footer />
      
      {/* Floating Buttons */}
      <FloatingButtons 
        onCartClick={handleOpenCart}
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
      />

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={handleCloseModals}
        cartItems={cartItems}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModals}
        onRegisterClick={handleRegisterClick}
      />
    </>
  );
}
