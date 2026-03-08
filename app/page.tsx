"use client";

import { useState } from "react";
import {
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  ChevronDown,
  Menu,
  X,
  Flame,
  ArrowDown,
} from "lucide-react";

const PHONE_NUMBER = "(262) 233-1917";
const PHONE_LINK = "tel:+12622331917";

// ---------------------------------------------------------------------------
// Nav — minimal, floating
// ---------------------------------------------------------------------------

function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-5">
        <div className="flex items-center justify-between bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/[0.06] px-5 py-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white tracking-tight">
              Kabab House
            </span>
          </a>

          {/* Desktop */}
          <div className="hidden sm:flex items-center gap-1">
            <a href="#menu" className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]">Menu</a>
            <a href="/dashboard" className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.06]">Dashboard</a>
            <a
              href={PHONE_LINK}
              className="ml-2 inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-all"
            >
              <Phone className="h-3 w-3" />
              Order
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="sm:hidden p-1.5 text-zinc-400 hover:text-white"
            aria-label="Menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="sm:hidden mt-2 bg-white/[0.04] backdrop-blur-2xl rounded-2xl border border-white/[0.06] p-3 flex flex-col gap-1">
            <a href="#menu" onClick={() => setOpen(false)} className="text-xs text-zinc-400 hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.06]">Menu</a>
            <a href="/dashboard" onClick={() => setOpen(false)} className="text-xs text-zinc-400 hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.06]">Dashboard</a>
            <a href={PHONE_LINK} className="mt-1 text-center text-xs bg-orange-600 hover:bg-orange-500 text-white font-medium py-2 px-3 rounded-lg">Call to Order</a>
          </div>
        )}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Hero — full viewport, just the phone number
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#050505]">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[400px] bg-orange-600/[0.08] rounded-full blur-[150px] pointer-events-none" />

      <div className="relative text-center px-5">
        {/* Live indicator */}
        <div className="inline-flex items-center gap-2 mb-10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
          </span>
          <span className="text-[10px] font-medium text-zinc-500 tracking-[0.2em] uppercase">
            Accepting orders 24/7
          </span>
        </div>

        <h1 className="text-[clamp(2.5rem,8vw,6rem)] font-bold tracking-tight leading-[0.95]">
          <span className="text-white">Kabab</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
            House
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-zinc-500 max-w-xs mx-auto leading-relaxed">
          Authentic Middle Eastern cuisine.
          <br />
          Call to order, we'll have it ready.
        </p>

        {/* The phone number — this IS the CTA */}
        <a
          href={PHONE_LINK}
          className="group mt-10 inline-flex items-center gap-3 text-white"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-600 group-hover:bg-orange-500 transition-colors shadow-lg shadow-orange-600/20">
            <Phone className="h-5 w-5" />
          </span>
          <span className="text-2xl sm:text-3xl font-semibold tracking-tight group-hover:text-orange-300 transition-colors">
            {PHONE_NUMBER}
          </span>
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <span className="text-[10px] text-zinc-600 tracking-[0.15em] uppercase">Menu</span>
        <ArrowDown className="h-3.5 w-3.5 text-zinc-700 animate-bounce" />
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Content — menu + info, side by side
// ---------------------------------------------------------------------------

const plates = [
  { name: "Beef Shawarma Plate", price: 24.99, note: "Popular" },
  { name: "Chicken Shawarma Plate", price: 23.99 },
  { name: "Chicken Tawook Plate", price: 23.99, note: "Popular" },
  { name: "Kafta Kabob Plate", price: 24.99 },
  { name: "Mix Grill Plate", price: 28.99, note: "Best value" },
  { name: "Lamb Chops Plate", price: 28.99 },
  { name: "Falafel Plate", price: 19.99, note: "Vegetarian" },
];

const sandwiches = [
  { name: "Beef Shawarma Wrap", price: 12.99 },
  { name: "Chicken Shawarma Wrap", price: 12.99 },
  { name: "Chicken Tawook Wrap", price: 12.99 },
  { name: "Kafta Kabob Wrap", price: 12.99 },
  { name: "Falafel Sandwich", price: 10.99, note: "Vegetarian" },
];

const sides = [
  { name: "Hummus", price: 5.99 },
  { name: "Baba Ghanoush", price: 6.99 },
  { name: "Fattoush Salad", price: 7.99 },
  { name: "Garlic Sauce", price: 2.99 },
  { name: "French Fries", price: 4.99 },
  { name: "Baklava", price: 4.99 },
];

