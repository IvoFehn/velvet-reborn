// models/Ticket.ts
import mongoose, { Document, Schema } from "mongoose";

interface IMessage {
  content: string;
  sender: string;
  timestamp: Date;
  isAdmin: boolean;
}

export interface ITicket extends Document {
  _id: string;
  subject: string;
  description?: string;
  messages?: IMessage[];
  archived: boolean;
  createdAt: Date;
  updatedAt?: Date;
  generatorId?: string | mongoose.Types.ObjectId | null;
  sanctionId?: mongoose.Types.ObjectId | null;
  sanctionsFrontendId?: string | null; // Für Kompatibilität mit bestehendem Code
}

const MessageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
});

const TicketSchema = new Schema<ITicket>(
  {
    subject: {
      type: String,
      required: [true, "Betreff ist erforderlich"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Beschreibung ist erforderlich"],
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
    archived: {
      type: Boolean,
      default: false,
    },
    generatorId: {
      type: Schema.Types.Mixed, // Unterstützt String und ObjectId
      default: null,
    },
    sanctionId: {
      type: Schema.Types.ObjectId,
      ref: "Sanction",
      default: null,
    },
    sanctionsFrontendId: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Verhindere mehrfache Modell-Kompilierung in Next.js
export default mongoose.models.Ticket ||
  mongoose.model<ITicket>("Ticket", TicketSchema);
