import Retell from "retell-sdk";
import { getAllItems, getMenuItem } from "@/lib/menu";

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

  // Extract only user utterances and the agent's final confirmation line.
  // This avoids false matches from menu descriptions and clarifying questions.
  const orderRelevantText = extractOrderRelevantLines(transcript);
  const lowerText = orderRelevantText.toLowerCase();

  const menuItems = getAllItems();
  const foundItems: { name: string; quantity: number }[] = [];
  const seenIds = new Set<string>();

  // 1. Direct menu name matching against relevant transcript text
  for (const item of menuItems) {
    const itemNameLower = item.name.toLowerCase();
    if (lowerText.includes(itemNameLower) && !seenIds.has(item.id)) {
      const quantity = extractQuantityBefore(lowerText, itemNameLower);
      foundItems.push({ name: item.name, quantity });
      seenIds.add(item.id);
    }
  }

  // 2. Alias-based matching: find spoken phrases in user lines that map
  //    to menu items via getMenuItem (which handles aliases like
  //    "large fries" → "Fries (Large)", "french fries" → "Fries (Small)")
  const spokenPhrases = extractSpokenItemPhrases(orderRelevantText);
  for (const phrase of spokenPhrases) {
    const menuItem = getMenuItem(phrase.name);
    if (menuItem && !seenIds.has(menuItem.id)) {
      foundItems.push({ name: menuItem.name, quantity: phrase.quantity });
      seenIds.add(menuItem.id);
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
 * Pull out only the lines relevant for item extraction:
 *  - All "User:" lines (what the customer actually asked for)
 *  - Agent lines that are order confirmations / summaries
 *    (contain phrases like "so that's", "to confirm", "your order", "your total")
 *
 * This prevents false matches from agent descriptions like
 * "The Chicken Shawarma Plate comes with rice, hummus, and grilled veggies".
 */
function extractOrderRelevantLines(transcript: string): string {
  const lines = transcript.split("\n");
  const relevant: string[] = [];

  // Only match agent lines that are definitive confirmations, not questions
  const confirmationPatterns = [
    /(?:so that'?s|to confirm|your order|your total|order all set|so we have|just to confirm).*(?:\.|!)/i,
  ];

  // Exclude agent lines that are questions or suggestions
  const questionPatterns = [
    /\?/,
    /did you mean/i,
    /was that/i,
    /would you like/i,
    /do you want/i,
    /how about/i,
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Always include user lines
    if (trimmed.startsWith("User:")) {
      relevant.push(trimmed);
      continue;
    }

    // Include agent lines only if they're definitive confirmations (not questions)
    if (trimmed.startsWith("Agent:")) {
      const isConfirmation = confirmationPatterns.some((p) => p.test(trimmed));
      const isQuestion = questionPatterns.some((p) => p.test(trimmed));
      if (isConfirmation && !isQuestion) {
        relevant.push(trimmed);
      }
    }
  }

  return relevant.join("\n");
}

/**
 * Extract likely item phrases from user lines for alias-based matching.
 * Looks for patterns like "one large fries", "a chicken shawarma", "french fries", etc.
 */
function extractSpokenItemPhrases(
  relevantText: string
): { name: string; quantity: number }[] {
  const results: { name: string; quantity: number }[] = [];

  // Only process user lines
  const userLines = relevantText
    .split("\n")
    .filter((l) => l.trim().startsWith("User:"))
    .map((l) => l.replace(/^User:\s*/i, "").toLowerCase());

  const text = userLines.join(" ");

  // Match patterns like "one/two/1/2 <item phrase>" or bare item phrases
  const quantityPattern =
    /(?:(?:(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+)?)((?:large|small|big|french|mixed|side of|chicken|beef|lamb|veggie|vegetarian|falafel)\s+\w+(?:\s+\w+)?)/gi;

  const numberWords: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };

  let match;
  while ((match = quantityPattern.exec(text)) !== null) {
    const qtyStr = match[1]?.toLowerCase();
    const itemPhrase = match[2].trim();
    const quantity = qtyStr
      ? /^\d+$/.test(qtyStr)
        ? parseInt(qtyStr, 10)
        : numberWords[qtyStr] || 1
      : 1;
    results.push({ name: itemPhrase, quantity });
  }

  return results;
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
