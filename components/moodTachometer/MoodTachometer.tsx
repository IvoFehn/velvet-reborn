import { useState, useEffect } from "react";
import dayjs from "dayjs";

// Typdefinition für den Generator (Auftrag)
interface Generator {
  createdAt: string;
  // Weitere Felder können hier ergänzt werden
}

interface ApiResponseSuccess {
  success: true;
  data: Generator;
}

interface ApiResponseError {
  success: false;
  message: string;
}

type ApiResponse = ApiResponseSuccess | ApiResponseError;

// Funktion zur Berechnung des Mood-Levels anhand des Erstellungsdatums
const calculateLevel = (createdAt: string): number => {
  const createdDate = dayjs(createdAt);
  const now = dayjs();
  const daysDiff = now.diff(createdDate, "day", true); // exakte Differenz in Tagen

  // Schwellenwerte zur Bestimmung des Levels:
  // Level 0: ≤ 2 Tage
  // Level 1: > 3 Tage
  // Level 2: > 4 Tage
  // Level 3: > 6 Tage
  // Level 4: > 7 Tage
  if (daysDiff > 8) {
    return 4;
  } else if (daysDiff > 6) {
    return 3;
  } else if (daysDiff > 4) {
    return 2;
  } else if (daysDiff > 3) {
    return 1;
  } else {
    return 0;
  }
};

