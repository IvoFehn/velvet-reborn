// pages/api/warnings/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Warning from "../../../models/Warning";
import { IWarning } from "../../../models/Warning";

interface CreateWarningRequest extends NextApiRequest {
  body: {
    message: string;
  };
}

export default async function handler(
  req: CreateWarningRequest,
  res: NextApiResponse<{
    success: boolean;
    data?: IWarning;
    message: string;
    error?: string;
  }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Bitte geben Sie eine Warnungsnachricht an",
      });
    }

    // Create new warning
    const warning = new Warning({
      message,
      createdAt: new Date(),
      acknowledged: false,
    });

    // Save to database
    await warning.save();

    return res.status(201).json({
      success: true,
      data: warning,
      message: "Warnung erfolgreich erstellt",
    });
  } catch (error) {
    console.error("Error creating warning:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler beim Erstellen der Warnung",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
