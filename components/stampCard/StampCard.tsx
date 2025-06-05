/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { addGold } from "@/util/addGold";
import React, { useState, useEffect, JSX } from "react";
import {
  FaCheck,
  FaGift,
  FaStar,
  FaCrown,
  FaLock,
  FaClock,
  FaCoins,
} from "react-icons/fa";

interface Profile {
  _id: string;
  name: string;
  gold: number;
  exp: number;
  inventory: any[];
  keys: number;
  lootboxes: any[];
  profileImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Reward {
  label: string;
  icon: JSX.Element;
  description: string;
  goldAmount?: number; // Added gold amount property
  special?: boolean;
}

interface Lootbox {
  _id: string;
  type: string;
  img: string;
  createdAt: string;
  updatedAt: string;
}

interface DailyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

// Updated Reward-Daten with gold amount
const rewards: Reward[] = [
  {
    label: "Reward 1",
    icon: <FaGift />,
    description: "Täglicher Bonus + 2 Gold",
    goldAmount: 2,
  },
  {
    label: "Reward 2",
    icon: <FaGift />,
    description: "Täglicher Bonus + 2 Gold",
    goldAmount: 2,
  },
  {
    label: "Reward 3",
    icon: <FaGift />,
    description: "Täglicher Bonus + 2 Gold",
    goldAmount: 2,
  },
  {
    label: "Reward 4",
    icon: <FaGift />,
    description: "Täglicher Bonus + 2 Gold",
    goldAmount: 2,
  },
  {
    label: "Reward 5",
    icon: <FaGift />,
    description: "Täglicher Bonus + 2 Gold",
    goldAmount: 2,
  },
  {
    label: "Reward 6",
    icon: <FaGift />,
    description: "Täglicher Bonus + 2 Gold",
    goldAmount: 2,
  },
  {
    label: "Premium Belohnung",
    icon: <FaCrown />,
    description: "Lootbox + 2 Gold!",
    goldAmount: 2,
    special: true,
  },
];

const StampCard: React.FC = () => {
  // Profil und Status-States
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [clickable, setClickable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [showGoldAnimation, setShowGoldAnimation] = useState<boolean>(false); // Added for gold animation

  // Daily Tasks States
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [allTasksCompleted, setAllTasksCompleted] = useState<boolean>(false);

  // Lootbox-States
  const [lootboxes, setLootboxes] = useState<Lootbox[]>([]);
  const [loadingLootboxes, setLoadingLootboxes] = useState<boolean>(false);
  const [errorLootboxes, setErrorLootboxes] = useState<string>("");
  const [selectedLootboxId, setSelectedLootboxId] = useState<string>("");

  // Zeitmanagement-States
  const [nextRewardTimestamp, setNextRewardTimestamp] = useState<number | null>(
    null
  );
  const [streakBroken, setStreakBroken] = useState<boolean>(false);
  const [formattedTimeLeft, setFormattedTimeLeft] = useState<string>("");

  // Event-Status (aus Konfiguration/CMS)
  const isEventActive = false;

  // Profil laden
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile/get`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      } else {
        setError(data.message || "Fehler beim Laden des Profils.");
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Laden des Profils.");
    } finally {
      setLoading(false);
    }
  };

  // Daily Tasks laden
  const fetchDailyTasks = async () => {
    try {
      setLoadingTasks(true);
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data)) {
          const tasksWithId = data.map((task: any) => ({
            ...task,
            id: task._id ? task._id.toString() : task.id,
          }));
          setDailyTasks(tasksWithId);

          // Prüfen, ob alle Aufgaben erledigt sind
          const completedTasks = tasksWithId.filter((task) => task.completed);
          setAllTasksCompleted(
            completedTasks.length === tasksWithId.length &&
              tasksWithId.length > 0
          );
        } else {
          setDailyTasks([]);
          setAllTasksCompleted(false);
        }
      } else {
        setError("Fehler beim Laden der täglichen Aufgaben.");
        setAllTasksCompleted(false);
      }
    } catch (err) {
      console.error("Fehler beim Laden der täglichen Aufgaben:", err);
      setError("Fehler beim Laden der täglichen Aufgaben.");
      setAllTasksCompleted(false);
    } finally {
      setLoadingTasks(false);
    }
  };

  const checkAndUpdateStreakStatus = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/daily-login?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        const now = new Date();
        const lastClaim = data.user.lastClaimAt
          ? new Date(data.user.lastClaimAt)
          : null;
        let streakBroken = false;

        if (lastClaim && data.user.consecutiveDays > 0) {
          const hoursSinceLastClaim =
            (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
          const lastClaimDay = new Date(lastClaim);
          lastClaimDay.setHours(0, 0, 0, 0);

          const yesterdayStart = new Date(now);
          yesterdayStart.setDate(now.getDate() - 1);
          yesterdayStart.setHours(0, 0, 0, 0);

          if (hoursSinceLastClaim > 48 && lastClaimDay < yesterdayStart) {
            streakBroken = true;
          }
        }

        if (streakBroken) {
          setStreakBroken(true);
          setCurrentDay(0);
          setClickable(true); // Benutzer kann sofort eine neue Streak starten
          setError("Du hast deine Streak verloren! Starte heute neu.");
        } else {
          setCurrentDay(data.user.consecutiveDays);
          setClickable(data.clickable);

          if (!data.clickable && data.user.lastClaimAt) {
            const lastClaim = new Date(data.user.lastClaimAt);
            const twoHoursAfterClaim = lastClaim.getTime() + 2 * 3600 * 1000;
            const nextDay = new Date();
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(0, 0, 0, 0);
            const nextTime = Math.max(twoHoursAfterClaim, nextDay.getTime());
            setNextRewardTimestamp(nextTime);
            const initialTimeLeft = nextTime - now.getTime();
            setFormattedTimeLeft(
              formatTime(initialTimeLeft > 0 ? initialTimeLeft : 0)
            );
          }
        }
      } else {
        setError(data.message || "Fehler beim Prüfen des Streak-Status.");
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Prüfen des Streak-Status.");
    } finally {
      setLoading(false);
    }
  };

  // Lootboxen laden
  const fetchAllLootboxes = async () => {
    try {
      setLoadingLootboxes(true);
      const response = await fetch(`/api/lootbox`);
      const data = await response.json();
      if (data.success) {
        setLootboxes(data.lootboxes);
      } else {
        setErrorLootboxes(data.message || "Fehler beim Abrufen der Lootboxen.");
      }
    } catch (err) {
      console.error(err);
      setErrorLootboxes("Fehler beim Abrufen der Lootboxen.");
    } finally {
      setLoadingLootboxes(false);
    }
  };

  // Initial-Effekte
  useEffect(() => {
    fetchProfile();
    fetchAllLootboxes();
    fetchDailyTasks();
  }, []);

  // Sobald das Profil vorhanden ist, Streak-Status prüfen
  useEffect(() => {
    if (profile && profile._id) {
      checkAndUpdateStreakStatus(profile._id);
    }
  }, [profile]);

  // Countdown-Timer aktualisieren
  useEffect(() => {
    if (!nextRewardTimestamp) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = nextRewardTimestamp - now;
      const newTimeLeft = diff > 0 ? diff : 0;

      setFormattedTimeLeft(formatTime(newTimeLeft));

      // Wenn der Timer abgelaufen ist, aktiviere den Claim-Button
      if (diff <= 0 && !clickable) {
        setClickable(true);
      }
    };

    updateTimer(); // Sofort ausführen
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextRewardTimestamp, clickable]);

  // Zeit formatieren (h:m:s)
  const formatTime = (ms: number) => {
    if (ms <= 0) return "Jetzt verfügbar!";

    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Reward beanspruchen
  const claimReward = async () => {
    if (!profile) return;

    // Prüfen, ob alle täglichen Aufgaben erledigt sind
    if (!allTasksCompleted) {
      setError(
        "Du musst erst alle täglichen Aufgaben erledigen, bevor du die Belohnung beanspruchen kannst."
      );
      return;
    }

    setSuccess("");
    setError("");

    // Bei Tag 7 Lootbox-Prüfung
    if (currentDay === 6 && !selectedLootboxId) {
      setError("Bitte wähle eine Lootbox aus, um den Bonus zu beanspruchen.");
      return;
    }

    try {
      setClaiming(true);
      let endpoint = "";
      const body: any = { userId: profile._id };

      // Tag 7 (Lootbox) vs. normale Tage
      if (currentDay === 6) {
        endpoint = `/api/daily-login/claim-lootbox`;
        body.isEventActive = isEventActive;
        body.lootboxId = selectedLootboxId;
      } else {
        endpoint = `/api/daily-login`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        // Gold-Belohnung hinzufügen (2 Gold pro Tag)
        try {
          const goldAmount = rewards[currentDay]?.goldAmount || 2;
          await addGold(goldAmount);
          setShowGoldAnimation(true);
          setTimeout(() => setShowGoldAnimation(false), 3000);
          setSuccess(
            `Belohnung und ${goldAmount} Gold erfolgreich beansprucht!`
          );

          // Profil neu laden, um aktualisiertes Gold anzuzeigen
          fetchProfile();
        } catch (goldError) {
          console.error("Fehler beim Hinzufügen von Gold:", goldError);
          setError("Gold-Belohnung konnte nicht hinzugefügt werden.");
        }

        setCurrentDay(data.consecutiveDays);
        setClickable(false);

        // Nächsten Reward-Zeitpunkt setzen
        if (data.user?.lastClaimAt) {
          const now = new Date();
          const lastClaim = new Date(data.user.lastClaimAt);
          const twoHoursAfterClaim = lastClaim.getTime() + 2 * 3600 * 1000;

          // Nächsten Tag in lokaler Zeitzone
          const nextDay = new Date();
          nextDay.setDate(nextDay.getDate() + 1);
          nextDay.setHours(0, 0, 0, 0);

          const nextRewardTime = Math.max(
            twoHoursAfterClaim,
            nextDay.getTime()
          );

          setNextRewardTimestamp(nextRewardTime);

          // Neuen Countdown setzen
          const newTimeLeft = nextRewardTime - now.getTime();
          setFormattedTimeLeft(formatTime(newTimeLeft > 0 ? newTimeLeft : 0));
        }
      } else {
        setError(data.message || "Fehler beim Beanspruchen des Rewards.");
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Beanspruchen des Rewards.");
    } finally {
      setClaiming(false);
    }
  };

  // Wirklich klickbar? Überprüft sowohl Timer als auch Task-Completion
  const isReallyClickable = clickable && allTasksCompleted;

  // Zeit-Status-Text
  const getTimeStatusText = () => {
    if (isReallyClickable) return "Deine Belohnung ist jetzt verfügbar!";
    if (!allTasksCompleted)
      return "Erledige alle täglichen Aufgaben für die Belohnung";
    if (formattedTimeLeft) return `Nächste Belohnung in: ${formattedTimeLeft}`;
    return "";
  };

  return (
    <div className="max-w-full w-full ">
      {/* Gold Amount Display */}
      {profile && (
        <div className="flex justify-end mb-3">
          <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full font-medium shadow-sm">
            <FaCoins className="text-yellow-500 mr-2" />
            <span>{profile.gold || 0} Gold</span>
          </div>
        </div>
      )}

      {/* Gold Animation */}
      {showGoldAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-bounce-fade text-4xl text-yellow-500 font-bold flex items-center gap-2 bg-yellow-100 px-6 py-4 rounded-lg shadow-lg">
            <FaCoins className="text-yellow-500 text-3xl" />
            +2 Gold!
          </div>
        </div>
      )}

      {/* Streak Broken Banner */}
      {streakBroken && (
        <div className="bg-gradient-to-r from-red-100 to-red-200 border-l-4 border-red-500 rounded-md p-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">
              !
            </div>
            <div>
              <h3 className="font-semibold">Streak verloren!</h3>
              <p className="text-sm text-gray-700">
                Du hast zu lange gewartet. Deine Streak wurde zurückgesetzt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {success && (
        <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-green-100 text-green-800 p-4 rounded-md mb-4 font-medium animate-slide-in">
          <FaCheck className="bg-green-500 text-white p-1 rounded-full" />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-500 p-3 rounded-md mb-4 text-center font-medium animate-shake">
          {error}
        </div>
      )}

      {/* Progress Container */}
      <div className="bg-white/90 rounded-lg p-5 mb-6 backdrop-blur-sm border border-white/30 shadow-md">
        <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-700 ease-out"
            style={{ width: `${(currentDay / 7) * 100}%` }}
          />
        </div>

        <div className="flex justify-between mt-3 text-gray-600 text-sm font-medium">
          <span>{currentDay}/7 Tage</span>
          <span>Wöchentliches Ziel</span>
        </div>

        {/* Countdown Timer Display */}
        {!loading && nextRewardTimestamp && !isReallyClickable && (
          <div className="mt-4 flex items-center justify-center gap-2 text-indigo-600 font-medium bg-indigo-50 p-3 rounded-md">
            <FaClock />
            <span>{getTimeStatusText()}</span>
          </div>
        )}

        {/* Available Now Indicator */}
        {isReallyClickable && (
          <div className="mt-4 flex items-center justify-center gap-2 text-green-600 font-semibold bg-green-50 p-3 rounded-md animate-pulse">
            <FaGift className="text-lg" />
            <span>Deine Belohnung (+2 Gold) ist jetzt verfügbar!</span>
          </div>
        )}
      </div>

      {/* Stamp Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 pb-2">
        {rewards.map((reward, index) => {
          const isActive = index < currentDay;
          const isSpecial = reward.special;
          const dayNumber = index + 1;
          const isClickable =
            clickable && index === currentDay && allTasksCompleted;
          const isPending =
            clickable && index === currentDay && !allTasksCompleted;

          return (
            <div
              key={index}
              className={`relative bg-white/95 rounded-lg p-4 min-h-[160px] flex flex-col border-2 transition-all
                ${
                  isActive
                    ? "bg-gradient-to-br from-white/98 to-indigo-50 border-indigo-200 shadow-lg -translate-y-1"
                    : "border-blue-100"
                }
                ${
                  isSpecial
                    ? "border-yellow-400 bg-gradient-to-br from-white/98 to-yellow-50"
                    : ""
                }
                ${
                  isClickable
                    ? "cursor-pointer border-green-500 shadow-md animate-pulse"
                    : "hover:border-blue-200 hover:shadow-sm"
                }
                ${isPending ? "cursor-not-allowed" : ""}`}
              onClick={() => isClickable && !claiming && claimReward()}
            >
              {/* Check Icon */}
              {isActive && (
                <div className="absolute top-2 right-2 text-green-500 bg-white rounded-full p-1 shadow">
                  <FaCheck />
                </div>
              )}

              {/* Stamp Content */}
              <div className="stamp-content">
                <div
                  className={`text-3xl my-2 transition-colors ${
                    isActive ? "text-indigo-500" : "text-gray-600"
                  } ${isSpecial ? "text-yellow-500" : ""}`}
                >
                  {reward.icon}
                </div>
                <div className="font-bold text-gray-800 mb-1 text-lg">
                  Tag {dayNumber}
                </div>
                <div className="text-sm text-gray-700 mb-0.5 font-semibold">
                  {reward.label}
                </div>
                <div className="text-xs text-gray-600 mt-auto font-medium">
                  {reward.description}
                </div>

                {/* Gold Display */}
                <div className="flex items-center mt-2 text-yellow-600 text-xs font-medium">
                  <FaCoins className="mr-1 text-yellow-500" /> +
                  {reward.goldAmount || 2} Gold
                </div>
              </div>

              {/* Special Badge */}
              {isSpecial && (
                <div className="absolute top-[-10px] right-[-10px] bg-gradient-to-br from-yellow-500 to-orange-500 text-white text-xs py-1 px-2 rounded-full flex items-center gap-1 font-semibold shadow-md">
                  <FaStar className="text-xs" /> Legendary
                </div>
              )}

              {/* Claim Badge */}
              {isClickable && (
                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs py-1 px-3 rounded-full font-semibold shadow-md animate-bounce">
                  Jetzt einlösen!
                </div>
              )}

              {/* Pending Overlay */}
              {isPending && (
                <div className="absolute inset-0 bg-white/95 rounded-lg flex items-center justify-center backdrop-blur-sm animate-pulse">
                  <div className="flex flex-col items-center gap-1 text-indigo-500 text-center p-4">
                    <FaLock className="text-3xl animate-bounce" />
                    <span className="text-xs font-semibold max-w-[90px] leading-tight">
                      Erledige alle täglichen Aufgaben
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lootbox Selection */}
      {currentDay === 6 && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-md animate-fade-in">
          <h3 className="mb-4 text-xl text-gray-800 font-semibold">
            Wähle deine Lootbox
          </h3>

          {loadingLootboxes ? (
            <p>Lade Lootboxen...</p>
          ) : errorLootboxes ? (
            <p className="text-red-500">{errorLootboxes}</p>
          ) : (
            <div>
              <select
                value={selectedLootboxId}
                onChange={(e) => setSelectedLootboxId(e.target.value)}
                className="w-full p-3 rounded-md border border-blue-200 bg-blue-50 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all"
                disabled={!allTasksCompleted}
              >
                <option value="">-- Auswahl --</option>
                {lootboxes.map((lb) => (
                  <option key={lb._id} value={lb._id}>
                    {lb.type}
                  </option>
                ))}
              </select>

              {selectedLootboxId && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-md animate-fade-in">
                  <div className="text-gray-700 font-medium text-center">
                    {lootboxes.find((lb) => lb._id === selectedLootboxId)
                      ?.type || "Lootbox"}{" "}
                    ausgewählt
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="flex flex-col items-center gap-3 text-gray-700 mt-6">
          <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
          <div>Loading rewards...</div>
        </div>
      )}

      {/* Added animation keyframes for Gold animation */}
      <style jsx>{`
        @keyframes bounce-fade {
          0%,
          100% {
            transform: translateY(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          50% {
            transform: translateY(-20px);
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
        }
        .animate-bounce-fade {
          animation: bounce-fade 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StampCard;
