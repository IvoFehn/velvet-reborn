/* eslint-disable @typescript-eslint/no-explicit-any */
// pages/api/daily-login/claim-lootbox.js
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserDailyLogin from "@/models/UserDailyLogin";
import Profile from "@/models/Profile";
import Lootbox from "@/models/Lootbox";
import dayjs from "dayjs";

// Optional: Falls du den Request-Body genauer typisieren möchtest:
interface ClaimLootboxBody {
  userId: string;
  lootboxId: string;
  isEventActive?: boolean; // falls benötigt
}

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

  // Typisiere den Body
  const { userId, lootboxId }: ClaimLootboxBody = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId ist erforderlich." });
  }

  if (!lootboxId) {
    return res
      .status(400)
      .json({ success: false, message: "lootboxId ist erforderlich." });
  }

  try {
    let user = await UserDailyLogin.findOne({ userId });
    const now = dayjs();
    if (!user) {
      user = new UserDailyLogin({ userId, consecutiveDays: 0 });
    }

    // Prüfe, ob der Bonus heute bereits beansprucht wurde.
    if (user.lastClaimAt) {
      const lastClaim = dayjs(user.lastClaimAt);
      if (now.format("YYYY-MM-DD") === lastClaim.format("YYYY-MM-DD")) {
        return res.status(400).json({
          success: false,
          message: "Heute wurde der Bonus bereits beansprucht.",
        });
      }
      if (now.diff(lastClaim, "hour", true) < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Bitte warte mindestens 2 Stunden zwischen den Bonus-Anforderungen.",
        });
      }
    }

    // Berechne den neuen Streak (consecutiveDays)
    let newConsecutiveDays = 1;
    if (
      user.lastClaimAt &&
      dayjs(user.lastClaimAt).isSame(now.subtract(1, "day"), "day")
    ) {
      newConsecutiveDays = user.consecutiveDays + 1;
    }
    if (newConsecutiveDays > 7) {
      newConsecutiveDays = 1;
    }

    user.consecutiveDays = newConsecutiveDays;
    user.lastClaimAt = now.toDate();
    user.lastVisitAt = now.toDate();
    await user.save();

    let rewardType = "kleine Belohnung";
    let lootboxAdded = false;

    // Wenn der 7. Tag erreicht ist, soll die übergebene lootboxId verwendet werden.
    if (newConsecutiveDays === 7) {
      rewardType = "Premium Belohnung";
      // Suche den Lootbox-Datensatz anhand der übergebenen ID.
      const lootbox = await Lootbox.findById(lootboxId);
      if (!lootbox) {
        return res
          .status(404)
          .json({ success: false, message: "Lootbox nicht gefunden." });
      }

      // Lade das Profil
      const profile = await Profile.findById(userId);
      if (!profile) {
        return res
          .status(404)
          .json({ success: false, message: "Profil nicht gefunden." });
      }

      // Prüfe, ob bereits ein Eintrag für diese Lootbox existiert.
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
      lootboxAdded = true;
    }

    return res.status(200).json({
      success: true,
      message: "Login Bonus erfolgreich beansprucht.",
      consecutiveDays: newConsecutiveDays,
      reward: rewardType,
      lootboxAdded,
    });
  } catch (error) {
    console.error("Fehler beim Beanspruchen des Bonus:", error);
    return res.status(500).json({
      success: false,
      message: "Serverfehler beim Beantragen des Bonus.",
    });
  }
}
