/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document } from "mongoose";

// Interface für das LevelThresholds-Dokument
export interface ILevelThresholds extends Document {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  createdAt: Date;
  updatedAt: Date;
}

// Typdefinition für "lean" Dokument (nach .lean() Aufruf)
export type LeanLevelThresholds = {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  _id: any;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

// Schema für LevelThresholds
const LevelThresholdsSchema: Schema = new Schema(
  {
    level1: {
      type: Number,
      required: true,
      min: 0.1,
      default: 3,
    },
    level2: {
      type: Number,
      required: true,
      min: 0.1,
      default: 4,
    },
    level3: {
      type: Number,
      required: true,
      min: 0.1,
      default: 6,
    },
    level4: {
      type: Number,
      required: true,
      min: 0.1,
      default: 8,
    },
  },
  { timestamps: true }
);

// Model erstellen oder bestehende Referenz verwenden
export default mongoose.models.LevelThresholds ||
  mongoose.model<ILevelThresholds>("LevelThresholds", LevelThresholdsSchema);
