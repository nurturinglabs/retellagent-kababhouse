import Retell from "retell-sdk";
import { getAllItems, getMenuItem, ALIASES } from "@/lib/menu";

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

  // Helper: derive a "family" key from a menu item id so that protein
  // variants, size variants, and plate/sandwich variants don't all match.
  // e.g. "beef-shawarma-plate" → "shawarma"
  //      "chicken-shawarma-sandwich" → "shawarma"
  //      "fries-small" → "fries"
  function familyKey(id: string): string {
    return id
      .replace(/^(beef|chicken|lamb|arabi)-/, "")
      .replace(/-(plate|sandwich|wrap|small|large|side|\d+)$/, "");
  }

  // Track item "families" so e.g. matching "Chicken Shawarma Sandwich"
  // blocks "Chicken Shawarma Plate" and "Beef Shawarma Plate".
  const seenFamilies = new Set<string>();

  // Collect matched text spans so aliases that are substrings of already-
  // matched full item names are skipped (e.g. "chicken shawarma" inside
  // "chicken shawarma sandwich").
  const matchedSpans: { start: number; end: number }[] = [];

  // 1. Direct menu name matching against relevant transcript text
  for (const item of menuItems) {
    const itemNameLower = item.name.toLowerCase();
    const idx = lowerText.indexOf(itemNameLower);
    if (idx !== -1 && !seenIds.has(item.id)) {
      const family = familyKey(item.id);
      if (seenFamilies.has(family)) continue;
      const quantity = extractQuantityBefore(lowerText, itemNameLower);
      foundItems.push({ name: item.name, quantity });
      seenIds.add(item.id);
      seenFamilies.add(family);
      matchedSpans.push({ start: idx, end: idx + itemNameLower.length });
    }
  }

  // Helper: check if an alias match is entirely within an already-matched span
  function isInsideMatchedSpan(aliasStart: number, aliasEnd: number): boolean {
    return matchedSpans.some(
      (span) => aliasStart >= span.start && aliasEnd <= span.end
    );
  }

  // 2. Alias-based matching: scan the relevant text for every known alias
  //    (e.g. "garlic sauce", "french fries", "chicken shirmer") and resolve
  //    them to actual menu items via getMenuItem.
  //    Sort longest-first so "large fries" matches before "french fries".
  const sortedAliases = Object.keys(ALIASES).sort(
    (a, b) => b.length - a.length
  );
  for (const aliasKey of sortedAliases) {
    const aliasIdx = lowerText.indexOf(aliasKey);
    if (aliasIdx !== -1) {
      // Skip if this alias text is fully inside an already-matched item name
      if (isInsideMatchedSpan(aliasIdx, aliasIdx + aliasKey.length)) continue;

      const menuItem = getMenuItem(aliasKey);
      if (menuItem && !seenIds.has(menuItem.id)) {
        const family = familyKey(menuItem.id);
        if (seenFamilies.has(family)) continue; // skip variants
        const quantity = extractQuantityBefore(lowerText, aliasKey);
        foundItems.push({ name: menuItem.name, quantity });
        seenIds.add(menuItem.id);
        seenFamilies.add(family);
      }
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

  const confirmationKeywords = [
    /so that'?s/i,
    /to confirm/i,
    /your order/i,
    /your total/i,
    /order all set/i,
    /so we have/i,
    /just to confirm/i,
    /order is all set/i,
    /order'?s all set/i,
  ];

  // Lines that are purely questions/suggestions with no confirmation value
  const pureQuestionPatterns = [
    /did you mean/i,
    /was that the/i,
    /would you like/i,
    /do you want/i,
    /how about/i,
    /which one/i,
  ];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Always include user lines
    if (trimmed.startsWith("User:")) {
      relevant.push(trimmed);
      continue;
    }

    // For agent lines: include confirmations, but strip trailing questions
    if (trimmed.startsWith("Agent:")) {
      // Skip lines that are purely questions/suggestions
      if (pureQuestionPatterns.some((p) => p.test(trimmed))) {
        continue;
      }

      const isConfirmation = confirmationKeywords.some((p) => p.test(trimmed));
      if (isConfirmation) {
        // If the line also contains a trailing question, keep only
        // the text before the last "?" to avoid question-only fragments
        // e.g. "Just to confirm: Chicken Plate, Fries. Does that work?"
        //    → "Just to confirm: Chicken Plate, Fries."
        const lastQ = trimmed.lastIndexOf("?");
        if (lastQ > 0) {
          // Find the start of the trailing question sentence
          const beforeQ = trimmed.substring(0, lastQ);
          const lastSentenceEnd = Math.max(
            beforeQ.lastIndexOf("."),
            beforeQ.lastIndexOf("!")
          );
          if (lastSentenceEnd > 0) {
            relevant.push(trimmed.substring(0, lastSentenceEnd + 1));
          } else {
            // No sentence boundary found — include the whole thing up to "?"
            relevant.push(beforeQ);
          }
        } else {
          relevant.push(trimmed);
        }
      }
    }
  }

  return relevant.join("\n");
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
  // Strategy: prioritize the agent's confirmation of the name (most reliable),
  // then fall back to user self-identification patterns.
  // Only search user lines for self-ID and agent lines for confirmations
  // to avoid false matches from agent greetings / descriptions.

  const lines = transcript.split("\n");
  const userLines = lines.filter((l) => l.trim().startsWith("User:")).join("\n");
  const agentLines = lines.filter((l) => l.trim().startsWith("Agent:")).join("\n");

  // 1. Best signal: agent addressing user by name in confirmation
  //    e.g. "Great, Even!" or "Thanks Anthony!" or "Got it, Mark!"
  const agentNamePatterns = [
    /(?:Great|Thanks|Thank you|Awesome|Got it|Perfect),?\s+([A-Z][a-z]+)[!.]/gi,
    /under the name\s+([A-Z][a-z]+)/gi,
    /(?:Can I get your name|what's your name|your name)\b.*?\n\s*(?:User:\s*)([A-Z][a-z]+)/gi,
  ];

  // Collect all agent-confirmed name candidates and pick the most frequent
  const agentCandidates: string[] = [];
  for (const pattern of agentNamePatterns) {
    let m;
    while ((m = pattern.exec(agentLines)) !== null) {
      const candidate = m[1].trim();
      if (isPlausibleName(candidate)) {
        agentCandidates.push(candidate);
      }
    }
  }

  if (agentCandidates.length > 0) {
    // Return the most frequently mentioned name
    const freq = new Map<string, number>();
    for (const c of agentCandidates) {
      freq.set(c, (freq.get(c) || 0) + 1);
    }
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  // 2. Context-based: find where agent asks for the name, then grab the
  //    user's next response. Handles cases where user just says "Mark." or "Anthony."
  const trimmedLines = lines.map((l) => l.trim());
  const namePromptPatterns = [
    /your name/i,
    /can i get (?:a|your) name/i,
    /what(?:'s| is) your name/i,
    /who(?:'s| is) this/i,
    /name (?:for|on) the order/i,
  ];

  for (let i = 0; i < trimmedLines.length; i++) {
    if (trimmedLines[i].startsWith("Agent:") &&
        namePromptPatterns.some((p) => p.test(trimmedLines[i]))) {
      // Look at the next user line(s) after this agent prompt
      for (let j = i + 1; j < trimmedLines.length && j <= i + 3; j++) {
        if (trimmedLines[j].startsWith("User:")) {
          const response = trimmedLines[j].replace(/^User:\s*/i, "").trim();
          // Extract first capitalized word(s) — the name
          const nameMatch = response.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
          if (nameMatch && isPlausibleName(nameMatch[1])) {
            return nameMatch[1];
          }
          // Also try if the whole response is just a word (lowercase from STT)
          const singleWord = response.replace(/[.!?,]/g, "").trim();
          if (/^[a-zA-Z]+$/.test(singleWord) && singleWord.length >= 2 &&
              singleWord.length <= 20 && isPlausibleName(singleWord)) {
            return singleWord.charAt(0).toUpperCase() + singleWord.slice(1);
          }
        }
        // Stop if agent speaks again (name window is over)
        if (trimmedLines[j].startsWith("Agent:")) break;
      }
    }
  }

  // 3. Fallback: user self-identification in user lines only
  const userPatterns = [
    /(?:my name is|name's|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ];

  for (const pattern of userPatterns) {
    const match = userLines.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (isPlausibleName(candidate)) return candidate;
    }
  }

  return null;
}

/** Check if a word looks like a real name (not a common English word). */
function isPlausibleName(word: string): boolean {
  const notNames = new Set([
    "here", "ready", "looking", "calling", "interested", "trying",
    "going", "just", "also", "not", "good", "fine", "done", "back",
    "waiting", "ordering", "wondering", "sure", "sorry", "happy",
    "authentic", "middle", "eastern", "welcome", "home", "today",
    "perfect", "great", "awesome", "right", "pickup", "delivery",
  ]);
  return !notNames.has(word.toLowerCase().split(/\s+/)[0]);
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
