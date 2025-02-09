// models/News.ts
import mongoose, { Document, Schema, Model, models } from "mongoose";

/** Rating scale from 1 to 5 */
export type Rating = 1 | 2 | 3 | 4 | 5;

/** News-Typen */
export type NewsType = "general" | "review";

/** Dokumenttyp – beinhaltet auch Mongoose-spezifische Felder */
export interface INews extends Document {
  title: string;
  message: string;
  createdAt: Date;
  type: NewsType;
  seen: boolean;
}

/** Erweiterung für Reviews */
export interface INewsReview extends INews {
  obedience: Rating;
  didSquirt: boolean;
  vibeDuringSex: Rating;
  vibeAfterSex: Rating;
  orgasmIntensity: Rating;
  painlessness: Rating;
  wasAnal: boolean;
  ballsWorshipping: Rating;
  cumWorshipping: Rating;
  didEverythingForHisPleasure: Rating;
  bestMoment?: string;
  improvementSuggestion: string;
  additionalNotes: string;
}

/** Interface für die Eingabedaten beim Erstellen eines News-Eintrags */
export interface INewsInput {
  title: string;
  message: string;
  createdAt?: string; // Optional – falls nicht angegeben, kann der Default genutzt werden
  type: NewsType;
  seen?: boolean;
  // Felder für Reviews (optional, nur bei type === "review" erforderlich)
  obedience?: Rating;
  didSquirt?: boolean;
  vibeDuringSex?: Rating;
  vibeAfterSex?: Rating;
  orgasmIntensity?: Rating;
  painlessness?: Rating;
  wasAnal?: boolean;
  ballsWorshipping?: Rating;
  cumWorshipping?: Rating;
  didEverythingForHisPleasure?: Rating;
  bestMoment?: string;
  improvementSuggestion?: string;
  additionalNotes?: string;
}

/** Basisfelder für allgemeine News */
const NewsSchemaFields = {
  title: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ["general", "review"], required: true },
  seen: { type: Boolean, default: false },
};

/** Felder, die nur bei Reviews verwendet werden */
const ReviewFields = {
  obedience: { type: Number, enum: [1, 2, 3, 4, 5] },
  didSquirt: { type: Boolean },
  vibeDuringSex: { type: Number, enum: [1, 2, 3, 4, 5] },
  vibeAfterSex: { type: Number, enum: [1, 2, 3, 4, 5] },
  orgasmIntensity: { type: Number, enum: [1, 2, 3, 4, 5] },
  painlessness: { type: Number, enum: [1, 2, 3, 4, 5] },
  wasAnal: { type: Boolean },
  ballsWorshipping: { type: Number, enum: [1, 2, 3, 4, 5] },
  cumWorshipping: { type: Number, enum: [1, 2, 3, 4, 5] },
  didEverythingForHisPleasure: { type: Number, enum: [1, 2, 3, 4, 5] },
  bestMoment: { type: String },
  improvementSuggestion: { type: String },
  additionalNotes: { type: String },
};

const NewsSchema = new Schema(
  {
    ...NewsSchemaFields,
    ...ReviewFields, // Bei allgemeinen News werden diese Felder ungenutzt bleiben.
  },
  {
    timestamps: false, // Wir nutzen hier explizit das Feld createdAt
  }
);

// Hot Reload-sicher
const News: Model<INews | INewsReview> =
  models.News || mongoose.model<INews | INewsReview>("News", NewsSchema);

export default News;
