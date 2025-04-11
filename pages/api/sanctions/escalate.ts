// pages/api/sanctions/escalate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Sanction from "../../../models/Sanction";
import { IApiResponse, ISanction } from "@/types/index";

interface EscalateSanctionRequest extends NextApiRequest {
  body: {
    sanctionId: string;
  };
}

export default async function handler(
  req: EscalateSanctionRequest,
  res: NextApiResponse<IApiResponse<ISanction>>
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    const { sanctionId } = req.body;

    if (!sanctionId) {
      return res.status(400).json({
        success: false,
        message: "Bitte geben Sie eine Sanktions-ID an",
      });
    }

    // Sanktion finden
    const sanction = await Sanction.findById(sanctionId);

    if (!sanction) {
      return res.status(404).json({
        success: false,
        message: "Sanktion nicht gefunden",
      });
    }

    // Prüfen, ob die Sanktion bereits erledigt ist
    if (sanction.status === "erledigt") {
      return res.status(400).json({
        success: false,
        message: "Erledigte Sanktionen können nicht eskaliert werden",
      });
    }

    // Eskalationszähler erhöhen
    sanction.escalationCount = (sanction.escalationCount || 0) + 1;

    // Menge basierend auf Eskalation erhöhen (um 50%)
    sanction.amount = Math.ceil(sanction.amount * 1.5);

    // Deadline verlängern (um einen Tag)
    const currentDeadline = new Date(sanction.deadline);
    sanction.deadline = new Date(
      currentDeadline.getTime() + 24 * 60 * 60 * 1000
    );

    // Status auf "eskaliert" setzen
    sanction.status = "eskaliert";

    // Speichern
    await sanction.save();

    // Erfolgreiche Antwort senden
    return res.status(200).json({
      success: true,
      data: sanction,
      message: "Sanktion erfolgreich eskaliert",
    });
  } catch (error) {
    console.error("Error escalating sanction:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler beim Eskalieren der Sanktion",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
