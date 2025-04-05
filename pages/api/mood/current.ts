/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Mood from "@/models/Mood";

interface MoodResponseData {
  success: boolean;
  data?: any;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MoodResponseData>
) {
  // Nur GET-Methode erlauben
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Methode nicht erlaubt",
    });
  }

  try {
    // Verbindung zur Datenbank herstellen
    await dbConnect();

    // Neuesten Mood-Eintrag abrufen
    const mood = await Mood.findOne().sort({ createdAt: -1 });

    if (!mood) {
      return res.status(404).json({
        success: false,
        message: "Keine Stimmungsdaten gefunden",
      });
    }

    return res.status(200).json({
      success: true,
      data: mood,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der aktuellen Stimmung:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Abrufen der aktuellen Stimmung",
    });
  }
}
