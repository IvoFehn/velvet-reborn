/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

// Deaktiviere den automatischen Body-Parser von Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

type Data = {
  message?: string;
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, _fields, files) => {
    if (err) {
      console.error("Fehler beim Parsen:", err);
      res.status(500).json({ error: "Fehler beim Parsen der Formulardaten." });
      return;
    }

    // "photo" entspricht dem Namen, den wir im FormData der Client-Komponente verwendet haben.
    const fileField = files.photo as File | File[];
    let uploadedFile: File | null = null;

    if (Array.isArray(fileField)) {
      uploadedFile = fileField[0];
    } else {
      uploadedFile = fileField;
    }

    if (!uploadedFile) {
      res.status(400).json({ error: "Kein Bild hochgeladen." });
      return;
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID_ADMIN;

    if (!token || !chatId) {
      res
        .status(500)
        .json({ error: "Telegram Token oder Chat ID nicht konfiguriert." });
      return;
    }

    const telegramUrl = `https://api.telegram.org/bot${token}/sendPhoto`;

    try {
      const formData = new FormData();
      formData.append("chat_id", chatId);
      // Nutze "filepath" (neu in formidable) oder "path" je nach Version
      formData.append("photo", fs.createReadStream(uploadedFile.filepath));

      const response = await axios.post(telegramUrl, formData, {
        headers: formData.getHeaders(),
      });

      if (response.data.ok) {
        res.status(200).json({ message: "Bild gesendet." });
      } else {
        console.error("Telegram API Fehler:", response.data);
        res.status(500).json({ error: "Telegram API Fehler." });
      }
    } catch (error: any) {
      console.error("Fehler beim Senden an Telegram:", error);
      res.status(500).json({ error: "Fehler beim Senden an Telegram." });
    }
  });
};

export default handler;
