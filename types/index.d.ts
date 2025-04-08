/* eslint-disable @typescript-eslint/no-explicit-any */
// types/index.ts
import { Document, Types } from "mongoose";

// Basisinterface für Sanktionsdaten
export interface ISanctionBase {
  title: string;
  description: string;
  task: string;
  severity: number;
  amount: number;
  unit: "Minuten" | "Stunden" | "Tage" | "Mal";
  status: "offen" | "erledigt" | "abgelaufen" | "eskaliert";
  createdAt: Date;
  deadline: Date;
  escalationFactor: number;
  escalationCount: number;
  category: "Hausarbeit" | "Lernen" | "Sport" | "Soziales" | "Sonstiges";
}

// Interface für Mongoose-Dokument mit erweiterten MongoDB-Eigenschaften
export interface ISanction extends ISanctionBase, Document {
  _id: Types.ObjectId;
  checkAndEscalate: () => boolean;
}

export interface ISanctionTemplate {
  title: string;
  description: string;
  task: string;
  amount: number;
  unit: "Minuten" | "Stunden" | "Tage" | "Mal" | "Schläge" | "Stunden/Tag";
  category:
    | "Hausarbeit"
    | "Lernen"
    | "Sport"
    | "Soziales"
    | "Sonstiges"
    | "Erotik"
    | "Anal"
    | "Spanking"
    | "Kraulen"
    | "Alleine einkaufen";
  escalationFactor: number;
}

// Explizit die Typsignatur für den Katalog definieren
export interface ISanctionCatalog {
  1: ISanctionTemplate[];
  2: ISanctionTemplate[];
  3: ISanctionTemplate[];
  4: ISanctionTemplate[];
  5: ISanctionTemplate[];
}

export interface ISanctionResponse {
  id: string;
  title: string;
  escalated: boolean;
  newAmount?: number;
  newDeadline?: Date;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  totalCount?: number; // Hinzugefügt für Paginierung
  error?: string;
  totalChecked?: number;
  escalatedCount?: number;
  results?: ISanctionResponse[];
  escalatedSanctions?: {
    id: string;
    title: string;
    newAmount: number;
    newDeadline: Date;
  }[];
}
