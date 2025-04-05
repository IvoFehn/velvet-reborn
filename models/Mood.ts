import mongoose, { Schema, Document } from "mongoose";

export type MoodFeeling = "good" | "bad";

export interface HealthStatus {
  complaint: string;
  analPossible: boolean;
  vaginalPossible: boolean;
  oralPossible: boolean;
}

export interface IMood extends Document {
  feeling: MoodFeeling;
  healthStatus?: HealthStatus;
  createdAt: Date;
  updatedAt: Date;
}

const HealthStatusSchema = new Schema(
  {
    complaint: {
      type: String,
      required: [true, "Beschwerdebeschreibung ist erforderlich"],
    },
    analPossible: {
      type: Boolean,
      default: false,
    },
    vaginalPossible: {
      type: Boolean,
      default: false,
    },
    oralPossible: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const MoodSchema: Schema = new Schema(
  {
    feeling: {
      type: String,
      enum: ["good", "bad"],
      required: [true, "Stimmungsangabe ist erforderlich"],
    },
    healthStatus: {
      type: HealthStatusSchema,
      required: false,
    },
  },
  { timestamps: true }
);

// Stellen Sie sicher, dass das Schema richtig registriert wird
export default mongoose.models.Mood ||
  mongoose.model<IMood>("Mood", MoodSchema);
