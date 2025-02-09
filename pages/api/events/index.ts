// pages/api/events.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect"; // Stelle sicher, dass diese Funktion die DB-Verbindung herstellt
import Event, { IEvent } from "@/models/Event";

interface Data {
  success: boolean;
  message?: string;
  event?: IEvent;
  events?: IEvent[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect(); // Datenbankverbindung herstellen

  if (req.method === "GET") {
    try {
      const now = new Date();

      // Abfrage für Events, die entweder:
      // 1. Nicht wiederkehrend sind und deren endDate in der Zukunft liegt, ODER
      // 2. Wiederkehrend sind und deren recurrenceEnd in der Zukunft liegt
      const events = await Event.find({
        $or: [
          { endDate: { $gt: now } }, // Nicht-wiederkehrende Events
          {
            recurring: true,
            recurrenceEnd: { $gt: now }, // Wiederkehrende Events mit zukünftigem Ende
          },
        ],
      });

      return res.status(200).json({ success: true, events });
    } catch (error) {
      console.error("GET /api/events:", error);
      return res
        .status(500)
        .json({ success: false, message: "Fehler beim Abrufen der Events" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title, description, startDate, endDate, recurring, recurrence } =
        req.body;

      // Basisvalidierung: Pflichtfelder vorhanden?
      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: "Bitte alle Pflichtfelder ausfüllen.",
        });
      }

      // Validierung: Enddatum muss in der Zukunft liegen
      if (new Date(endDate) <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "Das Enddatum muss in der Zukunft liegen.",
        });
      }

      // Falls das Event wiederkehrend sein soll, setzen wir ein Default für recurrenceEnd,
      // falls keines übergeben wurde. (Hier: 30 Tage ab dem Startdatum)
      let recurrenceEnd;
      if (recurring === true || recurring === "true") {
        recurrenceEnd = new Date(
          new Date(startDate).getTime() + 30 * 24 * 60 * 60 * 1000
        );
      }

      const newEvent = new Event({
        title,
        description,
        startDate,
        endDate,
        recurring: recurring === true || recurring === "true",
        recurrence: recurring ? recurrence : undefined,
        recurrenceEnd: recurring ? recurrenceEnd : undefined,
      });

      const savedEvent = await newEvent.save();
      return res.status(201).json({ success: true, event: savedEvent });
    } catch (error) {
      console.error("POST /api/events:", error);
      return res.status(500).json({
        success: false,
        message: "Fehler beim Erstellen des Events",
      });
    }
  }

  // Falls eine andere HTTP-Methode verwendet wird:
  res.setHeader("Allow", ["GET", "POST"]);
  return res
    .status(405)
    .json({ success: false, message: `Methode ${req.method} nicht erlaubt` });
}
