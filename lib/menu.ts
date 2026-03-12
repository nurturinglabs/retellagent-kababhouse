import { MenuItem } from "@/lib/types";

export const MENU_ITEMS: Record<string, MenuItem[]> = {
  plates: [
    {
      id: "beef-shawarma-plate",
      name: "Beef Shawarma Plate",
      price: 24.99,
      description:
        "Marinated beef cooked on rotating spit, served with rice, hummus, grilled tomatoes and onions, and warm pita bread",
      category: "plates",
      customizations: [
        "extra_sauce",
        "no_onions",
        "light_rice",
        "no_hummus",
        "extra_pita",
      ],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "chicken-shawarma-plate",
      name: "Chicken Shawarma Plate",
      price: 23.99,
      description:
        "Tender marinated chicken, served with rice, hummus, grilled tomatoes and onions, and warm pita bread",
      category: "plates",
      customizations: [
        "extra_sauce",
        "no_onions",
        "light_rice",
        "no_hummus",
        "extra_pita",
      ],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "beef-shish-kabob-plate",
      name: "Beef Shish Kabob Plate",
      price: 24.99,
      description:
        "Grilled beef skewers, served with rice, hummus, grilled tomatoes and onions, and warm pita bread",
      category: "plates",
      customizations: [
        "extra_sauce",
        "no_onions",
        "light_rice",
        "no_hummus",
      ],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "chicken-tawook-plate",
      name: "Chicken Tawook Plate",
      price: 23.99,
      description:
        "Grilled chicken tenderloins marinated in yogurt and spices, served with rice, hummus, grilled tomatoes and onions, and warm pita bread",
      category: "plates",
      customizations: [
        "extra_sauce",
        "no_onions",
        "light_rice",
        "no_hummus",
      ],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "mix-grill-plate",
      name: "Mix Grill Plate",
      price: 28.99,
      description:
        "Combination of beef, chicken, and lamb, served with rice, hummus, grilled vegetables, and warm pita bread",
      category: "plates",
      customizations: ["extra_sauce", "no_onions", "light_rice"],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "lamb-kabob-plate",
      name: "Lamb Kabob Plate",
      price: 26.99,
      description:
        "Grilled lamb skewers, served with rice, hummus, grilled tomatoes and onions, and warm pita bread",
      category: "plates",
      customizations: [
        "extra_sauce",
        "no_onions",
        "light_rice",
        "no_hummus",
      ],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "arabi-beef-shawarma-plate",
      name: "Arabi Beef Shawarma Plate",
      price: 19.99,
      description:
        "Authentic Middle Eastern beef preparation, served with rice, hummus, and warm pita bread",
      category: "plates",
      customizations: ["extra_sauce", "no_onions", "light_rice"],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "vegetarian-plate",
      name: "Vegetarian Plate",
      price: 22.99,
      description:
        "Falafel, hummus, tahini, grilled vegetables, rice, salad, and warm pita bread",
      category: "plates",
      customizations: [
        "extra_sauce",
        "no_onions",
        "light_rice",
        "extra_falafel",
      ],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "chicken-kofta-plate",
      name: "Chicken Kofta Plate",
      price: 23.99,
      description:
        "Spiced ground chicken patties, served with rice, hummus, grilled vegetables, and warm pita bread",
      category: "plates",
      customizations: ["extra_sauce", "no_onions", "light_rice"],
      dietary: ["halal"],
      available: true,
    },
  ],

  sandwiches: [
    {
      id: "beef-shawarma-sandwich",
      name: "Beef Shawarma Sandwich",
      price: 12.99,
      description:
        "Sliced beef shawarma with lettuce, tomato, and garlic sauce on warm pita",
      category: "sandwiches",
      customizations: [
        "extra_sauce",
        "no_lettuce",
        "no_tomato",
        "extra_meat",
      ],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "chicken-shawarma-sandwich",
      name: "Chicken Shawarma Sandwich",
      price: 12.99,
      description:
        "Sliced chicken shawarma with lettuce, tomato, and garlic sauce on warm pita",
      category: "sandwiches",
      customizations: [
        "extra_sauce",
        "no_lettuce",
        "no_tomato",
        "extra_meat",
      ],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "beef-shish-kabob-sandwich",
      name: "Beef Shish Kabob Sandwich",
      price: 14.99,
      description:
        "Grilled beef skewers with lettuce, tomato, onion, and tahini on warm pita",
      category: "sandwiches",
      customizations: ["extra_sauce", "no_lettuce", "no_onion"],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "chicken-tawook-sandwich",
      name: "Chicken Tawook Sandwich",
      price: 12.99,
      description:
        "Grilled chicken tenderloins with lettuce, tomato, and garlic sauce on warm pita",
      category: "sandwiches",
      customizations: ["extra_sauce", "no_lettuce", "no_tomato"],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "falafel-sandwich",
      name: "Falafel Sandwich",
      price: 10.99,
      description:
        "Crispy chickpea patties with lettuce, tomato, tahini sauce, and hummus on warm pita",
      category: "sandwiches",
      customizations: ["extra_sauce", "no_lettuce", "extra_falafel"],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "chicken-kofta-sandwich",
      name: "Chicken Kofta Sandwich",
      price: 12.99,
      description:
        "Spiced ground chicken with lettuce, tomato, onion, and garlic sauce on warm pita",
      category: "sandwiches",
      customizations: ["extra_sauce", "no_lettuce", "no_onion"],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "lamb-kabob-sandwich",
      name: "Lamb Kabob Sandwich",
      price: 14.99,
      description:
        "Grilled lamb skewers with lettuce, tomato, onion, and tahini on warm pita",
      category: "sandwiches",
      customizations: ["extra_sauce", "no_lettuce", "no_onion"],
      dietary: ["halal"],
      available: true,
    },
  ],

  appetizers: [
    {
      id: "hummus",
      name: "Hummus",
      price: 9.99,
      description: "Creamy chickpea dip with tahini and lemon",
      category: "appetizers",
      customizations: ["extra_pita"],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "baba-ghanoush",
      name: "Baba Ghanoush",
      price: 9.99,
      description: "Roasted eggplant dip with tahini",
      category: "appetizers",
      customizations: ["extra_pita"],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "tabbouleh-salad",
      name: "Tabbouleh Salad",
      price: 9.99,
      description:
        "Parsley salad with bulgur, tomato, olive oil, and lemon",
      category: "appetizers",
      customizations: [],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "falafel-12",
      name: "Falafel (12 pieces)",
      price: 9.99,
      description: "Crispy fried chickpea patties",
      category: "appetizers",
      customizations: ["with_tahini"],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "kubbeh",
      name: "Kubbeh (1 piece)",
      price: 4.49,
      description: "Meat-filled pastry dumpling",
      category: "appetizers",
      customizations: [],
      dietary: ["halal"],
      available: true,
    },
    {
      id: "garlic-sauce",
      name: "Garlic Sauce (container)",
      price: 2.99,
      description: "House garlic and mayo sauce",
      category: "appetizers",
      customizations: [],
      dietary: [],
      available: true,
    },
    {
      id: "tahini-sauce",
      name: "Tahini Sauce (container)",
      price: 2.99,
      description: "Creamy sesame seed sauce",
      category: "appetizers",
      customizations: [],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "fries-small",
      name: "Fries (Small)",
      price: 4.49,
      description: "Seasoned French fries",
      category: "appetizers",
      customizations: [],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "fries-large",
      name: "Fries (Large)",
      price: 6.99,
      description: "Large portion seasoned fries",
      category: "appetizers",
      customizations: [],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "lentil-soup",
      name: "Lentil Soup",
      price: 4.49,
      description: "Traditional Middle Eastern lentil soup",
      category: "appetizers",
      customizations: [],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
    {
      id: "rice-side",
      name: "Rice (side)",
      price: 3.99,
      description: "Jasmine rice",
      category: "appetizers",
      customizations: [],
      dietary: ["vegetarian", "vegan"],
      available: true,
    },
  ],

  desserts: [
    {
      id: "baklava",
      name: "Baklava",
      price: 4.99,
      description: "Phyllo pastry with honey and pistachios",
      category: "desserts",
      customizations: [],
      dietary: ["vegetarian"],
      available: true,
    },
  ],
};

/**
 * Search for a menu item by name (case-insensitive with partial matching).
 * For example, "beef shawarma" will match "Beef Shawarma Plate".
 */
// Common spoken aliases → canonical menu item name or id.
// Covers alternate spellings, abbreviations, and casual phrasing customers
// are likely to use over the phone.
export const ALIASES: Record<string, string> = {
  // ── Fries (no bare "fries" — agent always asks for size) ────────────────
  "small french fries": "fries (small)",
  "small fries": "fries (small)",
  "french fries": "fries (small)",
  "french fry": "fries (small)",
  "large french fries": "fries (large)",
  "large fries": "fries (large)",
  "big fries": "fries (large)",

  // ── Rice ────────────────────────────────────────────────────────────────
  "rice": "rice (side)",
  "side of rice": "rice (side)",
  "side rice": "rice (side)",
  "jasmine rice": "rice (side)",
  "white rice": "rice (side)",

  // ── Sauces ──────────────────────────────────────────────────────────────
  "tahini": "tahini sauce (container)",
  "tahini sauce": "tahini sauce (container)",
  "garlic sauce": "garlic sauce (container)",
  "garlic dip": "garlic sauce (container)",
  "toum": "garlic sauce (container)",

  // ── Shawarma spelling variants (incl. common mispronunciations) ─────────
  "beef shawarma": "beef shawarma plate",
  "chicken shawarma": "chicken shawarma plate",
  "beef shwarma": "beef shawarma plate",
  "chicken shwarma": "chicken shawarma plate",
  "beef shirmer": "beef shawarma plate",
  "chicken shirmer": "chicken shawarma plate",
  "beef sharma": "beef shawarma plate",
  "chicken sharma": "chicken shawarma plate",
  "beef shwarmer": "beef shawarma plate",
  "chicken shwarmer": "chicken shawarma plate",
  "beef shawerma": "beef shawarma plate",
  "chicken shawerma": "chicken shawarma plate",
  "beef shawirma": "beef shawarma plate",
  "chicken shawirma": "chicken shawarma plate",
  // NOTE: no bare "shawarma plate" / "shawarma sandwich" alias — too ambiguous
  // when the transcript already specifies "beef shawarma plate" etc.
  "arabi shawarma": "arabi beef shawarma plate",
  "arabi beef": "arabi beef shawarma plate",
  "arabi beef shawarma": "arabi beef shawarma plate",

  // ── Kabob / kebab spelling variants ─────────────────────────────────────
  "beef kebab": "beef shish kabob plate",
  "beef kebab plate": "beef shish kabob plate",
  "beef kabob": "beef shish kabob plate",
  "shish kebab": "beef shish kabob plate",
  "shish kabob": "beef shish kabob plate",
  "beef shish kebab": "beef shish kabob plate",
  "lamb kebab": "lamb kabob plate",
  "lamb kebab plate": "lamb kabob plate",
  "lamb kabob": "lamb kabob plate",
  "beef kebab sandwich": "beef shish kabob sandwich",
  "beef kabob sandwich": "beef shish kabob sandwich",
  "shish kebab sandwich": "beef shish kabob sandwich",
  "lamb kebab sandwich": "lamb kabob sandwich",
  "lamb kabob sandwich": "lamb kabob sandwich",

  // ── Tawook / taouk / tavuk ─────────────────────────────────────────────
  "chicken taouk": "chicken tawook plate",
  "chicken taouk plate": "chicken tawook plate",
  "chicken tavuk": "chicken tawook plate",
  "tawook": "chicken tawook plate",
  "taouk": "chicken tawook plate",
  "tawook plate": "chicken tawook plate",
  "chicken taouk sandwich": "chicken tawook sandwich",
  "chicken tavuk sandwich": "chicken tawook sandwich",
  "tawook sandwich": "chicken tawook sandwich",

  // ── Kofta / kafta / kofte ──────────────────────────────────────────────
  "chicken kafta": "chicken kofta plate",
  "chicken kafta plate": "chicken kofta plate",
  "chicken kofte": "chicken kofta plate",
  "kofta": "chicken kofta plate",
  "kafta": "chicken kofta plate",
  "kofte": "chicken kofta plate",
  "kofta plate": "chicken kofta plate",
  "chicken kafta sandwich": "chicken kofta sandwich",
  "chicken kofte sandwich": "chicken kofta sandwich",
  "kofta sandwich": "chicken kofta sandwich",
  "kafta sandwich": "chicken kofta sandwich",

  // ── Mix(ed) Grill ──────────────────────────────────────────────────────
  "mixed grill": "mix grill plate",
  "mixed grill plate": "mix grill plate",
  "mix grill": "mix grill plate",
  "combo plate": "mix grill plate",
  "combo grill": "mix grill plate",

  // ── Vegetarian ─────────────────────────────────────────────────────────
  "veggie plate": "vegetarian plate",
  "veg plate": "vegetarian plate",
  "vegetable plate": "vegetarian plate",

  // ── Falafel ────────────────────────────────────────────────────────────
  "falafel": "falafel (12 pieces)",
  "falafels": "falafel (12 pieces)",
  "falafel pieces": "falafel (12 pieces)",
  "falafel wrap": "falafel sandwich",

  // ── Kubbeh / kibbeh ────────────────────────────────────────────────────
  "kubbeh": "kubbeh (1 piece)",
  "kibbeh": "kubbeh (1 piece)",
  "kibbe": "kubbeh (1 piece)",
  "kubba": "kubbeh (1 piece)",

  // ── Baba Ghanoush spelling variants ────────────────────────────────────
  "baba ganoush": "baba ghanoush",
  "baba ganush": "baba ghanoush",
  "babaganoush": "baba ghanoush",
  "baba ghanouj": "baba ghanoush",

  // ── Tabbouleh spelling variants ────────────────────────────────────────
  "tabouli": "tabbouleh salad",
  "tabouleh": "tabbouleh salad",
  "taboule": "tabbouleh salad",
  "tabbouleh": "tabbouleh salad",

  // ── Hummus ─────────────────────────────────────────────────────────────
  "hummus dip": "hummus",
  "hommus": "hummus",
  "humus": "hummus",

  // ── Wrap → Sandwich alias ──────────────────────────────────────────────
  "beef shawarma wrap": "beef shawarma sandwich",
  "chicken shawarma wrap": "chicken shawarma sandwich",
  "chicken tawook wrap": "chicken tawook sandwich",
  "lamb kabob wrap": "lamb kabob sandwich",
  "beef kabob wrap": "beef shish kabob sandwich",
  "chicken kofta wrap": "chicken kofta sandwich",
};

export function getMenuItem(name: string): MenuItem | undefined {
  const allItems = getAllItems();
  let searchTerm = name.toLowerCase().trim();

  // Check aliases first — map common spoken names to canonical names
  if (ALIASES[searchTerm]) {
    searchTerm = ALIASES[searchTerm];
  }

  // Try exact match first (case-insensitive)
  const exactMatch = allItems.find(
    (item) => item.name.toLowerCase() === searchTerm
  );
  if (exactMatch) return exactMatch;

  // Try matching by id
  const idMatch = allItems.find(
    (item) => item.id.toLowerCase() === searchTerm
  );
  if (idMatch) return idMatch;

  // Try partial match - search term is contained in the item name
  const partialMatch = allItems.find((item) =>
    item.name.toLowerCase().includes(searchTerm)
  );
  if (partialMatch) return partialMatch;

  // Try partial match - item name words are contained in the search term
  const reversePartialMatch = allItems.find((item) => {
    const itemWords = item.name
      .toLowerCase()
      .replace(/[()]/g, "")
      .split(/\s+/);
    const searchWords = searchTerm.split(/\s+/);
    // Check if all search words appear in the item name
    return searchWords.every((word) =>
      itemWords.some((itemWord) => itemWord.includes(word))
    );
  });
  if (reversePartialMatch) return reversePartialMatch;

  // Try alias-style match: strip common prefixes and try again
  const stripped = searchTerm
    .replace(/^(french|side of|a|an|the|order of|some)\s+/i, "")
    .trim();
  if (stripped !== searchTerm) {
    const strippedMatch = allItems.find((item) =>
      item.name.toLowerCase().includes(stripped)
    );
    if (strippedMatch) return strippedMatch;
  }

  return undefined;
}

/**
 * Validate whether a customization is valid for a given menu item.
 */
export function validateCustomization(
  itemId: string,
  customization: string
): boolean {
  const allItems = getAllItems();
  const item = allItems.find((i) => i.id === itemId);
  if (!item) return false;
  return item.customizations.includes(customization);
}

/**
 * Get all menu items across all categories as a flat array.
 */
export function getAllItems(): MenuItem[] {
  return Object.values(MENU_ITEMS).flat();
}

/**
 * Get all menu items in a specific category.
 */
export function getItemsByCategory(category: string): MenuItem[] {
  return MENU_ITEMS[category] || [];
}

/**
 * Get all currently available menu items.
 */
export function getAvailableItems(): MenuItem[] {
  return getAllItems().filter((item) => item.available);
}

/**
 * Set the availability of a menu item by its id.
 * Returns true if the item was found and updated, false otherwise.
 */
export function setItemAvailability(
  itemId: string,
  available: boolean
): boolean {
  for (const category of Object.values(MENU_ITEMS)) {
    const item = category.find((i) => i.id === itemId);
    if (item) {
      item.available = available;
      return true;
    }
  }
  return false;
}
