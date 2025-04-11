// pages/api/warnings/acknowledge.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Warning from "../../../models/Warning";
import { IWarning } from "../../../models/Warning";

interface AcknowledgeWarningRequest extends NextApiRequest {
  body: {
    warningId: string;
  };
}

export default async function handler(
  req: AcknowledgeWarningRequest,
  res: NextApiResponse<{
    success: boolean;
    data?: IWarning;
    message: string;
    error?: string;
  }>
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    const { warningId } = req.body;

    if (!warningId) {
      return res.status(400).json({
        success: false,
        message: "Bitte geben Sie eine Warnungs-ID an",
      });
    }

    // Find warning
    const warning = await Warning.findById(warningId);

    if (!warning) {
      return res.status(404).json({
        success: false,
        message: "Warnung nicht gefunden",
      });
    }

    // Mark as acknowledged
    warning.acknowledged = true;
    warning.acknowledgedAt = new Date();

    // Save
    await warning.save();

    return res.status(200).json({
      success: true,
      data: warning,
      message: "Warnung erfolgreich bestätigt",
    });
  } catch (error) {
    console.error("Error acknowledging warning:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler beim Bestätigen der Warnung",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
