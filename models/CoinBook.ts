/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, models, Document } from "mongoose";
import CoinItem, { ICoinItem } from "./CoinItem";

export interface ICoinBookEntry {
  coinItem: Schema.Types.ObjectId | ICoinItem;
  quantity: number;
}

export interface ICoinBook extends Document {
  user: Schema.Types.ObjectId; // Verweis auf den Benutzer (z. B. Profile)
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
      // Asynchroner Validator: Die Anzahl darf den Wert von coinItem.neededAmount nicht überschreiten.
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
  { _id: false } // _id für Unterdokumente deaktivieren, falls nicht benötigt
);

const CoinBookSchema = new Schema<ICoinBook>(
  {
    user: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
    entries: [CoinBookEntrySchema],
  },
  { timestamps: true }
);

export default models.CoinBook || model<ICoinBook>("CoinBook", CoinBookSchema);
