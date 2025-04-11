import mongoose, { Schema, Document } from "mongoose";

// Interface für das MoodBaseDate-Dokument
export interface IMoodBaseDate extends Document {
  active: boolean;
  baseDate: Date; // Das angepasste Basisdatum für Level-Berechnung
  createdForLevel: number; // Für welches Level wurde es erstellt
  createdAt: Date;
  updatedAt: Date;
}

// Schema für MoodBaseDate
const MoodBaseDateSchema: Schema = new Schema(
  {
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
    baseDate: {
      type: Date,
      required: true,
    },
    createdForLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
  },
  { timestamps: true }
);

// Model erstellen oder bestehende Referenz verwenden
const MoodBaseDate =
  mongoose.models.MoodBaseDate ||
  mongoose.model<IMoodBaseDate>("MoodBaseDate", MoodBaseDateSchema);

export default MoodBaseDate;
