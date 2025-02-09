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
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfilePayload {
  id: string; // Verwendung von '_id' im Payload
  name?: string;
  gold?: number;
  exp?: number;
  inventory?: string[];
  profileImage?: string;
}
