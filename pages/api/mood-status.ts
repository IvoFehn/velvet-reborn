/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Generator from "@/models/Generator";
import MoodBaseDate from "@/models/MoodBaseDate";
import LevelThresholds, { LeanLevelThresholds } from "@/models/LevelThresholds";
import dayjs from "dayjs";

// Typdefinition für die API-Antwort
type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

// Hilfsfunktion zur Berechnung des Mood-Levels anhand des Erstellungsdatums
// mit dynamischen Schwellenwerten
const calculateLevel = (
  createdAt: Date | string,
  thresholds: LeanLevelThresholds | null
): number => {
  const createdDate = dayjs(createdAt);
  const now = dayjs();
  const daysDiff = now.diff(createdDate, "day", true); // exakte Differenz in Tagen

  console.log(`Tage seit Basisdatum: ${daysDiff.toFixed(2)}`);

  // Standardwerte verwenden, wenn keine benutzerdefinierten Schwellenwerte vorliegen
  const t = thresholds || {
    level1: 3,
    level2: 4,
    level3: 6,
    level4: 8,
  };

  // Verwende Debug-Logging, um die tatsächlich verwendeten Schwellenwerte zu sehen
  console.log(`Verwendete Schwellenwerte für Berechnung:`);
  console.log(`Level 1: > ${t.level1} Tage`);
  console.log(`Level 2: > ${t.level2} Tage`);
  console.log(`Level 3: > ${t.level3} Tage`);
  console.log(`Level 4: > ${t.level4} Tage`);

  // Schwellenwerte zur Bestimmung des Levels anhand der benutzerdefinierten Werte
  if (daysDiff > t.level4) {
    console.log(`Ergebnis: Level 4 (>${t.level4} Tage)`);
    return 4;
  } else if (daysDiff > t.level3) {
    console.log(`Ergebnis: Level 3 (>${t.level3} Tage)`);
    return 3;
  } else if (daysDiff > t.level2) {
    console.log(`Ergebnis: Level 2 (>${t.level2} Tage)`);
    return 2;
  } else if (daysDiff > t.level1) {
    console.log(`Ergebnis: Level 1 (>${t.level1} Tage)`);
    return 1;
  } else {
    console.log(`Ergebnis: Level 0 (<=${t.level1} Tage)`);
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
    console.log("Mood-Status API aufgerufen");

    // 1. Letzten ABGESCHLOSSENEN Generator (Auftrag mit status "DONE") abrufen
    let generator = null;
    let generatorDate = null;

    try {
      const generatorDocument = await Generator.findOne({ status: "DONE" })
        .sort({ _id: -1 })
        .exec();

      if (generatorDocument) {
        // TypeScript-Fix: Als any typen, um Zugriffsprobleme zu vermeiden
        const genDoc = generatorDocument as any;

        // Alle verfügbaren Felder sichern
        generator = genDoc.toObject ? genDoc.toObject() : genDoc;

        // Datum des Generators sichern (verschiedene mögliche Pfade prüfen)
        if (generator.createdAt) {
          generatorDate = generator.createdAt;
        } else if (generator._doc && generator._doc.createdAt) {
          generatorDate = generator._doc.createdAt;
        } else {
          // Fallback: Versuche direkt auf das Dokument zuzugreifen
          generatorDate = genDoc.createdAt;
        }

        console.log("Generator gefunden, Datum:", generatorDate);
      }
    } catch (err) {
      console.error("Fehler beim Abrufen des Generators:", err);
    }

    // 2. Letzten aktiven MoodBaseDate-Eintrag abrufen
    let moodBaseDate = null;
    let moodBaseDateValue = null;

    try {
      const moodBaseDateDoc = await MoodBaseDate.findOne({ active: true })
        .sort({ updatedAt: -1 })
        .exec();

      if (moodBaseDateDoc) {
        // TypeScript-Fix: Als any typen, um Zugriffsprobleme zu vermeiden
        const moodDoc = moodBaseDateDoc as any;

        moodBaseDate = moodDoc.toObject ? moodDoc.toObject() : moodDoc;

        moodBaseDateValue = moodBaseDate.baseDate;
        console.log(
          "MoodBaseDate gefunden, Datum:",
          moodBaseDateValue,
          "Erstellt für Level:",
          moodBaseDate.createdForLevel
        );
      }
    } catch (err) {
      console.error("Fehler beim Abrufen des MoodBaseDate:", err);
    }

    // 3. Aktuell eingestellte Schwellenwerte abrufen
    const thresholds = (await LevelThresholds.findOne()
      .sort({ updatedAt: -1 })
      .lean()) as LeanLevelThresholds | null;

    console.log(
      "Schwellenwerte:",
      thresholds || "Keine gefunden, verwende Standards"
    );

    // 4. Die Basisdate für die Level-Berechnung bestimmen
    let calculatedLevel = 2; // Standard-Level, falls keine Daten vorhanden
    let baseDateForCalc = null;
    let baseSource = "standard";

    // Wenn sowohl Generator als auch MoodBaseDate vorhanden sind, das NEUERE Datum verwenden
    // HIER IST DIE ÄNDERUNG - Wir verwenden das NEUERE Datum statt des älteren
    if (generatorDate && moodBaseDateValue) {
      const genDate = dayjs(generatorDate);
      const moodDate = dayjs(moodBaseDateValue);

      // Das NEUERE Datum verwenden
      if (genDate.isAfter(moodDate)) {
        baseDateForCalc = generatorDate;
        baseSource = "generator";
        console.log("Verwende Generator-Datum für Berechnung (ist neuer)");
      } else {
        baseDateForCalc = moodBaseDateValue;
        baseSource = "moodBaseDate";
        console.log("Verwende MoodBaseDate für Berechnung (ist neuer)");
      }
    }
    // Nur Generator vorhanden
    else if (generatorDate) {
      baseDateForCalc = generatorDate;
      baseSource = "generator";
      console.log(
        "Verwende Generator-Datum für Berechnung (MoodBaseDate nicht vorhanden)"
      );
    }
    // Nur MoodBaseDate vorhanden
    else if (moodBaseDateValue) {
      baseDateForCalc = moodBaseDateValue;
      baseSource = "moodBaseDate";
      console.log(
        "Verwende MoodBaseDate für Berechnung (Generator nicht vorhanden)"
      );
    }
    // Weder Generator noch MoodBaseDate vorhanden
    else {
      console.log(
        "Weder Generator noch MoodBaseDate gefunden, verwende Standard-Level 2"
      );
    }

    // Level berechnen, wenn ein Basisdatum vorhanden ist
    if (baseDateForCalc) {
      calculatedLevel = calculateLevel(baseDateForCalc, thresholds);
      console.log(`Berechnetes Level: ${calculatedLevel}`);
    }

    // Antwort zusammenstellen
    const responseData = {
      generator: generator,
      moodBaseDate: moodBaseDate,
      calculatedLevel,
      effectiveLevel: calculatedLevel, // Keine Überschreibung mehr, immer das berechnete Level
      baseDateForCalc,
      baseSource,
      thresholds,
      debug: {
        currentDate: new Date().toISOString(),
        daysSinceBaseDate: baseDateForCalc
          ? dayjs().diff(dayjs(baseDateForCalc), "day", true)
          : null,
        generatorDate,
        moodBaseDateValue,
      },
    };

    console.log("Sende Antwort:", {
      success: true,
      data: {
        ...responseData,
        generator: generator ? "Generator vorhanden" : null,
        moodBaseDate: moodBaseDate ? "MoodBaseDate vorhanden" : null,
      },
    });

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error in mood-status API:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Abrufen des Mood-Status",
    });
  }
}
