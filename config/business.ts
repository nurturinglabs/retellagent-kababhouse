import { BusinessSettings } from '@/lib/types';

export const BUSINESS_CONFIG: BusinessSettings = {
  business_name: 'Kabab House',
  phone: '+1(262)384-6288',
  address: '214 E Ryan Rd, Oak Creek, WI 53154',
  regular_hours: {
    monday: { open: '11:00', close: '21:00', closed: false },
    tuesday: { open: '11:00', close: '21:00', closed: false },
    wednesday: { open: '11:00', close: '21:00', closed: false },
    thursday: { open: '11:00', close: '21:00', closed: false },
    friday: { open: '11:00', close: '21:00', closed: false },
    saturday: { open: '11:00', close: '21:00', closed: false },
    sunday: { open: '12:00', close: '20:00', closed: false },
  },
  holiday_closures: [
    { date: '2026-12-25', message: 'Closed for Christmas Day. We reopen December 26th.' },
    { date: '2026-11-26', message: 'Closed for Thanksgiving Day.' },
    { date: '2026-07-04', message: 'Closed for Independence Day.' },
  ],
  temporary_closure: { active: false, message: '' },
  default_prep_time: 25,
  staff_transfer_number: '+1(262)384-6288',
  catering_alert_email: undefined,
  sms_enabled: true,
  email_enabled: true,
  delivery: {
    enabled: true,
    delivery_fee: 6.99,
    delivery_radius_miles: 5,
    min_order_amount: 15.00,
    estimated_delivery_time: "35-45 minutes",
  },
};

/**
 * Check if the restaurant is currently open, taking into account
 * regular hours, holiday closures, and temporary closures.
 */
export function isCurrentlyOpen(): { open: boolean; message: string } {
  // Check temporary closure first
  if (BUSINESS_CONFIG.temporary_closure.active) {
    return {
      open: false,
      message: BUSINESS_CONFIG.temporary_closure.message || 'We are temporarily closed.',
    };
  }

  const now = new Date();

  // Check holiday closures
  const todayISO = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const holidayClosure = BUSINESS_CONFIG.holiday_closures.find((h) => h.date === todayISO);
  if (holidayClosure) {
    return { open: false, message: holidayClosure.message };
  }

  // Check regular hours
  const todayHours = getTodayHours();
  if (!todayHours || todayHours.closed) {
    return { open: false, message: 'We are closed today.' };
  }

  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (currentTime >= todayHours.open && currentTime < todayHours.close) {
    return {
      open: true,
      message: `We are open until ${formatTime(todayHours.close)} today.`,
    };
  }

  if (currentTime < todayHours.open) {
    return {
      open: false,
      message: `We open at ${formatTime(todayHours.open)} today.`,
    };
  }

  return {
    open: false,
    message: `We are closed for today. We closed at ${formatTime(todayHours.close)}.`,
  };
}

/**
 * Get the opening and closing hours for today.
 */
export function getTodayHours(): { open: string; close: string; closed: boolean } | null {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const hours = BUSINESS_CONFIG.regular_hours[today];
  return hours || null;
}

/**
 * Format the full weekly business hours for display or reading aloud.
 */
export function formatBusinessHours(): string {
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };

  const lines: string[] = [];

  // Group consecutive days with the same hours
  let groupStart = dayOrder[0];
  let groupEnd = dayOrder[0];
  let groupHours = BUSINESS_CONFIG.regular_hours[dayOrder[0]];

  for (let i = 1; i < dayOrder.length; i++) {
    const day = dayOrder[i];
    const hours = BUSINESS_CONFIG.regular_hours[day];

    if (
      hours &&
      groupHours &&
      hours.open === groupHours.open &&
      hours.close === groupHours.close &&
      hours.closed === groupHours.closed
    ) {
      groupEnd = day;
    } else {
      lines.push(formatHoursLine(groupStart, groupEnd, groupHours, dayLabels));
      groupStart = day;
      groupEnd = day;
      groupHours = hours;
    }
  }

  // Push the last group
  lines.push(formatHoursLine(groupStart, groupEnd, groupHours, dayLabels));

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Format a single line of hours for a range of days.
 */
function formatHoursLine(
  startDay: string,
  endDay: string,
  hours: { open: string; close: string; closed: boolean } | undefined,
  labels: Record<string, string>
): string {
  const range =
    startDay === endDay ? labels[startDay] : `${labels[startDay]} - ${labels[endDay]}`;

  if (!hours || hours.closed) {
    return `${range}: Closed`;
  }

  return `${range}: ${formatTime(hours.open)} - ${formatTime(hours.close)}`;
}

/**
 * Convert 24-hour time string (e.g. "21:00") to 12-hour display (e.g. "9:00 PM").
 */
function formatTime(time24: string): string {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}
