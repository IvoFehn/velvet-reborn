/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import MoodBaseDate from "@/models/MoodBaseDate";

// Typdefinition für die API-Antwort
type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Nur POST-Requests erlauben
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await dbConnect();
    console.log("Mood-Reset API aufgerufen");

    // Alle MoodBaseDate-Einträge deaktivieren
    const updateResult = await MoodBaseDate.updateMany({}, { active: false });

    console.log(
      `${updateResult.modifiedCount} MoodBaseDate-Einträge deaktiviert`
    );

    return res.status(200).json({
      success: true,
      message: "Alle angepassten Basisdaten wurden zurückgesetzt",
      data: {
        deactivatedCount: updateResult.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Error in mood-reset API:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Zurücksetzen der Basisdaten",
    });
  }
}
