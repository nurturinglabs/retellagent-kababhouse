"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "plates" | "sandwiches" | "appetizers" | "desserts";
  customizations: string[];
  dietary: string[];
  available: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { value: "plates", label: "Plates" },
  { value: "sandwiches", label: "Sandwiches" },
  { value: "appetizers", label: "Appetizers" },
  { value: "desserts", label: "Desserts" },
] as const;

const DIETARY_BADGE_STYLES: Record<string, string> = {
  halal: "bg-green-500/10 text-green-400 border-green-500/20",
  vegetarian: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  vegan: "bg-lime-500/10 text-lime-400 border-lime-500/20",
};

const DIETARY_LABELS: Record<string, string> = {
  halal: "Halal",
  vegetarian: "Vegetarian",
  vegan: "Vegan",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Fetch menu items on mount
  useEffect(() => {
    async function fetchMenu() {
      try {
        const res = await fetch("/api/dashboard/menu");
        if (!res.ok) throw new Error("Failed to fetch menu");
        const json = await res.json();
        setItems(json.items || []);
      } catch (err) {
        console.error("Error loading menu:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  // Toggle item availability via PATCH
  const handleToggle = useCallback(
    async (itemId: string, newAvailable: boolean) => {
      // Optimistic update
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, available: newAvailable } : item
        )
      );
      setTogglingIds((prev) => new Set(prev).add(itemId));

      try {
        const res = await fetch("/api/dashboard/menu", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemId, available: newAvailable }),
        });
        const json = await res.json();

        if (!json.success) {
          // Revert on failure
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, available: !newAvailable }
                : item
            )
          );
        }
      } catch {
        // Revert on error
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? { ...item, available: !newAvailable }
              : item
          )
        );
      } finally {
        setTogglingIds((prev) => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    },
    []
  );

  // Group items by category
  const itemsByCategory = CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.value] = items.filter((item) => item.category === cat.value);
      return acc;
    },
    {} as Record<string, MenuItem[]>
  );

  // Format price
  const fmtPrice = (price: number) =>
    price.toLocaleString("en-US", { style: "currency", currency: "USD" });

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-sm text-zinc-500">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Menu Management
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage menu item availability. Toggle items on or off for voice
          ordering.
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="plates" className="w-full">
        <TabsList className="mb-4 w-full justify-start bg-white/[0.03] border border-white/[0.06]">
          {CATEGORIES.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="text-zinc-400 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
            >
              {cat.label}
              <span className="ml-1.5 text-xs opacity-70">
                ({itemsByCategory[cat.value]?.length || 0})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value}>
            {(itemsByCategory[cat.value]?.length || 0) === 0 ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-white/[0.06] bg-white/[0.02]">
                <p className="text-sm text-zinc-500">
                  No items in this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {itemsByCategory[cat.value].map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all duration-200 ${
                      item.available
                        ? "border-white/[0.06] bg-white/[0.02]"
                        : "border-white/[0.04] bg-white/[0.01] opacity-70"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <CardTitle
                            className={`text-base ${
                              item.available
                                ? "text-white"
                                : "text-zinc-600"
                            }`}
                          >
                            {item.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-lg font-semibold text-orange-400">
                            {fmtPrice(item.price)}
                          </CardDescription>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`text-xs font-medium ${
                              item.available
                                ? "text-green-400"
                                : "text-zinc-600"
                            }`}
                          >
                            {item.available ? "Available" : "Unavailable"}
                          </span>
                          <Switch
                            checked={item.available}
                            onCheckedChange={(checked) =>
                              handleToggle(item.id, checked)
                            }
                            disabled={togglingIds.has(item.id)}
                            className="data-[state=checked]:bg-orange-600"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Description - truncated to 2 lines */}
                      <p
                        className={`line-clamp-2 text-sm ${
                          item.available
                            ? "text-zinc-400"
                            : "text-zinc-600"
                        }`}
                      >
                        {item.description}
                      </p>

                      {/* Dietary Badges */}
                      {item.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.dietary.map((d) => (
                            <span
                              key={d}
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                                DIETARY_BADGE_STYLES[d] ||
                                "bg-white/[0.05] text-zinc-400 border-white/[0.08]"
                              }`}
                            >
                              {DIETARY_LABELS[d] || d}
                            </span>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
