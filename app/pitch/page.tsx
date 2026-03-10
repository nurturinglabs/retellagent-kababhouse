"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Phone,
  PhoneOff,
  Clock,
  Users,
  Bot,
  MessageSquare,
  ShieldCheck,
  Zap,
  ArrowRight,
  Smartphone,
  ChefHat,
  DollarSign,
  Flame,
} from "lucide-react";
import PitchSlide from "@/components/PitchSlide";
import SlideNavigation from "@/components/SlideNavigation";

const TOTAL_SLIDES = 5;

// Brand colors — darker burnt orange matching dashboard
const BRAND = "#c2571a";
const BRAND_LIGHT = "#e87d2f";

export default function PitchPage() {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback(
    (i: number) => {
      setCurrent(Math.max(0, Math.min(TOTAL_SLIDES - 1, i)));
    },
    []
  );
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
      if (e.key === "Escape") window.history.back();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // Touch / swipe navigation
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) next();
        else prev();
      }
    };
    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [next, prev]);

  return (
    <div className="bg-[#060606] text-white min-h-screen overflow-hidden selection:bg-orange-900/30">
      {/* ── Top bar (matches landing page) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.05] bg-[#060606]/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})` }}
            >
              <Flame className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">
              Kabab House
            </span>
          </a>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <a href="/" className="hover:text-zinc-300 transition-colors">
              Home
            </a>
            <a
              href="/dashboard"
              className="hover:text-zinc-300 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </div>
      </header>

      <SlideNavigation
        current={current}
        total={TOTAL_SLIDES}
        onPrev={prev}
        onNext={next}
        onGoTo={goTo}
      />

      {/* ── Slide 1: The Problem ── */}
      <PitchSlide active={current === 0}>
        <div className="text-center space-y-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: `${BRAND}15`, border: `1px solid ${BRAND}30`, color: BRAND_LIGHT }}
          >
            <Phone className="w-4 h-4" />
            The Problem
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            Your Phone Is Your
            <br />
            <span style={{ color: BRAND_LIGHT }}>Busiest Employee</span>
          </h1>

          <p className="text-xl md:text-2xl text-zinc-500 font-light">
            And it&apos;s dropping the ball.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto">
            {[
              {
                icon: <ChefHat className="w-8 h-8" />,
                text: "Staff pulled away from kitchen to answer calls",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                text: "Customers waiting on hold during peak hours",
              },
              {
                icon: <PhoneOff className="w-8 h-8" />,
                text: "Phone ringing with no one to pick up",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div style={{ color: `${BRAND_LIGHT}B3` }}>{item.icon}</div>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PitchSlide>

      {/* ── Slide 2: The Cost ── */}
      <PitchSlide active={current === 1}>
        <div className="text-center space-y-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: `${BRAND}15`, border: `1px solid ${BRAND}30`, color: BRAND_LIGHT }}
          >
            <DollarSign className="w-4 h-4" />
            The Cost
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Every Missed Call Is a
            <br />
            <span style={{ color: BRAND_LIGHT }}>Lost Customer</span>
          </h1>

          <div className="pt-4">
            <p
              className="text-8xl md:text-9xl font-black tracking-tight"
              style={{ color: BRAND }}
            >
              43%
            </p>
            <p className="text-xl text-zinc-500 mt-2">
              of restaurant calls go unanswered
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 max-w-3xl mx-auto">
            {[
              { stat: "30%", desc: "of customers won't call back" },
              {
                stat: "$2,000+",
                desc: "lost per month in missed phone orders",
              },
              {
                stat: "8\u201310",
                desc: "calls at the same time during peak hours",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.04]"
              >
                <p
                  className="text-3xl md:text-4xl font-bold"
                  style={{ color: BRAND_LIGHT }}
                >
                  {item.stat}
                </p>
                <p className="text-zinc-500 text-sm mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </PitchSlide>

      {/* ── Slide 3: The Solution ── */}
      <PitchSlide active={current === 2}>
        <div className="text-center space-y-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: `${BRAND}15`, border: `1px solid ${BRAND}30`, color: BRAND_LIGHT }}
          >
            <Bot className="w-4 h-4" />
            The Solution
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            An AI Voice Agent That
            <br />
            <span style={{ color: BRAND_LIGHT }}>Never Misses a Call</span>
          </h1>

          <p className="text-xl text-zinc-500 font-light">
            Answers every call. Takes orders. Handles questions. 24/7.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 max-w-3xl mx-auto">
            {[
              {
                icon: <Phone className="w-6 h-6" />,
                text: "Takes phone orders for pickup",
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                text: "Answers menu, allergen & halal questions",
              },
              {
                icon: <Users className="w-6 h-6" />,
                text: "Handles multiple calls at once",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                text: "Works 24/7 \u2014 even holidays",
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                text: "Sends order confirmations via SMS",
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                text: "Never calls in sick. Never puts anyone on hold.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] transition-colors"
                style={{ ["--hover-bg" as string]: `${BRAND}0A` }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${BRAND}0A`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "")}
              >
                <div style={{ color: `${BRAND_LIGHT}B3` }}>{item.icon}</div>
                <p className="text-zinc-500 text-xs md:text-sm leading-relaxed">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </PitchSlide>

      {/* ── Slide 4: How It Works ── */}
      <PitchSlide active={current === 3}>
        <div className="text-center space-y-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: `${BRAND}15`, border: `1px solid ${BRAND}30`, color: BRAND_LIGHT }}
          >
            <Zap className="w-4 h-4" />
            How It Works
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Simple. Seamless.{" "}
            <span style={{ color: BRAND_LIGHT }}>Instant.</span>
          </h1>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 pt-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] w-full md:w-72">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `${BRAND}1A` }}
              >
                <Phone className="w-8 h-8" style={{ color: BRAND_LIGHT }} />
              </div>
              <p className="text-lg font-semibold">Customer Calls</p>
              <p className="text-zinc-500 text-sm">
                &ldquo;I&apos;d like a beef shawarma plate&rdquo;
              </p>
            </div>

            <ArrowRight className="w-8 h-8 text-zinc-700 shrink-0 rotate-90 md:rotate-0 mx-4" />

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] w-full md:w-72">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `${BRAND}1A` }}
              >
                <Bot className="w-8 h-8" style={{ color: BRAND_LIGHT }} />
              </div>
              <p className="text-lg font-semibold">AI Takes the Order</p>
              <p className="text-zinc-500 text-sm">
                Confirms items, collects name & phone, handles customizations
              </p>
            </div>

            <ArrowRight className="w-8 h-8 text-zinc-700 shrink-0 rotate-90 md:rotate-0 mx-4" />

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.04] w-full md:w-72">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `${BRAND}1A` }}
              >
                <ChefHat className="w-8 h-8" style={{ color: BRAND_LIGHT }} />
              </div>
              <p className="text-lg font-semibold">Order in Your Kitchen</p>
              <p className="text-zinc-500 text-sm">
                Appears in your POS. Kitchen starts cooking. Customer gets a
                text.
              </p>
            </div>
          </div>

          <p className="text-zinc-600 text-sm pt-4">
            Zero manual entry. Zero errors. Zero missed orders.
          </p>
        </div>
      </PitchSlide>

      {/* ── Slide 5: What's Coming Next ── */}
      <PitchSlide active={current === 4}>
        <div className="text-center space-y-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{ background: `${BRAND}15`, border: `1px solid ${BRAND}30`, color: BRAND_LIGHT }}
          >
            <Zap className="w-4 h-4" />
            Coming Soon
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            Delivery Without the
            <br />
            <span style={{ color: BRAND_LIGHT }}>Commission</span>
          </h1>

          <p className="text-lg text-zinc-500 font-light max-w-2xl mx-auto">
            Customers order delivery through your phone line. We dispatch
            drivers from Uber and DoorDash — but you keep 100% of your food
            revenue. No marketplace. No 25% commission.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-2xl mx-auto">
            {/* Today */}
            <div className="p-8 rounded-2xl bg-white/[0.02] border border-zinc-800 space-y-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Today
              </p>
              <div className="space-y-3 text-left">
                {[
                  "Customer orders on DoorDash",
                  "You pay 25% commission",
                  "DoorDash owns the customer",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <DollarSign className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
                    <p className="text-zinc-500 text-sm">{line}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* With AI Voice Agent */}
            <div
              className="p-8 rounded-2xl space-y-4"
              style={{ background: `${BRAND}0A`, border: `1px solid ${BRAND}33` }}
            >
              <p
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: `${BRAND_LIGHT}B3` }}
              >
                With AI Voice Agent
              </p>
              <div className="space-y-3 text-left">
                {[
                  "Customer calls your number",
                  "You pay $0 commission",
                  "You own the customer",
                ].map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ShieldCheck
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: `${BRAND_LIGHT}99` }}
                    />
                    <p className="text-zinc-400 text-sm">{line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-zinc-700 text-xs pt-2">
            Same delivery drivers. Your revenue.
          </p>
        </div>
      </PitchSlide>

      {/* ── Footer ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.04] bg-[#060606]/80 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto h-9 flex items-center justify-between px-4 sm:px-6 lg:px-8 text-[11px] text-zinc-700">
          <span>&copy; 2026 Kabab House</span>
          <span>Authentic Middle Eastern Cuisine — Oak Creek, WI</span>
        </div>
      </footer>
    </div>
  );
}
