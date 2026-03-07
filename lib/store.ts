import { Order, Customer, CallLog, CateringLead } from "@/lib/types";
import { kvGet, kvSet, kvIncr } from "@/lib/kv";

// ---------------------------------------------------------------------------
// KV key constants
// ---------------------------------------------------------------------------

const KEYS = {
  orders: "kh:orders",
  customers: "kh:customers",
  callLogs: "kh:call_logs",
  cateringLeads: "kh:catering_leads",
  orderCounter: "kh:order_counter",
  orderDate: "kh:order_date",
};

// ---------------------------------------------------------------------------
// Serialisation helpers  (Date ↔ string for JSON storage)
// ---------------------------------------------------------------------------

interface StoredOrder extends Omit<Order, "created_at" | "updated_at"> {
  created_at: string;
  updated_at: string;
}

interface StoredCustomer
  extends Omit<Customer, "first_order_date" | "last_order_date"> {
  first_order_date: string;
  last_order_date: string;
}

interface StoredCallLog extends Omit<CallLog, "created_at"> {
  created_at: string;
}

interface StoredCateringLead extends Omit<CateringLead, "created_at"> {
  created_at: string;
}

function hydrateOrder(s: StoredOrder): Order {
  return {
    ...s,
    created_at: new Date(s.created_at),
    updated_at: new Date(s.updated_at),
  };
}

function hydrateCustomer(s: StoredCustomer): Customer {
  return {
    ...s,
    first_order_date: new Date(s.first_order_date),
    last_order_date: new Date(s.last_order_date),
  };
}

function hydrateCallLog(s: StoredCallLog): CallLog {
  return { ...s, created_at: new Date(s.created_at) };
}

function hydrateCateringLead(s: StoredCateringLead): CateringLead {
  return { ...s, created_at: new Date(s.created_at) };
}

// ---------------------------------------------------------------------------
// Generic list helpers
// ---------------------------------------------------------------------------

async function getList<T>(key: string): Promise<T[]> {
  const data = await kvGet<T[]>(key);
  return data ?? [];
}

async function setList<T>(key: string, list: T[]): Promise<void> {
  await kvSet(key, list);
}

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

export async function generateOrderId(): Promise<string> {
  const dateStr = todayStr();
  const storedDate = await kvGet<string>(KEYS.orderDate);

  if (dateStr !== storedDate) {
    // New day — reset counter
    await kvSet(KEYS.orderCounter, 0);
    await kvSet(KEYS.orderDate, dateStr);
  }

  const seq = await kvIncr(KEYS.orderCounter);
  return `ORD-${dateStr}-${String(seq).padStart(3, "0")}`;
}

export async function addOrder(
  order: Omit<Order, "id" | "created_at" | "updated_at">
): Promise<Order> {
  const now = new Date();
  const newOrder: Order = {
    ...order,
    id: await generateOrderId(),
    created_at: now,
    updated_at: now,
  };

  const orders = await getList<StoredOrder>(KEYS.orders);
  orders.push(newOrder as unknown as StoredOrder);
  await setList(KEYS.orders, orders);

  // Update associated customer
  if (newOrder.customer_phone) {
    const customer = await getCustomerByPhone(newOrder.customer_phone);
    if (customer) {
      customer.last_order_date = now;
      customer.total_orders = (customer.total_orders || 0) + 1;
      customer.total_spent =
        (customer.total_spent || 0) + (newOrder.order_total || 0);
      await updateCustomer(customer.phone, customer);
      console.log(
        `[store] Updated customer ${customer.phone} after new order ${newOrder.id}`
      );
    }
  }

  console.log(`[store] Added order ${newOrder.id}`);
  return newOrder;
}

export async function getOrder(id: string): Promise<Order | undefined> {
  const orders = await getList<StoredOrder>(KEYS.orders);
  const found = orders.find((o) => o.id === id);
  return found ? hydrateOrder(found) : undefined;
}

