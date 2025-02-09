/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ticket, { ITicket } from "@/models/Ticket";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
    const { archived } = req.query;

    // Boolean-Werte korrekt umwandeln
    const filter: any = {};
    if (archived === "true") filter.archived = true;
    if (archived === "false") filter.archived = false;

    try {
      const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).lean();
      res.status(200).json({ tickets });
    } catch (error) {
      console.error("GET /api/tickets Fehler:", error);
      res.status(500).json({ message: "Interner Serverfehler" });
    }
  } else if (req.method === "POST") {
    const { subject, description, generatorId } = req.body;

    if (!subject || !description) {
      return res
        .status(400)
        .json({ message: "Betreff und Beschreibung sind erforderlich" });
    }

    // Validierung, ob ein Generator ausgewählt wurde, falls nötig
    if (
      ["Änderungsantrag", "Ablehnungsantrag"].includes(subject) &&
      !generatorId
    ) {
      return res.status(400).json({
        message: "Bitte wählen Sie einen Generator aus.",
      });
    }

    try {
      const newTicket: ITicket = new Ticket({
        subject,
        description,
        generatorId: generatorId || null, // Speichere die Generator-ID, falls vorhanden
        archived: false, // Standardmäßig offen
        messages: [],
        createdAt: new Date(), // Setze das Erstellungsdatum explizit
      });

      await newTicket.save();

      // Benachrichtigung per Telegram
      sendTelegramMessage(
        "admin",
        `Ein neuer Antrag wurde gestellt am ${dayjs()
          .locale("de")
          .format("DD.MM.YYYY HH:mm:ss")}`
      );

      res.status(201).json({
        message: "Ticket erfolgreich erstellt",
        ticket: newTicket.toObject({ virtuals: true }),
      });
    } catch (error) {
      console.error("POST /api/tickets Fehler:", error);
      res.status(500).json({ message: "Interner Serverfehler" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Methode ${req.method} ist nicht erlaubt`);
  }
}
