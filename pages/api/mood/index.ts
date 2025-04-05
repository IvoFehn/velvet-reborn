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
    pages: number;
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
      // Pagination Parameter
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Datumsfilter
      let dateFilter: { createdAt?: { $gte?: Date; $lte?: Date } } = {};
      if (req.query.start && req.query.end) {
        dateFilter = {
          createdAt: {
            $gte: new Date(req.query.start as string),
            $lte: new Date(req.query.end as string),
          },
        };
      }

      // Nur schlechte Stimmungen mit Gesundheitsstatus abrufen (für Admins)
      const adminView = req.query.adminView === "true";
      const filter = adminView
        ? { ...dateFilter, feeling: "bad", healthStatus: { $exists: true } }
        : dateFilter;

      // Loggen des Filters für Debugging
      console.log("Query filter:", filter);

      // Testabfrage für adminView
      if (adminView) {
        const testCount = await Mood.countDocuments({
          feeling: "bad",
          healthStatus: { $exists: true },
        });
        console.log(
          `Found ${testCount} documents with feeling "bad" and healthStatus.`
        );
      }

      // Stimmungen abrufen
      const moods = await Mood.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      console.log(`Retrieved ${moods.length} mood entries.`);

      // Für Debugging - Details der ersten Einträge zeigen
      if (moods.length > 0) {
        console.log("First entry:", JSON.stringify(moods[0]));
      }

      // Gesamtanzahl für Pagination
      const total = await Mood.countDocuments(filter);

      return res.status(200).json({
        success: true,
        data: moods,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
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
