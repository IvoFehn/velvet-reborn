/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Event from "@/models/Event";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  switch (method) {
    case "PUT":
      try {
        if (req.body.recurring && !req.body.recurrence) {
          return res.status(400).json({
            success: false,
            message:
              "Bei wiederkehrenden Events muss eine Häufigkeit angegeben werden",
          });
        }

        const duration =
          new Date(req.body.endDate).getTime() -
          new Date(req.body.startDate).getTime();
        req.body.duration = duration;

        // Suche explizit nach der ID ohne Konvertierung
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });

        if (!updatedEvent) {
          console.log(`Event mit ID ${id} nicht gefunden`);
          return res.status(404).json({
            success: false,
            message: "Event nicht gefunden",
          });
        }

        console.log(`Event mit ID ${id} erfolgreich aktualisiert`);
        res.status(200).json({ success: true, event: updatedEvent });
      } catch (error: any) {
        console.error("PUT /api/events/[id]:", error);
        res.status(400).json({
          success: false,
          message: `Fehler beim Aktualisieren des Events: ${
            error.message || "Unbekannter Fehler"
          }`,
        });
      }
      break;

    case "DELETE":
      try {
        console.log(`Versuche Event mit ID ${id} zu löschen`);
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
          console.log(`Event mit ID ${id} nicht gefunden`);
          return res.status(404).json({
            success: false,
            message: "Event nicht gefunden",
          });
        }

        console.log(`Event mit ID ${id} erfolgreich gelöscht`);
        res.status(200).json({
          success: true,
          message: "Event erfolgreich gelöscht",
        });
      } catch (error: any) {
        console.error("DELETE /api/events/[id]:", error);
        res.status(400).json({
          success: false,
          message: `Fehler beim Löschen des Events: ${
            error.message || "Unbekannter Fehler"
          }`,
        });
      }
      break;

    case "GET":
      try {
        console.log(`Versuche Event mit ID ${id} abzurufen`);
        const event = await Event.findById(id);

        if (!event) {
          console.log(`Event mit ID ${id} nicht gefunden`);
          return res.status(404).json({
            success: false,
            message: "Event nicht gefunden",
          });
        }

        console.log(`Event mit ID ${id} erfolgreich abgerufen`);
        res.status(200).json({ success: true, event });
      } catch (error: any) {
        console.error("GET /api/events/[id]:", error);
        res.status(400).json({
          success: false,
          message: `Fehler beim Abrufen des Events: ${
            error.message || "Unbekannter Fehler"
          }`,
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).json({
        success: false,
        message: `Methode ${method} nicht erlaubt`,
      });
      break;
  }
}
