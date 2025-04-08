/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import MoodOverride from "@/models/MoodOverride";
import Generator from "@/models/Generator";
import LevelThresholds, { LeanLevelThresholds } from "@/models/LevelThresholds";
import dayjs from "dayjs";

// Typdefinition für die API-Antwort
type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

// Typdefinition für Mood-Überschreibung
interface MoodOverrideRequest {
  active: boolean;
  level?: number;
  expiresAt?: string | null;
  adjustGeneratorDate?: boolean; // Parameter für die zeitliche Anpassung
}

// Funktion zur umgekehrten Berechnung: Level -> Tage mit dynamischen Schwellenwerten
const calculateDaysForLevel = (
  level: number,
  thresholds: LeanLevelThresholds | null
): number => {
  // Standardwerte verwenden, wenn keine benutzerdefinierten Schwellenwerte vorliegen
  const t = thresholds || {
    level1: 3,
    level2: 4,
    level3: 6,
    level4: 8,
  };

  // Einen kleinen Wert hinzufügen (0.1), um sicherzustellen, dass wir über dem Schwellenwert liegen
  switch (level) {
    case 4:
      return t.level4 + 0.1;
    case 3:
      return t.level3 + 0.1;
    case 2:
      return t.level2 + 0.1;
    case 1:
      return t.level1 + 0.1;
    case 0:
    default:
      return 0;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Nur POST-Requests erlauben
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Daten aus dem Request-Body extrahieren
    const { active, level, expiresAt, adjustGeneratorDate } =
      req.body as MoodOverrideRequest;

    // Validierung: Wenn aktiv, muss ein Level angegeben werden
    if (active && (level === undefined || level < 0 || level > 4)) {
      return res.status(400).json({
        success: false,
        message: "Ungültiges Level. Muss zwischen 0 und 4 liegen.",
      });
    }

    // Aktuell eingestellte Schwellenwerte abrufen
    const thresholdsDoc = (await LevelThresholds.findOne()
      .sort({ updatedAt: -1 })
      .lean()) as LeanLevelThresholds | null;

    // Wenn adjustGeneratorDate true ist, müssen wir einen neuen Generator-Eintrag erstellen
    if (active && adjustGeneratorDate && level !== undefined) {
      const daysForLevel = calculateDaysForLevel(level, thresholdsDoc);

      // Berechnen des Datums, das zu dem gewünschten Level führen würde
      const adjustedDate = dayjs().subtract(daysForLevel, "day").toDate();

      // Neuen Generator-Eintrag erstellen mit dem angepassten Datum
      const newGenerator = await Generator.create({
        status: "DONE",
        content: `Automatisch angepasst für Level ${level}`,
        createdAt: adjustedDate,
        updatedAt: adjustedDate,
      });

      // Bei Datumsanpassung benötigen wir keine Überschreibung mehr
      return res.status(200).json({
        success: true,
        message: `Generator-Datum angepasst für Level ${level}. Keine Überschreibung nötig.`,
        data: {
          adjustedDate,
          generator: newGenerator,
        },
      });
    }

    // Aktuelle Überschreibung suchen, um zu entscheiden, ob wir aktualisieren oder neu erstellen
    const existingOverride = await MoodOverride.findOne().sort({
      updatedAt: -1,
    });

    if (existingOverride) {
      // Bestehende Überschreibung aktualisieren
      existingOverride.active = active;

      if (active) {
        existingOverride.level = level!;
        existingOverride.expiresAt = expiresAt ? new Date(expiresAt) : null;
      }

      await existingOverride.save();

      return res.status(200).json({
        success: true,
        message: active
          ? "Überschreibung erfolgreich gespeichert"
          : "Überschreibung erfolgreich deaktiviert",
        data: existingOverride,
      });
    } else {
      // Neue Überschreibung erstellen
      const newOverride = new MoodOverride({
        active,
        level: active ? level : undefined,
        expiresAt: active && expiresAt ? new Date(expiresAt) : null,
      });

      await newOverride.save();

      return res.status(201).json({
        success: true,
        message: "Neue Überschreibung erfolgreich erstellt",
        data: newOverride,
      });
    }
  } catch (error) {
    console.error("Error in mood-override API:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Speichern der Überschreibung",
    });
  }
}
