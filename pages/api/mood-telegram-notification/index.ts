/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dayjs from "dayjs";

// Typ-Definition für die API-Antwort des Mood-Status
interface ApiMoodStatusData {
  generator: Generator | null;
  calculatedLevel: number;
  moodOverride: MoodOverride | null;
  effectiveLevel: number;
  thresholds?: any | null;
}

interface Generator {
  _id: string;
  createdAt: string;
  status: string;
  content?: string;
}

interface MoodOverride {
  active: boolean;
  level: number;
  expiresAt: string | null;
}

interface ApiResponseSuccess {
  success: true;
  data: ApiMoodStatusData;
}

interface ApiResponseError {
  success: false;
  message: string;
}

type ApiResponse = ApiResponseSuccess | ApiResponseError;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Hole den aktuellen Mood-Status
    console.log("Mood-Status wird abgerufen...");
    const statusResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/mood-status`
    );
    const statusData: ApiResponse = await statusResponse.json();

    if (!statusData.success) {
      throw new Error(
        `Fehler beim Abrufen des Mood-Status: ${statusData.message}`
      );
    }

    // Effektives Level prüfen
    const level = statusData.data.effectiveLevel;
    console.log(`Aktuelles Mood-Level: ${level}`);

    // Nachrichten je nach Level definieren
    let message = "";
    let shouldSendMessage = false;

    if (level === 4) {
      message =
        "Das Lustlevel ist fast beim Maximum angekommen. So hoch sollte es optimalerweise nicht werden. Prüfe schnellstmöglich, ob dein Mann Lust hat und bewege ihn dazu, dass er einen Auftrag einstellt und das Lustlevel senkt";
      shouldSendMessage = true;
    } else if (level >= 5) {
      // Für den Fall, dass es über 4 geht (obwohl es nur 0-4 geben sollte)
      message =
        "🔥🔥🔥 Das Lustlevel ist beim Maximum angekommen. Prüfe so schnell und intensiv wie möglich, ob er eventuell Lust hat und setze alle Mittel und Reize die du hast ein, um ihn dazu zu bewegen einen Auftrag einzustellen. 🔥🔥🔥";
      shouldSendMessage = true;
    }

    // Wenn keine Nachricht gesendet werden soll, frühzeitig beenden
    if (!shouldSendMessage) {
      return res.status(200).json({
        success: true,
        action: "no_action",
        message: `Kein Handlungsbedarf für Level ${level}`,
      });
    }

    // Telegram-Nachricht senden
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const chat_id = process.env.TELEGRAM_CHAT_ID_USER; // Immer an User schicken

    if (!TELEGRAM_BOT_TOKEN || !chat_id) {
      throw new Error(
        "Telegram-Konfiguration fehlt. Bitte TELEGRAM_BOT_TOKEN und TELEGRAM_CHAT_ID_USER setzen"
      );
    }

    // Telegram-Nachricht senden
    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const now = dayjs().format("DD.MM.YYYY HH:mm");
    const formattedMessage = `[${now}] Mood-Level ${level}: ${message}`;

    const response = await fetch(telegramURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text: formattedMessage,
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.description);
    }

    return res.status(200).json({
      success: true,
      action: "message_sent",
      level,
      message,
      telegramResponse: result,
    });
  } catch (error: any) {
    console.error("Fehler beim Verarbeiten:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
