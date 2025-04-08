import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { LeanLevelThresholds } from "@/models/LevelThresholds";

// Typdefinition für den Generator (Auftrag)
interface Generator {
  _id: string;
  createdAt: string;
  status: string;
  content?: string;
  // Weitere Felder können hier ergänzt werden
}

// Typdefinition für Mood-Überschreibung
interface MoodOverride {
  active: boolean;
  level: number;
  expiresAt: string | null; // Zeitpunkt, wann die Überschreibung abläuft (null = nie)
}

interface MoodStatus {
  generator: Generator | null;
  calculatedLevel: number;
  moodOverride: MoodOverride | null;
  effectiveLevel: number;
  thresholds?: LeanLevelThresholds | null;
}

const MoodLevelAdmin: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moodStatus, setMoodStatus] = useState<MoodStatus | null>(null);

  // Status für die Form
  const [manualLevel, setManualLevel] = useState<number>(0);
  const [expiryType, setExpiryType] = useState<"none" | "time" | "hours">(
    "none"
  );
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [expiryTime, setExpiryTime] = useState<string>("");
  const [expiryHours, setExpiryHours] = useState<number>(24);

  // Neue Option für Datum-Anpassung
  const [adjustDate, setAdjustDate] = useState<boolean>(false);

  // Status für UI
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Daten beim Mounten laden
  useEffect(() => {
    fetchMoodStatus();
  }, []);

  // Formular initialisieren, wenn Daten geladen sind
  useEffect(() => {
    if (moodStatus) {
      // Aktuelles Level als Default setzen
      setManualLevel(moodStatus.effectiveLevel);

      // Wenn eine aktive Überschreibung existiert mit Ablaufzeit
      if (
        moodStatus.moodOverride?.active &&
        moodStatus.moodOverride?.expiresAt
      ) {
        setExpiryType("time");
        const expiry = dayjs(moodStatus.moodOverride.expiresAt);
        setExpiryDate(expiry.format("YYYY-MM-DD"));
        setExpiryTime(expiry.format("HH:mm"));
      } else if (moodStatus.moodOverride?.active) {
        // Überschreibung ohne Ablaufzeit
        setExpiryType("none");
      } else {
        // Keine aktive Überschreibung
        setExpiryType("none");
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

  // Speichern der Überschreibung
  const saveMoodOverride = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    let expiresAt: string | null = null;

    // Ablaufzeit bestimmen
    if (expiryType === "time" && expiryDate && expiryTime) {
      expiresAt = dayjs(`${expiryDate} ${expiryTime}`).toISOString();
    } else if (expiryType === "hours" && expiryHours > 0) {
      expiresAt = dayjs().add(expiryHours, "hour").toISOString();
    }

    try {
      const response = await fetch("/api/mood-override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !adjustDate, // Wenn adjustDate true ist, wird keine aktive Überschreibung benötigt
          level: manualLevel,
          expiresAt: expiresAt,
          adjustGeneratorDate: adjustDate, // Neue Option für Datum-Anpassung
        }),
      });

      const data = await response.json();

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

  // Zurücksetzen der Überschreibung
  const resetMoodOverride = async () => {
    setIsResetting(true);
    setError(null);

    try {
      const response = await fetch("/api/mood-override", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSaveSuccess(true);
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

  // Zurücksetzen des letzten Auftrags-Datums (neuer Auftrag)
  const resetLastGenerator = async () => {
    setIsResetting(true);
    setError(null);

    try {
      const response = await fetch("/api/generator-reset", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        setSaveSuccess(true);
        // Daten neu laden
        fetchMoodStatus();
      } else {
        setError(data.message || "Fehler beim Zurücksetzen des Generators");
      }
    } catch (err) {
      setError("Verbindungsfehler beim Zurücksetzen des Generators");
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
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Letzter Auftrag:</span>
              <span className="font-medium">
                {moodStatus.generator
                  ? dayjs(moodStatus.generator.createdAt).format(
                      "DD.MM.YYYY HH:mm"
                    )
                  : "Kein Auftrag vorhanden"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Berechnetes Level:</span>
              <span className="font-medium flex items-center">
                {moods[moodStatus.calculatedLevel].emoji}{" "}
                {moods[moodStatus.calculatedLevel].label} (
                {moodStatus.calculatedLevel})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Manuelle Überschreibung:</span>
              <span className="font-medium">
                {moodStatus.moodOverride?.active ? "Aktiv" : "Inaktiv"}
              </span>
            </div>

            {moodStatus.moodOverride?.active &&
              moodStatus.moodOverride?.expiresAt && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Läuft ab am:</span>
                  <span className="font-medium">
                    {dayjs(moodStatus.moodOverride.expiresAt).format(
                      "DD.MM.YYYY HH:mm"
                    )}
                  </span>
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

      {/* Formular für manuelle Überschreibung */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Manuelles Level einstellen
        </h3>

        <div className="space-y-4">
          {/* Level-Slider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gewünschtes Level:
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

          {/* Neue Option: Datum anpassen statt Überschreiben */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="adjust-date"
                checked={adjustDate}
                onChange={(e) => setAdjustDate(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="adjust-date"
                className="ml-2 block text-sm font-medium text-blue-800"
              >
                Datum anpassen statt manuelle Überschreibung
              </label>
            </div>
            <p className="text-xs text-blue-600 italic">
              Diese Option passt das Datum des letzten Auftrags so an, dass es
              automatisch zum gewählten Level führt und dieses mit der Zeit
              normal steigt.
            </p>
          </div>

          {/* Ablaufzeit-Optionen (nur anzeigen, wenn nicht adjustDate) */}
          {!adjustDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ablaufzeit:
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="expiry-none"
                    name="expiry-type"
                    value="none"
                    checked={expiryType === "none"}
                    onChange={() => setExpiryType("none")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="expiry-none"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Kein Ablaufdatum (manuell zurücksetzen)
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="expiry-hours"
                    name="expiry-type"
                    value="hours"
                    checked={expiryType === "hours"}
                    onChange={() => setExpiryType("hours")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="expiry-hours"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Nach Stunden zurücksetzen
                  </label>
                </div>

                {expiryType === "hours" && (
                  <div className="ml-6 flex items-center mt-2">
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(parseInt(e.target.value))}
                      className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <span className="ml-2 text-sm text-gray-500">Stunden</span>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="radio"
                    id="expiry-time"
                    name="expiry-type"
                    value="time"
                    checked={expiryType === "time"}
                    onChange={() => setExpiryType("time")}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="expiry-time"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Zu bestimmtem Zeitpunkt zurücksetzen
                  </label>
                </div>

                {expiryType === "time" && (
                  <div className="ml-6 grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <label htmlFor="expiry-date" className="sr-only">
                        Datum
                      </label>
                      <input
                        type="date"
                        id="expiry-date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        min={dayjs().format("YYYY-MM-DD")}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="expiry-time" className="sr-only">
                        Uhrzeit
                      </label>
                      <input
                        type="time"
                        id="expiry-time"
                        value={expiryTime}
                        onChange={(e) => setExpiryTime(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Speichern Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={saveMoodOverride}
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
            ) : adjustDate ? (
              "Datum anpassen & Level setzen"
            ) : (
              "Manuelles Level speichern"
            )}
          </button>

          {saveSuccess && (
            <span className="ml-3 text-sm text-green-600">
              ✓ Erfolgreich gespeichert
            </span>
          )}
        </div>
      </div>

      {/* Zurücksetzen-Optionen */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Zurücksetzen</h3>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={resetMoodOverride}
            disabled={isResetting || !moodStatus?.moodOverride?.active}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Manuelle Einstellung zurücksetzen
          </button>

          <button
            type="button"
            onClick={resetLastGenerator}
            disabled={isResetting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Neuen Auftrag simulieren (Level auf 0 setzen)
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoodLevelAdmin;
