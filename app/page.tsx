"use client";

import { useState } from "react";
import {
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Truck,
  Menu,
  X,
  Flame,
} from "lucide-react";

const PHONE_NUMBER = "(262) 233-1917";
const PHONE_LINK = "tel:+12622331917";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const plates = [
  { name: "Beef Shawarma Plate", price: 24.99, tag: "Popular" },
  { name: "Chicken Shawarma Plate", price: 23.99 },
  { name: "Chicken Tawook Plate", price: 23.99, tag: "Popular" },
  { name: "Kafta Kabob Plate", price: 24.99 },
  { name: "Mix Grill Plate", price: 28.99, tag: "Best" },
  { name: "Lamb Chops Plate", price: 28.99 },
  { name: "Falafel Plate", price: 19.99, tag: "Veg" },
];

const wraps = [
  { name: "Beef Shawarma Wrap", price: 12.99 },
  { name: "Chicken Shawarma Wrap", price: 12.99 },
  { name: "Chicken Tawook Wrap", price: 12.99 },
  { name: "Kafta Kabob Wrap", price: 12.99 },
  { name: "Falafel Sandwich", price: 10.99, tag: "Veg" },
];

const sides = [
  { name: "Hummus", price: 5.99 },
  { name: "Baba Ghanoush", price: 6.99 },
  { name: "Fattoush Salad", price: 7.99 },
  { name: "Tabbouleh Salad", price: 7.99 },
  { name: "Garlic Sauce", price: 2.99 },
  { name: "French Fries", price: 4.99 },
  { name: "Rice Pilaf", price: 3.99 },
  { name: "Pita Bread", price: 2.99 },
  { name: "Grape Leaves", price: 6.99 },
  { name: "Fatayer", price: 3.99 },
  { name: "Baklava", price: 4.99 },
];

// ---------------------------------------------------------------------------
// Menu column
// ---------------------------------------------------------------------------

