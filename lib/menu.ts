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
export function getMenuItem(name: string): MenuItem | undefined {
  const allItems = getAllItems();
  const searchTerm = name.toLowerCase().trim();

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
