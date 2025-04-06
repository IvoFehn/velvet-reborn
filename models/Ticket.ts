// models/Ticket.ts
import mongoose, { Document, Schema } from "mongoose";

interface IMessage {
  content: string;
  sender: string;
  timestamp: Date;
  isAdmin: boolean;
}

export interface ITicket extends Document {
  subject: string;
  description?: string;
  messages: IMessage[];
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  generatorId?: mongoose.Types.ObjectId;
  sanctionId?: mongoose.Types.ObjectId; // Referenz zur verknüpften Sanktion
}

const MessageSchema = new Schema<IMessage>({
  content: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },
});

const TicketSchema = new Schema<ITicket>(
  {
    subject: { type: String, required: true },
    description: { type: String },
    messages: { type: [MessageSchema], default: [] },
    archived: { type: Boolean, default: false },
    generatorId: { type: Schema.Types.ObjectId, ref: "Generator" },
    sanctionId: { type: Schema.Types.ObjectId, ref: "Sanction" }, // Referenz zur Sanktion
  },
  {
    timestamps: true,
  }
);

// Verhindere mehrfache Modell-Kompilierung in Next.js
export default mongoose.models.Ticket ||
  mongoose.model<ITicket>("Ticket", TicketSchema);
