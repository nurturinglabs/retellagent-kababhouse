import axios from "axios";
import { kvGet, kvSet, kvIncr } from "@/lib/kv";

const CLOVER_API_BASE = "https://api.clover.com/v3";

// ---------------------------------------------------------------------------
// Mock Clover POS Store (used when real Clover credentials are not configured)
// ---------------------------------------------------------------------------

export interface MockCloverOrder {
  id: string;
  title: string;
  note?: string;
  state: string;
  createdTime: number;
  modifiedTime: number;
  lineItems: {
    id: string;
    name: string;
    price: number; // in cents
    unitQty: number;
    note?: string;
  }[];
}

const KV_CLOVER_ORDERS = "kh:clover_orders";
const KV_CLOVER_ORDER_CTR = "kh:clover_order_counter";
const KV_CLOVER_LI_CTR = "kh:clover_li_counter";

function isMockMode(): boolean {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  return (
    !merchantId ||
    !accessToken ||
    merchantId === "your_merchant_id_here" ||
    accessToken === "your_clover_access_token_here"
  );
}

async function getMockOrders(): Promise<MockCloverOrder[]> {
  const data = await kvGet<MockCloverOrder[]>(KV_CLOVER_ORDERS);
  return data ?? [];
}

async function saveMockOrders(orders: MockCloverOrder[]): Promise<void> {
  await kvSet(KV_CLOVER_ORDERS, orders);
}

/** Get all mock Clover orders (for the POS dashboard). */
export async function getMockCloverOrders(): Promise<MockCloverOrder[]> {
  const orders = await getMockOrders();
  return [...orders].reverse(); // newest first
}

/** Update a mock Clover order's state. */
export async function updateMockCloverOrderState(
  orderId: string,
  newState: string
): Promise<MockCloverOrder | null> {
  const orders = await getMockOrders();
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.state = newState;
    order.modifiedTime = Date.now();
    await saveMockOrders(orders);
    return order;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function getCloverConfig() {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  if (!merchantId || !accessToken) {
    console.error("[clover] Missing CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN");
  }
  return { merchantId, accessToken };
}

// ---------------------------------------------------------------------------
// Create Order
// ---------------------------------------------------------------------------

export async function createCloverOrder(orderData: {
  title: string;
  note?: string;
  state?: string;
}): Promise<{ id: string } | null> {
  // ── Mock mode ──────────────────────────────────────────────────────────
  if (isMockMode()) {
    const counter = await kvIncr(KV_CLOVER_ORDER_CTR);
    const id = `CLV-${1000 + counter}`;
    const now = Date.now();
    const mockOrder: MockCloverOrder = {
      id,
      title: orderData.title,
      note: orderData.note,
      state: "open",
      createdTime: now,
      modifiedTime: now,
      lineItems: [],
    };
    const orders = await getMockOrders();
    orders.push(mockOrder);
    await saveMockOrders(orders);
    console.log(`[clover-mock] Created order ${id}: "${orderData.title}"`);
    return { id };
  }

  // ── Real Clover API ────────────────────────────────────────────────────
  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/orders`;
    const body = {
      title: orderData.title,
      note: orderData.note,
      state: "open",
    };

    console.log("[clover] createCloverOrder - URL:", url);

    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[clover] createCloverOrder - Response status:", response.status);
    return response.data;
  } catch (error: any) {
    console.error("[clover] createCloverOrder - Error:", error?.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Add Line Items
// ---------------------------------------------------------------------------

export async function addLineItemsToClover(
  orderId: string,
  items: { name: string; price: number; quantity?: number; note?: string }[]
): Promise<boolean> {
  // ── Mock mode ──────────────────────────────────────────────────────────
  if (isMockMode()) {
    const orders = await getMockOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      console.error(`[clover-mock] Order ${orderId} not found`);
      return false;
    }
    for (const item of items) {
      const liCounter = await kvIncr(KV_CLOVER_LI_CTR);
      order.lineItems.push({
        id: `LI-${5000 + liCounter}`,
        name: item.name,
        price: Math.round(item.price * 100),
        unitQty: item.quantity || 1,
        note: item.note,
      });
    }
    order.modifiedTime = Date.now();
    await saveMockOrders(orders);
    console.log(
      `[clover-mock] Added ${items.length} line item(s) to order ${orderId}`
    );
    return true;
  }

  // ── Real Clover API ────────────────────────────────────────────────────
  try {
    const { merchantId, accessToken } = getCloverConfig();
    let allSucceeded = true;

    for (const item of items) {
      const url = `${CLOVER_API_BASE}/merchants/${merchantId}/orders/${orderId}/line_items`;
      const body: Record<string, any> = {
        name: item.name,
        price: item.price * 100,
        unitQty: item.quantity || 1,
      };
      if (item.note) body.note = item.note;

      try {
        await axios.post(url, body, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      } catch (itemError: any) {
        console.error("[clover] addLineItemsToClover - Error adding item:", item.name, itemError?.message);
        allSucceeded = false;
      }
    }

    return allSucceeded;
  } catch (error: any) {
    console.error("[clover] addLineItemsToClover - Error:", error?.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Get Customer
// ---------------------------------------------------------------------------

export async function getCloverCustomer(
  phone: string
): Promise<{ id: string; firstName: string; lastName: string } | null> {
  if (isMockMode()) {
    console.log(`[clover-mock] Customer lookup for ${phone} — returning null (mock)`);
    return null;
  }

  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/customers?filter=phoneNumber=${phone}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const customers = response.data?.elements;
    if (customers && customers.length > 0) {
      const customer = customers[0];
      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
      };
    }
    return null;
  } catch (error: any) {
    console.error("[clover] getCloverCustomer - Error:", error?.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Create Customer
// ---------------------------------------------------------------------------

export async function createCloverCustomer(customerData: {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  emailAddress?: string;
}): Promise<{ id: string } | null> {
  if (isMockMode()) {
    const id = `CUST-${Date.now()}`;
    console.log(`[clover-mock] Created mock customer ${id}: ${customerData.firstName}`);
    return { id };
  }

  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/customers`;

    const response = await axios.post(url, customerData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("[clover] createCloverCustomer - Error:", error?.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Update Order Status
// ---------------------------------------------------------------------------

export async function updateCloverOrderStatus(
  orderId: string,
  status: string
): Promise<boolean> {
  if (isMockMode()) {
    const order = await updateMockCloverOrderState(orderId, status);
    if (order) {
      console.log(`[clover-mock] Updated order ${orderId} state to "${status}"`);
      return true;
    }
    console.error(`[clover-mock] Order ${orderId} not found`);
    return false;
  }

  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/orders/${orderId}`;

    await axios.post(url, { state: status }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return true;
  } catch (error: any) {
    console.error("[clover] updateCloverOrderStatus - Error:", error?.message);
    return false;
  }
}
