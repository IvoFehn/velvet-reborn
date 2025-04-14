/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { id, since },
    method,
  } = req;

  await dbConnect();

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      message: "Ungültige Ticket-ID",
      success: false,
    });
  }

  // Helper function to check if deadline is expired
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

        // Check if deadline has expired and close the ticket automatically if needed
        const deadlineExpired = await checkDeadline(ticket);

        // Get messages with filter by date if 'since' parameter exists
        let messages = ticket.messages || [];
        if (since) {
          const sinceDate = new Date(since as string);
          messages = messages.filter(
            (msg: { timestamp: Date | string }) =>
              new Date(msg.timestamp) > sinceDate
          );
        }

        // Return serialized messages with ISO string timestamps
        res.status(200).json({
          messages: messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp.toISOString(),
          })),
          responseDeadline: ticket.responseDeadline
            ? ticket.responseDeadline.toISOString()
            : null,
          responseHours: ticket.responseHours || 6,
          deadlineExpired, // Include this flag so the frontend can update its state
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
        const { content, isAdmin, responseHours } = req.body;

        if (!content) {
          return res.status(400).json({
            message: "Nachrichteninhalt fehlt",
            success: false,
          });
        }

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

        // Check if deadline has expired before allowing new message
        const deadlineExpired = await checkDeadline(ticket);

        // If the ticket is now archived due to deadline expiration, don't allow posting
        if (ticket.archived) {
          return res.status(400).json({
            message:
              "Ticket ist geschlossen und kann nicht mehr beantwortet werden",
            success: false,
            deadlineExpired,
          });
        }

        // Create the new message
        const newMessage = {
          content,
          sender: isAdmin ? "ADMIN" : "USER",
          timestamp: new Date(),
          isAdmin,
        };

        // Add the message to the ticket
        ticket.messages.push(newMessage);

        // Handle deadline: set if admin message, clear if user message
        if (isAdmin) {
          // If admin provided custom responseHours, update the ticket
          if (
            responseHours &&
            typeof responseHours === "number" &&
            responseHours > 0
          ) {
            ticket.responseHours = responseHours;
          }

          // Calculate and set deadline
          ticket.calculateResponseDeadline();

          // Track the last admin message time
          ticket.lastAdminMessage = new Date();
        } else {
          // Reset deadline when user responds
          ticket.responseDeadline = null;
        }

        await ticket.save();

        res.status(201).json({
          message: "Nachricht erfolgreich hinzugefügt",
          newMessage: {
            ...newMessage,
            timestamp: newMessage.timestamp.toISOString(),
          },
          responseDeadline: ticket.responseDeadline
            ? ticket.responseDeadline.toISOString()
            : null,
          responseHours: ticket.responseHours,
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

    case "PUT":
      try {
        const { responseHours } = req.body;

        if (typeof responseHours !== "number" || responseHours <= 0) {
          return res.status(400).json({
            message: "Ungültige Antwortfrist",
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

        // Check if deadline has expired before updating
        const deadlineExpired = await checkDeadline(ticket);

        if (ticket.archived) {
          return res.status(400).json({
            message:
              "Ticket ist geschlossen und kann nicht mehr bearbeitet werden",
            success: false,
            deadlineExpired,
          });
        }

        // Update response hours
        ticket.responseHours = responseHours;

        // Recalculate deadline if there's an active one
        if (ticket.responseDeadline && !ticket.archived) {
          ticket.calculateResponseDeadline();
        }

        await ticket.save();

        res.status(200).json({
          message: "Antwortfrist aktualisiert",
          responseHours: ticket.responseHours,
          responseDeadline: ticket.responseDeadline
            ? ticket.responseDeadline.toISOString()
            : null,
          success: true,
        });
      } catch (error) {
        console.error(`PUT /api/tickets/${id}/messages Fehler:`, error);
        res.status(500).json({
          message: "Interner Serverfehler",
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT"]);
      res.status(405).end(`Methode ${method} ist nicht erlaubt`);
  }
}
