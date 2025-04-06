import mongoose, { Document, Schema, Model } from "mongoose";

export interface IEvent extends Document {
  _id: string;
  id?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  recurring: boolean;
  recurrence?:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "biannually"
    | "yearly";
  recurrenceEnd?: Date;
  duration?: number;
  isOccurrence?: boolean;
  originalEventId?: string;
}

export interface EventData {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  recurring: boolean;
  recurrence?:
    | "daily"
    | "weekly"
    | "monthly"
    | "quarterly"
    | "biannually"
    | "yearly";
  recurrenceEnd?: Date;
  duration?: number;
  isOccurrence?: boolean;
  originalEventId?: string;
}

const eventSchema: Schema<IEvent> = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    recurring: { type: Boolean, required: true, default: false },
    recurrence: {
      type: String,
      enum: ["daily", "weekly", "monthly", "quarterly", "biannually", "yearly"],
      required: function (this: IEvent) {
        return this.recurring;
      },
    },
    recurrenceEnd: {
      type: Date,
      required: false, // Jetzt optional
    },
    duration: {
      type: Number,
      default: function (this: IEvent) {
        return this.endDate.getTime() - this.startDate.getTime();
      },
    },
  },
  {
    timestamps: true,
  }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", eventSchema);

export default Event;
