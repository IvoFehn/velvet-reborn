/* eslint-disable @typescript-eslint/no-explicit-any */
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
      // Zerlege updateData in gold/exp und die übrigen Felder
      const { gold, exp, ...otherFields } = updateData;

      // Baue das Update-Objekt mit $set für alle Felder, die direkt überschrieben werden sollen.
      const updateQuery: any = {
        $set: {
          updatedAt: new Date(),
          ...otherFields,
        },
      };

      // Falls gold oder exp vorhanden sind, werden diese Werte inkrementell angepasst.
      if (gold !== undefined || exp !== undefined) {
        updateQuery.$inc = {};
        if (gold !== undefined) {
          updateQuery.$inc.gold = gold;
        }
        if (exp !== undefined) {
          updateQuery.$inc.exp = exp;
        }
      }

      // Finde und aktualisiere das erste gefundene Profil
      const updatedProfile = await Profile.findOneAndUpdate(
        {}, // Leeres Filterkriterium: Es wird das erste Profil-Dokument verwendet.
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
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Serverfehler" });
  }
}
