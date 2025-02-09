// pages/api/acceptGenerator.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";
import dbConnect from "@/lib/dbConnect";
import Generator, { IGenerator } from "@/models/Generator";

interface SuccessResponse<T = IGenerator> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  await dbConnect();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      message: `Methode ${req.method} ist nicht erlaubt`,
    });
  }

  try {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Ungültige oder fehlende ID." });
    }

    // Generator anhand der ID abrufen
    const generator = await Generator.findById(id);
    if (!generator) {
      return res.status(404).json({
        success: false,
        message: "Kein Auftrag mit dieser ID gefunden.",
      });
    }

    // Optional: Prüfen, ob der Auftrag den Status "NEW" hat
    if (generator.status !== "NEW") {
      return res.status(400).json({
        success: false,
        message:
          "Auftrag kann nicht angenommen werden, da er nicht den Status NEW hat.",
      });
    }

    // Status auf "ACCEPTED" ändern
    generator.status = "ACCEPTED";
    const updatedGenerator = await generator.save();

    // Optional: Eine Telegram-Nachricht an den Admin senden
    await sendTelegramMessage(
      "admin",
      `Auftrag #${generator._id} wurde am ${dayjs()
        .locale("de")
        .format("DD.MM.YYYY HH:mm:ss")} angenommen.`
    );

    return res.status(200).json({ success: true, data: updatedGenerator });
  } catch (error) {
    console.error("Fehler beim Annehmen des Generators:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Annehmen des Auftrags.",
    });
  }
}
