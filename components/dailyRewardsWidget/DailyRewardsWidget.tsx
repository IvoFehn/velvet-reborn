import React, { useState, useEffect, useCallback } from "react";
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
  const [lastCheckTime, setLastCheckTime] = useState<number>(0);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user?action=profile`);
      const data = await response.json();
      if (data.data) setProfile(data.data);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Moved to useCallback to prevent recreation on each render
  const isStreakBroken = useCallback(
    (
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
    },
    []
  );

  // Wrapped in useCallback to stabilize function reference
  const checkAndUpdateStreakStatus = useCallback(
    async (userId: string) => {
      // Prevent checking too frequently (prevent rapid re-checks)
      const now = Date.now();
      if (now - lastCheckTime < 5000) {
        // Only check at most once every 5 seconds
        return;
      }

      setLastCheckTime(now);

      try {
        setLoading(true);
        const response = await fetch(`/api/user?action=daily-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        const data = await response.json();

        if (data.data) {
          const streakBroken = isStreakBroken(
            data.data.lastClaimAt,
            data.data.consecutiveDays
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
          } else {
            setCurrentDay(data.data.consecutiveDays || 0);
            setClickable(data.clickable || false);

            // Zeitpunkt für nächsten Reward berechnen
            if (!data.clickable && data.data.lastClaimAt) {
              const lastClaim = new Date(data.data.lastClaimAt);
              const twoHoursAfterClaim = lastClaim.getTime() + 2 * 3600 * 1000;
              const nextDay = new Date(lastClaim);
              nextDay.setDate(lastClaim.getDate() + 1);
              nextDay.setHours(0, 0, 0, 0);
              setNextRewardTimestamp(
                Math.max(twoHoursAfterClaim, nextDay.getTime())
              );
            }
          }
        } else if (data.error) {
          setError(
            data.error.message || "Fehler beim Abrufen des Daily Login Status."
          );
        }
      } catch (err) {
        console.error("Error checking streak status:", err);
        setError("Fehler beim Überprüfen des Streak-Status.");
      } finally {
        setLoading(false);
      }
    },
    [isStreakBroken, lastCheckTime]
  );

  // Profil laden
  useEffect(() => {
    fetchProfile();
  }, []);

  // Streak-Status überprüfen, sobald das Profil geladen ist
  useEffect(() => {
    if (profile?._id) {
      checkAndUpdateStreakStatus(profile._id);
    }
  }, [profile?._id, checkAndUpdateStreakStatus]);

  // Timer aktualisieren - simple timer without status checks to prevent loops
  useEffect(() => {
    if (!nextRewardTimestamp) return;

    const timer = setInterval(() => {
      const diff = nextRewardTimestamp - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRewardTimestamp]);

  // Separate effect for status checking to prevent timer dependency loops
  useEffect(() => {
    if (!profile?._id || clickable || timeLeft > 0) return;
    
    const now = Date.now();
    // Only check if we haven't checked in the last 5 minutes
    if (now - lastCheckTime > 300000) {
      checkAndUpdateStreakStatus(profile._id);
    }
  }, [profile?._id, clickable, timeLeft, lastCheckTime, checkAndUpdateStreakStatus]);

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
