// pages/api/survey/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Survey from "@/models/Survey";
import dbConnect from "@/lib/dbConnect";

interface StatusResponse {
  canRetake: boolean;
  average: number | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatusResponse | { error: string }>
) {
  await dbConnect();

  try {
    // Da wir nur einen Benutzer haben, überprüfen wir einfach, ob eine neue Umfrage ausgefüllt werden kann
    const canRetake = await Survey.canRetake();

    // Holen der letzten Umfrage ohne Benutzerfilter
    const lastSurvey = await Survey.findOne().sort({ submittedAt: -1 });

    return res.status(200).json({
      canRetake,
      average: lastSurvey?.averageScore || null,
    });
  } catch (error) {
    console.error("Fehler beim Abrufen des Survey-Status:", error);
    return res
      .status(500)
      .json({ error: "Serverfehler", canRetake: false, average: null });
  }
}
