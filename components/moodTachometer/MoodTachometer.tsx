/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import dayjs from "dayjs";

// Typ-Definition für die komplette API-Antwort
interface ApiMoodStatusData {
  generator: Generator | null;
  calculatedLevel: number;
  moodOverride: MoodOverride | null;
  effectiveLevel: number;
  thresholds?: any | null;
}

interface Generator {
  _id: string;
  createdAt: string;
  status: string;
  content?: string;
}

interface MoodOverride {
  active: boolean;
  level: number;
  expiresAt: string | null;
}

interface ApiResponseSuccess {
  success: true;
  data: ApiMoodStatusData;
}

interface ApiResponseError {
  success: false;
  message: string;
}

type ApiResponse = ApiResponseSuccess | ApiResponseError;

const MoodTachometer = () => {
  const [moodData, setMoodData] = useState<ApiMoodStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showExtraTips, setShowExtraTips] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Funktion zum Abrufen des Mood-Status - kann bei Bedarf erneut aufgerufen werden
  const fetchMoodStatus = () => {
    setLoading(true);

    console.log("Mood-Status wird abgerufen...");
    fetch("/api/mood-status")
      .then((response) => response.json())
      .then((data: ApiResponse) => {
        console.log("Mood-Status API-Antwort:", data);

        if (data.success) {
          setMoodData(data.data);
          setFetchError(false);

          // Detaillierte Konsolenausgabe
          if (data.data.generator) {
            const createdDate = dayjs(data.data.generator.createdAt);
            const now = dayjs();
            const daysDiff = now.diff(createdDate, "day", true);

            console.log(`Generator erstellt vor ${daysDiff.toFixed(2)} Tagen`);
            console.log(`Generator Status: ${data.data.generator.status}`);
            console.log(
              `Generator CreatedAt: ${createdDate.format(
                "YYYY-MM-DD HH:mm:ss"
              )}`
            );
            console.log(`Berechnetes Level: ${data.data.calculatedLevel}`);
            console.log(`Effektives Level: ${data.data.effectiveLevel}`);
            console.log(`Schwellenwerte:`, data.data.thresholds);

            if (data.data.moodOverride) {
              console.log(
                `MoodOverride aktiv: ${data.data.moodOverride.active}`
              );
              console.log(
                `MoodOverride Level: ${data.data.moodOverride.level}`
              );
              console.log(
                `MoodOverride läuft ab: ${data.data.moodOverride.expiresAt}`
              );
            } else {
              console.log(`Keine MoodOverride aktiv`);
            }
          }
        } else {
          setFetchError(true);
          console.error("API-Fehler:", data.message);
        }
      })
      .catch((err) => {
        console.error("Fetch-Fehler:", err);
        setFetchError(true);
      })
      .finally(() => setLoading(false));
  };

  // Beim Mounten den Mood-Status abrufen
  useEffect(() => {
    fetchMoodStatus();
  }, []);

  // Regelmäßige Aktualisierung des Status (alle 5 Minuten)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchMoodStatus();
    }, 5 * 60 * 1000); // 5 Minuten

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Lade Daten...</div>;
  }

  if (fetchError || !moodData) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>Fehler beim Laden der Daten.</p>
        <button
          onClick={fetchMoodStatus}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-red-800 text-sm"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  // Effektives Level verwenden
  const level = moodData.effectiveLevel;

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
        "Es ist wahrscheinlich, dass er sich in einem entspannten Zustand befindest.",
    },
    {
      title: "Eventuelle Lust",
      description:
        "Es könnte langsam der Breakeven-Point sein, an dem er wieder merkbar Lust auf Sex hat.",
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
    [],
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

  // Überschreibungsindikator anzeigen
  const showOverrideIndicator =
    moodData.moodOverride && moodData.moodOverride.active;

  return (
    <div className="relative w-full px-4 pt-1 font-['Segoe_UI'] text-gray-800">
      {/* Info Icon */}
      <div
        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-600 text-xs font-bold text-white shadow-xs hover:bg-gray-700 hover:scale-105 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        i
      </div>

      {/* Überschreibungsindikator */}
      {showOverrideIndicator && (
        <div className="mt-8 mb-2 flex items-center justify-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-orange-800">
          <span className="mr-1">⚙️</span>
          Manuell eingestellt
          {moodData.moodOverride?.expiresAt && (
            <span className="ml-1">
              (bis{" "}
              {dayjs(moodData.moodOverride.expiresAt).format("DD.MM. HH:mm")})
            </span>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-[90%] max-w-[95vw] rounded-xl bg-white p-5 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-3 top-3 text-xl text-gray-500 hover:text-gray-800"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Lustlevel-Info
              </h2>
            </div>
            <div className="space-y-3 text-sm">
              <div className="rounded-md border border-orange-100 bg-orange-50 p-3">
                <p>
                  🔍 <strong>Erklärung:</strong> Das Lustlevel bemisst sich am{" "}
                  <span className="font-medium text-orange-600">
                    Zeitpunkt des letzten Auftrags
                  </span>{" "}
                  und analysiertem Verhalten.
                </p>
              </div>
              <p className="rounded-md border border-green-100 bg-green-50 p-3 text-green-700">
                💡 Tipps sind Vorschläge -{" "}
                <strong>kreative Eigeninitiative</strong> ist erwünscht!
              </p>
              {showOverrideIndicator && (
                <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
                  <p>
                    ⚙️ <strong>Hinweis:</strong> Das aktuelle Level wurde
                    manuell eingestellt
                    {moodData.moodOverride?.expiresAt ? (
                      <span>
                        {" "}
                        und läuft am{" "}
                        {dayjs(moodData.moodOverride.expiresAt).format(
                          "DD.MM.YYYY um HH:mm"
                        )}{" "}
                        ab.
                      </span>
                    ) : (
                      <span> und bleibt aktiv bis zur Zurücksetzung.</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tachometer Container */}
      <div className="relative my-5 h-20">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />

        {moods.map((mood, index) => (
          <div
            key={index}
            className={`absolute top-1/2 -translate-x-1/2 text-xl transition-all duration-300 ease-in-out ${
              index === level
                ? "text-3xl grayscale-0 opacity-100 -translate-y-[60%]"
                : "grayscale opacity-80 -translate-y-1/2"
            }`}
            style={{ left: `${(index * 100) / (moods.length - 1)}%` }}
          >
            {mood.emoji}
          </div>
        ))}
      </div>

      {/* Tip Section */}
      <div className="my-4 rounded-lg border border-gray-100 bg-gray-50 p-4 text-center">
        <h3 className="mb-1 text-lg font-medium text-gray-900">
          {tips[level].title}
        </h3>
        <p className="text-sm text-gray-600">{tips[level].description}</p>
      </div>

      {/* Extra Tips */}
      {extraTips[level].length > 0 && (
        <div className="mx-auto max-w-full">
          <div
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50"
            onClick={() => setShowExtraTips(!showExtraTips)}
          >
            <span className="font-medium">
              {showExtraTips ? "Ausblenden" : "Tipps anzeigen"}
            </span>
            <span
              className={`text-[0.6rem] ${showExtraTips ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </div>

          {showExtraTips && (
            <ul className="my-2 divide-y divide-gray-100 rounded-lg bg-white shadow-md text-sm">
              {extraTips[level].map((tip, idx) => (
                <li
                  key={idx}
                  className="p-3 text-gray-600 transition-colors hover:bg-gray-50"
                >
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default MoodTachometer;
