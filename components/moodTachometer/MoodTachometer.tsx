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

  return (
    <div className="relative w-full max-w-[380px] px-4 pt-1 font-['Segoe_UI'] text-gray-800">
      {/* Info Icon */}
      <div
        className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-gray-600 text-xs font-bold text-white shadow-xs hover:bg-gray-700 hover:scale-105 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        i
      </div>

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
