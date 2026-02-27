import axios from "axios";

const CLOVER_API_BASE = "https://api.clover.com/v3";

function getCloverConfig() {
  const merchantId = process.env.CLOVER_MERCHANT_ID;
  const accessToken = process.env.CLOVER_ACCESS_TOKEN;
  if (!merchantId || !accessToken) {
    console.error('[clover] Missing CLOVER_MERCHANT_ID or CLOVER_ACCESS_TOKEN');
  }
  return { merchantId, accessToken };
}

/**
 * Create a new order in Clover POS.
 */
export async function createCloverOrder(orderData: {
  title: string;
  note?: string;
  state?: string;
}): Promise<{ id: string } | null> {
  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/orders`;
    const body = {
      title: orderData.title,
      note: orderData.note,
      state: "open",
    };

    console.log("[clover] createCloverOrder - URL:", url);
    console.log("[clover] createCloverOrder - Request body:", JSON.stringify(body, null, 2));

    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[clover] createCloverOrder - Response status:", response.status);
    console.log("[clover] createCloverOrder - Response data:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error: any) {
    console.error("[clover] createCloverOrder - Error:", error?.message);
    console.error("[clover] createCloverOrder - Error details:", error?.response?.status, JSON.stringify(error?.response?.data, null, 2));
    return null;
  }
}

/**
 * Add line items to an existing Clover order.
 * Prices are converted from dollars to cents (Clover uses cents).
 */
export async function addLineItemsToClover(
  orderId: string,
  items: { name: string; price: number; quantity?: number; note?: string }[]
): Promise<boolean> {
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

      if (item.note) {
        body.note = item.note;
      }

      console.log("[clover] addLineItemsToClover - URL:", url);
      console.log("[clover] addLineItemsToClover - Adding item:", JSON.stringify(body, null, 2));

      try {
        const response = await axios.post(url, body, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("[clover] addLineItemsToClover - Response status:", response.status);
        console.log("[clover] addLineItemsToClover - Response data:", JSON.stringify(response.data, null, 2));
      } catch (itemError: any) {
        console.error("[clover] addLineItemsToClover - Error adding item:", item.name);
        console.error("[clover] addLineItemsToClover - Error:", itemError?.message);
        console.error("[clover] addLineItemsToClover - Error details:", itemError?.response?.status, JSON.stringify(itemError?.response?.data, null, 2));
        allSucceeded = false;
      }
    }

    return allSucceeded;
  } catch (error: any) {
    console.error("[clover] addLineItemsToClover - Error:", error?.message);
    console.error("[clover] addLineItemsToClover - Error details:", error?.response?.status, JSON.stringify(error?.response?.data, null, 2));
    return false;
  }
}

/**
 * Look up a customer in Clover by phone number.
 */
export async function getCloverCustomer(
  phone: string
): Promise<{ id: string; firstName: string; lastName: string } | null> {
  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/customers?filter=phoneNumber=${phone}`;

    console.log("[clover] getCloverCustomer - URL:", url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[clover] getCloverCustomer - Response status:", response.status);
    console.log("[clover] getCloverCustomer - Response data:", JSON.stringify(response.data, null, 2));

    const customers = response.data?.elements;
    if (customers && customers.length > 0) {
      const customer = customers[0];
      console.log("[clover] getCloverCustomer - Found customer:", JSON.stringify(customer, null, 2));
      return {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
      };
    }

    console.log("[clover] getCloverCustomer - No customer found for phone:", phone);
    return null;
  } catch (error: any) {
    console.error("[clover] getCloverCustomer - Error:", error?.message);
    console.error("[clover] getCloverCustomer - Error details:", error?.response?.status, JSON.stringify(error?.response?.data, null, 2));
    return null;
  }
}

/**
 * Create a new customer in Clover.
 */
export async function createCloverCustomer(customerData: {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  emailAddress?: string;
}): Promise<{ id: string } | null> {
  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/customers`;

    console.log("[clover] createCloverCustomer - URL:", url);
    console.log("[clover] createCloverCustomer - Request body:", JSON.stringify(customerData, null, 2));

    const response = await axios.post(url, customerData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[clover] createCloverCustomer - Response status:", response.status);
    console.log("[clover] createCloverCustomer - Response data:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error: any) {
    console.error("[clover] createCloverCustomer - Error:", error?.message);
    console.error("[clover] createCloverCustomer - Error details:", error?.response?.status, JSON.stringify(error?.response?.data, null, 2));
    return null;
  }
}

/**
 * Update the status/state of an existing Clover order.
 */
export async function updateCloverOrderStatus(
  orderId: string,
  status: string
): Promise<boolean> {
  try {
    const { merchantId, accessToken } = getCloverConfig();
    const url = `${CLOVER_API_BASE}/merchants/${merchantId}/orders/${orderId}`;
    const body = { state: status };

    console.log("[clover] updateCloverOrderStatus - URL:", url);
    console.log("[clover] updateCloverOrderStatus - Request body:", JSON.stringify(body, null, 2));

    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("[clover] updateCloverOrderStatus - Response status:", response.status);
    console.log("[clover] updateCloverOrderStatus - Response data:", JSON.stringify(response.data, null, 2));

    return true;
  } catch (error: any) {
    console.error("[clover] updateCloverOrderStatus - Error:", error?.message);
    console.error("[clover] updateCloverOrderStatus - Error details:", error?.response?.status, JSON.stringify(error?.response?.data, null, 2));
    return false;
  }
}
