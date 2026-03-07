import { NextRequest, NextResponse } from "next/server";
import {
  verifyRetellWebhook,
  extractOrderFromTranscript,
  determineCallType,
  extractInquiryTopic,
} from "@/lib/retell";
import {
  addOrder,
  addCallLog,
  addCateringLead,
  getOrCreateCustomer,
} from "@/lib/store";
import { createCloverOrder, addLineItemsToClover } from "@/lib/clover";
import {
  sendOrderConfirmationSMS,
  sendCateringAlertSMS,
  sendCateringAlertEmail,
} from "@/lib/notifications";
import { getMenuItem } from "@/lib/menu";
import { log, logError, logWebhook } from "@/lib/utils";
import { BUSINESS_CONFIG } from "@/config/business";
import type { RetellWebhookPayload } from "@/lib/types";

// ---------------------------------------------------------------------------
// POST /api/webhooks/retell
// Receives webhook events from the Retell AI platform.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    // ── 1. Read raw body ──────────────────────────────────────────────
    const body = await request.text();
    logWebhook("raw_payload_received", { length: body.length, body });

    // ── 2. Verify webhook signature ───────────────────────────────────
    const signature = request.headers.get("x-retell-signature");
    const isDev = process.env.NODE_ENV === "development";

    if (!isDev) {
      if (!signature) {
        log("Webhook signature missing - rejecting request");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }

      try {
        const isValid = verifyRetellWebhook(body, signature);
        log("Webhook signature verification result", { isValid });

        if (!isValid) {
          log("Webhook signature invalid - rejecting request");
          return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 }
          );
        }
      } catch (verifyError) {
        logError("Webhook signature verification threw an error", verifyError);
        // In production, reject if verification itself throws
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    } else {
      log("Development mode - skipping webhook signature verification");
    }

    // ── 3. Parse payload ──────────────────────────────────────────────
    const payload: RetellWebhookPayload = JSON.parse(body);
    logWebhook("parsed_event", { event: payload.event, call_id: payload.call?.call_id });

    // ── 4. Route by event type ────────────────────────────────────────
    switch (payload.event) {
      // ================================================================
      // CALL STARTED
      // ================================================================
      case "call_started": {
        logWebhook("call_started", {
          call_id: payload.call.call_id,
          agent_id: payload.call.agent_id,
        });

        return new NextResponse(null, { status: 204 });
      }

      // ================================================================
      // CALL ENDED – primary processing of order / inquiry / catering
      // ================================================================
      case "call_ended": {
        const {
          call_id,
          transcript,
          call_status,
          start_timestamp,
          end_timestamp,
          call_analysis,
        } = payload.call;

        const durationSeconds =
          start_timestamp && end_timestamp
            ? Math.round((end_timestamp - start_timestamp) / 1000)
            : 0;

        logWebhook("call_ended", {
          call_id,
          call_status,
          duration_seconds: durationSeconds,
          transcript_length: transcript?.length ?? 0,
        });

        // Determine call type from transcript + analysis
        const callType = determineCallType(transcript, call_analysis);
        log(`Call ${call_id} determined type: ${callType}`);

        // ── ORDER ─────────────────────────────────────────────────────
        if (callType === "order") {
          try {
            const orderData = extractOrderFromTranscript(transcript);
            logWebhook("order_extraction", { call_id, orderData });

            if (orderData && orderData.hasOrder && orderData.items.length > 0) {
              // Build validated OrderItem array from menu lookups
              const orderItems = [];
              for (const rawItem of orderData.items) {
                const menuItem = getMenuItem(rawItem.name);
                if (menuItem) {
                  orderItems.push({
                    name: menuItem.name,
                    quantity: rawItem.quantity,
                    unit_price: menuItem.price,
                    customizations: {} as Record<string, string>,
                    subtotal: menuItem.price * rawItem.quantity,
                  });
                  log(`Matched menu item: "${rawItem.name}" -> "${menuItem.name}" @ $${menuItem.price}`);
                } else {
                  log(`Menu item not found for transcript item: "${rawItem.name}" - skipping`);
                }
              }

              if (orderItems.length > 0) {
                const orderTotal = orderItems.reduce(
                  (sum, item) => sum + item.subtotal,
                  0
                );

                // Get or create customer
                const customerName = orderData.customerName || "Voice Order Customer";
                const customerPhone = orderData.customerPhone || "unknown";
                const customer = await getOrCreateCustomer(customerPhone, customerName);
                log("Customer resolved for voice order", {
                  id: customer.id,
                  phone: customer.phone,
                  name: customer.name,
                });

                // Add order to local store
                const order = await addOrder({
                  customer_name: customerName,
                  customer_phone: customerPhone,
                  order_type: "pickup",
                  order_items: orderItems,
                  special_requests: orderData.specialRequests || "",
                  order_total: orderTotal,
                  order_status: "pending",
                  call_id,
                  transcript,
                  call_duration_seconds: durationSeconds,
                });
                logWebhook("order_created", { order_id: order.id, total: orderTotal, items: orderItems.length });

                // Try to create order in Clover POS
                try {
                  const cloverOrder = await createCloverOrder({
                    title: `Voice Order #${order.id}`,
                    note: `Phone: ${customerPhone} | Name: ${customerName}${orderData.specialRequests ? ` | Special: ${orderData.specialRequests}` : ""}`,
                  });

                  if (cloverOrder && cloverOrder.id) {
                    log("Clover order created", { clover_order_id: cloverOrder.id });

                    const lineItemsResult = await addLineItemsToClover(
                      cloverOrder.id,
                      orderItems.map((item) => ({
                        name: item.name,
                        price: item.unit_price,
                        quantity: item.quantity,
                      }))
                    );
                    log("Clover line items added", { success: lineItemsResult });
                  } else {
                    log("Clover order creation returned null - order not synced to POS");
                  }
                } catch (cloverError) {
                  logError("Failed to create Clover order", cloverError);
                }

                // Try to send SMS confirmation
                try {
                  if (customerPhone && customerPhone !== "unknown") {
                    const smsResult = await sendOrderConfirmationSMS(customerPhone, {
                      customerName,
                      orderId: order.id,
                      total: orderTotal,
                      pickupTime: `${BUSINESS_CONFIG.default_prep_time} minutes`,
                    });
                    log("Order confirmation SMS result", smsResult);
                  } else {
                    log("Skipping SMS - no valid customer phone number");
                  }
                } catch (smsError) {
                  logError("Failed to send order confirmation SMS", smsError);
                }
              } else {
                log(`Call ${call_id}: order items extracted but none matched menu - treating as general call`);
              }
            } else {
              log(`Call ${call_id}: no order items found in transcript`);
            }
          } catch (orderError) {
            logError(`Failed to process order for call ${call_id}`, orderError);
          }
        }

        // ── INQUIRY ───────────────────────────────────────────────────
        if (callType === "inquiry") {
          try {
            const topic = extractInquiryTopic(transcript);
            log(`Call ${call_id}: inquiry topic = "${topic}"`);

            await addCallLog({
              call_id,
              call_type: "inquiry",
              duration_seconds: durationSeconds,
              inquiry_topic: topic,
              transcript,
            });
            logWebhook("inquiry_logged", { call_id, topic });
          } catch (inquiryError) {
            logError(`Failed to process inquiry for call ${call_id}`, inquiryError);
          }
        }

        // ── CATERING ──────────────────────────────────────────────────
        if (callType === "catering") {
          try {
            // Basic extraction of catering details from transcript
            const nameMatch = transcript.match(
              /(?:my name is|name's|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i
            );
            const phoneMatch = transcript.match(
              /(\+?1?\s*[-.]?\s*\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{4})/
            );
            const guestMatch = transcript.match(
              /(\d+)\s*(?:guests?|people|persons?|attendees?)/i
            );
            const dateMatch = transcript.match(
              /(?:on|for|date|scheduled)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?)/i
            );

            const leadName = nameMatch ? nameMatch[1].trim() : "Unknown";
            const leadPhone = phoneMatch ? phoneMatch[1].trim() : "Unknown";
            const guestCount = guestMatch ? parseInt(guestMatch[1], 10) : 0;
            const eventDate = dateMatch ? dateMatch[1].trim() : "TBD";

            log(`Call ${call_id}: catering lead extracted`, {
              name: leadName,
              phone: leadPhone,
              guestCount,
              eventDate,
            });

            // Add catering lead to store
            const lead = await addCateringLead({
              name: leadName,
              phone: leadPhone,
              event_date: eventDate,
              guest_count: guestCount,
              notes: `From voice call ${call_id}. Transcript available.`,
            });
            logWebhook("catering_lead_created", { lead_id: lead.id, lead });

            // Send catering alert SMS to staff
            try {
              const staffPhone = BUSINESS_CONFIG.staff_transfer_number;
              if (staffPhone) {
                const smsResult = await sendCateringAlertSMS(staffPhone, {
                  name: leadName,
                  phone: leadPhone,
                  eventDate,
                  guestCount,
                });
                log("Catering alert SMS result", smsResult);
              }
            } catch (cateringSmsError) {
              logError("Failed to send catering alert SMS", cateringSmsError);
            }

            // Send catering alert email if configured
            try {
              const alertEmail = BUSINESS_CONFIG.catering_alert_email;
              if (alertEmail) {
                const emailResult = await sendCateringAlertEmail(alertEmail, {
                  name: leadName,
                  phone: leadPhone,
                  eventDate,
                  guestCount,
                });
                log("Catering alert email result", emailResult);
              } else {
                log("No catering alert email configured - skipping email notification");
              }
            } catch (cateringEmailError) {
              logError("Failed to send catering alert email", cateringEmailError);
            }

            // Log the catering call
            await addCallLog({
              call_id,
              call_type: "catering",
              duration_seconds: durationSeconds,
              transcript,
              summary: `Catering inquiry from ${leadName} (${leadPhone}) - ${guestCount} guests on ${eventDate}`,
            });
            logWebhook("catering_call_logged", { call_id });
          } catch (cateringError) {
            logError(`Failed to process catering lead for call ${call_id}`, cateringError);
          }
        }

        // ── TRANSFER ──────────────────────────────────────────────────
        if (callType === "transfer") {
          try {
            await addCallLog({
              call_id,
              call_type: "transfer",
              duration_seconds: durationSeconds,
              transcript,
              summary: "Call transferred to staff",
            });
            logWebhook("transfer_call_logged", { call_id });
          } catch (transferError) {
            logError(`Failed to log transfer call ${call_id}`, transferError);
          }
        }

        // ── Catch-all: log for any call type (order logs handled inline) ──
        if (callType === "order") {
          try {
            await addCallLog({
              call_id,
              call_type: "order",
              duration_seconds: durationSeconds,
              transcript,
              sentiment: call_analysis?.user_sentiment,
              summary: call_analysis?.call_summary,
            });
            logWebhook("order_call_logged", { call_id });
          } catch (logErr) {
            logError(`Failed to add call log for order call ${call_id}`, logErr);
          }
        }

        if (callType === "other") {
          try {
            await addCallLog({
              call_id,
              call_type: "other",
              duration_seconds: durationSeconds,
              transcript,
              sentiment: call_analysis?.user_sentiment,
              summary: call_analysis?.call_summary,
            });
            logWebhook("other_call_logged", { call_id });
          } catch (logErr) {
            logError(`Failed to add call log for other call ${call_id}`, logErr);
          }
        }

        return new NextResponse(null, { status: 204 });
      }

      // ================================================================
      // CALL ANALYZED – post-call analysis from Retell
      // ================================================================
      case "call_analyzed": {
        const { call_id, call_analysis: analysis } = payload.call;

        const sentiment = analysis?.user_sentiment;
        const summary = analysis?.call_summary;
        const customAnalysisData = analysis?.custom_analysis_data;

        logWebhook("call_analyzed", {
          call_id,
          sentiment,
          summary,
          custom_analysis_data: customAnalysisData,
        });

        // Add or update a call log entry with analysis data
        try {
          addCallLog({
            call_id,
            call_type: "other",
            duration_seconds: 0,
            sentiment,
            summary,
          });
          log(`Call analysis logged for ${call_id}`, { sentiment, summary });
        } catch (analysisLogError) {
          logError(`Failed to log call analysis for ${call_id}`, analysisLogError);
        }

        return new NextResponse(null, { status: 204 });
      }

      // ================================================================
      // UNKNOWN EVENT
      // ================================================================
      default: {
        logWebhook("unknown_event", { event: payload.event, payload });
        return new NextResponse(null, { status: 204 });
      }
    }
  } catch (error) {
    logError("Retell webhook handler crashed", error);
    if (error instanceof Error) {
      logError("Stack trace", error.stack);
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
