"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Monitor,
  UtensilsCrossed,
  Settings,
  Menu,
  X,
  Presentation,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Delivery", href: "/dashboard/delivery", icon: Truck },
  { label: "POS", href: "/dashboard/pos", icon: Monitor },
  { label: "Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Pitch", href: "/pitch", icon: Presentation },
];

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="border-b border-white/[0.06] px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <Flame className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              Kabab House
            </h1>
            <p className="text-[10px] text-zinc-600">Voice Ordering Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-orange-600/10 text-orange-400 border-l-2 border-orange-500"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-6 py-4">
        <p className="text-[11px] text-zinc-700">
          Kabab House &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#060606]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-white/[0.06] bg-[#0a0a0a] lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileNav && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNav(false)}
          />
          <aside className="relative w-60 h-full bg-[#0a0a0a] border-r border-white/[0.06]">
            <SidebarContent pathname={pathname} />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="flex h-12 items-center border-b border-white/[0.06] bg-[#0a0a0a] px-4 lg:hidden">
          <button
            onClick={() => setMobileNav(true)}
            className="p-1 text-zinc-500 hover:text-white"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Flame className="h-3 w-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">Kabab House</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
