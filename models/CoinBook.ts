/* eslint-disable @typescript-eslint/no-explicit-any */
// models/CoinBook.ts
import { Schema, model, models, Document, Types } from "mongoose";
import CoinItem, { ICoinItem } from "./CoinItem";

export interface ICoinBookEntry {
  coinItem: Types.ObjectId | ICoinItem;
  quantity: number;
}

export interface ICoinBook extends Document {
  user: Types.ObjectId; // statt Schema.Types.ObjectId
  entries: ICoinBookEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const CoinBookEntrySchema = new Schema<ICoinBookEntry>(
  {
    coinItem: { type: Schema.Types.ObjectId, ref: "CoinItem", required: true },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: async function (value: number): Promise<boolean> {
          const coinItemDoc = await CoinItem.findById(this.coinItem);
          if (!coinItemDoc) return false;
          return value <= coinItemDoc.neededAmount;
        },
        message: (props: any) =>
          `Die Anzahl (${props.value}) überschreitet den maximalen Wert für dieses CoinItem!`,
      },
    },
  },
  { _id: false }
);

const CoinBookSchema = new Schema<ICoinBook>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    entries: [CoinBookEntrySchema],
  },
  {
    timestamps: true,
    collection: "coinbooks",
  }
);

export default models.CoinBook || model<ICoinBook>("CoinBook", CoinBookSchema);
