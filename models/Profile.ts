import { Schema, model, models, Document } from "mongoose";

// Importiere InventoryItem als Seiteneffekt, damit das Modell registriert wird
import "./InventoryItem";
import "./Lootbox";
import { IInventoryItem } from "./InventoryItem";
import { ILootbox } from "./Lootbox";

// types/profile.ts
export interface UpdateProfilePayload {
  gold?: number;
  exp?: number;
  profileImage?: string;
  name?: string;
  // Füge die neuen Felder als optionale Eigenschaften hinzu:
  spin?: boolean;
  newCoinItem?: string;
  modifier?: string;
}

export interface IProfile extends Document {
  name: string;
  gold: number;
  exp: number;
  level: number;
  email?: string;
  streakCount: number;
  lastLogin?: Date;
  inventory: Array<Schema.Types.ObjectId | IInventoryItem>;
  keys: number;
  // lootboxes enthält jetzt Objekte mit Verweis und Menge
  lootboxes: {
    lootbox: ILootbox;
    quantity: number;
  }[];
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    gold: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    email: { type: String },
    streakCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
    inventory: [{ type: Schema.Types.ObjectId, ref: "InventoryItem" }],
    keys: { type: Number, default: 0 },
    lootboxes: [
      {
        lootbox: { type: Schema.Types.ObjectId, ref: "Lootbox" },
        quantity: { type: Number, default: 1 },
      },
    ],
    profileImage: { type: String },
  },
  { timestamps: true }
);

// Add indexes for performance
ProfileSchema.index({ name: 1 });
ProfileSchema.index({ gold: -1 });
ProfileSchema.index({ exp: -1 });
ProfileSchema.index({ level: -1 });

export default models.Profile || model<IProfile>("Profile", ProfileSchema);
