/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, role } = req.body;

    if (!message || !role) {
      return res.status(400).json({ error: "Message and role are required" });
    }

    // Hole den Token und bereite Variablen vor
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    let chat_id: string | undefined;

    // Role direkt über if abfragen
    if (role === "admin") {
      chat_id = process.env.TELEGRAM_CHAT_ID_ADMIN;
    } else if (role === "user") {
      chat_id = process.env.TELEGRAM_CHAT_ID_USER;
    }

    // Prüfe, ob eine gültige Rolle/ID vorliegt
    if (!chat_id) {
      return res
        .status(400)
        .json({ error: "Invalid role. Use 'admin' or 'user'" });
    }

    // Telegram-Nachricht senden
    const telegramURL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(telegramURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id,
        text: `📢 Nachricht für ${role}: ${message}`,
      }),
    });

    const result = await response.json();
    if (!result.ok) {
      throw new Error(result.description);
    }

    return res.status(200).json({ success: true, response: result });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
