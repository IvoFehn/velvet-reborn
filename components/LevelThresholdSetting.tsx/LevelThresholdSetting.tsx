import React, { useState, useEffect } from "react";

// Schnittstelle für die Schwellenwerte im Formular
interface ThresholdFormValues {
  level1: number; // Tage für Level 1
  level2: number; // Tage für Level 2
  level3: number; // Tage für Level 3
  level4: number; // Tage für Level 4
}

const LevelThresholdSettings: React.FC = () => {
  // Niedrigere Standardwerte für schnelleres Ansteigen des Levels
  const defaultThresholds: ThresholdFormValues = {
    level1: 1.5, // Nach 1,5 Tagen auf Level 1
    level2: 3, // Nach 3 Tagen auf Level 2
    level3: 4.5, // Nach 4,5 Tagen auf Level 3
    level4: 6, // Nach 6 Tagen auf Level 4
  };

  const [thresholds, setThresholds] =
    useState<ThresholdFormValues>(defaultThresholds);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Schwellenwerte beim Laden der Komponente abrufen
  useEffect(() => {
    fetchThresholds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aktuelle Schwellenwerte abrufen
  const fetchThresholds = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/level-thresholds");
      const data = await response.json();

      if (data.success) {
        setThresholds(data.data);
      } else {
        // Bei Fehler Standardwerte verwenden
        setThresholds(defaultThresholds);
        setError(data.message || "Fehler beim Laden der Schwellenwerte.");
      }
    } catch (err) {
      console.error("Fehler beim Abrufen der Schwellenwerte:", err);
      setThresholds(defaultThresholds);
      setError("Verbindungsfehler beim Laden der Schwellenwerte.");
    } finally {
      setIsLoading(false);
    }
  };

  // Änderungen an einem Schwellenwert
  const handleThresholdChange = (
    level: keyof ThresholdFormValues,
    value: number
  ) => {
    setThresholds((prev) => ({
      ...prev,
      [level]: value,
    }));
  };

  // Schwellenwerte speichern
  const saveThresholds = async () => {
    // Validierung: Sicherstellen, dass die Werte in aufsteigender Reihenfolge sind
    if (
      thresholds.level1 >= thresholds.level2 ||
      thresholds.level2 >= thresholds.level3 ||
      thresholds.level3 >= thresholds.level4
    ) {
      setError("Die Schwellenwerte müssen in aufsteigender Reihenfolge sein.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const response = await fetch("/api/level-thresholds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(thresholds),
      });

      const data = await response.json();

      if (data.success) {
        setSaveSuccess(true);
        setThresholds(data.data);
      } else {
        setError(data.message || "Fehler beim Speichern der Schwellenwerte.");
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Schwellenwerte:", err);
      setError("Verbindungsfehler beim Speichern der Schwellenwerte.");
    } finally {
      setIsSaving(false);
    }
  };

  // Auf schnellere Standardwerte zurücksetzen
  const resetToDefaults = () => {
    setThresholds(defaultThresholds);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Geschwindigkeit des Lustlevel-Anstiegs anpassen
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            Schwellenwerte (in Tagen):
          </h4>
          <p className="text-xs text-gray-500 mb-3">
            Definiere, nach wie vielen Tagen das jeweilige Level erreicht wird.
            Kleinere Werte lassen das Level schneller ansteigen.
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label
                  htmlFor="level1"
                  className="block text-sm font-medium text-gray-700"
                >
                  Level 1 (😉)
                </label>
                <input
                  type="number"
                  id="level1"
                  min="0.1"
                  step="0.1"
                  value={thresholds.level1}
                  onChange={(e) =>
                    handleThresholdChange("level1", parseFloat(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mehr als {thresholds.level1} Tage
                </p>
              </div>

              <div>
                <label
                  htmlFor="level2"
                  className="block text-sm font-medium text-gray-700"
                >
                  Level 2 (🥵)
                </label>
                <input
                  type="number"
                  id="level2"
                  min="0.1"
                  step="0.1"
                  value={thresholds.level2}
                  onChange={(e) =>
                    handleThresholdChange("level2", parseFloat(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mehr als {thresholds.level2} Tage
                </p>
              </div>

              <div>
                <label
                  htmlFor="level3"
                  className="block text-sm font-medium text-gray-700"
                >
                  Level 3 (🔥)
                </label>
                <input
                  type="number"
                  id="level3"
                  min="0.1"
                  step="0.1"
                  value={thresholds.level3}
                  onChange={(e) =>
                    handleThresholdChange("level3", parseFloat(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mehr als {thresholds.level3} Tage
                </p>
              </div>

              <div>
                <label
                  htmlFor="level4"
                  className="block text-sm font-medium text-gray-700"
                >
                  Level 4 (🍆)
                </label>
                <input
                  type="number"
                  id="level4"
                  min="0.1"
                  step="0.1"
                  value={thresholds.level4}
                  onChange={(e) =>
                    handleThresholdChange("level4", parseFloat(e.target.value))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mehr als {thresholds.level4} Tage
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Hinweis:</strong> Die voreingestellten Werte sind für
            schnelleres Ansteigen des Levels optimiert:
          </p>
          <ul className="text-xs text-blue-700 mt-1 list-disc pl-5">
            <li>Level 1 nach 1,5 Tagen (statt 3 Tagen)</li>
            <li>Level 2 nach 3 Tagen (statt 4 Tagen)</li>
            <li>Level 3 nach 4,5 Tagen (statt 6 Tagen)</li>
            <li>Level 4 nach 6 Tagen (statt 8 Tagen)</li>
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            type="button"
            onClick={saveThresholds}
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
              "Schwellenwerte speichern"
            )}
          </button>

          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Optimierte Werte wiederherstellen
          </button>

          {saveSuccess && (
            <span className="inline-flex items-center px-2 text-sm text-green-600">
              ✓ Erfolgreich gespeichert
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelThresholdSettings;
