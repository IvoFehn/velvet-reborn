// pages/api/profile/update.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import Profile from "../../../models/Profile";
import { UpdateProfilePayload } from "../../../types/profile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  try {
    if (req.method === "PUT") {
      const updateData: UpdateProfilePayload = req.body;

      // Finde und aktualisiere das erste gefundene Profil
      const updatedProfile = await Profile.findOneAndUpdate(
        {}, // Leeres Filterkriterium, um das erste Dokument zu finden
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedProfile) {
        return res
          .status(404)
          .json({ success: false, message: "Profil nicht gefunden" });
      }

      return res.status(200).json({ success: true, data: updatedProfile });
    }

    return res
      .status(405)
      .json({ success: false, message: "Methode nicht erlaubt" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Serverfehler" });
  }
}