function MenuCol({
  title,
  items,
}: {
  title: string;
  items: { name: string; price: number; tag?: string }[];
}) {
  return (
    <div className="flex flex-col min-w-0">
      <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-orange-400/70 mb-2">
        {title}
      </h2>
      <div className="flex flex-col">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-baseline justify-between gap-2 py-[5px] border-b border-white/[0.03] last:border-0"
          >
            <span className="text-[13px] text-zinc-300 truncate leading-tight">
              {item.name}
              {item.tag && (
                <span className="ml-1.5 text-[9px] font-semibold tracking-wider uppercase text-orange-400/50">
                  {item.tag}
                </span>
              )}
            </span>
            <span className="text-[12px] text-zinc-500 tabular-nums shrink-0">
              {item.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#060606] overflow-hidden">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-white/[0.05]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Flame className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">
              Kabab House
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 ml-3 text-xs text-zinc-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-400" />
              </span>
              AI ordering live
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <div className="flex items-center gap-4 text-xs text-zinc-600">
              <a href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</a>
              <a href="/dashboard/orders" className="hover:text-zinc-300 transition-colors">Orders</a>
              <a href="/dashboard/pos" className="hover:text-zinc-300 transition-colors">POS</a>
              <a href="/dashboard/delivery" className="hover:text-zinc-300 transition-colors">Delivery</a>
              <a href="/dashboard/menu" className="hover:text-zinc-300 transition-colors">Menu Mgmt</a>
              <a href="/dashboard/settings" className="hover:text-zinc-300 transition-colors">Settings</a>
            </div>
            <div className="w-px h-5 bg-white/[0.06]" />
            <a
              href={PHONE_LINK}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium pl-3.5 pr-4 py-1.5 rounded-lg transition-all"
            >
              <Phone className="h-3 w-3" />
              {PHONE_NUMBER}
            </a>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-3">
            <a
              href={PHONE_LINK}
              className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg"
            >
              <Phone className="h-3 w-3" />
              Call
            </a>
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="p-1 text-zinc-500 hover:text-white"
              aria-label="Menu"
            >
              {mobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNav && (
          <div className="md:hidden border-t border-white/[0.04] px-4 py-3 flex flex-wrap gap-3 text-[11px]">
            {[
              { l: "Dashboard", h: "/dashboard" },
              { l: "Orders", h: "/dashboard/orders" },
              { l: "POS", h: "/dashboard/pos" },
              { l: "Delivery", h: "/dashboard/delivery" },
              { l: "Menu Mgmt", h: "/dashboard/menu" },
              { l: "Settings", h: "/dashboard/settings" },
            ].map((lk) => (
              <a key={lk.l} href={lk.h} className="text-zinc-500 hover:text-white transition-colors">{lk.l}</a>
            ))}
          </div>
        )}
      </header>

      {/* ── Main: two-panel split ───────────────────────────────────────── */}
      <main className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden">

        {/* ── LEFT PANEL: Restaurant Story & CTA ──────────────────────── */}
        <div className="lg:w-[45%] xl:w-[42%] shrink-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-8 lg:py-0 border-b lg:border-b-0 lg:border-r border-white/[0.05]">
          {/* Tagline */}
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-orange-400/60 mb-4">
            Authentic Middle Eastern Cuisine
          </p>

          {/* Restaurant name */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] xl:text-[3.5rem] font-bold text-white tracking-tight leading-[1.1] mb-3">
            Kabab<br />House
          </h1>

          {/* About */}
          <p className="text-sm sm:text-[15px] text-zinc-400 leading-relaxed max-w-md mb-6">
            Family-owned restaurant in Oak Creek, WI. Serving the finest shawarma, kabobs, and Middle Eastern classics — made fresh daily.
          </p>

          {/* Halal badge */}
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-4 w-4 text-orange-400/70" />
            <span className="text-xs font-medium text-zinc-300 tracking-wide">
              100% Zabiha Halal Certified
            </span>
          </div>

          {/* Call to order CTA */}
          <a
            href={PHONE_LINK}
            className="group inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-500 transition-all rounded-xl px-6 py-4 mb-6 w-fit shadow-lg shadow-orange-600/15"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/15 shrink-0">
              <Phone className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-lg font-semibold text-white tracking-tight">
                {PHONE_NUMBER}
              </div>
              <div className="text-[11px] text-orange-200/70 uppercase tracking-wider">
                Call to order — AI answers 24/7
              </div>
            </div>
          </a>

          {/* Info row */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[12px] text-zinc-500 mb-5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-zinc-600" />
              <span>Mon-Sat 11a-9p <span className="text-zinc-700">/</span> Sun 12p-8p</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-zinc-600" />
              <span>214 E Ryan Rd, Oak Creek, WI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-zinc-600" />
              <span>Delivery available</span>
            </div>
          </div>

          {/* How it works */}
          <div className="border-t border-white/[0.04] pt-4">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-600 mb-2.5">
              How it works
            </p>
            <div className="flex gap-6 text-[12px] text-zinc-500">
              <div className="flex gap-1.5 items-baseline">
                <span className="text-orange-400/50 font-semibold text-[11px]">1</span>
                <span>Call anytime</span>
              </div>
              <div className="flex gap-1.5 items-baseline">
                <span className="text-orange-400/50 font-semibold text-[11px]">2</span>
                <span>Order by voice</span>
              </div>
              <div className="flex gap-1.5 items-baseline">
                <span className="text-orange-400/50 font-semibold text-[11px]">3</span>
                <span>Pick up in ~20 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Menu ───────────────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-12 xl:px-16 py-8 lg:py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 xl:gap-x-10 gap-y-6">
            {/* Col 1: Plates */}
            <MenuCol title="Plates" items={plates} />

            {/* Col 2: Wraps */}
            <MenuCol title="Sandwiches & Wraps" items={wraps} />

            {/* Col 3: Sides & Desserts */}
            <MenuCol title="Sides & Desserts" items={sides} />
          </div>
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-white/[0.04] px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto h-9 flex items-center justify-between text-[11px] text-zinc-700">
          <span>&copy; 2026 Kabab House</span>
          <span>Authentic Middle Eastern Cuisine — Oak Creek, WI</span>
        </div>
      </footer>
    </div>
  );
}
