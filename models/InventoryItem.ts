// models/InventoryItem.ts
import { Schema, model, models, Document } from "mongoose";
import { IItem } from "./Item";

export interface IInventoryItem extends Document {
  item: Schema.Types.ObjectId | IItem;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default models.InventoryItem ||
  model<IInventoryItem>("InventoryItem", InventoryItemSchema);
