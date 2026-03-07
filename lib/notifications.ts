import twilio from 'twilio';
import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// Helper: format phone numbers to E.164
// ---------------------------------------------------------------------------

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
}

// ---------------------------------------------------------------------------
// Twilio SMS Functions
// ---------------------------------------------------------------------------

/**
 * Send an order confirmation SMS to the customer.
 * Supports both pickup and delivery order types.
 */
export async function sendOrderConfirmationSMS(
  customerPhone: string,
  orderDetails: {
    customerName: string;
    orderId: string;
    total: number;
    pickupTime: string;
    orderType?: "pickup" | "delivery";
    deliveryAddress?: string;
    deliveryFee?: number;
    estimatedDeliveryTime?: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(
    `[notifications] Attempting to send order confirmation SMS to ${customerPhone}`
  );

  if (!customerPhone) {
    console.log('[notifications] Missing customer phone number');
    return { success: false, error: 'Missing phone' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || accountSid === 'your_twilio_sid_here') {
    console.log('[notifications] Twilio not configured — skipping SMS (email will still be sent)');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const { customerName, orderId, total, pickupTime, orderType, deliveryAddress, deliveryFee, estimatedDeliveryTime } = orderDetails;

    let body: string;
    if (orderType === "delivery" && deliveryAddress) {
      body = `Hi ${customerName}! Your Kabab House delivery order #${orderId} for $${total.toFixed(2)} (incl. $${(deliveryFee ?? 6.99).toFixed(2)} delivery fee) is confirmed. Delivering to: ${deliveryAddress}. Est. delivery: ${estimatedDeliveryTime || "35-45 min"}. Questions? Call (262) 233-1917. Reply STOP to unsubscribe.`;
    } else {
      body = `Hi ${customerName}! Your Kabab House order #${orderId} for $${total.toFixed(2)} is confirmed. Pickup in ${pickupTime}. Questions? Call (262) 233-1917. Reply STOP to unsubscribe.`;
    }

    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: formatPhone(customerPhone),
    });

    console.log(
      `[notifications] Order confirmation SMS sent successfully. SID: ${message.sid}`
    );
    return { success: true, messageId: message.sid };
  } catch (error: any) {
    console.log(
      `[notifications] Failed to send order confirmation SMS: ${error.message}`
    );
    return { success: false, error: error.message };
  }
}

/**
 * Send an "order ready" SMS to the customer.
 */
