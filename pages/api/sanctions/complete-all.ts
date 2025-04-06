// pages/api/sanctions/complete-all.ts
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Sanction from "../../../models/Sanction";
import { IApiResponse } from "@/types/index";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IApiResponse>
) {
  if (req.method !== "PUT") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    await dbConnect();

    // Alle offenen Sanktionen abrufen
    const result = await Sanction.updateMany(
      { status: { $in: ["offen", "eskaliert"] } },
      { $set: { status: "erledigt" } }
    );

    // Erfolgreiche Antwort senden
    return res.status(200).json({
      success: true,
      count: result.modifiedCount,
      message: `${result.modifiedCount} Sanktion(en) erfolgreich als erledigt markiert`,
    });
  } catch (error) {
    console.error("Error completing all sanctions:", error);
    return res.status(500).json({
      success: false,
      message: "Fehler beim Markieren aller Sanktionen als erledigt",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
