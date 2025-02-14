import { Schema, model, models, Document } from "mongoose";

// Definiere die 5 Rarity-Stufen als Enum
export type RarityType = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface ICoinItem extends Document {
  _id: string; // explizit das _id-Feld hinzufügen
  name: string;
  description: string;
  color: string;
  rarity: RarityType;
  neededAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CoinItemSchema = new Schema<ICoinItem>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    color: { type: String, required: true },
    rarity: {
      type: String,
      enum: ["Common", "Uncommon", "Rare", "Epic", "Legendary"],
      required: true,
    },
    neededAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default models.CoinItem || model<ICoinItem>("CoinItem", CoinItemSchema);
