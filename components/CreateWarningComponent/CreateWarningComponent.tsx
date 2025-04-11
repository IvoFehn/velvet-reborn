// components/admin/CreateWarningComponent.tsx
import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

interface CreateWarningComponentProps {
  onSuccess?: () => void;
}

const CreateWarningComponent: React.FC<CreateWarningComponentProps> = ({
  onSuccess,
}) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Bitte geben Sie eine Warnungsnachricht ein");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/warnings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Erstellen der Warnung");
      }

      // Success!
      try {
        const dayjs = await import("dayjs");
        await import("dayjs/locale/de");

        await sendTelegramMessage(
          "user",
          `Neue Verwarnung ausgesprochen am ${dayjs
            .default()
            .locale("de")
            .format("DD.MM.YYYY HH:mm:ss")}: "${message.trim()}"`
        );
      } catch (telegramError) {
        console.error(
          "Fehler beim Senden der Telegram-Nachricht:",
          telegramError
        );
        // Die Aktion wurde trotzdem durchgeführt, wir zeigen keinen Fehler an
      }

      // Success!
      setSuccess("Warnung erfolgreich erstellt");
      setMessage("");

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after a delay
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
      console.error("Fehler beim Erstellen der Warnung:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Verwarnung aussprechen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Geben Sie einen detaillierten Grund für die Verwarnung ein..."
                className="min-h-32"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-md text-sm text-red-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 p-3 rounded-md text-sm text-green-600">
                {success}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Wird erstellt...
                  </>
                ) : (
                  "Verwarnung aussprechen"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateWarningComponent;
