// types/profile.ts

export interface Item {
  _id: string;
  title: string;
  description: string;
  img: string;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  _id: string;
  item: Item; // Referenz auf das Item
  quantity: number; // Anzahl des Items im Inventar
  createdAt: Date;
  updatedAt: Date;
}

export interface Profile {
  _id: string; // Geändert von 'id' zu '_id'
  name: string;
  gold: number;
  exp: number;
  inventory: InventoryItem[]; // Array von InventoryItem-Objekten
  profileImage?: string;
  keys: number; // Anzahl der Keys
  lootboxes: Lootbox[]; // Array von Lootbox-Objekten
  createdAt: Date;
  updatedAt: Date;
}

// types/profile.ts
export interface UpdateProfilePayload {
  _id?: string;
  gold?: number;
  exp?: number;
  profileImage?: string;
  name?: string;
  // Füge die neuen Felder als optionale Eigenschaften hinzu:
  spin?: boolean;
  newCoinItem?: string;
  modifier?: string;
}
