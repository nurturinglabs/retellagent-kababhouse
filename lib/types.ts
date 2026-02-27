// Kabab House Voice Ordering System - TypeScript Interfaces

export interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  customizations: Record<string, string>;
  subtotal: number;
}

export interface Order {
  id: string;
  clover_order_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: "pickup" | "delivery";
  order_items: OrderItem[];
  special_requests: string;
  order_total: number;
  order_status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "completed"
    | "cancelled";
  pickup_time?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_zip?: string;
  delivery_fee?: number;
  delivery_status?:
    | "awaiting_dispatch"
    | "dispatched"
    | "in_transit"
    | "delivered";
  estimated_delivery_time?: string;
  uber_direct_id?: string;
  created_at: Date;
  updated_at: Date;
  call_id?: string;
  transcript?: string;
  sentiment?: string;
  call_duration_seconds?: number;
  notes_from_agent?: string;
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  total_orders: number;
  total_spent: number;
  first_order_date: Date;
  last_order_date: Date;
  preferred_items: string[];
  dietary_restrictions?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "plates" | "sandwiches" | "appetizers" | "desserts";
  customizations: string[];
  dietary: string[];
  available: boolean;
}

export interface RetellWebhookPayload {
  event: string;
  call: {
    call_id: string;
    agent_id: string;
    call_status: string;
    start_timestamp: number;
    end_timestamp: number;
    transcript: string;
    call_analysis?: {
      user_sentiment: string;
      call_summary: string;
      custom_analysis_data: any;
    };
    metadata?: Record<string, any>;
  };
  data?: any;
}

export interface CloverOrder {
  id?: string;
  currency: string;
  employee?: {
    id: string;
  };
  state?: string;
  total?: number;
  title?: string;
  note?: string;
  orderType?: {
    id: string;
  };
}

export interface CloverLineItem {
  name: string;
  price: number;
  unitQty?: number;
  note?: string;
}

export interface CallLog {
  id: string;
  call_id: string;
  call_type: "order" | "inquiry" | "catering" | "transfer" | "other";
  caller_phone?: string;
  duration_seconds: number;
  sentiment?: string;
  summary?: string;
  inquiry_topic?: string;
  created_at: Date;
  transcript?: string;
}

export interface CateringLead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  event_date: string;
  guest_count: number;
  preferences?: string;
  status: "new" | "contacted" | "quoted" | "confirmed" | "declined";
  created_at: Date;
  notes?: string;
}

export interface DeliverySettings {
  enabled: boolean;
  delivery_fee: number;
  delivery_radius_miles: number;
  min_order_amount: number;
  estimated_delivery_time: string;
}

export interface BusinessSettings {
  business_name: string;
  phone: string;
  address: string;
  regular_hours: Record<
    string,
    { open: string; close: string; closed: boolean }
  >;
  holiday_closures: { date: string; message: string }[];
  temporary_closure: { active: boolean; message: string };
  default_prep_time: number;
  staff_transfer_number: string;
  catering_alert_email?: string;
  sms_enabled: boolean;
  email_enabled: boolean;
  delivery: DeliverySettings;
}

export interface DashboardStats {
  total_orders_today: number;
  revenue_today: number;
  avg_order_value: number;
  peak_order_hour: string;
  total_calls_today: number;
  inquiry_count: number;
  catering_leads: number;
  transfer_count: number;
}
