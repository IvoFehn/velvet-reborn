// pages/api/tickets/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Ticket from "@/models/Ticket";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { archived } = req.query;
        const tickets = await Ticket.find({
          archived: archived === "true",
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, tickets });
      } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(400).json({
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to fetch tickets",
        });
      }
      break;

    case "POST":
      try {
        const { subject, description, generatorId, sanctionsFrontendId } =
          req.body;

        // Validate required fields
        if (!subject || !description) {
          return res.status(400).json({
            success: false,
            message: "Subject and description are required",
          });
        }

        // Erstelle ein neues Ticket mit allen benötigten Feldern
        const ticketData = {
          subject,
          description,
          generatorId: generatorId || null,
          sanctionsFrontendId: sanctionsFrontendId || null,
          // Wenn sanctionsFrontendId vorhanden ist, übertrage es auch in sanctionId für das neue Schema
          sanctionId: sanctionsFrontendId || null,
          archived: false,
          messages: [], // Leeres Array für Nachrichten
          createdAt: new Date(),
        };

        const ticket = await Ticket.create(ticketData);

        // Send Telegram notification
        try {
          await sendTelegramMessage(
            "admin",
            `Ein neuer Antrag wurde eingereicht am ${dayjs()
              .locale("de")
              .format("DD.MM.YYYY HH:mm:ss")}`
          );
        } catch (telegramError) {
          console.error("Telegram notification error:", telegramError);
          // Continue processing even if Telegram notification fails
        }

        res.status(201).json({ success: true, ticket });
      } catch (error) {
        console.error("Error creating ticket:", error);
        res.status(400).json({
          success: false,
          message:
            error instanceof Error ? error.message : "Failed to create ticket",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
