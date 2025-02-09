// pages/api/tickets/changeStatus.ts

import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Nur PUT-Methode zulassen
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Methode ${req.method} ist nicht erlaubt`);
  }

  // Verbindung zur Datenbank herstellen
  await dbConnect();

  // ticketId und newStatus aus dem Request-Body extrahieren
  const { ticketId, newStatus } = req.body;

  if (!ticketId || !newStatus) {
    return res.status(400).json({
      success: false,
      message: "ticketId und newStatus müssen übergeben werden",
    });
  }

  try {
    // Ticket anhand der ticketId aktualisieren
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        message: "Kein Ticket mit der angegebenen ID gefunden",
      });
    }

    return res.status(200).json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Ticket-Status:", error);
    return res.status(500).json({
      success: false,
      message: "Interner Serverfehler",
    });
  }
}
