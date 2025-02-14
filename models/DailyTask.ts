import { Schema, model, Document, models } from "mongoose";

export interface IDailyTask extends Document {
  title: string;
  description: string;
  completed: boolean;
  completedAt?: Date | null;
}

const DailyTaskSchema = new Schema<IDailyTask>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Prüfen, ob das Modell bereits existiert, ansonsten erstellen
export default models.DailyTask ||
  model<IDailyTask>("DailyTask", DailyTaskSchema);
