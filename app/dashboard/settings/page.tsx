"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { BusinessSettings } from "@/lib/types";

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Holiday form state
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayMessage, setNewHolidayMessage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/dashboard/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();
        setSettings(data);
      } catch {
        alert("Failed to load settings. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSave() {
    if (!settings) return;
    try {
      setSaving(true);
      const res = await fetch("/api/dashboard/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      alert("Settings saved successfully!");
    } catch {
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function updateHours(
    day: string,
    field: "open" | "close" | "closed",
    value: string | boolean
  ) {
    if (!settings) return;
    setSettings({
      ...settings,
      regular_hours: {
        ...settings.regular_hours,
        [day]: {
          ...settings.regular_hours[day],
          [field]: value,
        },
      },
    });
  }

  function addHoliday() {
    if (!settings || !newHolidayDate) return;
    setSettings({
      ...settings,
      holiday_closures: [
        ...settings.holiday_closures,
        {
          date: newHolidayDate,
          message: newHolidayMessage || `Closed on ${newHolidayDate}`,
        },
      ],
    });
    setNewHolidayDate("");
    setNewHolidayMessage("");
  }

  function removeHoliday(index: number) {
    if (!settings) return;
    setSettings({
      ...settings,
      holiday_closures: settings.holiday_closures.filter((_, i) => i !== index),
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-destructive">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      {/* Card 1: Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Your restaurant details as configured in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={settings.business_name} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={settings.phone} readOnly />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={settings.address} readOnly />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Business Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Business Hours</CardTitle>
          <CardDescription>
            Set your opening and closing times for each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 pr-4 font-medium">Day</th>
                  <th className="pb-2 pr-4 font-medium">Open</th>
                  <th className="pb-2 pr-4 font-medium">Close</th>
                  <th className="pb-2 font-medium">Closed</th>
                </tr>
              </thead>
              <tbody>
                {DAY_ORDER.map((day) => {
                  const hours = settings.regular_hours[day];
                  return (
                    <tr key={day} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">
                        {DAY_LABELS[day]}
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="time"
                          value={hours?.open ?? "11:00"}
                          disabled={hours?.closed}
                          className="w-32"
                          onChange={(e) =>
                            updateHours(day, "open", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3 pr-4">
                        <Input
                          type="time"
                          value={hours?.close ?? "21:00"}
                          disabled={hours?.closed}
                          className="w-32"
                          onChange={(e) =>
                            updateHours(day, "close", e.target.value)
                          }
                        />
                      </td>
                      <td className="py-3">
                        <Switch
                          checked={hours?.closed ?? false}
                          onCheckedChange={(checked) =>
                            updateHours(day, "closed", checked)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Holiday Closures */}
      <Card>
        <CardHeader>
          <CardTitle>Holiday Closures</CardTitle>
          <CardDescription>
            Manage dates when the restaurant will be closed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings.holiday_closures.length > 0 ? (
            <ul className="space-y-2">
              {settings.holiday_closures.map((holiday, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{holiday.date}</p>
                    <p className="text-xs text-muted-foreground">
                      {holiday.message}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeHoliday(idx)}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No holiday closures configured.
            </p>
          )}

          <Separator />

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label htmlFor="holiday-date">Date</Label>
              <Input
                id="holiday-date"
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="w-44"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="holiday-message">Message</Label>
              <Input
                id="holiday-message"
                type="text"
                placeholder="e.g., Closed for New Year's Day"
                value={newHolidayMessage}
                onChange={(e) => setNewHolidayMessage(e.target.value)}
              />
            </div>
            <Button
              onClick={addHoliday}
              disabled={!newHolidayDate}
              variant="outline"
            >
              Add Holiday
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Temporary Closure */}
      <Card>
        <CardHeader>
          <CardTitle>Temporary Closure</CardTitle>
          <CardDescription>
            Toggle this on to temporarily close the restaurant.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Switch
              id="temp-closed"
              checked={settings.temporary_closure.active}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  temporary_closure: {
                    ...settings.temporary_closure,
                    active: checked,
                  },
                })
              }
            />
            <Label htmlFor="temp-closed" className="font-medium">
              Temporarily Closed
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="closure-message">Closure Message</Label>
            <Input
              id="closure-message"
              type="text"
              placeholder="e.g., We are temporarily closed for maintenance"
              value={settings.temporary_closure.message}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  temporary_closure: {
                    ...settings.temporary_closure,
                    message: e.target.value,
                  },
                })
              }
            />
          </div>

          <p className="text-sm text-amber-600">
            When active, the AI agent will inform callers that you are
            temporarily closed.
          </p>
        </CardContent>
      </Card>

      {/* Card 5: Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Settings</CardTitle>
          <CardDescription>
            Configure delivery options via Uber Direct integration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enable Delivery</Label>
              <p className="text-xs text-muted-foreground">
                Allow customers to order delivery via Uber Direct.
              </p>
            </div>
            <Switch
              checked={settings.delivery?.enabled ?? true}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  delivery: {
                    ...(settings.delivery ?? {
                      enabled: true,
                      delivery_fee: 6.99,
                      delivery_radius_miles: 5,
                      min_order_amount: 15,
                      estimated_delivery_time: "35-45 minutes",
                    }),
                    enabled: checked,
                  },
                })
              }
            />
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery-fee">Delivery Fee ($)</Label>
              <Input
                id="delivery-fee"
                type="number"
                min={0}
                step={0.01}
                value={settings.delivery?.delivery_fee ?? 6.99}
                disabled={!settings.delivery?.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: {
                      ...settings.delivery!,
                      delivery_fee: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery-radius">Delivery Radius (miles)</Label>
              <Input
                id="delivery-radius"
                type="number"
                min={1}
                max={25}
                value={settings.delivery?.delivery_radius_miles ?? 5}
                disabled={!settings.delivery?.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: {
                      ...settings.delivery!,
                      delivery_radius_miles: parseInt(e.target.value, 10) || 5,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min-order">Minimum Order Amount ($)</Label>
              <Input
                id="min-order"
                type="number"
                min={0}
                step={0.01}
                value={settings.delivery?.min_order_amount ?? 15}
                disabled={!settings.delivery?.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: {
                      ...settings.delivery!,
                      min_order_amount: parseFloat(e.target.value) || 0,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="est-delivery-time">Estimated Delivery Time</Label>
              <Input
                id="est-delivery-time"
                type="text"
                placeholder="e.g., 35-45 minutes"
                value={settings.delivery?.estimated_delivery_time ?? "35-45 minutes"}
                disabled={!settings.delivery?.enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery: {
                      ...settings.delivery!,
                      estimated_delivery_time: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          {settings.delivery?.enabled && (
            <p className="text-sm text-emerald-600">
              Delivery is active. Orders dispatched via Uber Direct (mock integration).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Card 6: Order Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Order Settings</CardTitle>
          <CardDescription>
            Configure default order preparation and staff transfer settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prep-time">Default Prep Time (minutes)</Label>
              <Input
                id="prep-time"
                type="number"
                min={1}
                max={120}
                value={settings.default_prep_time}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    default_prep_time: parseInt(e.target.value, 10) || 25,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-phone">
                Staff Transfer Phone Number
              </Label>
              <Input
                id="transfer-phone"
                type="tel"
                value={settings.staff_transfer_number}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    staff_transfer_number: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 6: Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Control how you receive notifications about orders and inquiries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">SMS Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive text messages for new orders and updates.
              </p>
            </div>
            <Switch
              checked={settings.sms_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, sms_enabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Receive email notifications for orders and catering inquiries.
              </p>
            </div>
            <Switch
              checked={settings.email_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, email_enabled: checked })
              }
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="catering-email">Catering Alert Email</Label>
            <Input
              id="catering-email"
              type="email"
              placeholder="e.g., catering@kabobhouse.com"
              value={settings.catering_alert_email ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  catering_alert_email: e.target.value || undefined,
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end pb-6">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
