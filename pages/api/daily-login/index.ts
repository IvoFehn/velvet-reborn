// pages/api/daily-login.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserDailyLogin from "@/models/UserDailyLogin";
import dayjs from "dayjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // GET request to check status
  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId ist erforderlich." });
    }

    try {
      // Find the user record
      const user = await UserDailyLogin.findOne({ userId });
      const now = dayjs();

      if (!user) {
        // Create a new user record if it doesn't exist
        const newUser = new UserDailyLogin({
          userId,
          consecutiveDays: 0,
          lastVisitAt: now.toDate(),
        });
        await newUser.save();

        return res.status(200).json({
          success: true,
          user: newUser,
          clickable: true, // First time user can claim immediately
        });
      }

      // Check if reward is claimable
      let clickable = false;

      if (!user.lastClaimAt) {
        // First time - can claim
        clickable = true;
      } else {
        const lastClaim = dayjs(user.lastClaimAt);
        const todayStart = now.startOf("day");
        const lastClaimDayStart = lastClaim.startOf("day");

        // Can claim if:
        // 1. Not already claimed today
        // 2. At least 2 hours passed since last claim
        if (
          !todayStart.isSame(lastClaimDayStart) &&
          now.diff(lastClaim, "hour") >= 2
        ) {
          clickable = true;
        }
      }

      // Update lastVisitAt timestamp
      user.lastVisitAt = now.toDate();
      await user.save();

      return res.status(200).json({
        success: true,
        user: user,
        clickable: clickable,
      });
    } catch (error) {
      console.error("Error checking daily login status:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Überprüfen des Daily Login Status.",
      });
    }
  }
  // POST request to claim reward
  else if (req.method === "POST") {
    // Your existing POST handling logic
    // This would be similar to your claim-lootbox.ts but for regular daily claims
    // Include logic to increment consecutiveDays, update lastClaimAt, etc.

    // Example POST implementation:
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId ist erforderlich." });
    }

    try {
      // Find the user record
      const user = await UserDailyLogin.findOne({ userId });
      const now = dayjs();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Kein Datensatz für diesen Benutzer gefunden.",
        });
      }

      // Check if the user can claim
      if (user.lastClaimAt) {
        const lastClaim = dayjs(user.lastClaimAt);

        // Check if already claimed today
        if (now.format("YYYY-MM-DD") === lastClaim.format("YYYY-MM-DD")) {
          return res.status(400).json({
            success: false,
            message: "Heute wurde der Bonus bereits beansprucht.",
          });
        }

        // Check if 2 hours have passed
        if (now.diff(lastClaim, "hour", true) < 2) {
          return res.status(400).json({
            success: false,
            message:
              "Bitte warte mindestens 2 Stunden zwischen den Bonus-Anforderungen.",
          });
        }
      }

      // Update user streak
      user.consecutiveDays += 1;
      user.lastClaimAt = now.toDate();
      user.lastVisitAt = now.toDate();
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Täglicher Bonus erfolgreich beansprucht!",
        consecutiveDays: user.consecutiveDays,
        user: user,
      });
    } catch (error) {
      console.error("Fehler beim Beanspruchen des täglichen Bonus:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Beanspruchen des täglichen Bonus.",
      });
    }
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Methode nicht erlaubt." });
  }
}
