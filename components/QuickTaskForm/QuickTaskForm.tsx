// components/QuickTaskForm.tsx
import React, { useState, FormEvent, ChangeEvent } from "react";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";

interface QuickTaskFormData {
  title: string;
  description: string;
  url: string;
}

const initialFormData: QuickTaskFormData = {
  title: "",
  description: "",
  url: "",
};

const QuickTaskForm: React.FC = () => {
  const [formData, setFormData] = useState<QuickTaskFormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/quicktasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "NEW",
          seen: false,
          createdAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Quick Task erfolgreich erstellt!");
        setFormData(initialFormData);
        sendTelegramMessage("user", "Ein neuer Quick Task wurde erstellt.");
      } else {
        setErrorMessage(
          result.message || "Fehler beim Erstellen des Quick Tasks"
        );
      }
    } catch (error) {
      console.error("Error creating quick task:", error);
      setErrorMessage("Fehler beim Erstellen des Quick Tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Quick Task erstellen
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titel
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL (optional)
          </label>
          <input
            type="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? "Wird erstellt..." : "Quick Task erstellen"}
          </button>
        </div>
      </form>

      {successMessage && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default QuickTaskForm;
