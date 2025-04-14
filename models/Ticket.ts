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
  sanctionsFrontendId?: string | null;
  responseDeadline?: Date | null; // New field to track the deadline
  responseHours?: number; // Default response time in hours
  lastAdminMessage?: Date | null; // Track when the last admin message was sent
  calculateResponseDeadline(hours?: number): Date; // Method declaration
  isDeadlineExpired(): boolean; // Method declaration
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
    responseDeadline: {
      type: Date,
      default: null,
    },
    responseHours: {
      type: Number,
      default: 6, // Default 6 hours response time
    },
    lastAdminMessage: {
      type: Date,
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

// Calculate response deadline considering night hours (00:00 - 08:00)
TicketSchema.methods.calculateResponseDeadline = function (
  this: ITicket,
  hours?: number
): Date {
  const startTime = new Date();
  this.lastAdminMessage = startTime;

  // Use the passed hours or default to this.responseHours or 6
  const hoursToUse = hours !== undefined ? hours : this.responseHours || 6;

  let remainingHours = hoursToUse;
  // Using var instead of let to avoid ESLint confusion about modification vs reassignment
  // TypeScript still understands that we're modifying the Date object, not reassigning the variable
  const currentTime = new Date(startTime);

  while (remainingHours > 0) {
    // Add one hour
    currentTime.setHours(currentTime.getHours() + 1);

    // Check if we're in the night hours (0-8)
    const currentHour = currentTime.getHours();
    if (currentHour >= 0 && currentHour < 8) {
      // Skip counting this hour toward the deadline
      continue;
    }

    // Count this hour
    remainingHours--;
  }

  this.responseDeadline = currentTime;
  return currentTime;
};

// Check if the ticket has an active deadline and if it's expired
TicketSchema.methods.isDeadlineExpired = function (this: ITicket): boolean {
  if (!this.responseDeadline || this.archived) {
    return false;
  }

  return new Date() > this.responseDeadline;
};

// Verhindere mehrfache Modell-Kompilierung in Next.js
export default mongoose.models.Ticket ||
  mongoose.model<ITicket>("Ticket", TicketSchema);
