/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/tickets/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

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

  // Check if the deadline has expired - this function will be used in GET and PUT methods
  const checkDeadline = async (ticket: any) => {
    if (ticket.responseDeadline && !ticket.archived) {
      const now = new Date();
      const deadline = new Date(ticket.responseDeadline);

      // Check if we're in night hours (00:00 - 08:00)
      const currentHour = now.getHours();
      const isNightHours = currentHour >= 0 && currentHour < 8;

      if (now > deadline) {
        // If we're in night hours, extend the deadline to 8:00 AM
        if (isNightHours) {
          const today = new Date();
          today.setHours(8, 0, 0, 0); // Set to 8:00 AM today

          // Only extend if the current deadline is earlier than 8:00 AM today
          if (deadline < today) {
            ticket.responseDeadline = today;
            await ticket.save();
            return false; // Deadline not expired, just extended
          }
        } else {
          // Not in night hours, close the ticket
          const deadlineMessage = {
            content:
              "Frist überschritten. Das Ticket wurde automatisch geschlossen.",
            sender: "SYSTEM",
            timestamp: now,
            isAdmin: false,
          };

          ticket.messages.push(deadlineMessage);
          ticket.archived = true;
          ticket.responseDeadline = null;
          await ticket.save();

          // Send notifications
          try {
            await sendTelegramMessage(
              "admin",
              `Ticket #${id} wurde automatisch geschlossen, da die Antwortfrist überschritten wurde.`
            );
            await sendTelegramMessage(
              "user",
              `Ihr Ticket #${id} wurde automatisch geschlossen, da die Antwortfrist überschritten wurde.`
            );
          } catch (telegramError) {
            console.error("Telegram notification error:", telegramError);
          }

          return true; // Deadline expired and ticket closed
        }
      }
    }
    return false; // Deadline not expired
  };

  switch (req.method) {
    case "GET":
      try {
        const ticket = await Ticket.findById(id);
        if (!ticket)
          return res
            .status(404)
            .json({ message: "Ticket nicht gefunden", success: false });

        // Check if deadline has expired
        const deadlineExpired = await checkDeadline(ticket);

        res.status(200).json({
          ticket,
          deadlineExpired,
          success: true,
        });
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

        // Check deadline before making changes
        await checkDeadline(ticket);

        if (subject !== undefined) ticket.subject = subject;
        if (description !== undefined) ticket.description = description;
        if (archived !== undefined) {
          ticket.archived = archived;
          // If closing the ticket, clear any response deadline
          if (archived) {
            ticket.responseDeadline = null;
          }
        }

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
