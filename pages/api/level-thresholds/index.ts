/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";

// Modell für die Schwellenwerte
interface ILevelThresholds {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
}

// Mongoose Schema für die Schwellenwerte
const LevelThresholdsSchema = new mongoose.Schema<ILevelThresholds>(
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

// Modell erstellen oder aus dem Cache verwenden
const LevelThresholds =
  mongoose.models.LevelThresholds ||
  mongoose.model<ILevelThresholds>("LevelThresholds", LevelThresholdsSchema);

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

// Standardwerte für die Schwellenwerte
const defaultThresholds: ILevelThresholds = {
  level1: 3,
  level2: 4,
  level3: 6,
  level4: 8,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  await dbConnect();

  // GET-Methode zum Abrufen der Schwellenwerte
  if (req.method === "GET") {
    try {
      // Die neuesten Schwellenwerte abrufen
      const thresholds = await LevelThresholds.findOne()
        .sort({ updatedAt: -1 })
        .lean();

      if (thresholds) {
        return res.status(200).json({
          success: true,
          data: thresholds,
        });
      } else {
        // Falls keine Schwellenwerte gefunden wurden, die Standardwerte zurückgeben
        return res.status(200).json({
          success: true,
          data: defaultThresholds,
        });
      }
    } catch (error) {
      console.error("Fehler beim Abrufen der Schwellenwerte:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Abrufen der Schwellenwerte",
      });
    }
  }

  // POST-Methode zum Speichern neuer Schwellenwerte
  else if (req.method === "POST") {
    try {
      const { level1, level2, level3, level4 } = req.body as ILevelThresholds;

      // Validierung
      if (level1 >= level2 || level2 >= level3 || level3 >= level4) {
        return res.status(400).json({
          success: false,
          message:
            "Die Schwellenwerte müssen in aufsteigender Reihenfolge sein.",
        });
      }

      if (level1 <= 0 || level2 <= 0 || level3 <= 0 || level4 <= 0) {
        return res.status(400).json({
          success: false,
          message: "Alle Schwellenwerte müssen größer als 0 sein.",
        });
      }

      // Neue Schwellenwerte erstellen
      const newThresholds = new LevelThresholds({
        level1,
        level2,
        level3,
        level4,
      });

      const savedThresholds = await newThresholds.save();

      return res.status(201).json({
        success: true,
        message: "Schwellenwerte erfolgreich gespeichert",
        data: savedThresholds,
      });
    } catch (error) {
      console.error("Fehler beim Speichern der Schwellenwerte:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Speichern der Schwellenwerte",
      });
    }
  }

  // Andere Methoden nicht erlaubt
  else {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({
      success: false,
      message: `Methode ${req.method} ist nicht erlaubt`,
    });
  }
}
