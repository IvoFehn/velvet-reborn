// components/CreateWarningForm.tsx
import React, { useState } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface CreateWarningFormProps {
  onSuccess?: () => void;
}

const CreateWarningForm: React.FC<CreateWarningFormProps> = ({ onSuccess }) => {
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
    <div className="rounded-xl bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex items-center">
        <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-red-500 md:h-6 md:w-6" />
        <h2 className="text-lg font-semibold text-gray-700 md:text-xl">
          Verwarnung erstellen
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="warningMessage"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Warnungsnachricht
          </label>
          <textarea
            id="warningMessage"
            className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Geben Sie den Grund für die Verwarnung ein..."
            disabled={isSubmitting}
          ></textarea>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Wird erstellt..." : "Verwarnung erstellen"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateWarningForm;