function MenuList({ title, items }: { title: string; items: { name: string; price: number; note?: string }[] }) {
  return (
    <div className="mb-10 last:mb-0">
      <h3 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-4">
        {title}
      </h3>
      <div className="space-y-0">
        {items.map((item, i) => (
          <div
            key={i}
            className="group flex items-baseline justify-between gap-3 py-2.5 border-b border-white/[0.04] last:border-0"
          >
            <div className="flex items-baseline gap-2.5 min-w-0">
              <span className="text-sm text-zinc-200 group-hover:text-white transition-colors truncate">
                {item.name}
              </span>
              {item.note && (
                <span className="shrink-0 text-[9px] font-medium tracking-wider uppercase text-orange-400/70">
                  {item.note}
                </span>
              )}
            </div>
            <span className="text-sm text-zinc-500 tabular-nums shrink-0">
              {item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3.5 py-4 border-b border-white/[0.04] last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
      </div>
      <div className="text-sm text-zinc-400 leading-relaxed">{children}</div>
    </div>
  );
}

function ContentSection() {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <section id="menu" className="bg-[#0a0a0a] py-16 sm:py-24">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-12 lg:gap-16">
          {/* Left — Menu */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-10">
              Menu
            </h2>
            <MenuList title="Plates" items={plates} />
            <MenuList title="Sandwiches & Wraps" items={sandwiches} />
            <MenuList title="Sides & Desserts" items={sides} />

            <div className="mt-8 pt-6 border-t border-white/[0.04]">
              <a
                href={PHONE_LINK}
                className="inline-flex items-center gap-2.5 text-sm text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Call to order — {PHONE_NUMBER}
              </a>
            </div>
          </div>

          {/* Right — Info */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <InfoCard icon={ShieldCheck}>
                <span className="text-zinc-200 font-medium">100% Zabiha Halal.</span>{" "}
                All meats sourced from certified suppliers.
              </InfoCard>

              <InfoCard icon={Clock}>
                <span className="text-zinc-200 font-medium">Mon — Sat</span> 11 AM — 9 PM
                <br />
                <span className="text-zinc-200 font-medium">Sunday</span> 12 PM — 8 PM
                <br />
                <span className="text-orange-400/80 text-xs mt-1 inline-block">Phone orders accepted 24/7</span>
              </InfoCard>

              <InfoCard icon={MapPin}>
                214 E Ryan Rd
                <br />
                Oak Creek, WI 53154
              </InfoCard>

              <InfoCard icon={Truck}>
                Delivery available. Tell our AI assistant your address when you call.
              </InfoCard>

              <InfoCard icon={Phone}>
                Our AI answers instantly — no hold time, ever. Your order is ready in ~20 minutes.
              </InfoCard>

              {/* Collapsed FAQ */}
              <div className="mt-4 pt-4 border-t border-white/[0.04]">
                <button
                  onClick={() => setFaqOpen(!faqOpen)}
                  className="flex items-center justify-between w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <span className="font-medium tracking-wide uppercase">Common questions</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${faqOpen ? "rotate-180" : ""}`} />
                </button>

                {faqOpen && (
                  <div className="mt-4 space-y-4 text-sm text-zinc-500 leading-relaxed">
                    <div>
                      <p className="text-zinc-300 font-medium mb-1">Is it really AI?</p>
                      <p>Yes. Our AI assistant takes your order naturally over the phone — just like talking to a person. It knows the full menu and can handle customizations.</p>
                    </div>
                    <div>
                      <p className="text-zinc-300 font-medium mb-1">Allergies?</p>
                      <p>Just mention them on the call. The AI will guide you to safe options.</p>
                    </div>
                    <div>
                      <p className="text-zinc-300 font-medium mb-1">How long until my food is ready?</p>
                      <p>Most orders are ready in 20 minutes. The AI will confirm your pickup time.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CTA card */}
            <div className="mt-4 rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-600/5 border border-orange-500/10 p-5 text-center">
              <p className="text-xs text-zinc-400 mb-3">Ready to order?</p>
              <a
                href={PHONE_LINK}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all w-full justify-center"
              >
                <Phone className="h-4 w-4" />
                {PHONE_NUMBER}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer — compact
// ---------------------------------------------------------------------------

function Footer() {
  return (
    <footer className="bg-[#050505] border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-wrap text-xs text-zinc-600">
            <span>&copy; 2026 Kabab House</span>
            <a href={PHONE_LINK} className="text-zinc-500 hover:text-white transition-colors">{PHONE_NUMBER}</a>
          </div>

          <div className="flex items-center gap-4 flex-wrap text-xs">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Orders", href: "/dashboard/orders" },
              { label: "POS", href: "/dashboard/pos" },
              { label: "Delivery", href: "/dashboard/delivery" },
              { label: "Menu Mgmt", href: "/dashboard/menu" },
              { label: "Settings", href: "/dashboard/settings" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
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
    <div className="min-h-screen bg-[#050505]">
      <Nav />
      <main>
        <Hero />
        <ContentSection />
      </main>
      <Footer />
    </div>
  );
}
