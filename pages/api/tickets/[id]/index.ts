// pages/api/tickets/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  await dbConnect();

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ message: "Ungültige Ticket-ID", success: false });
  }

  switch (req.method) {
    case "GET":
      try {
        const ticket = await Ticket.findById(id);
        if (!ticket)
          return res
            .status(404)
            .json({ message: "Ticket nicht gefunden", success: false });
        res.status(200).json({ ticket, success: true });
      } catch (error) {
        console.error(`GET /api/tickets/${id} Fehler:`, error);
        res.status(500).json({
          message: "Interner Serverfehler",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      break;

    case "PUT":
      try {
        const { subject, description, archived } = req.body;
        const ticket = await Ticket.findById(id);
        if (!ticket)
          return res
            .status(404)
            .json({ message: "Ticket nicht gefunden", success: false });

        if (subject !== undefined) ticket.subject = subject;
        if (description !== undefined) ticket.description = description;
        if (archived !== undefined) ticket.archived = archived;

        await ticket.save();
        res
          .status(200)
          .json({ message: "Ticket aktualisiert", ticket, success: true });
      } catch (error) {
        console.error(`PUT /api/tickets/${id} Fehler:`, error);
        res.status(500).json({
          message: "Interner Serverfehler",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      break;

    case "DELETE":
      try {
        const deletedTicket = await Ticket.findByIdAndDelete(id);
        if (!deletedTicket)
          return res
            .status(404)
            .json({ message: "Ticket nicht gefunden", success: false });
        res.status(200).json({ message: "Ticket gelöscht", success: true });
      } catch (error) {
        console.error(`DELETE /api/tickets/${id} Fehler:`, error);
        res.status(500).json({
          message: "Interner Serverfehler",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      res.status(405).end(`Methode ${req.method} ist nicht erlaubt`);
  }
}
