// components/admin/RandomSanctionForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, BadgeAlert } from "lucide-react";
import { ISanction } from "@/types/index";
import { giveSanction } from "@/util/sanctionUtils";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

interface RandomSanctionFormProps {
  onSanctionCreated?: (sanction: ISanction) => void;
}

const RandomSanctionForm: React.FC<RandomSanctionFormProps> = ({
  onSanctionCreated,
}) => {
  const [severity, setSeverity] = useState<number>(3);
  const [deadlineDays, setDeadlineDays] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reason, setReason] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const newSanction = await giveSanction(severity, deadlineDays, reason);

      // Telegram-Benachrichtigung senden
      try {
        const dayjs = await import("dayjs");
        await import("dayjs/locale/de");

        await sendTelegramMessage(
          "user",
          `Neue Sanktion erstellt am ${dayjs
            .default()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}`
        );
      } catch (telegramError) {
        console.error(
          "Fehler beim Senden der Telegram-Nachricht:",
          telegramError
        );
        // Die Sanktion wurde trotzdem erstellt, wir zeigen keinen Fehler an
      }

      setSuccess(
        `Sanktion "${newSanction.title}" (Schweregrad ${severity}) erfolgreich erstellt!` +
          (newSanction.reason ? `\nBegründung: ${newSanction.reason}` : "")
      );

      // Elternkomponente benachrichtigen
      if (onSanctionCreated) {
        onSanctionCreated(newSanction);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
          Zufällige Sanktion
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Vergebe eine zufällige Sanktion basierend auf dem Schweregrad
        </p>
      </div>

      {/* Status Anzeigen */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-200 rounded animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <BadgeAlert className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-200 rounded animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">{success}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Severity Selector */}
        <div className="space-y-4">
          <Label
            htmlFor="severity-group"
            className="block font-medium text-gray-700 dark:text-gray-300"
          >
            Schweregrad der Verfehlung
          </Label>

          <div id="severity-group" className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setSeverity(level)}
                className={`
                  py-3 px-1 rounded-lg text-center transition-all duration-200
                  ${
                    severity === level
                      ? "ring-2 ring-offset-2 ring-blue-500 shadow-md scale-105 transform"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                  ${getSeverityButtonStyle(level)}
                `}
              >
                <div className="text-xl font-bold mb-1">{level}</div>
                <div className="text-xs font-medium">
                  {getSeverityLabel(level)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Deadline Selector */}
        <div className="space-y-2">
          <Label
            htmlFor="deadlineDays"
            className="block font-medium text-gray-700 dark:text-gray-300"
          >
            Frist für die Erledigung
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="deadlineDays"
              type="number"
              min="1"
              max="30"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
              Tage
            </span>
          </div>
        </div>

        {/* Begründung */}
        <div className="space-y-2">
          <Label
            htmlFor="reason"
            className="block font-medium text-gray-700 dark:text-gray-300"
          >
            Begründung (optional)
          </Label>
          <Input
            id="reason"
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex-1"
            placeholder="Optional: Warum wird die Sanktion vergeben?"
          />
        </div>

        {/* Information Box */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm">
          <p className="mb-1 font-medium">
            Wie funktioniert die Sanktionszuweisung?
          </p>
          <p>
            Der Schweregrad bestimmt den Pool möglicher Sanktionen. Je höher der
            Schweregrad, desto anspruchsvoller sind die potentiellen Aufgaben.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-base font-medium flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Wird vergeben...
              </>
            ) : (
              "Sanktion zufällig vergeben"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Hilfsfunktionen
function getSeverityLabel(level: number): string {
  switch (level) {
    case 1:
      return "Sehr leicht";
    case 2:
      return "Leicht";
    case 3:
      return "Mittel";
    case 4:
      return "Schwer";
    case 5:
      return "Sehr schwer";
    default:
      return `Stufe ${level}`;
  }
}

function getSeverityButtonStyle(level: number): string {
  switch (level) {
    case 1:
      return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200";
    case 2:
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200";
    case 3:
      return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200";
    case 4:
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200";
    case 5:
      return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200";
    default:
      return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200";
  }
}

export default RandomSanctionForm;
