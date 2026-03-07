"use client";

import { useState } from "react";
import {
  Phone,
  MessageSquare,
  Clock,
  Zap,
  CalendarClock,
  ShieldCheck,
  MessageCircle,
  MapPin,
  Menu,
  X,
  ChevronDown,
  UtensilsCrossed,
  Star,
} from "lucide-react";

const PHONE_NUMBER = "(262) 233-1917";
const PHONE_LINK = "tel:+12622331917";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e8ddd0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <UtensilsCrossed className="h-7 w-7 sm:h-8 sm:w-8 text-[#c2571a]" />
            <span className="text-xl sm:text-2xl font-bold text-[#3d2b1f]">
              Kabab House
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#menu"
              className="text-[#3d2b1f] hover:text-[#c2571a] transition-colors font-medium"
            >
              Menu
            </a>
            <a
              href="#how-it-works"
              className="text-[#3d2b1f] hover:text-[#c2571a] transition-colors font-medium"
            >
              How It Works
            </a>
            <a
              href="#faq"
              className="text-[#3d2b1f] hover:text-[#c2571a] transition-colors font-medium"
            >
              FAQ
            </a>
            <a
              href="/dashboard"
              className="text-[#3d2b1f] hover:text-[#c2571a] transition-colors font-medium"
            >
              Dashboard
            </a>
            <a
              href={PHONE_LINK}
              className="inline-flex items-center gap-2 bg-[#c2571a] hover:bg-[#a94a15] text-white font-semibold px-6 py-2.5 rounded-full transition-colors shadow-md hover:shadow-lg"
            >
              <Phone className="h-4 w-4" />
              Call to Order
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#3d2b1f] hover:text-[#c2571a] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 border-t border-[#e8ddd0]">
            <nav className="flex flex-col gap-1 pt-4">
              <a
                href="#menu"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#3d2b1f] hover:text-[#c2571a] hover:bg-[#fdf6ee] transition-colors font-medium py-3 px-4 rounded-lg"
              >
                Menu
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#3d2b1f] hover:text-[#c2571a] hover:bg-[#fdf6ee] transition-colors font-medium py-3 px-4 rounded-lg"
              >
                How It Works
              </a>
              <a
                href="#faq"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#3d2b1f] hover:text-[#c2571a] hover:bg-[#fdf6ee] transition-colors font-medium py-3 px-4 rounded-lg"
              >
                FAQ
              </a>
              <a
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#3d2b1f] hover:text-[#c2571a] hover:bg-[#fdf6ee] transition-colors font-medium py-3 px-4 rounded-lg"
              >
                Dashboard
              </a>
              <a
                href={PHONE_LINK}
                className="mt-2 inline-flex items-center justify-center gap-2 bg-[#c2571a] hover:bg-[#a94a15] text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-md"
              >
                <Phone className="h-4 w-4" />
                Call to Order
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fdf6ee] via-[#fef0e0] to-[#fde8d0]" />
      {/* Decorative pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233d2b1f' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-6 sm:mb-8 shadow-sm border border-[#e8ddd0]">
          <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-[#3d2b1f]">
            AI Ordering Line is Live — Available 24/7
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3d2b1f] leading-tight max-w-4xl mx-auto">
          Order Delicious Middle Eastern Food by Phone{" "}
          <span className="text-[#c2571a]">— Anytime, 24/7</span>
        </h1>

        <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-[#5a4a3a] max-w-2xl mx-auto leading-relaxed">
          Call our AI-powered ordering line and have your fresh, authentic Kabob
          House meal ready when you arrive. No waiting, no app needed.
        </p>

        {/* Primary CTA */}
        <div className="mt-8 sm:mt-10">
          <a
            href={PHONE_LINK}
            className="inline-flex items-center gap-3 bg-[#c2571a] hover:bg-[#a94a15] text-white font-bold text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <Phone className="h-6 w-6" />
            Call Now: {PHONE_NUMBER}
          </a>
        </div>

        <p className="mt-4 text-sm sm:text-base text-[#8a7a6a] font-medium">
          Available 24 hours a day, 7 days a week
        </p>

        {/* Trust indicators */}
        <div className="mt-10 sm:mt-14 flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-[#5a4a3a]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#c2571a]" />
            <span>100% Zabiha Halal</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-[#c2571a]" />
            <span>Fresh & Authentic</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#c2571a]" />
            <span>Ready in 20-30 min</span>
          </div>
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Phone,
    title: "Call Us",
    description: `Dial ${PHONE_NUMBER} anytime, day or night`,
    step: "01",
  },
  {
    icon: MessageSquare,
    title: "Place Your Order",
    description:
      "Our friendly AI assistant will guide you through our menu and take your order",
    step: "02",
  },
  {
    icon: Clock,
    title: "Pick Up & Enjoy",
    description: "Your fresh meal will be ready in 20-30 minutes",
    step: "03",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d2b1f]">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-[#5a4a3a] max-w-xl mx-auto">
            Ordering your favorite Kabab House meal is as easy as 1-2-3
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative text-center group">
              {/* Connector line (desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-[#e8ddd0] to-[#e8ddd0]/50" />
              )}

              {/* Step number */}
              <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#fdf6ee] to-[#fde8d0] mb-6 group-hover:from-[#fde8d0] group-hover:to-[#f9d4b0] transition-all shadow-md">
                <step.icon className="h-10 w-10 text-[#c2571a]" />
                <span className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#c2571a] text-white text-sm font-bold flex items-center justify-center shadow-md">
                  {step.step}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#3d2b1f] mb-2">
                {step.title}
              </h3>
              <p className="text-[#5a4a3a] leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Zap,
    title: "Instant Ordering",
    description:
      "No waiting on hold. Our AI answers immediately, every time.",
  },
  {
    icon: CalendarClock,
    title: "24/7 Availability",
    description:
      "Order at midnight for tomorrow's lunch. We're always here.",
  },
  {
    icon: ShieldCheck,
    title: "Perfect Accuracy",
    description:
      "AI-powered ordering means your order is exactly right, every time.",
  },
  {
    icon: MessageCircle,
    title: "SMS Confirmation",
    description:
      "Get a text message confirming your order and when it's ready.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-16 sm:py-24 bg-[#fdf6ee]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d2b1f]">
            Why Order by Phone?
          </h2>
          <p className="mt-4 text-lg text-[#5a4a3a] max-w-xl mx-auto">
            Our AI-powered phone system makes ordering fast, easy, and reliable
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow border border-[#e8ddd0]/60"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#fdf6ee] to-[#fde8d0] mb-4">
                <feature.icon className="h-6 w-6 text-[#c2571a]" />
              </div>
              <h3 className="text-lg font-bold text-[#3d2b1f] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#5a4a3a] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const menuItems = [
  {
    name: "Beef Shawarma Plate",
    price: "$24.99",
    description:
      "Tender, slow-roasted beef shawarma served with rice, salad, hummus, and fresh pita bread",
    tag: "Popular",
  },
  {
    name: "Chicken Tawook Plate",
    price: "$23.99",
    description:
      "Marinated grilled chicken tawook with garlic sauce, rice, salad, and pita bread",
    tag: "Popular",
  },
  {
    name: "Mix Grill Plate",
    price: "$28.99",
    description:
      "A generous combination of beef shawarma, chicken tawook, and kafta kabob with all the sides",
    tag: "Best Value",
  },
  {
    name: "Falafel Sandwich",
    price: "$10.99",
    description:
      "Crispy falafel wrapped in warm pita with tahini, pickles, and fresh vegetables",
    tag: "Vegetarian",
  },
];

function MenuPreviewSection() {
  return (
    <section id="menu" className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d2b1f]">
            Our Menu
          </h2>
          <p className="mt-4 text-lg text-[#5a4a3a] max-w-xl mx-auto">
            Authentic Middle Eastern cuisine made fresh to order
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-[#e8ddd0]/60 hover:border-[#c2571a]/30"
            >
              {/* Decorative gradient header */}
              <div className="h-32 bg-gradient-to-br from-[#c2571a] to-[#e87d2f] relative flex items-center justify-center">
                <UtensilsCrossed className="h-12 w-12 text-white/30" />
                {item.tag && (
                  <span className="absolute top-3 right-3 bg-white/90 text-[#c2571a] text-xs font-bold px-3 py-1 rounded-full">
                    {item.tag}
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-lg font-bold text-[#3d2b1f] leading-tight">
                    {item.name}
                  </h3>
                  <span className="text-lg font-bold text-[#c2571a] shrink-0">
                    {item.price}
                  </span>
                </div>
                <p className="text-sm text-[#5a4a3a] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Halal badge and CTA */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-[#fdf6ee] rounded-full px-5 py-2.5 mb-6 border border-[#e8ddd0]">
            <ShieldCheck className="h-5 w-5 text-[#c2571a]" />
            <span className="text-sm font-semibold text-[#3d2b1f]">
              All meats are 100% Zabiha Halal certified
            </span>
          </div>

          <div className="block">
            <a
              href={PHONE_LINK}
              className="inline-flex items-center gap-2 bg-[#c2571a] hover:bg-[#a94a15] text-white font-semibold px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone className="h-5 w-5" />
              Call to Order from Full Menu
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "How does the phone ordering work?",
    answer:
      "When you call our ordering line at (262) 233-1917, you'll be greeted by our friendly AI assistant. It will walk you through our menu, help you customize your order, and confirm everything before placing it. It's like talking to a real person — fast, easy, and accurate.",
  },
  {
    question: "Is the food halal?",
    answer:
      "Yes, all meats at Kabab House are 100% Zabiha Halal certified. We take this very seriously and source all our meats from certified Zabiha Halal suppliers.",
  },
  {
    question: "What are your hours?",
    answer:
      "Our restaurant hours are Monday through Saturday, 11 AM to 9 PM, and Sunday 12 PM to 8 PM. However, you can call our AI ordering line 24/7 to place an order for the next available pickup time.",
  },
  {
    question: "How long does pickup take?",
    answer:
      "Most orders are ready in 20-30 minutes after being placed. Our AI assistant will let you know the estimated pickup time when you place your order.",
  },
  {
    question: "Do you offer delivery?",
    answer:
      "Yes! Just let our AI assistant know during your call that you'd like delivery, and it will help you arrange it. Delivery availability and fees may vary based on your location.",
  },
  {
    question: "What if I have allergies or dietary restrictions?",
    answer:
      "Our AI assistant can guide you through allergen information for any menu item. Just let it know about your dietary restrictions or allergies, and it will help you find safe and delicious options on our menu.",
  },
];

function FAQSection() {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-[#fdf6ee]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#3d2b1f]">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-[#5a4a3a]">
            Everything you need to know about ordering from Kabab House
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-xl border border-[#e8ddd0]/60 shadow-sm overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none font-semibold text-[#3d2b1f] hover:text-[#c2571a] transition-colors [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-[#8a7a6a] group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-5 -mt-1">
                <p className="text-[#5a4a3a] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-[#3d2b1f] to-[#5a3d28] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#c2571a]/10 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c2571a]/10 rounded-full translate-y-1/2 -translate-x-1/3" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Order?
        </h2>
        <p className="text-lg text-[#d4c4b0] mb-8 max-w-xl mx-auto">
          Call now and have your fresh, authentic Middle Eastern meal ready for
          pickup in just 20-30 minutes.
        </p>
        <a
          href={PHONE_LINK}
          className="inline-flex items-center gap-3 bg-[#e87d2f] hover:bg-[#c2571a] text-white font-bold text-lg sm:text-xl px-8 sm:px-10 py-4 sm:py-5 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <Phone className="h-6 w-6" />
          Call Now: {PHONE_NUMBER}
        </a>
        <p className="mt-4 text-sm text-[#a89888]">
          Available 24 hours a day, 7 days a week
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#2a1f16] text-[#c4b4a0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="h-7 w-7 text-[#e87d2f]" />
              <span className="text-xl font-bold text-white">Kabab House</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Authentic Middle Eastern cuisine made with love. 100% Zabiha Halal
              certified.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#3d2b1f] rounded-full px-4 py-2">
              <ShieldCheck className="h-4 w-4 text-[#e87d2f]" />
              <span className="text-xs font-semibold text-[#e87d2f]">
                100% Zabiha Halal
              </span>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#e87d2f]" />
                <span>214 E Ryan Rd, Oak Creek, WI 53154</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#e87d2f]" />
                <a
                  href={PHONE_LINK}
                  className="hover:text-white transition-colors"
                >
                  {PHONE_NUMBER}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hours</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between gap-4">
                <span>Mon - Sat</span>
                <span className="text-white">11 AM - 9 PM</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sunday</span>
                <span className="text-white">12 PM - 8 PM</span>
              </li>
              <li className="mt-3 pt-3 border-t border-[#3d2b1f]">
                <span className="text-[#e87d2f] font-medium text-xs">
                  Phone ordering available 24/7
                </span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Dashboard</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/dashboard"
                  className="hover:text-white transition-colors"
                >
                  Overview
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/orders"
                  className="hover:text-white transition-colors"
                >
                  Orders
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/delivery"
                  className="hover:text-white transition-colors"
                >
                  Delivery
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/pos"
                  className="hover:text-white transition-colors"
                >
                  POS (Kitchen Display)
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/menu"
                  className="hover:text-white transition-colors"
                >
                  Menu Management
                </a>
              </li>
              <li>
                <a
                  href="/dashboard/settings"
                  className="hover:text-white transition-colors"
                >
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#3d2b1f] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8a7a6a]">
          <p>&copy; 2026 Kabab House. All rights reserved.</p>
          <a
            href={PHONE_LINK}
            className="flex items-center gap-2 text-[#e87d2f] hover:text-white transition-colors font-medium"
          >
            <Phone className="h-3.5 w-3.5" />
            {PHONE_NUMBER}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <MenuPreviewSection />
        <FAQSection />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
