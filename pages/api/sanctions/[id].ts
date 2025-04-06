import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Sanction from "@/models/Sanction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ success: false, message: "Ungültige Sanktions-ID" });
  }

  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const sanction = await Sanction.findById(id);
        if (!sanction) {
          return res
            .status(404)
            .json({ success: false, message: "Sanktion nicht gefunden" });
        }
        res.status(200).json({ success: true, data: sanction });
      } catch (error) {
        res.status(400).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Fehler beim Abrufen der Sanktion",
        });
      }
      break;

    case "DELETE":
      try {
        const deletedSanction = await Sanction.findByIdAndDelete(id);
        if (!deletedSanction) {
          return res
            .status(404)
            .json({ success: false, message: "Sanktion nicht gefunden" });
        }
        res
          .status(200)
          .json({ success: true, message: "Sanktion erfolgreich gelöscht" });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Fehler beim Löschen der Sanktion",
          error: error instanceof Error ? error.message : String(error),
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
