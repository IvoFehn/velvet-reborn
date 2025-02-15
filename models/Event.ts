// models/Event.ts

import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEvent extends Document {
  _id: string;
  title: string;
  description: string;
  startDate: Date; // Beginn des Events bzw. einer Occurrence
  endDate: Date; // Ende des Events bzw. einer Occurrence
  recurring: boolean; // Gibt an, ob das Event wiederkehrend ist
  /**
   * Für wiederkehrende Events: Gibt die Wiederholungsfrequenz an.
   * Mögliche Werte: 'daily', 'weekly', 'monthly', 'yearly'
   */
  recurrence?: "daily" | "weekly" | "monthly" | "yearly";
  /**
   * Für wiederkehrende Events: Gibt an, bis zu welchem Datum das Event wiederholt wird.
   */
  recurrenceEnd?: Date;
}

const eventSchema: Schema<IEvent> = new Schema(
  {
    _id: Schema.Types.ObjectId,
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    recurring: { type: Boolean, required: true },
    recurrence: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      // Falls das Event wiederkehrend ist, sollte auch eine Wiederholungsfrequenz angegeben werden.
      required: function (this: IEvent) {
        return this.recurring;
      },
    },
    recurrenceEnd: {
      type: Date,
      // Für wiederkehrende Events muss das Enddatum der Wiederholung gesetzt sein.
      required: function (this: IEvent) {
        return this.recurring;
      },
    },
  },
  {
    timestamps: true, // Fügt automatisch createdAt und updatedAt hinzu
  }
);

// Verhindere Mehrfachregistrierung bei Hot Reload in Next.js
const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
