/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/admin/assign-lootbox-first.ts

import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import Profile from "@/models/Profile";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Methode nicht erlaubt." });
  }

  const { lootboxId } = req.body;

  if (!lootboxId) {
    return res.status(400).json({
      success: false,
      message: "Lootbox-ID fehlt im Request-Body.",
    });
  }

  try {
    // Finde den ersten Nutzer in der Datenbank
    const profile = await Profile.findOne();
    if (!profile) {
      return res
        .status(404)
        .json({ success: false, message: "Kein Nutzerprofil gefunden." });
    }

    // Prüfe, ob bereits ein Eintrag für diese Lootbox existiert
    const existingEntry = profile.lootboxes.find(
      (entry: { lootbox: any; quantity: number }) =>
        entry.lootbox.toString() === lootboxId
    );

    if (existingEntry) {
      // Erhöhe die Anzahl
      existingEntry.quantity += 1;
    } else {
      // Füge einen neuen Eintrag hinzu
      profile.lootboxes.push({ lootbox: lootboxId, quantity: 1 });
    }

    await profile.save();

    return res.status(200).json({
      success: true,
      message: "Lootbox erfolgreich dem ersten Nutzer zugewiesen.",
      profile,
    });
  } catch (error) {
    console.error("Assign Lootbox Error:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Zuweisen der Lootbox.",
    });
  }
}
