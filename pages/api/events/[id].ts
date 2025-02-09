/* eslint-disable @typescript-eslint/no-unused-vars */
// pages/api/events/[id].ts
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
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
          new: true,
        });
        if (!updatedEvent) {
          return res
            .status(404)
            .json({ success: false, message: "Event nicht gefunden" });
        }
        res.status(200).json({ success: true, event: updatedEvent });
      } catch (error) {
        res.status(400).json({
          success: false,
          message: "Fehler beim Aktualisieren des Events",
        });
      }
      break;
    case "DELETE":
      try {
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
          return res
            .status(404)
            .json({ success: false, message: "Event nicht gefunden" });
        }
        res.status(200).json({ success: true });
      } catch (error) {
        res
          .status(400)
          .json({ success: false, message: "Fehler beim Löschen des Events" });
      }
      break;
    default:
      res.setHeader("Allow", ["PUT", "DELETE"]);
      res
        .status(405)
        .json({ success: false, message: `Methode ${method} nicht erlaubt` });
      break;
  }
}
