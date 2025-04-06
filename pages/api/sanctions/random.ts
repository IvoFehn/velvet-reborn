// pages/api/sanctions/random.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Sanction from "../../../models/Sanction";
import sanctionCatalog from "../../../data/sanctionCatalog";
import { IApiResponse, ISanction } from "@/types/index";
import dbConnect from "../../../lib/dbConnect";

interface RandomSanctionRequest extends NextApiRequest {
  body: {
    severity: number;
    deadlineDays?: number;
  };
}

export default async function handler(
  req: RandomSanctionRequest,
  res: NextApiResponse<IApiResponse<ISanction>>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    const { severity, deadlineDays = 2 } = req.body;

    // Überprüfen der erforderlichen Felder
    if (!severity) {
      return res.status(400).json({
        success: false,
        message: "Bitte geben Sie einen Schweregrad an",
      });
    }

    // Validiere den Schweregrad
    if (severity < 1 || severity > 5 || !Number.isInteger(severity)) {
      return res.status(400).json({
        success: false,
        message: "Der Schweregrad muss eine ganze Zahl zwischen 1 und 5 sein",
      });
    }

    // Sanktionen für diesen Schweregrad abrufen mit Typ-Assertion
    const availableSanctions =
      sanctionCatalog[severity as keyof typeof sanctionCatalog];

    if (!availableSanctions || availableSanctions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Keine Sanktionen für diesen Schweregrad gefunden",
      });
    }

    // Zufällige Sanktion auswählen
    const randomIndex = Math.floor(Math.random() * availableSanctions.length);
    const sanctionTemplate = availableSanctions[randomIndex];

    // Deadline berechnen (Standard: 2 Tage ab jetzt)
    const now = new Date();
    const deadline = new Date(
      now.getTime() + deadlineDays * 24 * 60 * 60 * 1000
    );

    // Neue Sanktion erstellen
    const newSanction = new Sanction({
      ...sanctionTemplate,
      severity,
      deadline,
      status: "offen",
      createdAt: now,
    });

    // In der Datenbank speichern
    await newSanction.save();

    // Erfolgreiche Antwort senden
    return res.status(201).json({
      success: true,
      data: newSanction,
      message: "Sanktion erfolgreich erstellt",
    });
  } catch (error) {
    console.error("Error creating random sanction:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler bei der Erstellung der Sanktion",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
