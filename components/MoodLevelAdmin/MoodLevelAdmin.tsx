import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { LeanLevelThresholds } from "@/models/LevelThresholds";

// Typdefinition für den Generator (Auftrag)
interface Generator {
  _id: string;
  createdAt: string;
  status: string;
  content?: string;
}

// Typdefinition für MoodBaseDate
interface MoodBaseDate {
  _id: string;
  active: boolean;
  baseDate: string;
  createdForLevel: number;
  createdAt: string;
  updatedAt: string;
}

interface MoodStatus {
  generator: Generator | null;
  moodBaseDate: MoodBaseDate | null;
  calculatedLevel: number;
  effectiveLevel: number;
  baseDateForCalc: string | null;
  baseSource: string;
  thresholds?: LeanLevelThresholds | null;
}

const MoodLevelAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodStatus, setMoodStatus] = useState<MoodStatus | null>(null);

  // Status für die Form
  const [manualLevel, setManualLevel] = useState<number>(0);

  // Debug-Information für Transparenz
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Status für UI
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Daten beim Mounten laden
  useEffect(() => {
    fetchMoodStatus();
  }, []);

  // Formular initialisieren, wenn Daten geladen sind
  useEffect(() => {
    if (moodStatus) {
      // Aktuelles Level als Default setzen
      setManualLevel(moodStatus.effectiveLevel);

      // Debug-Info anzeigen
      if (moodStatus.baseDateForCalc) {
        const baseDate = dayjs(moodStatus.baseDateForCalc);
        const now = dayjs();
        const daysDiff = now.diff(baseDate, "day", true);

        setDebugInfo(
          `Basisdatum für Berechnung ist ${daysDiff.toFixed(
            2
          )} Tage alt (Quelle: ${moodStatus.baseSource})`
        );
      }
    }
  }, [moodStatus]);

  // Aktuellen Status laden
  const fetchMoodStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/mood-status");
      const data = await response.json();

      if (data.success) {
        setMoodStatus(data.data);
        console.log("Mood status geladen:", data.data);
      } else {
        setError(data.message || "Fehler beim Laden der Daten");
      }
    } catch (err) {
      setError("Verbindungsfehler beim Laden der Daten");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Speichern des neuen Ausgangswerts
  const saveMoodLevel = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      // Basisdatum für das gewählte Level anpassen
      const response = await fetch("/api/mood-override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: manualLevel,
        }),
      });

      const data = await response.json();
      console.log("API Antwort:", data);

      if (data.success) {
        setSaveSuccess(true);
        // Daten neu laden
        fetchMoodStatus();
      } else {
        setError(data.message || "Fehler beim Speichern");
      }
    } catch (err) {
      setError("Verbindungsfehler beim Speichern");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset-Funktion für MoodBaseDate
  const resetMoodBaseDate = async () => {
    setIsResetting(true);
    setResetSuccess(false);
    setError(null);

    try {
      // API-Endpunkt zum Zurücksetzen des MoodBaseDate
      const response = await fetch("/api/mood-reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Reset API Antwort:", data);

      if (data.success) {
        setResetSuccess(true);
        // Daten neu laden
        fetchMoodStatus();
      } else {
        setError(data.message || "Fehler beim Zurücksetzen");
      }
    } catch (err) {
      setError("Verbindungsfehler beim Zurücksetzen");
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  // Definition der verfügbaren Mood-Emojis
  const moods = [
    { id: 0, emoji: "😐", label: "Keine Lust" },
    { id: 1, emoji: "😉", label: "Mäßig Lust" },
    { id: 2, emoji: "🥵", label: "Eventuelle Lust" },
    { id: 3, emoji: "🔥", label: "Sexlust" },
    { id: 4, emoji: "🍆", label: "Blaue Eier" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
        <p className="font-medium">Es ist ein Fehler aufgetreten:</p>
        <p>{error}</p>
        <button
          onClick={fetchMoodStatus}
          className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-red-800 text-sm font-medium"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* Statusanzeige */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-100">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aktueller Status
        </h3>

        {moodStatus && (
          <div className="space-y-2 text-sm">
            {moodStatus.generator && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Letzter Auftrag:</span>
                <span className="font-medium">
                  {dayjs(moodStatus.generator.createdAt).format(
                    "DD.MM.YYYY HH:mm"
                  )}
                </span>
              </div>
            )}

            {moodStatus.moodBaseDate && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Angepasstes Basisdatum:</span>
                <span className="font-medium">
                  {dayjs(moodStatus.moodBaseDate.baseDate).format(
                    "DD.MM.YYYY HH:mm"
                  )}
                </span>
              </div>
            )}

            {debugInfo && (
              <div className="flex justify-between items-center text-gray-500 text-xs mt-1 pt-1 border-t border-gray-100">
                <span>Info:</span>
                <span>{debugInfo}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-gray-700 font-medium">
                Aktuelles Level:
              </span>
              <span className="font-bold flex items-center text-lg">
                {moods[moodStatus.effectiveLevel].emoji}{" "}
                {moods[moodStatus.effectiveLevel].label} (
                {moodStatus.effectiveLevel})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Formular für Ausgangslevel */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Ausgangslevel einstellen
        </h3>

        <div className="space-y-4">
          {/* Level-Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gewünschtes Ausgangslevel:
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="4"
                value={manualLevel}
                onChange={(e) => setManualLevel(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl">{moods[manualLevel].emoji}</span>
            </div>
            <div className="text-center text-sm mt-1 font-medium">
              {moods[manualLevel].label} (Level {manualLevel})
            </div>
          </div>

          <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Hinweis:</strong> Das Level wird auf {manualLevel} gesetzt
              und von dort aus mit der Zeit automatisch weiterwachsen.
            </p>
            <p className="text-xs text-blue-600 mt-1 italic">
              Das System erstellt ein angepasstes Basisdatum, damit das Level
              automatisch steigt. Wenn ein neuer Auftrag abgeschlossen wird und
              sein Datum neuer ist, wird dieser für die Berechnung verwendet.
            </p>
          </div>
        </div>

        {/* Speichern Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={saveMoodLevel}
            disabled={isSaving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Wird gespeichert...
              </>
            ) : (
              "Level setzen & automatisch wachsen lassen"
            )}
          </button>

          {saveSuccess && (
            <span className="ml-3 text-sm text-green-600">
              ✓ Erfolgreich gespeichert
            </span>
          )}
        </div>
      </div>

      {/* Reset-Bereich */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Aktionen</h3>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetMoodBaseDate}
            disabled={isResetting || !moodStatus?.moodBaseDate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isResetting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Zurücksetzen...
              </>
            ) : (
              "Angepasstes Basisdatum zurücksetzen"
            )}
          </button>

          {resetSuccess && (
            <span className="ml-3 text-sm text-green-600">
              ✓ Erfolgreich zurückgesetzt
            </span>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          <p>
            Beim Zurücksetzen des angepassten Basisdatums wird wieder das
            normale Datum des letzten Auftrags für die Berechnung verwendet.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodLevelAdmin;
