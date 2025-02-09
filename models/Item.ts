// models/Item.ts
import { Schema, model, models, Document } from "mongoose";

export interface IItem extends Document {
  title: string;
  description: string;
  img: string;
  price: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    img: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export default models.Item || model<IItem>("Item", ItemSchema);
