import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserDailyLogin from "@/models/UserDailyLogin";
import dayjs from "dayjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === "GET") {
    const { userId } = req.query;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId ist erforderlich." });
    }

    try {
      const user = await UserDailyLogin.findOne({ userId });
      const now = dayjs();

      if (!user) {
        const newUser = new UserDailyLogin({
          userId,
          consecutiveDays: 0,
          lastVisitAt: now.toDate(),
        });
        await newUser.save();
        return res.status(200).json({
          success: true,
          user: newUser,
          clickable: true,
        });
      }

      let clickable = false;
      let streakBroken = false;

      if (user.lastClaimAt) {
        const lastClaim = dayjs(user.lastClaimAt);
        const todayStart = now.startOf("day");
        const lastClaimDayStart = lastClaim.startOf("day");

        if (
          !todayStart.isSame(lastClaimDayStart) &&
          now.diff(lastClaim, "hour") > 48
        ) {
          // Streak ist gebrochen
          streakBroken = true;
          user.consecutiveDays = 0;
          clickable = true; // Benutzer kann sofort eine neue Streak starten
        } else if (
          !todayStart.isSame(lastClaimDayStart) &&
          now.diff(lastClaim, "hour") >= 2
        ) {
          clickable = true; // Normaler Claim möglich
        }
      } else {
        clickable = true; // Erster Claim
      }

      user.lastVisitAt = now.toDate();
      await user.save();

      return res.status(200).json({
        success: true,
        user,
        clickable,
        streakBroken, // Optional: Rückmeldung an Frontend
      });
    } catch (error) {
      console.error("Error checking daily login status:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Überprüfen des Daily Login Status.",
      });
    }
  } else if (req.method === "POST") {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "userId ist erforderlich." });
    }

    try {
      const user = await UserDailyLogin.findOne({ userId });
      const now = dayjs();

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Kein Datensatz für diesen Benutzer gefunden.",
        });
      }

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

      user.consecutiveDays += 1;
      user.lastClaimAt = now.toDate();
      user.lastVisitAt = now.toDate();
      await user.save();

      return res.status(200).json({
        success: true,
        message: "Täglicher Bonus erfolgreich beansprucht!",
        consecutiveDays: user.consecutiveDays,
        user,
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
