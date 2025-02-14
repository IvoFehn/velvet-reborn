import React, { useState, useEffect } from "react";
import { FaCheck, FaGift, FaCrown } from "react-icons/fa";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

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

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/profile/get`);
      const data = await response.json();
      if (data.success) setProfile(data.data);
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  };

  const fetchDailyLoginStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/daily-login?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setCurrentDay(data.user.consecutiveDays);
        setClickable(data.clickable);
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
    } catch (err) {
      console.error("Error loading daily status:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?._id) fetchDailyLoginStatus(profile._id);
  }, [profile]);

  useEffect(() => {
    if (!nextRewardTimestamp) return;
    const timer = setInterval(() => {
      const diff = nextRewardTimestamp - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [nextRewardTimestamp]);

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m`;
  };

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
            className={`flex h-12 items-center justify-center rounded-lg text-sm transition-all ${
              day <= currentDay
                ? "bg-green-50 text-green-600"
                : "bg-gray-50 text-gray-400"
            } ${day === 7 ? "bg-purple-50 text-purple-600" : ""}`}
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

      {nextRewardTimestamp && (
        <div className="mt-3 text-center text-sm text-gray-500">
          {clickable
            ? "Reward jetzt claimen"
            : `Nächster Reward in ${formatTime(timeLeft)}`}
        </div>
      )}
    </section>
  );
};

export default DailyRewardsWidget;
