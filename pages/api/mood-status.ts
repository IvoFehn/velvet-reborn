/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Generator from "@/models/Generator";
import MoodOverride from "@/models/MoodOverride";
import LevelThresholds, { LeanLevelThresholds } from "@/models/LevelThresholds";
import dayjs from "dayjs";

// Typdefinition für die API-Antwort
type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

// Mongoose Lean Document Typen
type LeanMoodOverride = {
  active: boolean;
  level: number;
  expiresAt: Date | null;
  _id: any;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

type LeanGenerator = {
  _id: any;
  createdAt: Date;
  status: string;
  content?: string;
  updatedAt: Date;
  __v: number;
  [key: string]: any; // Für alle anderen Generator-Felder
};

// Hilfsfunktion zur Berechnung des Mood-Levels anhand des Erstellungsdatums
// mit dynamischen Schwellenwerten
const calculateLevel = (
  createdAt: Date,
  thresholds: LeanLevelThresholds | null
): number => {
  const createdDate = dayjs(createdAt);
  const now = dayjs();
  const daysDiff = now.diff(createdDate, "day", true); // exakte Differenz in Tagen

  // Standardwerte verwenden, wenn keine benutzerdefinierten Schwellenwerte vorliegen
  const t = thresholds || {
    level1: 3,
    level2: 4,
    level3: 6,
    level4: 8,
  };

  // Schwellenwerte zur Bestimmung des Levels anhand der benutzerdefinierten Werte
  if (daysDiff > t.level4) {
    return 4;
  } else if (daysDiff > t.level3) {
    return 3;
  } else if (daysDiff > t.level2) {
    return 2;
  } else if (daysDiff > t.level1) {
    return 1;
  } else {
    return 0;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Nur GET-Requests erlauben
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Letzten Generator (Auftrag) abrufen
    const latestGenerator = (await Generator.findOne()
      .sort({ createdAt: -1 })
      .lean()) as LeanGenerator | null;

    // Aktuelle Mood-Überschreibung abrufen
    const moodOverride = (await MoodOverride.findOne()
      .sort({ updatedAt: -1 })
      .lean()) as LeanMoodOverride | null;

    // Aktuell eingestellte Schwellenwerte abrufen
    const thresholds = (await LevelThresholds.findOne()
      .sort({ updatedAt: -1 })
      .lean()) as LeanLevelThresholds | null;

    // Standard-Level, falls kein Generator gefunden wurde
    let calculatedLevel = 2;

    // Wenn Generator gefunden wurde, Level berechnen
    if (latestGenerator) {
      calculatedLevel = calculateLevel(latestGenerator.createdAt, thresholds);
    }

    // Effektives Level bestimmen unter Berücksichtigung der Überschreibung
    let effectiveLevel = calculatedLevel;

    // Wenn Überschreibung aktiv ist
    if (moodOverride && moodOverride.active) {
      // Prüfen, ob die Überschreibung abgelaufen ist
      if (
        moodOverride.expiresAt &&
        dayjs().isAfter(dayjs(moodOverride.expiresAt))
      ) {
        // Überschreibung ist abgelaufen, auf den berechneten Wert zurückfallen

        // Optional: Überschreibung deaktivieren in der Datenbank
        await MoodOverride.findByIdAndUpdate(moodOverride._id, {
          active: false,
        });

        // Ändern des effektiven Levels ist nicht nötig, da wir schon auf calculatedLevel gesetzt haben
      } else {
        // Überschreibung ist aktiv und nicht abgelaufen
        effectiveLevel = moodOverride.level;
      }
    }

    // Antwort zusammenstellen
    return res.status(200).json({
      success: true,
      data: {
        generator: latestGenerator,
        calculatedLevel,
        moodOverride: moodOverride
          ? {
              active: moodOverride.active,
              level: moodOverride.level,
              expiresAt: moodOverride.expiresAt,
            }
          : null,
        effectiveLevel,
        thresholds,
      },
    });
  } catch (error) {
    console.error("Error in mood-status API:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Abrufen des Mood-Status",
    });
  }
}
