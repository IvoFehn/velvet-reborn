// pages/api/tickets/[id]/messages.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id },
    method,
  } = req;

  await dbConnect();

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      message: "Ungültige Ticket-ID",
      success: false,
    });
  }

  switch (method) {
    case "GET":
      try {
        const ticket = await Ticket.findById(id);
        if (!ticket) {
          return res.status(404).json({
            message: "Ticket nicht gefunden",
            success: false,
          });
        }

        res.status(200).json({
          messages: ticket.messages || [],
          success: true,
        });
      } catch (error) {
        console.error(`GET /api/tickets/${id}/messages Fehler:`, error);
        res.status(500).json({
          message: "Interner Serverfehler",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      break;

    case "POST":
      try {
        const { content, isAdmin } = req.body;

        if (!content) {
          return res.status(400).json({
            message: "Nachrichteninhalt fehlt",
            success: false,
          });
        }

        // Überprüfung des Admin-Status aus dem Request Body
        if (typeof isAdmin !== "boolean") {
          return res.status(400).json({
            message: "Ungültiger Admin-Status",
            success: false,
          });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
          return res.status(404).json({
            message: "Ticket nicht gefunden",
            success: false,
          });
        }

        const newMessage = {
          content,
          sender: isAdmin ? "ADMIN" : "USER",
          timestamp: new Date(),
          isAdmin,
        };

        ticket.messages.push(newMessage);
        await ticket.save();

        res.status(201).json({
          message: "Nachricht erfolgreich hinzugefügt",
          newMessage,
          success: true,
        });
      } catch (error) {
        console.error(`POST /api/tickets/${id}/messages Fehler:`, error);
        res.status(500).json({
          message: "Interner Serverfehler",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Methode ${method} ist nicht erlaubt`);
  }
}