export async function sendOrderReadySMS(
  customerPhone: string,
  orderDetails: {
    customerName: string;
    orderId: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  console.log(
    `[notifications] Attempting to send order ready SMS to ${customerPhone}`
  );

  if (!customerPhone) {
    console.log('[notifications] Missing customer phone number');
    return { success: false, error: 'Missing phone' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || accountSid === 'your_twilio_sid_here') {
    console.log('[notifications] Twilio not configured — skipping SMS (email will still be sent)');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const { customerName, orderId } = orderDetails;

    const message = await client.messages.create({
      body: `Hi ${customerName}! Your Kabab House order #${orderId} is ready for pickup. See you soon! Reply STOP to unsubscribe.`,
      from: fromNumber,
      to: formatPhone(customerPhone),
    });

    console.log(
      `[notifications] Order ready SMS sent successfully. SID: ${message.sid}`
    );
    return { success: true, messageId: message.sid };
  } catch (error: any) {
    console.log(
      `[notifications] Failed to send order ready SMS: ${error.message}`
    );
    return { success: false, error: error.message };
  }
}

/**
 * Send a catering inquiry alert SMS to staff.
 */
export async function sendCateringAlertSMS(
  staffPhone: string,
  leadDetails: {
    name: string;
    phone: string;
    eventDate: string;
    guestCount: number;
  }
): Promise<{ success: boolean; error?: string }> {
  console.log(
    `[notifications] Attempting to send catering alert SMS to ${staffPhone}`
  );

  if (!staffPhone) {
    console.log('[notifications] Missing staff phone number');
    return { success: false, error: 'Missing phone' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber || accountSid === 'your_twilio_sid_here') {
    console.log('[notifications] Twilio not configured — skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const client = twilio(accountSid, authToken);
    const { name, phone, eventDate, guestCount } = leadDetails;

    await client.messages.create({
      body: `New catering inquiry! ${name} (${phone}) - Event: ${eventDate}, ${guestCount} guests. Check dashboard for details.`,
      from: fromNumber,
      to: formatPhone(staffPhone),
    });

    console.log('[notifications] Catering alert SMS sent successfully');
    return { success: true };
  } catch (error: any) {
    console.log(
      `[notifications] Failed to send catering alert SMS: ${error.message}`
    );
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------------------
// Resend Email Functions
// ---------------------------------------------------------------------------

/**
 * Send an order receipt email to the customer.
 * Supports both pickup and delivery order types.
 */
export async function sendOrderReceiptEmail(
  customerEmail: string,
  orderDetails: {
    customerName: string;
    orderId: string;
    items: { name: string; quantity: number; subtotal: number }[];
    total: number;
    pickupTime: string;
    orderType?: "pickup" | "delivery";
    deliveryAddress?: string;
    deliveryFee?: number;
    estimatedDeliveryTime?: string;
  }
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  console.log(
    `[notifications] Attempting to send order receipt email to ${customerEmail}`
  );

  if (!customerEmail) {
    console.log('[notifications] Missing customer email');
    return { success: false, error: 'Missing email' };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('[notifications] Missing RESEND_API_KEY environment variable');
    return { success: false, error: 'Missing Resend configuration' };
  }

  try {
    const resend = new Resend(apiKey);
    const { customerName, orderId, items, total, pickupTime, orderType, deliveryAddress, deliveryFee, estimatedDeliveryTime } = orderDetails;

    const isDelivery = orderType === "delivery" && deliveryAddress;

    const itemRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">${item.name}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; text-align: right;">$${item.subtotal.toFixed(2)}</td>
        </tr>`
      )
      .join('');

    const deliveryFeeRow = isDelivery
      ? `<tr>
          <td colspan="2" style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #555;">Delivery Fee</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 14px; color: #555; text-align: right;">$${(deliveryFee ?? 6.99).toFixed(2)}</td>
        </tr>`
      : '';

    const deliveryInfoSection = isDelivery
      ? `<div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin-bottom: 16px;">
          <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #1e40af;">Delivery Details</p>
          <p style="margin: 0 0 4px; font-size: 14px; color: #333;">Delivering to: <strong>${deliveryAddress}</strong></p>
          <p style="margin: 0 0 4px; font-size: 14px; color: #333;">Estimated delivery: <strong>${estimatedDeliveryTime || '35-45 minutes'}</strong></p>
          <p style="margin: 0; font-size: 14px; color: #333;">Delivery fee: <strong>$${(deliveryFee ?? 6.99).toFixed(2)}</strong></p>
        </div>`
      : '';

    const readyLine = isDelivery
      ? `<p style="margin: 0 0 8px; font-size: 14px; color: #555;">Estimated delivery: <strong>${estimatedDeliveryTime || '35-45 minutes'}</strong></p>`
      : `<p style="margin: 0 0 8px; font-size: 14px; color: #555;">Ready in: <strong>${pickupTime}</strong></p>`;

    const headerTitle = isDelivery
      ? 'Delivery Confirmation - Kabab House'
      : 'Order Confirmation - Kabab House';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #b91c1c; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">${headerTitle}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #333;">Thanks for your order, <strong>${customerName}</strong>!</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #555;">Order ID: <strong>#${orderId}</strong> &bull; ${isDelivery ? 'Delivery' : 'Pickup'}</p>

              ${deliveryInfoSection}

              <!-- Items Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background-color: #fef2f2;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #b91c1c;">Item</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 13px; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #b91c1c;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 13px; color: #b91c1c; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #b91c1c;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                  ${deliveryFeeRow}
                </tbody>
              </table>

              <p style="margin: 0 0 8px; font-size: 18px; font-weight: 700; color: #b91c1c; text-align: right;">Total: $${total.toFixed(2)}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              ${readyLine}
              <p style="margin: 0 0 0; font-size: 14px; color: #555;">Questions? Call <a href="tel:+12623846288" style="color: #b91c1c; text-decoration: none;">(262) 233-1917</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Kabab House</p>
              <p style="margin: 0; font-size: 13px; color: #888;">214 E Ryan Rd, Oak Creek, WI 53154</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: 'Kabab House <orders@kababhousemke.com>',
      to: customerEmail,
      subject: `${isDelivery ? 'Delivery' : 'Order'} Confirmation - Kabab House #${orderId}`,
      html,
    });

    if (error) {
      console.log(
        `[notifications] Resend returned an error: ${error.message}`
      );
      return { success: false, error: error.message };
    }

    console.log(
      `[notifications] Order receipt email sent successfully. ID: ${data?.id}`
    );
    return { success: true, emailId: data?.id };
  } catch (error: any) {
    console.log(
      `[notifications] Failed to send order receipt email: ${error.message}`
    );
    return { success: false, error: error.message };
  }
}

/**
 * Send a catering inquiry alert email to staff.
 */
export async function sendCateringAlertEmail(
  email: string,
  leadDetails: {
    name: string;
    phone: string;
    eventDate: string;
    guestCount: number;
    preferences?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  console.log(
    `[notifications] Attempting to send catering alert email to ${email}`
  );

  if (!email) {
    console.log('[notifications] Missing email address');
    return { success: false, error: 'Missing email' };
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log('[notifications] Missing RESEND_API_KEY environment variable');
    return { success: false, error: 'Missing Resend configuration' };
  }

  try {
    const resend = new Resend(apiKey);
    const { name, phone, eventDate, guestCount, preferences } = leadDetails;

    const preferencesRow = preferences
      ? `<tr>
           <td style="padding: 10px 14px; font-size: 14px; color: #888; border-bottom: 1px solid #eee; width: 140px;">Preferences</td>
           <td style="padding: 10px 14px; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">${preferences}</td>
         </tr>`
      : '';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #b91c1c; padding: 24px 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">New Catering Inquiry</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 20px; font-size: 16px; color: #333;">A new catering inquiry has been submitted. Details below:</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px; border: 1px solid #eee; border-radius: 6px;">
                <tr>
                  <td style="padding: 10px 14px; font-size: 14px; color: #888; border-bottom: 1px solid #eee; width: 140px;">Name</td>
                  <td style="padding: 10px 14px; font-size: 14px; color: #333; border-bottom: 1px solid #eee; font-weight: 600;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 14px; color: #888; border-bottom: 1px solid #eee;">Phone</td>
                  <td style="padding: 10px 14px; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">
                    <a href="tel:${phone}" style="color: #b91c1c; text-decoration: none;">${phone}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 14px; color: #888; border-bottom: 1px solid #eee;">Event Date</td>
                  <td style="padding: 10px 14px; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">${eventDate}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 14px; color: #888; border-bottom: 1px solid #eee;">Guest Count</td>
                  <td style="padding: 10px 14px; font-size: 14px; color: #333; border-bottom: 1px solid #eee;">${guestCount} guests</td>
                </tr>
                ${preferencesRow}
              </table>

              <p style="margin: 0; font-size: 14px; color: #555;">Please follow up with the customer promptly.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 20px 32px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0 0 4px; font-size: 13px; color: #888;">Kabab House</p>
              <p style="margin: 0; font-size: 13px; color: #888;">214 E Ryan Rd, Oak Creek, WI 53154</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const { error } = await resend.emails.send({
      from: 'Kabab House <orders@kababhousemke.com>',
      to: email,
      subject: 'New Catering Inquiry - Kabab House',
      html,
    });

    if (error) {
      console.log(
        `[notifications] Resend returned an error: ${error.message}`
      );
      return { success: false, error: error.message };
    }

    console.log('[notifications] Catering alert email sent successfully');
    return { success: true };
  } catch (error: any) {
    console.log(
      `[notifications] Failed to send catering alert email: ${error.message}`
    );
    return { success: false, error: error.message };
  }
}
