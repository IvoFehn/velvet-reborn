/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Generator from "@/models/Generator";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";

// Typdefinition für die API-Antwort
type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Nur POST-Requests erlauben
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();

    // Neuer Generator-Eintrag mit minimalen Daten
    // Hier kann die genaue Struktur angepasst werden, abhängig davon, was für ein Generator-Eintrag benötigt wird
    const newGenerator = new Generator({
      // Minimale Felder für einen Generator
      status: "DONE", // Status sollte DONE sein, um als abgeschlossener Auftrag zu gelten
      content: "Manuell zurückgesetzt", // Beschreibung für den Administrator
      resetType: "manual", // Marker, dass dies ein manuelles Reset war
    });

    const savedGenerator = await newGenerator.save();

    // Optional: Benachrichtigung per Telegram
    await sendTelegramMessage(
      "admin",
      `Lustlevel manuell zurückgesetzt am ${dayjs()
        .locale("de")
        .format("DD.MM.YYYY HH:mm:ss")}`
    );

    return res.status(201).json({
      success: true,
      message: "Generator erfolgreich zurückgesetzt",
      data: savedGenerator,
    });
  } catch (error) {
    console.error("Error in generator-reset API:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Zurücksetzen des Generators",
    });
  }
}
