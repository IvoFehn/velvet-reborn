// models/Lootbox.ts
import { Schema, model, models, Document } from "mongoose";

export type LootboxType =
  | "Normal"
  | "Event"
  | "Premium Lootbox"
  | "Rare Lootbox"
  | "Legendary Lootbox";

export interface ILootbox extends Document {
  _id: Schema.Types.ObjectId;
  name?: string; // Optional
  type: LootboxType;
  img: string;
  createdAt: Date;
  updatedAt: Date;
}

const LootboxSchema = new Schema<ILootbox>(
  {
    name: { type: String }, // Kein required mehr
    type: {
      type: String,
      enum: [
        "Normal",
        "Event",
        "Premium Lootbox",
        "Rare Lootbox",
        "Legendary Lootbox",
      ],
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Lootbox || model<ILootbox>("Lootbox", LootboxSchema);
