import React, { useState, useEffect } from "react";
import {
  FaCheck,
  FaGift,
  FaCrown,
  FaArrowRight,
  FaExclamationTriangle,
} from "react-icons/fa";
import Link from "next/link";

interface Profile {
  _id: string;
  consecutiveDays: number;
  lastClaimAt?: Date;
}

const DailyRewardsWidget: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [clickable, setClickable] = useState<boolean>(false);
  const [nextRewardTimestamp, setNextRewardTimestamp] = useState<number | null>(
    null
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [streakBroken, setStreakBroken] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile/get`);
      const data = await response.json();
      if (data.success) setProfile(data.data);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Prüft den Streak-Status und setzt ihn zurück, wenn nötig
  const checkAndUpdateStreakStatus = async (userId: string) => {
    try {
      setLoading(true);
      // Verwende den vorhandenen Endpunkt, da /api/daily-login/check-streak noch nicht existiert
      const response = await fetch(`/api/daily-login?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        // Importieren Sie die isStreakBroken-Funktion aus dem Service, wenn verfügbar
        // import { isStreakBroken, resetStreak } from "@/lib/streak-service";

        // Manuelle Streak-Überprüfung (bis Service importiert werden kann)
        const isStreakBroken = (
          lastClaimAt: Date | null | undefined,
          consecutiveDays: number
        ): boolean => {
          if (!lastClaimAt || consecutiveDays === 0) return false;

          const now = new Date();
          const lastClaim = new Date(lastClaimAt);
          const hoursSinceLastClaim =
            (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

          const lastClaimDay = new Date(lastClaim);
          lastClaimDay.setHours(0, 0, 0, 0);

          const yesterdayStart = new Date(now);
          yesterdayStart.setDate(now.getDate() - 1);
          yesterdayStart.setHours(0, 0, 0, 0);

          const todayStart = new Date(now);
          todayStart.setHours(0, 0, 0, 0);

          if (
            hoursSinceLastClaim > 48 &&
            lastClaimDay < yesterdayStart &&
            lastClaimDay < todayStart
          ) {
            return true;
          }

          return false;
        };

        // Überprüfe mit Helper-Funktion
        const streakBroken = isStreakBroken(
          data.user.lastClaimAt,
          data.user.consecutiveDays
        );

        if (streakBroken) {
          setStreakBroken(true);
          setCurrentDay(0); // Zurücksetzen auf Tag 0

          // Temporäre Mock bis API implementiert ist
          localStorage.setItem(
            `user_${userId}_streak_reset`,
            Date.now().toString()
          );
          console.log(`Streak für Benutzer ${userId} wurde zurückgesetzt`);

          // Wenn die API implementiert ist, nutzen Sie:
          // await fetch(`/api/daily-login/reset-streak`, {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ userId }),
          // });
        } else {
          setCurrentDay(data.user.consecutiveDays);
          setClickable(data.clickable);

          // Zeitpunkt für nächsten Reward berechnen
          if (!data.clickable && data.user.lastClaimAt) {
            const lastClaim = new Date(data.user.lastClaimAt);
            const twoHoursAfterClaim = lastClaim.getTime() + 2 * 3600 * 1000;
            const nextDay = new Date(lastClaim);
            nextDay.setDate(lastClaim.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            setNextRewardTimestamp(
              Math.max(twoHoursAfterClaim, nextDay.getTime())
            );
          }
        }
      } else {
        setError(data.message || "Fehler beim Abrufen des Daily Login Status.");
      }
    } catch (err) {
      console.error("Error checking streak status:", err);
      setError("Fehler beim Überprüfen des Streak-Status.");
    } finally {
      setLoading(false);
    }
  };

  // Profil laden
  useEffect(() => {
    fetchProfile();
  }, []);

  // Streak-Status überprüfen, sobald das Profil geladen ist
  useEffect(() => {
    if (profile?._id) {
      checkAndUpdateStreakStatus(profile._id);
    }
  }, [profile]);

  // Timer aktualisieren
  useEffect(() => {
    if (!nextRewardTimestamp) return;
    const timer = setInterval(() => {
      const diff = nextRewardTimestamp - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);

      // Wenn der Timer abgelaufen ist, können wir den Status aktualisieren
      if (diff <= 0 && !clickable && profile?._id) {
        checkAndUpdateStreakStatus(profile._id);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [nextRewardTimestamp, clickable, profile]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m`;
  };

  if (loading) {
    return (
      <section className="rounded-xl bg-white p-4 shadow-sm flex justify-center items-center h-32">
        <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center text-lg font-semibold text-gray-800">
          Daily Rewards
        </h2>
        <Link
          href="/daily"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 hover:underline"
        >
          Details
          <FaArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {streakBroken && (
        <div className="mb-3 bg-amber-50 border-l-4 border-amber-500 p-2 text-xs text-amber-700 flex items-center gap-1.5 rounded-r">
          <FaExclamationTriangle className="h-3 w-3 text-amber-500" />
          <span>Streak verloren! Hol dir heute einen neuen Reward.</span>
        </div>
      )}

      {error && (
        <div className="mb-3 bg-red-50 border-l-4 border-red-500 p-2 text-xs text-red-700 rounded-r">
          {error}
        </div>
      )}

      <div className="mb-3 h-2 rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
          style={{ width: `${(currentDay / 7) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4, 5, 6, 7].map((day) => (
          <div
            key={day}
            className={`flex h-12 items-center justify-center rounded-lg text-sm transition-all 
              ${
                day <= currentDay
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-50 text-gray-400"
              } 
              ${day === 7 ? "bg-purple-50 text-purple-600" : ""}
              ${
                day === currentDay + 1 && clickable
                  ? "ring-2 ring-blue-400 animate-pulse"
                  : ""
              }`}
          >
            {day === 7 ? (
              <FaCrown />
            ) : day <= currentDay ? (
              <FaCheck />
            ) : (
              <FaGift />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 text-center text-sm text-gray-500">
        {clickable ? (
          <span className="font-medium text-blue-600">
            Reward jetzt verfügbar!
          </span>
        ) : nextRewardTimestamp ? (
          `Nächster Reward in ${formatTime(timeLeft)}`
        ) : (
          "Claim deinen ersten Reward"
        )}
      </div>
    </section>
  );
};

export default DailyRewardsWidget;
