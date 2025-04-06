// pages/api/sanctions/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Sanction from "@/models/Sanction";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const { status, latest, limit = 50 } = req.query;

        let query = {};
        // Filtern nach Status, falls angegeben
        if (status) {
          // Unterstützt mehrere Status durch Komma getrennt
          const statusList = (status as string).split(",");
          query = { status: { $in: statusList } };
        }

        let sanctions;
        if (latest === "true") {
          // Nur die neueste Sanktion abholen
          sanctions = await Sanction.find(query)
            .sort({ createdAt: -1 })
            .limit(1);
        } else {
          // Normale Suche mit Limit
          sanctions = await Sanction.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit));
        }

        res.status(200).json({ success: true, data: sanctions });
      } catch (error) {
        res.status(400).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Fehler beim Abrufen der Sanktionen",
        });
      }
      break;

    case "PUT":
      try {
        const { id, status } = req.body;

        if (!id) {
          return res.status(400).json({
            success: false,
            message: "Sanktions-ID ist erforderlich",
          });
        }

        // Überprüfen, ob der angegebene Status gültig ist
        if (
          status &&
          !["offen", "erledigt", "eskaliert", "abgelaufen"].includes(status)
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Ungültiger Status. Erlaubt sind: offen, erledigt, eskaliert, abgelaufen",
          });
        }

        // Sanktion finden und aktualisieren
        const updatedSanction = await Sanction.findByIdAndUpdate(
          id,
          { status },
          { new: true, runValidators: true }
        );

        if (!updatedSanction) {
          return res.status(404).json({
            success: false,
            message: "Sanktion nicht gefunden",
          });
        }

        res.status(200).json({
          success: true,
          data: updatedSanction,
          message: `Sanktion erfolgreich aktualisiert auf Status: ${status}`,
        });
      } catch (error) {
        res.status(400).json({
          success: false,
          message:
            error instanceof Error
              ? error.message
              : "Fehler beim Aktualisieren der Sanktion",
        });
      }
      break;

    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
