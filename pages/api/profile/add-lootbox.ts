/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/add-lootbox.ts
import dbConnect from "@/lib/dbConnect";
import Lootbox from "@/models/Lootbox";
import Profile from "@/models/Profile";
import type { NextApiRequest, NextApiResponse } from "next";

interface Data {
  success: boolean;
  profile?: any;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Methode nicht erlaubt" });
  }

  try {
    // Erwartete Felder im Request-Body: profileId und lootboxId
    const { profileId, lootboxId } = req.body;

    if (!profileId || !lootboxId) {
      return res.status(400).json({
        success: false,
        message: "profileId und lootboxId sind erforderlich",
      });
    }

    // Überprüfe, ob die Lootbox existiert
    const lootbox = await Lootbox.findById(lootboxId);
    if (!lootbox) {
      return res
        .status(404)
        .json({ success: false, message: "Lootbox nicht gefunden" });
    }

    // Lade das Profil
    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Profil nicht gefunden" });
    }

    // Prüfe, ob bereits ein Eintrag für diese Lootbox existiert
    const existingEntry = profile.lootboxes.find(
      (entry: any) => entry.lootbox.toString() === lootboxId
    );

    if (existingEntry) {
      // Falls vorhanden, erhöhe die Anzahl
      existingEntry.quantity += 1;
    } else {
      // Andernfalls füge einen neuen Eintrag hinzu
      profile.lootboxes.push({ lootbox: lootboxId, quantity: 1 });
    }

    // Speichere das aktualisierte Profil
    const updatedProfile = await profile.save();

    return res.status(200).json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("Error in add-lootbox:", error);
    return res
      .status(500)
      .json({ success: false, message: "Interner Serverfehler" });
  }
}