const MoodTachometer = () => {
  const [generator, setGenerator] = useState<Generator | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fetchError, setFetchError] = useState(false);
  const [showExtraTips, setShowExtraTips] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Beim Mounten den letzten Auftrag abrufen
  useEffect(() => {
    fetch("/api/generator?last=true")
      .then((response) => response.json())
      .then((data: ApiResponse) => {
        if (data.success) {
          setGenerator(data.data);
        } else {
          setFetchError(true);
        }
      })
      .catch((err) => {
        console.error("Fehler beim Abrufen:", err);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Lade Daten...</div>;
  }

  // Falls kein Auftrag abgerufen werden konnte, default Level 3
  const level = generator ? calculateLevel(generator.createdAt) : 2;

  // Definition der verfügbaren Mood-Emojis
  const moods = [
    { id: 0, emoji: "😐" },
    { id: 1, emoji: "😉" },
    { id: 2, emoji: "🥵" },
    { id: 3, emoji: "🔥" },
    { id: 4, emoji: "🍆" },
  ];

  // Standard-Tipps je Level
  const tips = [
    {
      title: "Keine Lust",
      description:
        "Wahrscheinlich gerade zufrieden. Du brauchst nichts zu tun.",
    },
    {
      title: "Mäßig Lust",
      description:
        "Es ist wahrscheinlich, dass du dich in einem entspannten Zustand befindest.",
    },
    {
      title: "Eventuelle Lust",
      description:
        "Deine Emotionen kochen! Jetzt könnte der richtige Zeitpunkt sein, um neue Herausforderungen anzunehmen.",
    },
    {
      title: "Sexlust",
      description:
        "Es ist lange her, dass er abgespritzt hat. Reize ihn etwas.",
    },
    {
      title: "Blaue Eier",
      description:
        "Wahrscheinlich hat er zu lange nicht mehr abgespritzt. Höchstwahrscheinlich hat er Druck.",
    },
  ];

  // Extra Tipps je Level (als Liste)
  const extraTips = [
    ["Nichts"],
    ["Gelegentlich mal flashen.", "Gelegentlich mal in die Hose greifen."],
    [
      "Häufiger flashen.",
      "Häufiger in die Hose greifen.",
      "An dir selbst rumspielen.",
      "Sei öfter nackt oder sexy in seiner Umgebung.",
      "Ein Nacktfoto machen und ihm geben.",
    ],
    [
      "Viel flashen.",
      "Nackt rumlaufen.",
      "Im Dessous rumlaufen.",
      "Ein Nacktfoto machen und ihm geben.",
      "Ein Nacktvideo machen und ihm geben.",
      "Selbstständig präsentieren.",
      "Kondom sollte immer in deiner Nähe sein.",
      "Ggf. anblasen",
      "Eier in den Mund nehmen",
    ],
    [
      "An diesen Tagen solltest du so viel wie irgendmöglich nackt sein oder im Dessous rumlaufen.",
      "Sehr viel flashen.",
      "Nackt rumlaufen.",
      "Im Dessous rumlaufen.",
      "Nackt rumlaufen.",
      "Mehrere Nacktfoto machen und ihm geben.",
      "Mehrere Nacktvideo machen und ihm geben.",
      "Selbstständig präsentieren.",
      "Selbstständig show machen.",
      "Kondom sollte immer in deiner Nähe sein.",
      "Blasen",
      "Eier in den Mund nehmen",
      "Edged und vorbereitet sein",
      "Unten ohne vor ihn sezten und lecken anbieten",
    ],
  ];

  return (
    <div className="moodline-wrapper">
      {/* Info-Icon, das ein Modal öffnet */}
      <div className="info-icon" onClick={() => setShowModal(true)}>
        i
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <div className="modal-header">
              <h2>Lustlevel-Info</h2>
            </div>
            <div className="modal-body">
              <div className="info-box">
                <p>
                  🔍 <strong>Erklärung:</strong> Das Lustlevel bemisst sich an
                  dem <span className="accent">Zeitpunkt</span> des letzten
                  angenommenen Auftrags und am{" "}
                  <span className="accent">analysierten Verhalten</span> von
                  ihm.
                </p>
              </div>
              <div className="info-box">
                <p>
                  🔍 <strong>Erklärung 2:</strong> Je höher das Lustlevel, desto
                  mehr solltest du tun, um ihn zu verführen, damit er{" "}
                  <span className="accent">Sex</span> will oder einen{" "}
                  <span className="accent">Auftrag</span> einstellt.
                </p>
              </div>
              <p className="action-tip">
                💡 Dir werden Tipps je nach Lustlevel angezeigt. Das sind jedoch
                nur Handlungsvorschläge!{" "}
                <strong>kreative Eigeninitiative</strong> ist sehr gern gesehen.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* Horizontale Linie als Basis */}
        <div className="line" />

        {/* Emojis entlang der Linie */}
        {moods.map((mood, index) => (
          <div
            key={index}
            className={`emoji ${index === level ? "active" : ""}`}
            style={{ left: `${(index * 100) / (moods.length - 1)}%` }}
          >
            {mood.emoji}
          </div>
        ))}
      </div>

      {/* Aktueller Tippbereich */}
      <div className="tip">
        <h3>{tips[level].title}</h3>
        <p>{tips[level].description}</p>
      </div>

      {/* Toggle-Schriftzug für Extra Tipps */}
      <div
        className="extra-tips-toggle"
        onClick={() => setShowExtraTips(!showExtraTips)}
      >
        <span className="toggle-text">
          {showExtraTips ? "Ausblenden" : "Tipps anzeigen"}
        </span>
        <span className={`arrow ${showExtraTips ? "up" : "down"}`}>▼</span>
      </div>

      {/* Ausklappbarer Bereich für Extra Tipps */}
      {showExtraTips && (
        <ul className="extra-tips">
          {extraTips[level].map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .moodline-wrapper {
          position: relative;
          width: 100%;
          max-width: 480px;
          font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
          color: #2d3748;
          padding: 0.1rem 1.5rem 0 1.5rem;
        }
        .info-icon {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 24px;
          height: 24px;
          background: #4a5568;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s ease;
          border: 2px solid #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .info-icon:hover {
          background: #2d3748;
          transform: scale(1.1);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: #fff;
          padding: 28px;
          border-radius: 16px;
          max-width: 440px;
          width: 90%;
          position: relative;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          line-height: 1.6;
          font-size: 15px;
          color: #4a5568;
        }
        .close-modal {
          position: absolute;
          top: 16px;
          right: 16px;
          background: transparent;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #718096;
          transition: color 0.2s ease;
        }
        .close-modal:hover {
          color: #2d3748;
        }
        .modal-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        .modal-icon {
          font-size: 32px;
          background: #f0f4ff;
          padding: 12px;
          border-radius: 8px;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #1a202c;
        }
        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }
        .info-box {
          background: #fff7ed;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #ffedd5;
        }
        .accent {
          color: #dd6b20;
          font-weight: 600;
          margin: 0 4px;
        }
        .action-tip {
          font-size: 0.95rem;
          background: #f0fff4;
          padding: 16px;
          border-radius: 8px;
          border: 1px solid #c6f6d5;
          color: #2f855a;
        }
        .container {
          position: relative;
          width: 100%;
          height: 72px;
          margin: 2rem 0;
        }
        .line {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(
            90deg,
            #e2e8f0 0%,
            #cbd5e0 50%,
            #e2e8f0 100%
          );
          border-radius: 2px;
          transform: translateY(-50%);
        }
        .emoji {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          filter: grayscale(100%) opacity(0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .emoji.active {
          font-size: 40px;
          filter: none;
          transform: translate(-50%, -60%);
          text-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
        }
        .tip {
          text-align: center;
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 12px;
          margin: 1.5rem 0;
          border: 1px solid #e2e8f0;
        }
        .tip h3 {
          margin: 0 0 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a202c;
          letter-spacing: -0.02em;
        }
        .tip p {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.5;
          color: #718096;
        }
        .extra-tips-toggle {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 1rem auto;
          cursor: pointer;
          color: #4299e1;
          font-weight: 500;
          transition: all 0.2s ease;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .extra-tips-toggle:hover {
          background: #ebf8ff;
          color: #3182ce;
        }
        .arrow {
          font-size: 12px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .arrow.up {
          transform: rotate(180deg);
        }
        .extra-tips {
          max-width: 100%;
          margin: 1rem 0;
          padding: 0;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
          list-style: none;
          overflow: hidden;
        }
        .extra-tips li {
          padding: 1rem 1.5rem;
          font-size: 0.95rem;
          color: #4a5568;
          border-bottom: 1px solid #edf2f7;
          transition: background 0.2s ease;
        }
        .extra-tips li:last-child {
          border-bottom: none;
        }
        .extra-tips li:hover {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default MoodTachometer;
