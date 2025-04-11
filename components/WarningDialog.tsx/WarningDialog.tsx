// components/WarningDialog.tsx
import React, { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

import { IWarning } from "@/models/Warning";

type WarningProps = IWarning;

const WarningDialog: React.FC = () => {
  const [warning, setWarning] = useState<WarningProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch the most recent unacknowledged warning
  useEffect(() => {
    const fetchWarning = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/warnings?unacknowledged=true");

        if (!response.ok) {
          throw new Error("Fehler beim Abrufen der Warnungen");
        }

        const data = await response.json();
        if (data.success && data.data && data.data.length > 0) {
          // Get the newest warning
          setWarning(data.data[0]);
        } else {
          setWarning(null);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
        );
        console.error("Fehler beim Laden der Warnungen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWarning();
  }, []);

  // Handle first acknowledgment click
  const handleAcknowledge = () => {
    setShowConfirmation(true);
  };

  // Handle final confirmation
  const handleConfirmAcknowledge = async () => {
    if (!warning) return;

    try {
      const response = await fetch("/api/warnings/acknowledge", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ warningId: warning._id }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Bestätigen der Warnung");
      }

      // Reset states
      setWarning(null);
      setShowConfirmation(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
      console.error("Fehler beim Bestätigen der Warnung:", error);
    }
  };

  // Cancel confirmation dialog
  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  // If no warning, don't render anything
  if (!warning && !loading && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-md rounded-lg bg-white p-6 shadow-xl">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-red-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : warning ? (
          <div>
            <div className="mb-4 flex items-center">
              <ExclamationTriangleIcon className="mr-2 h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-800">Verwarnung</h2>
            </div>

            <p className="mb-4 text-gray-700">{warning.message}</p>

            <p className="mb-6 text-sm text-gray-500">
              Ausgesprochen am:{" "}
              {new Date(warning.createdAt).toLocaleDateString("de-DE")}
            </p>

            {!showConfirmation ? (
              <button
                onClick={handleAcknowledge}
                className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
              >
                Verstanden
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Bitte bestätigen Sie, dass Sie die Warnung verstanden haben
                  und sich verbessern werden.
                </p>
                <button
                  onClick={handleConfirmAcknowledge}
                  className="w-full rounded-md bg-blue-600 py-2 text-white hover:bg-blue-700"
                >
                  Verstanden, ich werde mich bessern
                </button>
                <button
                  onClick={handleCancelConfirmation}
                  className="w-full rounded-md border border-gray-300 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Abbrechen
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Keine Warnungen vorhanden
          </div>
        )}
      </div>
    </div>
  );
};

export default WarningDialog;
