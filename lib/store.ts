import { Order, Customer, CallLog, CateringLead } from "@/lib/types";

// ---------------------------------------------------------------------------
// In-memory data stores
// ---------------------------------------------------------------------------

const orders: Order[] = [];
const customers: Customer[] = [];
const callLogs: CallLog[] = [];
const cateringLeads: CateringLead[] = [];

// Order numbering – resets the sequence portion (XXX) each day
let orderCounter = 0;
let lastOrderDate = "";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ---------------------------------------------------------------------------
// Order functions
// ---------------------------------------------------------------------------

export function generateOrderId(): string {
  const dateStr = todayStr();

  if (dateStr !== lastOrderDate) {
    orderCounter = 0;
    lastOrderDate = dateStr;
  }

  orderCounter++;
  const seq = String(orderCounter).padStart(3, "0");
  return `ORD-${dateStr}-${seq}`;
}

export function addOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at">
): Order {
  const now = new Date();
  const newOrder: Order = {
    ...order,
    id: generateOrderId(),
    created_at: now,
    updated_at: now,
  };

  orders.push(newOrder);

  // Update the associated customer record if we can locate one by phone
  if (newOrder.customer_phone) {
    const customer = getCustomerByPhone(newOrder.customer_phone);
    if (customer) {
      customer.last_order_date = now;
      customer.total_orders = (customer.total_orders || 0) + 1;
      customer.total_spent =
        (customer.total_spent || 0) + (newOrder.order_total || 0);
      console.log(
        `[store] Updated customer ${customer.phone} after new order ${newOrder.id}`
      );
    }
  }

  console.log(`[store] Added order ${newOrder.id}`, newOrder);
  return newOrder;
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function getAllOrders(): Order[] {
  return [...orders].sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime()
  );
}

export function getOrdersByStatus(status: string): Order[] {
  return orders.filter((o) => o.order_status === status);
}

export function getOrdersByDate(date: Date): Order[] {
  return orders.filter((o) => isSameDay(o.created_at, date));
}

export function updateOrderStatus(
  id: string,
  status: string
): Order | undefined {
  const order = orders.find((o) => o.id === id);
  if (!order) return undefined;

  order.order_status = status as Order["order_status"];
  order.updated_at = new Date();

  console.log(`[store] Updated order ${id} status -> ${status}`);
  return order;
}

export function getOrdersByCustomerPhone(phone: string): Order[] {
  return orders.filter((o) => o.customer_phone === phone);
}

export function getTodayOrders(): Order[] {
  const now = new Date();
  return orders.filter((o) => isSameDay(o.created_at, now));
}

export function getTodayRevenue(): number {
  return getTodayOrders().reduce((sum, o) => sum + (o.order_total || 0), 0);
}

export function getAverageOrderValue(): number {
  const todayOrd = getTodayOrders();
  if (todayOrd.length === 0) return 0;
  const total = todayOrd.reduce((sum, o) => sum + (o.order_total || 0), 0);
  return total / todayOrd.length;
}

// ---------------------------------------------------------------------------
// Customer functions
// ---------------------------------------------------------------------------

export function addCustomer(
  customer: Omit<
    Customer,
    "id" | "first_order_date" | "last_order_date" | "total_orders" | "total_spent"
  >
): Customer {
  const now = new Date();
  const newCustomer: Customer = {
    ...customer,
    id: crypto.randomUUID(),
    first_order_date: now,
    last_order_date: now,
    total_orders: 0,
    total_spent: 0,
  };

  customers.push(newCustomer);
  console.log(
    `[store] Added customer ${newCustomer.id} (${newCustomer.phone})`,
    newCustomer
  );
  return newCustomer;
}

export function getCustomerByPhone(phone: string): Customer | undefined {
  return customers.find((c) => c.phone === phone);
}

export function updateCustomer(
  phone: string,
  updates: Partial<Customer>
): Customer | undefined {
  const customer = customers.find((c) => c.phone === phone);
  if (!customer) return undefined;

  Object.assign(customer, updates);
  console.log(`[store] Updated customer ${phone}`, updates);
  return customer;
}

export function getAllCustomers(): Customer[] {
  return [...customers];
}

export function getOrCreateCustomer(phone: string, name: string): Customer {
  const existing = getCustomerByPhone(phone);
  if (existing) return existing;

  return addCustomer({
    phone,
    name,
    preferred_items: [],
  });
}

// ---------------------------------------------------------------------------
// Call Log functions
// ---------------------------------------------------------------------------

export function addCallLog(
  logEntry: Omit<CallLog, "id" | "created_at">
): CallLog {
  const newLog: CallLog = {
    ...logEntry,
    id: crypto.randomUUID(),
    created_at: new Date(),
  };

  callLogs.push(newLog);
  console.log(`[store] Added call log ${newLog.id}`, newLog);
  return newLog;
}

export function getCallLogs(): CallLog[] {
  return [...callLogs].sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime()
  );
}

export function getCallLogsByType(type: string): CallLog[] {
  return callLogs.filter((l) => l.call_type === type);
}

export function getTodayCallLogs(): CallLog[] {
  const now = new Date();
  return callLogs.filter((l) => isSameDay(l.created_at, now));
}

export function getCallStats(): {
  total: number;
  orders: number;
  inquiries: number;
  catering: number;
  transfers: number;
  other: number;
} {
  const todayLogs = getTodayCallLogs();
  return {
    total: todayLogs.length,
    orders: todayLogs.filter((l) => l.call_type === "order").length,
    inquiries: todayLogs.filter((l) => l.call_type === "inquiry").length,
    catering: todayLogs.filter((l) => l.call_type === "catering").length,
    transfers: todayLogs.filter((l) => l.call_type === "transfer").length,
    other: todayLogs.filter((l) => l.call_type === "other").length,
  };
}

// ---------------------------------------------------------------------------
// Catering Lead functions
// ---------------------------------------------------------------------------

export function addCateringLead(
  lead: Omit<CateringLead, "id" | "created_at" | "status">
): CateringLead {
  const newLead: CateringLead = {
    ...lead,
    id: crypto.randomUUID(),
    created_at: new Date(),
    status: "new",
  };

  cateringLeads.push(newLead);
  console.log(`[store] Added catering lead ${newLead.id}`, newLead);
  return newLead;
}

export function getCateringLeads(): CateringLead[] {
  return [...cateringLeads];
}

export function updateCateringLeadStatus(
  id: string,
  status: string,
  notes?: string
): CateringLead | undefined {
  const lead = cateringLeads.find((l) => l.id === id);
  if (!lead) return undefined;

  lead.status = status as CateringLead["status"];
  if (notes !== undefined) {
    lead.notes = notes;
  }

  console.log(`[store] Updated catering lead ${id} status -> ${status}`);
  return lead;
}
