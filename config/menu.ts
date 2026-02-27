// Re-export menu from lib for config access
export { MENU_ITEMS, getAllItems, getItemsByCategory, getAvailableItems } from "@/lib/menu";

// Allergen quick reference
export const ALLERGEN_INFO: Record<
  string,
  { avoid: string[]; safe: string[] }
> = {
  sesame: {
    avoid: ["Hummus", "Baba Ghanoush", "Tahini Sauce"],
    safe: [
      "All grilled meat plates (request salad instead of hummus)",
      "All sandwiches without tahini",
      "Fries",
      "Rice",
      "Lentil Soup",
    ],
  },
  wheat: {
    avoid: ["All pita bread", "Some sauces"],
    safe: [
      "Plates without pita (rice-based)",
      "Hummus",
      "Baba Ghanoush",
      "Fries",
    ],
  },
  nuts: {
    avoid: ["Baklava (contains pistachios)"],
    safe: ["All other menu items are nut-free"],
  },
  chickpeas: {
    avoid: ["Falafel", "Hummus", "Tabbouleh"],
    safe: ["All meat plates", "Shawarma sandwiches", "Rice", "Fries"],
  },
  dairy: {
    avoid: ["Some marinades may contain yogurt"],
    safe: ["Ask staff for confirmation on specific items"],
  },
};

// Dietary categories
export const DIETARY_OPTIONS = {
  vegetarian: [
    "Vegetarian Plate",
    "Falafel Sandwich",
    "Hummus",
    "Baba Ghanoush",
    "Tabbouleh Salad",
    "Falafel (12 pieces)",
    "Fries (Small)",
    "Fries (Large)",
    "Lentil Soup",
    "Rice (side)",
    "Baklava",
  ],
  vegan: [
    "Vegetarian Plate",
    "Falafel Sandwich",
    "Hummus",
    "Baba Ghanoush",
    "Tabbouleh Salad",
    "Falafel (12 pieces)",
    "Fries (Small)",
    "Fries (Large)",
    "Lentil Soup",
    "Rice (side)",
  ],
  halal: [
    "All meat items are 100% Zabiha Halal certified",
  ],
};
