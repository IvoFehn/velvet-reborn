// pages/api/sanctions/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Sanction from "../../../models/Sanction";
import { IApiResponse, ISanction } from "@/types/index";

interface GetSanctionsRequest extends NextApiRequest {
  query: {
    status?: "offen" | "erledigt" | "abgelaufen" | "eskaliert";
    category?: "Hausarbeit" | "Lernen" | "Sport" | "Soziales" | "Sonstiges";
    limit?: string;
    skip?: string;
  };
}

export default async function handler(
  req: GetSanctionsRequest,
  res: NextApiResponse<IApiResponse<ISanction[]>>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    // Filter-Parameter
    const { status, category, limit = "50", skip = "0" } = req.query;
    const query: { status?: string; category?: string } = {};

    // Status-Filter hinzufügen, falls vorhanden
    if (
      status &&
      ["offen", "erledigt", "abgelaufen", "eskaliert"].includes(status)
    ) {
      query.status = status;
    }

    // Kategorie-Filter hinzufügen, falls vorhanden
    if (
      category &&
      ["Hausarbeit", "Lernen", "Sport", "Soziales", "Sonstiges"].includes(
        category
      )
    ) {
      query.category = category;
    }

    // Sanktionen abrufen, nach Erstellungsdatum sortiert (neueste zuerst)
    const sanctions = await Sanction.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    // Gesamtanzahl für Paginierung berechnen und in der Antwort zurückgeben
    const totalCount = await Sanction.countDocuments(query);

    // Erfolgreiche Antwort senden
    return res.status(200).json({
      success: true,
      count: sanctions.length,
      data: sanctions,
      totalCount, // Hier geben wir jetzt die Gesamtanzahl zurück
      message: `${sanctions.length} Sanktionen gefunden`,
    });
  } catch (error) {
    console.error("Error fetching sanctions:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler beim Abrufen der Sanktionen",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
