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
  ArrowRight,
  Flame,
  Sparkles,
} from "lucide-react";

const PHONE_NUMBER = "(262) 233-1917";
const PHONE_LINK = "tel:+12622331917";

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Flame className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white tracking-tight">
              Kabab House
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Menu", href: "#menu" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
              { label: "Dashboard", href: "/dashboard" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-zinc-400 hover:text-white transition-colors px-3.5 py-2 rounded-lg hover:bg-white/[0.06]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={PHONE_LINK}
              className="ml-3 inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
            >
              <Phone className="h-3.5 w-3.5" />
              Order Now
            </a>
          </nav>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-5 border-t border-white/[0.06] mt-1">
            <nav className="flex flex-col gap-1 pt-3">
              {[
                { label: "Menu", href: "#menu" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "FAQ", href: "#faq" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-zinc-400 hover:text-white transition-colors py-2.5 px-3 rounded-lg hover:bg-white/[0.06]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={PHONE_LINK}
                className="mt-2 inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all"
              >
                <Phone className="h-3.5 w-3.5" />
                Call to Order
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-orange-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center pt-24 pb-16">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-1.5 mb-8 border border-white/[0.08]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
          </span>
          <span className="text-xs font-medium text-zinc-300 tracking-wide uppercase">
            AI Ordering Live 24/7
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
          <span className="text-white">Fresh Kababs,</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            One Call Away
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Call our AI-powered line anytime. Your authentic Middle Eastern meal
          will be ready in 20 minutes. No app, no wait.
        </p>

        {/* CTA group */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={PHONE_LINK}
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-600/25 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Phone className="h-5 w-5" />
            {PHONE_NUMBER}
            <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href="#menu"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium px-6 py-4 rounded-xl border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04] transition-all"
          >
            View Menu
          </a>
        </div>

        {/* Trust row */}
        <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-orange-500/70" />
            <span>100% Zabiha Halal</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500/70" />
            <span>Ready in 20 min</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange-500/70" />
            <span>AI-Powered Ordering</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// How It Works
// ---------------------------------------------------------------------------

const steps = [
  {
    icon: Phone,
    title: "Call us",
    description: `Dial ${PHONE_NUMBER} anytime — day or night, 24/7.`,
    step: "01",
  },
  {
    icon: MessageSquare,
    title: "Place your order",
    description: "Our AI assistant walks you through the menu and takes your order naturally.",
    step: "02",
  },
  {
    icon: Clock,
    title: "Pick up & enjoy",
    description: "Your fresh meal is ready in 20 minutes. Just walk in and grab it.",
    step: "03",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Three steps to your meal
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="relative group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-8 transition-all"
            >
              <span className="text-5xl font-bold text-white/[0.04] absolute top-5 right-6 group-hover:text-white/[0.07] transition-colors">
                {step.step}
              </span>
              <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center mb-5">
                <step.icon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Features (Bento grid)
// ---------------------------------------------------------------------------

const features = [
  {
    icon: Zap,
    title: "Instant Ordering",
    description: "No waiting on hold. Our AI answers immediately, every single time.",
    size: "large" as const,
  },
  {
    icon: CalendarClock,
    title: "24/7 Availability",
    description: "Midnight craving? Order at 2 AM for tomorrow's lunch.",
    size: "small" as const,
  },
  {
    icon: ShieldCheck,
    title: "Perfect Accuracy",
    description: "AI-powered means your order is exactly right.",
    size: "small" as const,
  },
  {
    icon: MessageCircle,
    title: "Instant Confirmation",
    description: "Get an email confirming your order details and estimated pickup time.",
    size: "large" as const,
  },
];

function FeaturesSection() {
  return (
    <section className="py-20 sm:py-28 bg-[#0f0f0f]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-3">
            Why call us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Ordering, reimagined
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all ${
                feature.size === "large" ? "p-8 sm:p-10" : "p-8"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-5">
                <feature.icon className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Menu Preview
// ---------------------------------------------------------------------------

const menuItems = [
  {
    name: "Beef Shawarma Plate",
    price: "$24.99",
    description: "Slow-roasted beef shawarma with rice, salad, hummus & pita",
    tag: "Popular",
  },
  {
    name: "Chicken Tawook Plate",
    price: "$23.99",
    description: "Marinated grilled chicken with garlic sauce, rice & salad",
    tag: "Popular",
  },
  {
    name: "Mix Grill Plate",
    price: "$28.99",
    description: "Beef shawarma, chicken tawook & kafta kabob with all sides",
    tag: "Best Value",
  },
  {
    name: "Falafel Sandwich",
    price: "$10.99",
    description: "Crispy falafel in warm pita with tahini, pickles & vegetables",
    tag: "Vegetarian",
  },
];

function MenuPreviewSection() {
  return (
    <section id="menu" className="py-20 sm:py-28 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-3">
            Our menu
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Authentic flavors, fresh daily
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {menuItems.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-6 sm:p-7 transition-all"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-base font-semibold text-white group-hover:text-orange-300 transition-colors">
                    {item.name}
                  </h3>
                  {item.tag && (
                    <span className="inline-block mt-1.5 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {item.tag}
                    </span>
                  )}
                </div>
                <span className="text-lg font-semibold text-orange-400 shrink-0 tabular-nums">
                  {item.price}
                </span>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Halal + CTA */}
        <div className="mt-10 flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="h-4 w-4 text-orange-500/60" />
            <span>All meats are 100% Zabiha Halal certified</span>
          </div>
          <a
            href={PHONE_LINK}
            className="inline-flex items-center gap-2.5 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium px-6 py-3 rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            <Phone className="h-4 w-4 text-orange-400" />
            Call to Order from Full Menu
            <ArrowRight className="h-3.5 w-3.5 opacity-50" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const faqItems = [
  {
    question: "How does the phone ordering work?",
    answer:
      "Call our ordering line and you'll be greeted by our AI assistant. It walks you through the menu, helps customize your order, and confirms everything. It's fast, natural, and accurate.",
  },
  {
    question: "Is the food halal?",
    answer:
      "Yes, all meats at Kabab House are 100% Zabiha Halal certified. We source all meats from certified Zabiha Halal suppliers.",
  },
  {
    question: "What are your hours?",
    answer:
      "Our restaurant hours are Mon-Sat 11 AM - 9 PM, Sunday 12 PM - 8 PM. Our AI ordering line is available 24/7 to place orders for the next available pickup time.",
  },
  {
    question: "How long does pickup take?",
    answer:
      "Most orders are ready in 20-30 minutes. Our AI assistant will give you an estimated pickup time when you place your order.",
  },
  {
    question: "Do you offer delivery?",
    answer:
      "Yes! Just let our AI assistant know during your call that you'd like delivery. Availability and fees may vary by location.",
  },
  {
    question: "What about allergies or dietary restrictions?",
    answer:
      "Our AI assistant can guide you through allergen info for any item. Just mention your dietary needs and it will help you find safe options.",
  },
];

function FAQSection() {
  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#0f0f0f]">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Questions? Answered.
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => (
            <details
              key={idx}
              className="group rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-sm font-medium text-zinc-300 hover:text-white transition-colors [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-zinc-600 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 -mt-1">
                <p className="text-sm text-zinc-500 leading-relaxed">
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

// ---------------------------------------------------------------------------
// CTA Banner
// ---------------------------------------------------------------------------

function CTABanner() {
  return (
    <section className="relative py-20 sm:py-24 bg-[#0a0a0a] overflow-hidden">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Ready to order?
        </h2>
        <p className="text-zinc-400 mb-8 max-w-md mx-auto">
          Call now and have your fresh, authentic meal ready for pickup in just
          20 minutes.
        </p>
        <a
          href={PHONE_LINK}
          className="group inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-orange-600/25 hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Phone className="h-5 w-5" />
          {PHONE_NUMBER}
          <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <p className="mt-4 text-xs text-zinc-600 tracking-wide uppercase">
          Available 24/7
        </p>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/[0.06]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Flame className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-base font-semibold text-white">
                Kabab House
              </span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mb-3">
              Authentic Middle Eastern cuisine. 100% Zabiha Halal certified.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider uppercase text-orange-400/80">
              <ShieldCheck className="h-3 w-3" />
              Zabiha Halal
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Contact
            </h3>
            <ul className="space-y-2.5 text-sm text-zinc-500">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-zinc-600" />
                <span>214 E Ryan Rd, Oak Creek, WI 53154</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
                <a href={PHONE_LINK} className="hover:text-white transition-colors">
                  {PHONE_NUMBER}
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Hours
            </h3>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li className="flex justify-between gap-4">
                <span>Mon - Sat</span>
                <span className="text-zinc-300">11 AM - 9 PM</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sunday</span>
                <span className="text-zinc-300">12 PM - 8 PM</span>
              </li>
              <li className="mt-3 pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-orange-400/80">
                  Phone ordering 24/7
                </span>
              </li>
            </ul>
          </div>

          {/* Dashboard */}
          <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-zinc-400 mb-4">
              Dashboard
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Overview", href: "/dashboard" },
                { label: "Orders", href: "/dashboard/orders" },
                { label: "Delivery", href: "/dashboard/delivery" },
                { label: "POS / Kitchen", href: "/dashboard/pos" },
                { label: "Menu", href: "/dashboard/menu" },
                { label: "Settings", href: "/dashboard/settings" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-zinc-500 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
          <p>&copy; 2026 Kabab House. All rights reserved.</p>
          <a
            href={PHONE_LINK}
            className="flex items-center gap-1.5 text-orange-400/60 hover:text-orange-400 transition-colors"
          >
            <Phone className="h-3 w-3" />
            {PHONE_NUMBER}
          </a>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
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
