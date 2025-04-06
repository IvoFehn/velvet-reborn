// pages/api/sanctions/complete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Sanction from "../../../models/Sanction";
import { IApiResponse, ISanction } from "@/types/index";

interface CompleteSanctionRequest extends NextApiRequest {
  body: {
    sanctionId: string;
  };
}

export default async function handler(
  req: CompleteSanctionRequest,
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
        message: "Diese Sanktion wurde bereits als erledigt markiert",
      });
    }

    // Status auf "erledigt" setzen
    sanction.status = "erledigt";

    // Speichern
    await sanction.save();

    // Erfolgreiche Antwort senden
    return res.status(200).json({
      success: true,
      data: sanction,
      message: "Sanktion erfolgreich als erledigt markiert",
    });
  } catch (error) {
    console.error("Error completing sanction:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler beim Markieren der Sanktion als erledigt",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
