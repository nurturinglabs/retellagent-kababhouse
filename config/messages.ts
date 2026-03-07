// ---------------------------------------------------------------------------
// SMS Templates
// ---------------------------------------------------------------------------

export const SMS_TEMPLATES = {
  orderConfirmation: (name: string, orderId: string, total: number, pickupTime: string) =>
    `Hi ${name}! Your Kabab House order #${orderId} for $${total.toFixed(2)} is confirmed. Pickup in ${pickupTime}. Questions? Call (262) 233-1917. Reply STOP to unsubscribe.`,

  orderReady: (name: string, orderId: string) =>
    `Hi ${name}! Your Kabab House order #${orderId} is ready for pickup. See you soon! Reply STOP to unsubscribe.`,

  cateringAlert: (leadName: string, phone: string, eventDate: string, guestCount: number) =>
    `New catering inquiry! ${leadName} (${phone}) - Event: ${eventDate}, ${guestCount} guests. Check dashboard for details.`,
};

// ---------------------------------------------------------------------------
// Email Templates
// ---------------------------------------------------------------------------

export const EMAIL_TEMPLATES = {
  orderReceipt: (details: {
    customerName: string;
    orderId: string;
    items: { name: string; quantity: number; subtotal: number }[];
    total: number;
    pickupTime: string;
  }) => ({
    subject: `Order Confirmation - Kabab House #${details.orderId}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#fdf6ee;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf6ee;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c2571a 0%,#e87d2f 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">Kabab House</h1>
              <p style="margin:6px 0 0;color:#fde8d0;font-size:14px;">214 E Ryan Rd, Oak Creek, WI 53154</p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <h2 style="margin:0 0 8px;color:#3d2b1f;font-size:22px;">Order Confirmed!</h2>
              <p style="margin:0;color:#6b5445;font-size:15px;line-height:1.5;">
                Hi ${details.customerName}, thank you for your order. Here are your details:
              </p>
            </td>
          </tr>

          <!-- Order ID & Pickup -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#fdf0e2;border-radius:8px;padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#8b5e3c;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order #</td>
                        <td align="right" style="color:#8b5e3c;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Pickup Time</td>
                      </tr>
                      <tr>
                        <td style="color:#3d2b1f;font-size:18px;font-weight:700;padding-top:4px;">${details.orderId}</td>
                        <td align="right" style="color:#3d2b1f;font-size:18px;font-weight:700;padding-top:4px;">${details.pickupTime}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:2px solid #e8d5c4;color:#8b5e3c;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Item</td>
                  <td align="center" style="padding:10px 0;border-bottom:2px solid #e8d5c4;color:#8b5e3c;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Qty</td>
                  <td align="right" style="padding:10px 0;border-bottom:2px solid #e8d5c4;color:#8b5e3c;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</td>
                </tr>
                ${details.items
                  .map(
                    (item) => `
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #f0e6da;color:#3d2b1f;font-size:15px;">${item.name}</td>
                  <td align="center" style="padding:12px 0;border-bottom:1px solid #f0e6da;color:#6b5445;font-size:15px;">${item.quantity}</td>
                  <td align="right" style="padding:12px 0;border-bottom:1px solid #f0e6da;color:#3d2b1f;font-size:15px;font-weight:600;">$${item.subtotal.toFixed(2)}</td>
                </tr>`
                  )
                  .join('')}
              </table>
            </td>
          </tr>

          <!-- Total -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#3d2b1f;border-radius:8px;padding:16px 20px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#e8d5c4;font-size:16px;font-weight:600;">Total</td>
                        <td align="right" style="color:#ffffff;font-size:22px;font-weight:700;">$${details.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9efe4;padding:24px 40px;text-align:center;border-top:1px solid #e8d5c4;">
              <p style="margin:0 0 4px;color:#8b5e3c;font-size:14px;font-weight:600;">Kabab House</p>
              <p style="margin:0 0 4px;color:#a08774;font-size:13px;">214 E Ryan Rd, Oak Creek, WI 53154</p>
              <p style="margin:0;color:#a08774;font-size:13px;">(262) 233-1917</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim(),
  }),

  cateringAlert: (details: {
    name: string;
    phone: string;
    eventDate: string;
    guestCount: number;
    preferences?: string;
  }) => ({
    subject: 'New Catering Inquiry - Kabab House',
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background-color:#fdf6ee;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf6ee;padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#c2571a 0%,#e87d2f 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:0.5px;">Kabab House</h1>
              <p style="margin:6px 0 0;color:#fde8d0;font-size:14px;">Catering Department</p>
            </td>
          </tr>

          <!-- Alert Badge -->
          <tr>
            <td style="padding:32px 40px 16px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#c2571a;border-radius:20px;padding:6px 16px;">
                    <span style="color:#ffffff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">New Inquiry</span>
                  </td>
                </tr>
              </table>
              <h2 style="margin:16px 0 8px;color:#3d2b1f;font-size:22px;">Catering Request Received</h2>
              <p style="margin:0;color:#6b5445;font-size:15px;line-height:1.5;">
                A new catering inquiry was captured from a phone call. Please follow up promptly.
              </p>
            </td>
          </tr>

          <!-- Details Card -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf0e2;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e8d5c4;">
                    <p style="margin:0 0 2px;color:#8b5e3c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Contact Name</p>
                    <p style="margin:0;color:#3d2b1f;font-size:16px;font-weight:600;">${details.name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e8d5c4;">
                    <p style="margin:0 0 2px;color:#8b5e3c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Phone Number</p>
                    <p style="margin:0;color:#3d2b1f;font-size:16px;font-weight:600;">${details.phone}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 24px;border-bottom:1px solid #e8d5c4;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="50%">
                          <p style="margin:0 0 2px;color:#8b5e3c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Event Date</p>
                          <p style="margin:0;color:#3d2b1f;font-size:16px;font-weight:600;">${details.eventDate}</p>
                        </td>
                        <td width="50%">
                          <p style="margin:0 0 2px;color:#8b5e3c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Guest Count</p>
                          <p style="margin:0;color:#3d2b1f;font-size:16px;font-weight:600;">${details.guestCount} guests</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ${
                  details.preferences
                    ? `
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 2px;color:#8b5e3c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Preferences / Notes</p>
                    <p style="margin:0;color:#3d2b1f;font-size:15px;line-height:1.5;">${details.preferences}</p>
                  </td>
                </tr>`
                    : `
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 2px;color:#8b5e3c;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Preferences / Notes</p>
                    <p style="margin:0;color:#a08774;font-size:15px;font-style:italic;">No specific preferences mentioned.</p>
                  </td>
                </tr>`
                }
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <p style="margin:0;color:#6b5445;font-size:14px;line-height:1.5;">
                View and manage this inquiry in the <strong>Kabab House Dashboard</strong>.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9efe4;padding:24px 40px;text-align:center;border-top:1px solid #e8d5c4;">
              <p style="margin:0 0 4px;color:#8b5e3c;font-size:14px;font-weight:600;">Kabab House</p>
              <p style="margin:0 0 4px;color:#a08774;font-size:13px;">214 E Ryan Rd, Oak Creek, WI 53154</p>
              <p style="margin:0;color:#a08774;font-size:13px;">(262) 233-1917</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim(),
  }),
};
