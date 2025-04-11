/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import MoodBaseDate from "@/models/MoodBaseDate";
import LevelThresholds, { LeanLevelThresholds } from "@/models/LevelThresholds";
import dayjs from "dayjs";

// Typdefinition für die API-Antwort
type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

// Typdefinition für Mood-Überschreibung
interface MoodBaseDateRequest {
  level: number;
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

  console.log(
    `Verwendete Schwellenwerte für Berechnung: L1:${t.level1}, L2:${t.level2}, L3:${t.level3}, L4:${t.level4}`
  );

  // Einen kleinen Wert hinzufügen (0.1), um sicherzustellen, dass wir über dem Schwellenwert liegen
  let daysToAdd = 0;

  switch (level) {
    case 4:
      daysToAdd = t.level4 + 0.1;
      break;
    case 3:
      daysToAdd = t.level3 + 0.1;
      break;
    case 2:
      daysToAdd = t.level2 + 0.1;
      break;
    case 1:
      daysToAdd = t.level1 + 0.1;
      break;
    case 0:
    default:
      // Für Level 0 setzen wir das Datum auf heute (0 Tage zurück)
      daysToAdd = 0;
      break;
  }

  console.log(`Für Level ${level} werden ${daysToAdd} Tage abgezogen`);
  return daysToAdd;
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
    console.log("API Request Body:", req.body);

    // Daten aus dem Request-Body extrahieren
    const { level } = req.body as MoodBaseDateRequest;

    console.log(`API Request: level=${level}`);

    // Validierung: Level muss angegeben werden
    if (level === undefined || level < 0 || level > 4) {
      return res.status(400).json({
        success: false,
        message: "Ungültiges Level. Muss zwischen 0 und 4 liegen.",
      });
    }

    // Aktuell eingestellte Schwellenwerte abrufen
    const thresholdsDoc = (await LevelThresholds.findOne()
      .sort({ updatedAt: -1 })
      .lean()) as LeanLevelThresholds | null;

    console.log("Gefundene Schwellenwerte:", thresholdsDoc);

    // Berechnen des Datums, das zu dem gewünschten Level führen würde
    const daysForLevel = calculateDaysForLevel(level, thresholdsDoc);
    const baseDateForLevel = dayjs().subtract(daysForLevel, "day").toDate();

    console.log(
      `Berechnetes Basisdatum für Level ${level}: ${baseDateForLevel.toISOString()}`
    );

    // Alle vorherigen MoodBaseDate-Einträge deaktivieren
    await MoodBaseDate.updateMany({}, { active: false });

    // Neuen MoodBaseDate-Eintrag erstellen
    const newMoodBaseDate = new MoodBaseDate({
      active: true,
      baseDate: baseDateForLevel,
      createdForLevel: level,
    });

    await newMoodBaseDate.save();

    return res.status(200).json({
      success: true,
      message: `Ausgangslevel auf ${level} gesetzt. Level wird automatisch wachsen.`,
      data: {
        moodBaseDate: newMoodBaseDate,
        baseDateForLevel,
        createdForLevel: level,
      },
    });
  } catch (error) {
    console.error("Error in mood-override API:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Speichern des Basisdatums",
    });
  }
}
