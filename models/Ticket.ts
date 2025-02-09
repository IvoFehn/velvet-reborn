/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document } from "mongoose";

// Nachrichtenschema mit konsistenten Feldern
interface IMessage {
  isAdmin: boolean; // True = Admin, False = User
  sender: string; // "Admin" oder "Benutzer"
  content: string; // Der eigentliche Nachrichtentext
  timestamp: Date;
}

// Ticket-Schema mit sauberem Statusmanagement
export interface ITicket extends Document {
  subject: string;
  description: string;
  generatorId?: string; // Neue Referenz zum Generator
  archived: boolean;
  messages: IMessage[];
  createdAt: Date;
  _id: any; // _id wird intern von Mongoose als ObjectId verwaltet
}

// Message-Schema für Nachrichten
const MessageSchema: Schema = new Schema({
  isAdmin: { type: Boolean, default: false },
  sender: { type: String, enum: ["USER", "ADMIN"], required: true }, // Benutzer → USER
  content: { type: String, required: true }, // text → content
  timestamp: { type: Date, default: Date.now },
});

// Ticket-Schema mit `archived`
const TicketSchema: Schema = new Schema(
  {
    subject: { type: String, required: true },
    description: { type: String, required: true },
    archived: { type: Boolean, default: false }, // Standard = Offen
    messages: { type: [MessageSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    generatorId: { type: String }, // Neue Referenz
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuelles ID-Feld für Konsistenz
TicketSchema.virtual("id").get(function (this: ITicket) {
  // Hier casten wir _id als mongoose.Types.ObjectId, um toHexString nutzen zu können.
  return (this._id as mongoose.Types.ObjectId).toHexString();
});

export default mongoose.models.Ticket ||
  mongoose.model<ITicket>("Ticket", TicketSchema);
