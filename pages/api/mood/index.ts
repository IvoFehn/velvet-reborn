/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Mood, { MoodFeeling, HealthStatus } from "@/models/Mood";

interface MoodResponseData {
  success: boolean;
  data?: any;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    oldestDate?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MoodResponseData>
) {
  // Verbindung zur Datenbank herstellen
  await dbConnect();

  // POST: Neue Stimmung speichern
  if (req.method === "POST") {
    try {
      console.log("Received request body:", req.body);

      const { feeling, healthStatus } = req.body as {
        feeling: MoodFeeling;
        healthStatus?: HealthStatus;
      };

      console.log("Extracted feeling:", feeling);
      console.log("Extracted healthStatus:", healthStatus);

      // Validierung
      if (!feeling || !["good", "bad"].includes(feeling)) {
        return res.status(400).json({
          success: false,
          message: "Ungültige Stimmungsangabe",
        });
      }

      // Validierung für healthStatus wenn "bad" ausgewählt wurde
      if (feeling === "bad" && healthStatus) {
        if (!healthStatus.complaint) {
          return res.status(400).json({
            success: false,
            message: "Beschwerdebeschreibung ist erforderlich",
          });
        }
      }

      // Objekt für die Datenbank erstellen
      const moodData: any = { feeling };

      // Wenn healthStatus vorhanden ist, hinzufügen
      if (healthStatus) {
        moodData.healthStatus = {
          complaint: healthStatus.complaint,
          analPossible: healthStatus.analPossible || false,
          vaginalPossible: healthStatus.vaginalPossible || false,
          oralPossible: healthStatus.oralPossible || false,
        };
        console.log("Final moodData with healthStatus:", moodData);
      }

      // Neue Stimmung erstellen
      const mood = await Mood.create(moodData);
      console.log("Created mood document:", mood);

      return res.status(201).json({
        success: true,
        data: mood,
      });
    } catch (error) {
      console.error("Fehler beim Speichern der Stimmung:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Speichern der Stimmung",
      });
    }
  }

  // GET: Stimmungsprotokoll abrufen
  else if (req.method === "GET") {
    try {
      // Pagination und Block-Loading Parameter
      const limit = parseInt(req.query.limit as string) || 20;

      // Datumsfilter
      const dateFilter: { createdAt?: any } = {};

      // Startdatum (entweder vom Request oder Standard: letzte 7 Tage)
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : req.query.beforeDate
        ? undefined
        : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // Enddatum (entweder vom Request oder jetzt)
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();

      // Datum für Infinite Scrolling ("Älter als")
      const beforeDate = req.query.beforeDate
        ? new Date(req.query.beforeDate as string)
        : undefined;

      // Filter aufbauen
      if (beforeDate) {
        dateFilter.createdAt = { $lt: beforeDate };
      } else if (startDate) {
        dateFilter.createdAt = { $gte: startDate, $lte: endDate };
      }

      // Filter für Health Reports
      // const healthFilter = {};

      // Option: Nur Health Reports anzeigen (unabhängig vom Gefühl)
      // const onlyWithHealth = req.query.onlyWithHealth === "true";
      // Wichtig: Diese Option nicht mehr verwenden, da wir auch positive Berichte ohne healthStatus anzeigen wollen
      // Stattdessen wird die Filterung jetzt über das feeling-Feld gesteuert

      // Filter für Stimmung
      let feelingFilter = {};
      if (
        req.query.feeling &&
        ["good", "bad", "all"].includes(req.query.feeling as string)
      ) {
        if (req.query.feeling !== "all") {
          feelingFilter = { feeling: req.query.feeling };
        }
      }

      // Filter kombinieren - ohne healthFilter, um beide Arten von Berichten zu bekommen
      const filter = {
        ...dateFilter,
        ...feelingFilter,
      };

      // Loggen des Filters für Debugging
      console.log("Query filter:", filter);

      // Stimmungen abrufen
      const moods = await Mood.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit + 1); // Einen extra laden um zu wissen, ob es mehr gibt

      console.log(`Retrieved ${moods.length} mood entries.`);

      // Prüfen, ob noch mehr Einträge vorhanden sind
      const hasMore = moods.length > limit;

      // Den extra Eintrag entfernen, falls vorhanden
      const limitedMoods = hasMore ? moods.slice(0, limit) : moods;

      // Das älteste Datum in den zurückgegebenen Daten
      const oldestDate =
        limitedMoods.length > 0
          ? limitedMoods[limitedMoods.length - 1].createdAt
          : undefined;

      // Gesamtanzahl (nur für initiale Anzeige benötigt)
      const total = await Mood.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: limitedMoods,
        pagination: {
          total,
          page: 1,
          limit,
          hasMore,
          oldestDate: oldestDate ? oldestDate.toISOString() : undefined,
        },
      });
    } catch (error) {
      console.error("Fehler beim Abrufen der Stimmungsdaten:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Abrufen der Stimmungsdaten",
      });
    }
  }

  // Methode nicht unterstützt
  return res.status(405).json({
    success: false,
    message: "Methode nicht erlaubt",
  });
}
