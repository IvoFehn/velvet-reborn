import mongoose, { Document, Schema, Model, models } from "mongoose";

/** Rating-Skala von 0 bis 5 */
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

/** News-Typen */
export type NewsType = "general" | "review" | "failed";

/** Basis-Interface für alle News */
export interface INews extends Document {
  title: string;
  message?: string;
  createdAt: Date;
  type: NewsType;
  seen: boolean;
  goldDeduction?: number;
  expDeduction?: number;
}

/** Erweiterung für Reviews */
export interface INewsReview extends INews {
  // Bestehende Review-Felder für Beziehungsbewertungen
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

  // QuickTask Review-Felder
  quickTaskRating?: Rating;
  quickTaskCompletionEffort?: Rating;
  quickTaskCreativity?: Rating;
  quickTaskTimeManagement?: Rating;
  quickTaskFollowedInstructions?: Rating;
  quickTaskId?: mongoose.Types.ObjectId; // Referenz zum QuickTask
}

/** Interface für die Eingabedaten beim Erstellen eines News-Eintrags */
export interface INewsInput {
  title: string;
  message?: string;
  createdAt?: string;
  type: NewsType;
  seen?: boolean;

  // Bestehende Review-Felder
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

  // QuickTask Review-Felder
  quickTaskRating?: Rating;
  quickTaskCompletionEffort?: Rating;
  quickTaskCreativity?: Rating;
  quickTaskTimeManagement?: Rating;
  quickTaskFollowedInstructions?: Rating;
  quickTaskId?: string | mongoose.Types.ObjectId;

  // Felder für Sanktionen
  goldDeduction?: number;
  expDeduction?: number;
}

/** Grundlegende Felder für das News-Schema */
const NewsSchemaFields = {
  title: { type: String, required: true },
  message: { type: String },
  createdAt: { type: Date, default: Date.now },
  type: { type: String, enum: ["general", "review", "failed"], required: true },
  seen: { type: Boolean, default: false },
};

/** Felder für Beziehungs-Bewertungen */
const RelationshipReviewFields = {
  obedience: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  didSquirt: { type: Boolean },
  vibeDuringSex: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  vibeAfterSex: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  orgasmIntensity: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  painlessness: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  wasAnal: { type: Boolean },
  ballsWorshipping: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  cumWorshipping: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  didEverythingForHisPleasure: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  bestMoment: { type: String },
  improvementSuggestion: { type: String },
  additionalNotes: { type: String },
};

/** Felder für QuickTask-Bewertungen */
const QuickTaskReviewFields = {
  quickTaskRating: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  quickTaskCompletionEffort: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  quickTaskCreativity: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  quickTaskTimeManagement: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  quickTaskFollowedInstructions: { type: Number, enum: [0, 1, 2, 3, 4, 5] },
  quickTaskId: { type: mongoose.Schema.Types.ObjectId, ref: "QuickTask" },
};

/** Felder für Sanktionen (Gold- und Exp-Abzug) */
const DeductionFields = {
  goldDeduction: { type: Number, default: 0 },
  expDeduction: { type: Number, default: 0 },
};

/** Mongoose Schema für News */
const NewsSchema = new Schema(
  {
    ...NewsSchemaFields,
    ...RelationshipReviewFields, // Wird für Beziehungs-Reviews genutzt
    ...QuickTaskReviewFields, // Wird für QuickTask-Reviews genutzt
    ...DeductionFields, // Speichert Gold- und Exp-Abzüge
  },
  {
    timestamps: false, // Wir nutzen explizit das Feld createdAt
  }
);

// Falls das Modell bereits existiert, wird es wiederverwendet (Hot Reload-Schutz)
const News: Model<INews | INewsReview> =
  models.News || mongoose.model<INews | INewsReview>("News", NewsSchema);

export default News;
