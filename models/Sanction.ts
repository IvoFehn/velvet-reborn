// models/Sanction.ts
import mongoose, { Model } from "mongoose";
import { ISanction } from "@/types/index";
import { SanctionUnit, SanctionStatus, SanctionCategory } from "../types/common";

const SanctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Bitte geben Sie einen Titel an"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Bitte geben Sie eine Beschreibung an"],
    trim: true,
  },
  task: {
    type: String,
    required: [true, "Bitte geben Sie eine Aufgabe an"],
    trim: true,
  },
  sanctionsFrontendId: {
    type: String,
    unique: true,
    required: true,
  },
  severity: {
    type: Number,
    required: [true, "Bitte geben Sie eine Schwere (1-5) an"],
    min: 1,
    max: 5,
  },
  amount: {
    type: Number,
    required: [true, "Bitte geben Sie eine Menge/Dauer an"],
    min: 1,
  },
  unit: {
    type: String,
    required: [true, "Bitte geben Sie eine Einheit an"],
    enum: ["Minuten", "Stunden", "Tage", "Mal", "Schläge", "Stunden/Tag"],
    default: "Minuten",
  },
  status: {
    type: String,
    required: [true, "Bitte geben Sie einen Status an"],
    enum: ["offen", "erledigt", "abgelaufen", "eskaliert"],
    default: "offen",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
    required: [true, "Bitte geben Sie eine Frist an"],
  },
  escalationFactor: {
    type: Number,
    default: 10, // Standardwert für Eskalation (z.B. +10 Minuten)
  },
  escalationCount: {
    type: Number,
    default: 0, // Wie oft wurde die Sanktion bereits eskaliert
  },
  category: {
    type: String,
    enum: [
      "Hausarbeit",
      "Lernen",
      "Sport",
      "Soziales",
      "Sonstiges",
      "Erotik",
      "Anal",
      "Spanking",
      "Kraulen",
      "Alleine einkaufen",
    ],
    default: "Sonstiges",
  },
  reason: {
    type: String,
    required: false,
    trim: true,
  },
});

// Add indexes for performance
SanctionSchema.index({ status: 1 });
SanctionSchema.index({ category: 1 });
SanctionSchema.index({ deadline: 1 });
SanctionSchema.index({ createdAt: -1 });

// Methode zur Überprüfung und Eskalation einer Sanktion
SanctionSchema.methods.checkAndEscalate = function (): boolean {
  const now = new Date();

  // Prüfen, ob die Deadline überschritten ist und der Status noch offen ist
  if (now > this.deadline && this.status === "offen") {
    // Erhöhen der Menge/Dauer
    this.amount += this.escalationFactor;

    // Neue Deadline setzen (z.B. 2 weitere Tage)
    this.deadline = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // Eskalationszähler erhöhen
    this.escalationCount += 1;

    // Status auf "eskaliert" setzen
    this.status = "eskaliert";

    return true; // Eskalation durchgeführt
  }

  return false; // Keine Eskalation nötig
};

// MongoDB Model-Kompilierung mit TypeScript-Interface
const SanctionModel: Model<ISanction> =
  (mongoose.models.Sanction as Model<ISanction>) ||
  mongoose.model<ISanction>("Sanction", SanctionSchema);

export default SanctionModel;
