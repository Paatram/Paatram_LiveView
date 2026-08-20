export type ProductRecord = {
  id: string;
  name: string;
  pricePaise: number;
  material: string;
  size: string;
  care: string;
  imageUrl: string;
  available: boolean;
  sortOrder: number;
};

export const seedProducts: ProductRecord[] = [
  { id: "kansa-serving-bowl", name: "Kansa Serving Bowl", pricePaise: 245000, material: "Hand-finished bell metal", size: "22 cm × 8 cm", care: "Hand wash with mild soap. Dry immediately.", imageUrl: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 1 },
  { id: "terracotta-carafe", name: "Terracotta Carafe", pricePaise: 128000, material: "Naturally cooled, unglazed clay", size: "1.2 L", care: "Rinse and air dry after use.", imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 2 },
  { id: "stoneware-dinner-plate", name: "Stoneware Dinner Plate", pricePaise: 89000, material: "Speckled glaze, wheel-thrown", size: "27 cm", care: "Dishwasher safe on a gentle cycle.", imageUrl: "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 3 },
  { id: "hammered-brass-katori", name: "Hammered Brass Katori", pricePaise: 75000, material: "Food-safe, hand-hammered brass", size: "11 cm × 5 cm", care: "Hand wash and dry immediately.", imageUrl: "https://images.unsplash.com/photo-1603199506016-b9a594b593c0?auto=format&fit=crop&w=900&q=85", available: true, sortOrder: 4 },
];
