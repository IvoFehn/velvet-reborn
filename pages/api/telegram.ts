/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm, File as FormidableFile } from "formidable";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";
import os from "os";

export const config = {
  api: {
    bodyParser: false, // Standard-Bodyparser deaktivieren, damit formidable die Daten parsen kann
  },
};

interface ParsedFiles {
  file?: FormidableFile | FormidableFile[];
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    // Setze uploadDir explizit (optional, os.tmpdir() wird als Default genutzt)
    const form = new IncomingForm({ uploadDir: os.tmpdir() });

    form.parse(req, async (err, fields, files: ParsedFiles) => {
      if (err) {
        console.error("Formular-Parsing-Fehler:", err);
        return res
          .status(500)
          .json({ error: "Fehler beim Verarbeiten des Formulars" });
      }

      // Falls mehrere Dateien gesendet wurden, verwende das erste Element
      let fileObj: FormidableFile | undefined;
      if (Array.isArray(files.file)) {
        fileObj = files.file[0];
      } else {
        fileObj = files.file;
      }

      if (!fileObj) {
        return res.status(400).json({ error: "Keine Datei gefunden" });
      }

      // Versuche, den Pfad zu ermitteln (manchmal könnte der Dateipfad auch unter "path" stehen)
      const filePath = fileObj.filepath || (fileObj as any).path;
      if (!filePath) {
        return res.status(400).json({ error: "Dateipfad nicht gefunden" });
      }

      // Erstelle einen ReadStream der hochgeladenen Datei
      const fileStream = fs.createReadStream(filePath);

      // Überprüfe, ob die erforderlichen Umgebungsvariablen gesetzt sind
      const telegramChatId = process.env.TELEGRAM_CHAT_ID_ADMIN;
      const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!telegramChatId || !telegramBotToken) {
        return res.status(500).json({
          error:
            "Die Umgebungsvariablen TELEGRAM_CHAT_ID_ADMIN und TELEGRAM_BOT_TOKEN müssen gesetzt sein.",
        });
      }

      // Erstelle ein neues FormData für die Anfrage an die Telegram-Bot-API
      const telegramForm = new FormData();
      telegramForm.append("chat_id", telegramChatId);
      telegramForm.append("photo", fileStream, {
        filename: fileObj.originalFilename || "photo.jpg",
        contentType: fileObj.mimetype || "application/octet-stream",
      });

      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendPhoto`;

      try {
        const telegramResponse = await fetch(telegramUrl, {
          method: "POST",
          body: telegramForm,
          headers: telegramForm.getHeaders(),
        });
        const result = await telegramResponse.json();
        res.status(200).json(result);
      } catch (error) {
        console.error("Fehler beim Senden an Telegram:", error);
        res
          .status(500)
          .json({ error: "Fehler beim Senden des Bildes an Telegram" });
      }
    });
  } else {
    res.status(405).json({ error: "Methode nicht erlaubt" });
  }
}
