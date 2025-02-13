// pages/api/daily-login.js
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import UserDailyLogin from "@/models/UserDailyLogin";
import dayjs from "dayjs";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // Benutzer-ID wird je nach Methode (GET aus Query, POST aus Body) übergeben
  const userId = req.method === "GET" ? req.query.userId : req.body.userId;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "userId ist erforderlich." });
  }

  // GET: Status abfragen, dabei letzten Besuch aktualisieren und prüfen, ob der Bonus anklickbar ist.
  if (req.method === "GET") {
    try {
      let user = await UserDailyLogin.findOne({ userId });
      const now = dayjs();

      if (!user) {
        // Falls noch kein Datensatz existiert, wird ein neuer erstellt.
        user = new UserDailyLogin({
          userId,
          consecutiveDays: 0,
          lastVisitAt: now.toDate(),
        });
        await user.save();
      } else {
        // Aktualisiere den letzten Besuchszeitpunkt
        user.lastVisitAt = now.toDate();
        await user.save();
      }

      // Prüfe, ob der Bonus anklickbar ist:
      // - Der Bonus darf nicht am gleichen Kalendertag (YYYY-MM-DD) wie der letzte Claim beansprucht werden.
      // - Zwischen dem letzten Claim und jetzt muss ein Mindestabstand von 2 Stunden liegen.
      let clickable = true;
      if (user.lastClaimAt) {
        const lastClaim = dayjs(user.lastClaimAt);
        if (now.format("YYYY-MM-DD") === lastClaim.format("YYYY-MM-DD")) {
          clickable = false;
        } else if (now.diff(lastClaim, "hour", true) < 2) {
          clickable = false;
        }
      }

      return res.status(200).json({
        success: true,
        user: {
          consecutiveDays: user.consecutiveDays,
          lastClaimAt: user.lastClaimAt,
          lastVisitAt: user.lastVisitAt,
        },
        clickable,
      });
    } catch (error) {
      console.error("Fehler beim Abrufen des Status:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Abrufen des Status.",
      });
    }
  }
  // POST: Bonus beanspruchen – Prüfung der Bedingungen und Aktualisierung des Daily-Login-Status.
  else if (req.method === "POST") {
    try {
      let user = await UserDailyLogin.findOne({ userId });
      const now = dayjs();

      if (!user) {
        // Falls kein Datensatz existiert, erstelle einen neuen.
        user = new UserDailyLogin({ userId, consecutiveDays: 0 });
      }

      if (user.lastClaimAt) {
        const lastClaim = dayjs(user.lastClaimAt);

        // Bedingung 1: Bonus darf nicht zweimal am gleichen Kalendertag beansprucht werden.
        if (now.format("YYYY-MM-DD") === lastClaim.format("YYYY-MM-DD")) {
          return res.status(400).json({
            success: false,
            message: "Heute wurde der Bonus bereits beansprucht.",
          });
        }

        // Bedingung 2: Es müssen mindestens 2 Stunden seit dem letzten Claim vergangen sein.
        if (now.diff(lastClaim, "hour", true) < 2) {
          return res.status(400).json({
            success: false,
            message:
              "Bitte warte mindestens 2 Stunden zwischen den Bonus-Anforderungen.",
          });
        }
      }

      // Bestimme, ob es sich um einen aufeinanderfolgenden Tag handelt.
      // Falls der letzte Claim genau am Vortag erfolgte, wird der Zähler erhöht, sonst wird er auf 1 gesetzt.
      let newConsecutiveDays = 1;
      if (
        user.lastClaimAt &&
        dayjs(user.lastClaimAt).isSame(now.subtract(1, "day"), "day")
      ) {
        newConsecutiveDays = user.consecutiveDays + 1;
      }

      // Optional: Falls mehr als 7 Tage erreicht wurden, kann die Zählung zurückgesetzt werden.
      if (newConsecutiveDays > 7) {
        newConsecutiveDays = 1;
      }

      user.consecutiveDays = newConsecutiveDays;
      user.lastClaimAt = now.toDate();
      user.lastVisitAt = now.toDate();
      await user.save();

      // Lege fest, welche Belohnung vergeben wird (z. B. Premium Belohnung an Tag 7).
      let rewardType = "kleine Belohnung";
      if (newConsecutiveDays === 7) {
        rewardType = "Premium Belohnung";
        // Optional: Nach Erreichen von 7 Tagen könnte der Streak hier zurückgesetzt werden.
      }

      return res.status(200).json({
        success: true,
        message: "Login Bonus erfolgreich beansprucht.",
        consecutiveDays: newConsecutiveDays,
        reward: rewardType,
      });
    } catch (error) {
      console.error("Fehler beim Beanspruchen des Bonus:", error);
      return res.status(500).json({
        success: false,
        message: "Serverfehler beim Beantragen des Bonus.",
      });
    }
  } else {
    return res
      .status(405)
      .json({ success: false, message: "Methode nicht erlaubt." });
  }
}
