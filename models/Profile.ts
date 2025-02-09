// models/Profile.ts
import { Schema, model, models, Document } from "mongoose";
import { IInventoryItem } from "./InventoryItem";
// IMPORTANT: ensure that InventoryItem.ts is imported here
import "./InventoryItem";

export interface IProfile extends Document {
  name: string;
  gold: number;
  exp: number;
  inventory: Schema.Types.ObjectId[] | IInventoryItem[];
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    name: { type: String, required: true },
    gold: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    inventory: [{ type: Schema.Types.ObjectId, ref: "InventoryItem" }],
    profileImage: { type: String },
  },
  { timestamps: true }
);

export default models.Profile || model<IProfile>("Profile", ProfileSchema);
