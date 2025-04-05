import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaceSmileIcon,
  FaceFrownIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import HealthQuestionnaireModal, {
  HealthStatus,
} from "./HealthQuestionnaireModal";

// Typdefinitionen
export type MoodFeeling = "good" | "bad";

export interface MoodEntry {
  _id: string;
  feeling: MoodFeeling;
  healthStatus?: HealthStatus;
  createdAt: string;
  updatedAt: string;
}

interface MoodResponse {
  success: boolean;
  data: MoodEntry | null;
  message?: string;
}

const MoodTrackerWidget: React.FC = () => {
  const [currentMood, setCurrentMood] = useState<MoodFeeling | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showHealthQuestionnaire, setShowHealthQuestionnaire] =
    useState<boolean>(false);
  const [tempMoodSelection, setTempMoodSelection] =
    useState<MoodFeeling | null>(null);

  // Hole den letzten Mood-Status beim Laden der Komponente
  useEffect(() => {
    const fetchCurrentMood = async (): Promise<void> => {
      try {
        const response = await fetch("/api/mood/current");
        if (!response.ok) {
          // Wenn kein Mood gefunden wurde, ist das okay
          if (response.status === 404) {
            return;
          }
          throw new Error("Fehler beim Abrufen der Stimmung");
        }

        const data: MoodResponse = await response.json();
        if (data.success && data.data) {
          setCurrentMood(data.data.feeling);
        }
      } catch (error) {
        console.error("Fehler:", error);
        // Fehler nicht anzeigen, da es sein kann, dass noch kein Mood eingetragen wurde
      }
    };

    fetchCurrentMood();
  }, []);

  const handleMoodSelection = (feeling: MoodFeeling): void => {
    if (feeling === "good") {
      // Bei guter Stimmung direkt speichern
      updateMood(feeling);
    } else {
      // Bei schlechter Stimmung Fragebogen anzeigen
      setTempMoodSelection(feeling);
      setShowHealthQuestionnaire(true);
    }
  };

  const handleHealthQuestionnaireSubmit = (
    healthStatus: HealthStatus
  ): void => {
    console.log("Health questionnaire submitted with data:", healthStatus);
    if (tempMoodSelection) {
      console.log(
        "Updating mood with health status for feeling:",
        tempMoodSelection
      );
      updateMoodWithHealthStatus(tempMoodSelection, healthStatus);
    }
    setShowHealthQuestionnaire(false);
  };

  const handleHealthQuestionnaireClose = (): void => {
    setShowHealthQuestionnaire(false);
    setTempMoodSelection(null);
  };

  const updateMood = async (feeling: MoodFeeling): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("Updating mood with feeling:", feeling);
      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feeling }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Fehler beim Speichern der Stimmung"
        );
      }

      const data: MoodResponse = await response.json();
      if (data.success) {
        setCurrentMood(feeling);
        setSuccess(true);

        // Nach 2 Sekunden die Erfolgsmeldung ausblenden
        setTimeout(() => setSuccess(false), 2000);
      } else {
        throw new Error(data.message || "Ein Fehler ist aufgetreten");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateMoodWithHealthStatus = async (
    feeling: MoodFeeling,
    healthStatus: HealthStatus
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("Sending to API:", { feeling, healthStatus });

      // Erstellen eines neuen Objekts, um sicherzustellen, dass die Struktur korrekt ist
      const requestData = {
        feeling: feeling,
        healthStatus: {
          complaint: healthStatus.complaint,
          analPossible: healthStatus.analPossible,
          vaginalPossible: healthStatus.vaginalPossible,
          oralPossible: healthStatus.oralPossible,
        },
      };

      const response = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            "Fehler beim Speichern der Stimmung und Gesundheitsinformationen"
        );
      }

      const data: MoodResponse = await response.json();
      console.log("Response data:", data);

      if (data.success) {
        setCurrentMood(feeling);
        setSuccess(true);

        // Nach 2 Sekunden die Erfolgsmeldung ausblenden
        setTimeout(() => setSuccess(false), 2000);
      } else {
        throw new Error(data.message || "Ein Fehler ist aufgetreten");
      }
    } catch (error) {
      console.error("Error in updateMoodWithHealthStatus:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Ein unbekannter Fehler ist aufgetreten");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Tägliche Stimmung
          </h3>
          <button
            onClick={() => setShowInfoModal(true)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          >
            <InformationCircleIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoodSelection("good")}
            disabled={loading}
            className={`relative flex items-center justify-center p-3 sm:p-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              currentMood === "good"
                ? "bg-green-50 text-green-700 ring-2 ring-green-500"
                : "bg-gray-50 text-gray-500 hover:bg-green-100 hover:text-green-700"
            }`}
          >
            <FaceSmileIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="mt-2 text-xs font-medium sm:text-sm">Gut</span>
            {loading && currentMood !== "good" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-md">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-600"
                  viewBox="0 0 24 24"
                >
                  <path
                    className="fill-current"
                    d="M12 3a9 9 0 0 0 9 9 9 9 0 0 0-9 9 9 9 0 0 0-9-9 9 9 0 0 0 9-9zM12 17v3m0-13v.01M17 12h3m-13 0h.01M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
                  />
                </svg>
              </div>
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleMoodSelection("bad")}
            disabled={loading}
            className={`relative flex items-center justify-center p-3 sm:p-4 rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              currentMood === "bad"
                ? "bg-red-50 text-red-700 ring-2 ring-red-500"
                : "bg-gray-50 text-gray-500 hover:bg-red-100 hover:text-red-700"
            }`}
          >
            <FaceFrownIcon className="h-6 w-6 sm:h-7 sm:w-7" />
            <span className="mt-2 text-xs font-medium sm:text-sm">
              Schlecht
            </span>
            {loading && currentMood !== "bad" && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-md">
                <svg
                  className="animate-spin h-5 w-5 text-indigo-600"
                  viewBox="0 0 24 24"
                >
                  <path
                    className="fill-current"
                    d="M12 3a9 9 0 0 0 9 9 9 9 0 0 0-9 9 9 9 0 0 0-9-9 9 9 0 0 0 9-9zM12 17v3m0-13v.01M17 12h3m-13 0h.01M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
                  />
                </svg>
              </div>
            )}
          </motion.button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 italic">
            Wähle &ldquo;Schlecht&rdquo; nur bei ernsthaftem Unwohlsein.
          </p>
          <Link
            href="/mood-history"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          >
            Verlauf
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="mt-4">
          {error && (
            <div className="px-3 py-2 rounded-md bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-3 py-2 rounded-md bg-green-50 text-green-700 text-sm"
            >
              Stimmung gespeichert!
            </motion.div>
          )}
        </div>
      </div>

      {showInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75">
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="px-6 py-6 lg:px-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium text-gray-900">
                  Über den Stimmungs-Tracker
                </h3>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p>
                  Dieser Tracker hilft dir, deine tägliche Stimmung einfach zu
                  erfassen. Wähle die Option, die am besten zu deinem aktuellen
                  Befinden passt.
                </p>
                <h4 className="font-semibold text-gray-800 mt-3">
                  Wie es funktioniert:
                </h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Klicke auf &quot;Gut&quot; oder &quot;Schlecht&quot;.</li>
                  <li>
                    Bei &quot;Schlecht&quot; erscheint ein kurzer Fragebogen zu
                    deinem Gesundheitszustand.
                  </li>
                  <li>Deine Auswahl wird gespeichert.</li>
                  <li>
                    Im{" "}
                    <Link
                      href="/mood-history"
                      className="text-indigo-600 hover:underline"
                    >
                      Verlauf
                    </Link>{" "}
                    kannst du deine bisherigen Einträge einsehen.
                  </li>
                </ul>
                <p className="mt-3 italic text-sm text-gray-600">
                  <strong>Hinweis:</strong> Die Option &quot;Schlecht&quot;
                  sollte für Tage verwendet werden, an denen du dich wirklich
                  unwohl fühlst.
                </p>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-md text-sm px-5 py-2.5 text-center"
                >
                  Verstanden
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHealthQuestionnaire && (
        <HealthQuestionnaireModal
          onClose={handleHealthQuestionnaireClose}
          onSubmit={handleHealthQuestionnaireSubmit}
        />
      )}
    </div>
  );
};

export default MoodTrackerWidget;
