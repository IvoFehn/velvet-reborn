import mongoose, { Schema, Document } from "mongoose";

// Interface für das MoodOverride-Dokument
export interface IMoodOverride extends Document {
  active: boolean;
  level: number;
  expiresAt: Date | null; // Zeitpunkt, wann die Überschreibung abläuft (null = nie)
  createdAt: Date;
  updatedAt: Date;
}

// Schema für MoodOverride
const MoodOverrideSchema: Schema = new Schema(
  {
    active: {
      type: Boolean,
      required: true,
      default: false,
    },
    level: {
      type: Number,
      required: function (this: { active: boolean }): boolean {
        return this.active === true;
      },
      min: 0,
      max: 4,
      validate: {
        validator: function (this: { active: boolean }, v: number): boolean {
          // Wenn active=true, muss level zwischen 0-4 liegen
          return !this.active || (v >= 0 && v <= 4);
        },
        message: "Level muss zwischen 0 und 4 liegen, wenn active=true",
      },
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Model erstellen oder bestehende Referenz verwenden
export default mongoose.models.MoodOverride ||
  mongoose.model<IMoodOverride>("MoodOverride", MoodOverrideSchema);