export async function getAllOrders(): Promise<Order[]> {
  const orders = await getList<StoredOrder>(KEYS.orders);
  return orders
    .map(hydrateOrder)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function getOrdersByStatus(status: string): Promise<Order[]> {
  const orders = await getList<StoredOrder>(KEYS.orders);
  return orders.map(hydrateOrder).filter((o) => o.order_status === status);
}

export async function getOrdersByDate(date: Date): Promise<Order[]> {
  const orders = await getList<StoredOrder>(KEYS.orders);
  return orders.map(hydrateOrder).filter((o) => isSameDay(o.created_at, date));
}

export async function updateOrderStatus(
  id: string,
  status: string
): Promise<Order | undefined> {
  return updateOrder(id, { order_status: status as Order["order_status"] });
}

export async function updateOrder(
  id: string,
  updates: Partial<Order>
): Promise<Order | undefined> {
  const orders = await getList<StoredOrder>(KEYS.orders);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return undefined;

  Object.assign(orders[idx], updates, {
    updated_at: new Date().toISOString(),
  });
  await setList(KEYS.orders, orders);

  console.log(`[store] Updated order ${id}`, Object.keys(updates));
  return hydrateOrder(orders[idx]);
}

export async function getOrdersByCustomerPhone(
  phone: string
): Promise<Order[]> {
  const orders = await getList<StoredOrder>(KEYS.orders);
  return orders.map(hydrateOrder).filter((o) => o.customer_phone === phone);
}

export async function getTodayOrders(): Promise<Order[]> {
  const now = new Date();
  const orders = await getList<StoredOrder>(KEYS.orders);
  return orders.map(hydrateOrder).filter((o) => isSameDay(o.created_at, now));
}

export async function getTodayRevenue(): Promise<number> {
  const todayOrd = await getTodayOrders();
  return todayOrd.reduce((sum, o) => sum + (o.order_total || 0), 0);
}

export async function getAverageOrderValue(): Promise<number> {
  const todayOrd = await getTodayOrders();
  if (todayOrd.length === 0) return 0;
  const total = todayOrd.reduce((sum, o) => sum + (o.order_total || 0), 0);
  return total / todayOrd.length;
}

// ---------------------------------------------------------------------------
// Customer functions
// ---------------------------------------------------------------------------

export async function addCustomer(
  customer: Omit<
    Customer,
    "id" | "first_order_date" | "last_order_date" | "total_orders" | "total_spent"
  >
): Promise<Customer> {
  const now = new Date();
  const newCustomer: Customer = {
    ...customer,
    id: crypto.randomUUID(),
    first_order_date: now,
    last_order_date: now,
    total_orders: 0,
    total_spent: 0,
  };

  const customers = await getList<StoredCustomer>(KEYS.customers);
  customers.push(newCustomer as unknown as StoredCustomer);
  await setList(KEYS.customers, customers);

  console.log(`[store] Added customer ${newCustomer.id} (${newCustomer.phone})`);
  return newCustomer;
}

export async function getCustomerByPhone(
  phone: string
): Promise<Customer | undefined> {
  const customers = await getList<StoredCustomer>(KEYS.customers);
  const found = customers.find((c) => c.phone === phone);
  return found ? hydrateCustomer(found) : undefined;
}

export async function updateCustomer(
  phone: string,
  updates: Partial<Customer>
): Promise<Customer | undefined> {
  const customers = await getList<StoredCustomer>(KEYS.customers);
  const idx = customers.findIndex((c) => c.phone === phone);
  if (idx === -1) return undefined;

  Object.assign(customers[idx], updates);
  await setList(KEYS.customers, customers);

  console.log(`[store] Updated customer ${phone}`);
  return hydrateCustomer(customers[idx]);
}

export async function getAllCustomers(): Promise<Customer[]> {
  const customers = await getList<StoredCustomer>(KEYS.customers);
  return customers.map(hydrateCustomer);
}

export async function getOrCreateCustomer(
  phone: string,
  name: string
): Promise<Customer> {
  const existing = await getCustomerByPhone(phone);
  if (existing) return existing;

  return addCustomer({ phone, name, preferred_items: [] });
}

// ---------------------------------------------------------------------------
// Call Log functions
// ---------------------------------------------------------------------------

export async function addCallLog(
  logEntry: Omit<CallLog, "id" | "created_at">
): Promise<CallLog> {
  const newLog: CallLog = {
    ...logEntry,
    id: crypto.randomUUID(),
    created_at: new Date(),
  };

  const logs = await getList<StoredCallLog>(KEYS.callLogs);
  logs.push(newLog as unknown as StoredCallLog);
  await setList(KEYS.callLogs, logs);

  console.log(`[store] Added call log ${newLog.id}`);
  return newLog;
}

export async function getCallLogs(): Promise<CallLog[]> {
  const logs = await getList<StoredCallLog>(KEYS.callLogs);
  return logs
    .map(hydrateCallLog)
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
}

export async function getCallLogsByType(type: string): Promise<CallLog[]> {
  const logs = await getList<StoredCallLog>(KEYS.callLogs);
  return logs.map(hydrateCallLog).filter((l) => l.call_type === type);
}

export async function getTodayCallLogs(): Promise<CallLog[]> {
  const now = new Date();
  const logs = await getList<StoredCallLog>(KEYS.callLogs);
  return logs.map(hydrateCallLog).filter((l) => isSameDay(l.created_at, now));
}

export async function getCallStats(): Promise<{
  total: number;
  orders: number;
  inquiries: number;
  catering: number;
  transfers: number;
  other: number;
}> {
  const todayLogs = await getTodayCallLogs();
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

export async function addCateringLead(
  lead: Omit<CateringLead, "id" | "created_at" | "status">
): Promise<CateringLead> {
  const newLead: CateringLead = {
    ...lead,
    id: crypto.randomUUID(),
    created_at: new Date(),
    status: "new",
  };

  const leads = await getList<StoredCateringLead>(KEYS.cateringLeads);
  leads.push(newLead as unknown as StoredCateringLead);
  await setList(KEYS.cateringLeads, leads);

  console.log(`[store] Added catering lead ${newLead.id}`);
  return newLead;
}

export async function getCateringLeads(): Promise<CateringLead[]> {
  const leads = await getList<StoredCateringLead>(KEYS.cateringLeads);
  return leads.map(hydrateCateringLead);
}

export async function updateCateringLeadStatus(
  id: string,
  status: string,
  notes?: string
): Promise<CateringLead | undefined> {
  const leads = await getList<StoredCateringLead>(KEYS.cateringLeads);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return undefined;

  leads[idx].status = status as CateringLead["status"];
  if (notes !== undefined) {
    leads[idx].notes = notes;
  }
  await setList(KEYS.cateringLeads, leads);

  console.log(`[store] Updated catering lead ${id} status -> ${status}`);
  return hydrateCateringLead(leads[idx]);
}
