import Retell from "retell-sdk";
import { getAllItems } from "@/lib/menu";

/**
 * Verify that a webhook request actually came from Retell AI.
 * Uses the Retell SDK's built-in verification with the API key.
 */
export async function verifyRetellWebhook(
  payload: string,
  signature: string
): Promise<boolean> {
  try {
    const result = Retell.verify(
      payload,
      process.env.RETELL_API_KEY || "",
      signature
    );
    const verified = await Promise.resolve(result);
    console.log("[retell] Webhook verification result:", verified);
    return !!verified;
  } catch (error) {
    console.error("[retell] Webhook verification failed:", error);
    return false;
  }
}

/**
 * Basic fallback parser that looks for menu item names in a transcript.
 * The primary order collection happens via custom functions during the call;
 * this is used as a safety net when call analysis data is unavailable.
 */
export function extractOrderFromTranscript(transcript: string): {
  hasOrder: boolean;
  items: { name: string; quantity: number }[];
  customerName?: string;
  customerPhone?: string;
  specialRequests?: string;
} | null {
  if (!transcript || transcript.trim().length === 0) {
    return null;
  }

  const lowerTranscript = transcript.toLowerCase();
  const menuItems = getAllItems();
  const foundItems: { name: string; quantity: number }[] = [];

  for (const item of menuItems) {
    const itemNameLower = item.name.toLowerCase();
    if (lowerTranscript.includes(itemNameLower)) {
      const quantity = extractQuantityBefore(lowerTranscript, itemNameLower);
      foundItems.push({ name: item.name, quantity });
    }
  }

  const customerName = extractCustomerName(transcript);
  const customerPhone = extractPhoneNumber(transcript);
  const specialRequests = extractSpecialRequests(transcript);

  return {
    hasOrder: foundItems.length > 0,
    items: foundItems,
    customerName: customerName || undefined,
    customerPhone: customerPhone || undefined,
    specialRequests: specialRequests || undefined,
  };
}

/**
 * Determine the type/purpose of a call based on analysis data or transcript keywords.
 */
export function determineCallType(
  transcript: string,
  callAnalysis?: {
    call_summary?: string;
    custom_analysis_data?: Record<string, string>;
  }
): "order" | "inquiry" | "catering" | "transfer" | "other" {
  if (callAnalysis?.custom_analysis_data) {
    const analysisType =
      callAnalysis.custom_analysis_data["call_type"] ||
      callAnalysis.custom_analysis_data["callType"] ||
      callAnalysis.custom_analysis_data["type"];

    if (analysisType) {
      const normalized = analysisType.toLowerCase().trim();
      if (
        ["order", "inquiry", "catering", "transfer", "other"].includes(
          normalized
        )
      ) {
        console.log("[retell] Call type from analysis data:", normalized);
        return normalized as
          | "order"
          | "inquiry"
          | "catering"
          | "transfer"
          | "other";
      }
    }
  }

  const lowerTranscript = transcript.toLowerCase();

  const transferKeywords = [
    "transfer",
    "speak to",
    "talk to",
    "manager",
    "person",
    "human",
  ];
  const cateringKeywords = ["catering", "event", "party", "guests"];
  const orderKeywords = ["order", "pickup", "delivery", "plate", "sandwich"];
  const inquiryKeywords = [
    "hours",
    "open",
    "close",
    "location",
    "address",
    "halal",
    "allergy",
    "vegetarian",
    "menu",
    "price",
  ];

  if (transferKeywords.some((kw) => lowerTranscript.includes(kw))) {
    console.log("[retell] Call type from keywords: transfer");
    return "transfer";
  }
  if (cateringKeywords.some((kw) => lowerTranscript.includes(kw))) {
    console.log("[retell] Call type from keywords: catering");
    return "catering";
  }
  if (orderKeywords.some((kw) => lowerTranscript.includes(kw))) {
    console.log("[retell] Call type from keywords: order");
    return "order";
  }
  if (inquiryKeywords.some((kw) => lowerTranscript.includes(kw))) {
    console.log("[retell] Call type from keywords: inquiry");
    return "inquiry";
  }

  console.log("[retell] Call type from keywords: other");
  return "other";
}

/**
 * Determine the specific topic of an inquiry call from the transcript.
 */
export function extractInquiryTopic(transcript: string): string {
  const lowerTranscript = transcript.toLowerCase();

  const topicMap: { keywords: string[]; topic: string }[] = [
    { keywords: ["hours", "open", "close", "time"], topic: "hours" },
    {
      keywords: ["location", "address", "where", "directions"],
      topic: "location",
    },
    { keywords: ["halal", "zabiha"], topic: "halal" },
    {
      keywords: ["allergy", "allergen", "sesame", "gluten", "nuts"],
      topic: "allergens",
    },
    { keywords: ["vegetarian", "vegan"], topic: "dietary" },
    { keywords: ["menu", "price", "cost", "how much"], topic: "menu" },
    {
      keywords: ["holiday", "christmas", "thanksgiving", "closed"],
      topic: "holiday_hours",
    },
  ];

  for (const { keywords, topic } of topicMap) {
    if (keywords.some((kw) => lowerTranscript.includes(kw))) {
      return topic;
    }
  }

  return "general";
}

// ---------------------------------------------------------------------------
// Internal helper functions
// ---------------------------------------------------------------------------

function extractQuantityBefore(
  lowerTranscript: string,
  itemNameLower: string
): number {
  const numberWords: Record<string, number> = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  const idx = lowerTranscript.indexOf(itemNameLower);
  if (idx <= 0) return 1;

  const preceding = lowerTranscript
    .substring(Math.max(0, idx - 20), idx)
    .trim();
  const words = preceding.split(/\s+/);
  const lastWord = words[words.length - 1];

  if (/^\d+$/.test(lastWord)) {
    return parseInt(lastWord, 10);
  }

  if (numberWords[lastWord]) {
    return numberWords[lastWord];
  }

  return 1;
}

function extractCustomerName(transcript: string): string | null {
  const patterns = [
    /(?:my name is|name's|this is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:under the name|for)\s+([A-Z][a-z]+)/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractPhoneNumber(transcript: string): string | null {
  const phonePattern =
    /(\+?1?\s*[-.]?\s*\(?\d{3}\)?[-.\s]*\d{3}[-.\s]*\d{4})/;
  const match = transcript.match(phonePattern);
  return match ? match[1].trim() : null;
}

function extractSpecialRequests(transcript: string): string | null {
  const patterns = [
    /(?:special request|special instructions?|can you|could you|please)\s*[:\-]?\s*(.+?)(?:\.|$)/i,
    /(?:no onions|no tomato|extra sauce|extra spicy|mild|no spice|allergic to|gluten free|no nuts)/i,
  ];

  const requests: string[] = [];
  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      requests.push(match[0].trim());
    }
  }

  return requests.length > 0 ? requests.join("; ") : null;
}
