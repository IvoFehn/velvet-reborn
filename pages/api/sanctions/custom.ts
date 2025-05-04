// pages/api/sanctions/custom.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Sanction from "../../../models/Sanction";
import { IApiResponse, ISanction, ISanctionTemplate } from "@/types/index";
import dbConnect from "../../../lib/dbConnect";

interface CustomSanctionRequest extends NextApiRequest {
  body: {
    template: ISanctionTemplate;
    severity: number;
    deadlineDays?: number;
    reason?: string;
  };
}

export default async function handler(
  req: CustomSanctionRequest,
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

    const { template, severity, deadlineDays = 2, reason } = req.body;

    // Überprüfen der erforderlichen Felder
    if (!template || !severity) {
      return res.status(400).json({
        success: false,
        message:
          "Bitte geben Sie eine Sanktionsvorlage und einen Schweregrad an",
      });
    }

    // Zusätzliche Validierung: Template muss mindestens einen Titel und Kategorie haben
    if (!template.title || !template.category) {
      return res.status(400).json({
        success: false,
        message: "Ungültige Sanktionsvorlage übergeben",
      });
    }

    // Validiere den Schweregrad
    if (severity < 1 || severity > 5 || !Number.isInteger(severity)) {
      return res.status(400).json({
        success: false,
        message: "Der Schweregrad muss eine ganze Zahl zwischen 1 und 5 sein",
      });
    }

    // Deadline berechnen (Standard: 2 Tage ab jetzt)
    const now = new Date();
    const deadline = new Date(
      now.getTime() + deadlineDays * 24 * 60 * 60 * 1000
    );

    // Neue Sanktion erstellen
    const newSanction = new Sanction({
      ...template,
      severity,
      deadline,
      status: "offen",
      createdAt: now,
      escalationCount: 0,
      ...(reason ? { reason } : {}),
    });

    console.log(
      "[SpecificSanction] Erstellt:",
      template.title,
      "Level:",
      severity
    );

    // In der Datenbank speichern
    await newSanction.save();

    // Erfolgreiche Antwort senden
    return res.status(201).json({
      success: true,
      data: newSanction,
      message: "Spezifische Sanktion erfolgreich erstellt",
    });
  } catch (error) {
    console.error("Error creating custom sanction:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler bei der Erstellung der spezifischen Sanktion",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
