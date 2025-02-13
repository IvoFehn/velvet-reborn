/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/profile/admin-update.ts

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
      const { gold, exp, ...otherFields } = updateData;

      const updateQuery: any = {
        $set: {
          updatedAt: new Date(),
          ...otherFields,
        },
      };

      if (gold !== undefined) updateQuery.$set.gold = gold;
      if (exp !== undefined) updateQuery.$set.exp = exp;

      // Filtere anhand der übergebenen ID
      const filter = updateData._id ? { _id: updateData._id } : {};

      const updatedProfile = await Profile.findOneAndUpdate(
        filter,
        updateQuery,
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
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Serverfehler" });
  }
}
