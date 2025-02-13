/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, JSX } from "react";
import { FaCheck, FaGift, FaStar, FaCrown } from "react-icons/fa";

interface Profile {
  _id: string;
  name: string;
  gold: number;
  exp: number;
  inventory: any[]; // Kann nach Bedarf typisiert werden
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
  special?: boolean;
}

// Beispielhafte Reward-Daten
const rewards: Reward[] = [
  { label: "Reward 1", icon: <FaGift />, description: "Täglicher Bonus" },
  { label: "Reward 2", icon: <FaGift />, description: "Täglicher Bonus" },
  { label: "Reward 3", icon: <FaGift />, description: "Täglicher Bonus" },
  { label: "Reward 4", icon: <FaGift />, description: "Täglicher Bonus" },
  { label: "Reward 5", icon: <FaGift />, description: "Täglicher Bonus" },
  { label: "Reward 6", icon: <FaGift />, description: "Täglicher Bonus" },
  {
    label: "Premium Belohnung",
    icon: <FaCrown />,
    description: "Lootbox!",
    special: true,
  },
];

// Interface für Lootboxen
interface Lootbox {
  _id: string;
  type: string;
  img: string;
  createdAt: string;
  updatedAt: string;
}

const StampCard: React.FC = () => {
  // Lokaler State für das geladene Profil (um die userID zu erhalten)
  const [profile, setProfile] = useState<Profile | null>(null);
  // Daily Login States
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [clickable, setClickable] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // State für Lootboxen
  const [lootboxes, setLootboxes] = useState<Lootbox[]>([]);
  const [loadingLootboxes, setLoadingLootboxes] = useState<boolean>(false);
  const [errorLootboxes, setErrorLootboxes] = useState<string>("");

  // Neuer State für die ausgewählte Lootbox-ID (wird nur für den 7. Tag benötigt)
  const [selectedLootboxId, setSelectedLootboxId] = useState<string>("");

  // Neuer State für den Zeitpunkt, wann der nächste Reward verfügbar ist (als Timestamp)
  const [nextRewardTimestamp, setNextRewardTimestamp] = useState<number | null>(
    null
  );
  // State für den Countdown (Millisekunden bis zum nächsten Reward)
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Beispielhafter Flag, der angibt, ob ein Event aktiv ist – in der echten Anwendung z. B. aus Konfiguration/CMS
  const isEventActive = false; // Passe diesen Wert bei Bedarf an

  // Lädt zunächst das Profil, um die userID zu erhalten
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

  // Holt den aktuellen Daily-Login-Status anhand der userID aus dem geladenen Profil
  const fetchDailyLoginStatus = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/daily-login?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setCurrentDay(data.user.consecutiveDays);
        setClickable(data.clickable);
        // Falls der Reward noch nicht verfügbar ist, berechnen wir den nächsten Zeitpunkt:
        if (!data.clickable && data.user.lastClaimAt && data.user.lastVisitAt) {
          const lastClaim = new Date(data.user.lastClaimAt);
          // Zeitpunkt 2 Stunden nach dem letzten Claim:
          const twoHoursAfterClaim = lastClaim.getTime() + 2 * 3600 * 1000;
          // Beginn des nächsten Tages (00:00 Uhr) basierend auf lastClaim:
          const nextDay = new Date(lastClaim);
          nextDay.setDate(lastClaim.getDate() + 1);
          nextDay.setHours(0, 0, 0, 0);
          // Der nächste Reward ist verfügbar, sobald beide Bedingungen erfüllt sind:
          const nextRewardTime = Math.max(
            twoHoursAfterClaim,
            nextDay.getTime()
          );
          setNextRewardTimestamp(nextRewardTime);
        }
      } else {
        setError(data.message || "Fehler beim Abrufen des Daily Login Status.");
      }
    } catch (err) {
      console.error(err);
      setError("Fehler beim Abrufen des Daily Login Status.");
    } finally {
      setLoading(false);
    }
  };

  // Holt alle Lootboxen
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

  // Wird aufgerufen, sobald das Profil geladen ist
  useEffect(() => {
    fetchProfile();
  }, []);

  // Sobald das Profil vorhanden ist, hole den Daily-Login-Status
  useEffect(() => {
    if (profile && profile._id) {
      fetchDailyLoginStatus(profile._id);
    }
  }, [profile]);

  // Lootboxen laden (einmalig beim Mounten)
  useEffect(() => {
    fetchAllLootboxes();
  }, []);

  // Countdown aktualisieren, wenn ein nächster Reward-Zeitpunkt gesetzt wurde
  useEffect(() => {
    if (!nextRewardTimestamp) return;

    const updateTimer = () => {
      const diff = nextRewardTimestamp - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextRewardTimestamp]);

  // Hilfsfunktion zur Formatierung der Zeit (in h und m)
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Funktion, um den Bonus zu beanspruchen.
  // Wenn currentDay === 6, wird der Claim für den 7. Tag (Lootbox) ausgelöst.
  const claimReward = async () => {
    if (!profile) return;

    // Falls der 7. Tag erreicht ist, prüfen wir, ob eine Lootbox ausgewählt wurde.
    if (currentDay === 6 && !selectedLootboxId) {
      setError("Bitte wähle eine Lootbox aus, um den Bonus zu beanspruchen.");
      return;
    }

    try {
      setClaiming(true);
      let endpoint = "";
      const body: any = { userId: profile._id };

      // Wenn currentDay 6 ist, dann entspricht der nächste Claim dem 7. Tag
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
        setCurrentDay(data.consecutiveDays);
        setClickable(false);
        // Nach dem Claim setzen wir den nächsten Reward-Zeitpunkt neu,
        // basierend auf lastClaimAt (nun aktualisiert) – siehe Backend-Logik.
        if (data.user.lastClaimAt && data.user.lastVisitAt) {
          const lastClaim = new Date(data.user.lastClaimAt);
          const twoHoursAfterClaim = lastClaim.getTime() + 2 * 3600 * 1000;
          const nextDay = new Date(lastClaim);
          nextDay.setDate(lastClaim.getDate() + 1);
          nextDay.setHours(0, 0, 0, 0);
          const nextRewardTime = Math.max(
            twoHoursAfterClaim,
            nextDay.getTime()
          );
          setNextRewardTimestamp(nextRewardTime);
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

  return (
    <div className="container">
      <h2 className="title">Daily Login Rewards</h2>
      <div className="progress-container">
        <div
          className="progress-bar"
          style={{ width: `${(currentDay / 7) * 100}%` }}
        />
        <div className="progress-labels">
          <span>{currentDay}/7 Days</span>
          <span>Weekly Goal</span>
        </div>
        {/* Timer wird hier oben angezeigt */}
        {!clickable && nextRewardTimestamp && (
          <div className="reward-timer">
            Nächster Reward in {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="stamp-grid">
        {rewards.map((reward, index) => {
          const isActive = index < currentDay;
          const isSpecial = reward.special;
          const dayNumber = index + 1;
          // Nur das aktuell aktive (noch nicht beanspruchte) Feld soll klickbar sein
          const isClickable = clickable && index === currentDay;
          return (
            <div
              key={index}
              className={`stamp-card ${isActive ? "active" : ""} ${
                isSpecial ? "special" : ""
              } ${isClickable ? "clickable" : ""}`}
              onClick={() => {
                if (isClickable && !claiming) {
                  claimReward();
                }
              }}
            >
              <div className="stamp-content">
                {isActive && (
                  <div className="check-icon">
                    <FaCheck />
                  </div>
                )}
                <div className="stamp-icon">{reward.icon}</div>
                <div className="stamp-day">Day {dayNumber}</div>
                <div className="stamp-label">{reward.label}</div>
                <div className="stamp-description">{reward.description}</div>
              </div>
              {isSpecial && (
                <div className="special-badge">
                  <FaStar /> Legendary
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lootbox-Auswahl (nur anzeigen, wenn currentDay === 6) */}
      {currentDay === 6 && (
        <div className="lootbox-selection">
          <h3>Wähle deine Lootbox</h3>
          {loadingLootboxes ? (
            <p>Lade Lootboxen...</p>
          ) : errorLootboxes ? (
            <p className="error-message">{errorLootboxes}</p>
          ) : (
            <select
              value={selectedLootboxId}
              onChange={(e) => setSelectedLootboxId(e.target.value)}
            >
              <option value="">-- Auswahl --</option>
              {lootboxes.map((lb) => (
                <option key={lb._id} value={lb._id}>
                  {lb.type}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {error && <div className="error-message">{error}</div>}
      {loading && (
        <div className="loader">
          <div className="loader-spinner"></div>
          <div>Loading rewards...</div>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 100%;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(145deg, #f8f9ff 0%, #f0f4ff 100%);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
          box-sizing: border-box;
        }

        .title {
          text-align: center;
          font-size: 2rem;
          color: #2b2d42;
          margin-bottom: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .progress-container {
          background: rgba(255, 255, 255, 0.9);
          border-radius: 12px;
          padding: 1rem;
          margin: 1.5rem 0;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .progress-bar {
          height: 12px;
          background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 6px;
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 0.75rem;
        }

        .progress-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          color: #4b5563;
          font-size: 0.9rem;
          font-weight: 500;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .reward-timer {
          font-size: 0.9rem;
          font-weight: 500;
          color: #64748b;
        }

        .stamp-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          padding: 0.5rem 0;
        }

        .stamp-card {
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.3s ease;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          border: 2px solid #e0e7ff;
          backdrop-filter: blur(4px);
        }

        .stamp-card.active {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.98) 0%,
            #f0f4ff 100%
          );
          border-color: #818cf8;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -6px rgba(99, 102, 241, 0.15);
        }

        .stamp-card.special {
          border-color: #f59e0b;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.98) 0%,
            #fff7ed 100%
          );
        }

        .stamp-card.clickable {
          cursor: pointer;
        }

        .check-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          color: #10b981;
          background: white;
          border-radius: 50%;
          padding: 6px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
        }

        .stamp-icon {
          font-size: 2rem;
          margin: 0.5rem 0;
          color: #64748b;
          transition: transform 0.3s ease;
        }

        .active .stamp-icon {
          padding-left: 1rem;
          color: #6366f1;
          transform: scale(1.1);
        }

        .special .stamp-icon {
          color: #f59e0b;
        }

        .stamp-day {
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .stamp-label {
          font-size: 0.9rem;
          color: #334155;
          margin-bottom: 0.25rem;
          font-weight: 600;
        }

        .stamp-description {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: auto;
          font-weight: 500;
        }

        .special-badge {
          position: absolute;
          top: -10px;
          right: -10px;
          background: linear-gradient(45deg, #f59e0b 0%, #f97316 100%);
          color: white;
          font-size: 0.7rem;
          padding: 4px 8px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 600;
          box-shadow: 0 4px 6px rgba(245, 158, 11, 0.2);
        }

        .lootbox-selection {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .lootbox-selection h3 {
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          color: #2b2d42;
        }

        .lootbox-selection select {
          width: 100%;
          max-width: 300px;
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid #e0e7ff;
          font-size: 0.9rem;
        }

        .error-message {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 0.75rem;
          border-radius: 8px;
          margin: 1rem 0;
          text-align: center;
          font-weight: 500;
        }

        .loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #64748b;
          margin: 1.5rem 0;
        }

        .loader-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e0e7ff;
          border-radius: 50%;
          border-top-color: #6366f1;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0.75rem;
            border-radius: 12px;
          }

          .title {
            font-size: 1.75rem;
          }

          .stamp-grid {
            grid-template-columns: repeat(2, minmax(120px, 1fr));
          }

          .stamp-card {
            min-height: 160px;
            padding: 0.75rem;
          }

          .stamp-day {
            font-size: 0.9rem;
          }

          .stamp-label {
            font-size: 0.85rem;
          }

          .stamp-description {
            font-size: 0.75rem;
          }

          .progress-labels {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .stamp-grid {
            grid-template-columns: 1fr;
          }

          .stamp-card {
            min-height: auto;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StampCard;
