/* eslint-disable @typescript-eslint/no-explicit-any */
// components/NewsReviewForm.tsx

import StarRating from "@/components/starRating/StarRating";
import { calculateGoldReward } from "@/lib/calculateGold";
import { INewsInput } from "@/models/News";
import { GeneratorData } from "@/types";
import { createNews } from "@/util/createNews";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import dayjs from "dayjs";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";

/** Rating scale from 1 to 5 */
export type Rating = 1 | 2 | 3 | 4 | 5;

/** Erweiterte Formulardaten, inkl. Felder für fehlgeschlagene Generatoren */
export interface GeneratorReviewFormData {
  generatorId: string; // Referenz auf den zu bewertenden Generator
  title: string;
  message: string;
  obedience: Rating;
  didSquirt: boolean;
  vibeDuringSex: Rating;
  vibeAfterSex: Rating;
  orgasmIntensity: Rating;
  painlessness: Rating;
  wasAnal: boolean;
  ballsWorshipping: Rating;
  cumWorshipping: Rating;
  didEverythingForHisPleasure: Rating;
  bestMoment?: string;
  improvementSuggestion: string;
  additionalNotes: string;
  seen: boolean;
  // Neue Felder für den "FAILED"-Flow:
  isFailed: boolean;
  goldDeduction: number;
  expDeduction: number;
}

const initialFormData: GeneratorReviewFormData = {
  generatorId: "",
  title: "",
  message: "",
  obedience: 3,
  didSquirt: false,
  vibeDuringSex: 3,
  vibeAfterSex: 3,
  orgasmIntensity: 3,
  painlessness: 3,
  wasAnal: false,
  ballsWorshipping: 3,
  cumWorshipping: 3,
  didEverythingForHisPleasure: 3,
  bestMoment: "",
  improvementSuggestion: "",
  additionalNotes: "",
  seen: false,
  isFailed: false,
  goldDeduction: 0,
  expDeduction: 0,
};

/** Erweiterte Event-Typdefinition – Bonus-Events können einen extra bonusPercentage haben */
export interface EventType {
  id?: string;
  title: string;
  description: string;
  startDate: string; // ISO-Datum
  endDate: string; // ISO-Datum
  recurring: boolean;
  recurrence?: "daily" | "weekly" | "monthly" | "yearly";
  bonusPercentage?: number; // z. B. 0.1 für +10%
}

const NewsReviewForm: React.FC = () => {
  const [generators, setGenerators] = useState<GeneratorData[]>([]);
  const [selectedGenerator, setSelectedGenerator] =
    useState<GeneratorData | null>(null);
  const [formData, setFormData] =
    useState<GeneratorReviewFormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Aktive Bonus-Events laden
  const [activeEvents, setActiveEvents] = useState<EventType[]>([]);
  const fetchActiveEvents = async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      if (data.success) {
        setActiveEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Lade Generatoren (ACCEPTED) und Bonus-Events beim Laden der Komponente
  useEffect(() => {
    const fetchGenerators = async () => {
      try {
        const res = await fetch("/api/generator?status=ACCEPTED");
        const data = await res.json();
        if (data.success) {
          setGenerators(data.data);
        }
      } catch (error) {
        console.error("Error fetching generators:", error);
      }
    };

    fetchGenerators();
    fetchActiveEvents();
  }, []);

  const handleSelectGenerator = (generator: GeneratorData) => {
    setSelectedGenerator(generator);
    // Setze die generatorId und initialisiere den Rest des Formulars
    setFormData({ ...initialFormData, generatorId: generator._id ?? "" });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // Checkbox- und Number-Inputs entsprechend behandeln:
    const newValue =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : type === "number"
        ? Number(value)
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.isFailed) {
        // *** Fall: Generator als "failed" markieren ***

        // Erstelle ein News-Objekt mit Typ "failed"
        // (Stelle sicher, dass in deinem News-Modell "failed" als Typ erlaubt ist.)
        const failedNews: INewsInput = {
          title: formData.title,
          message: formData.message,
          createdAt: new Date().toISOString(),
          type: "failed" as any,
          seen: formData.seen,
        };

        await createNews(failedNews);

        // Profil aktualisieren: Gold und Exp abziehen (als negative Werte)
        await fetch("/api/profile/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gold: -formData.goldDeduction,
            exp: -formData.expDeduction,
          }),
        });

        // Aktualisiere den Generatorstatus über den /api/generator Endpoint auf "FAILED"
        if (selectedGenerator && selectedGenerator._id) {
          await fetch("/api/generator", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedGenerator._id,
              newStatus: "FAILED",
            }),
          });
        }

        setSuccessMessage(
          `Generator wurde als fehlgeschlagen markiert! ${formData.goldDeduction} Gold und ${formData.expDeduction} Exp wurden abgezogen.`
        );
        sendTelegramMessage(
          "user",
          "❌ Oh oh! Ein Auftrag von dir wurde gerade als fehlerhaft markiert. Schau rein. "
        );
      } else {
        // *** Normale Bewertung (Review) ***

        const reviewNews: INewsInput = {
          ...formData,
          type: "review",
          createdAt: new Date().toISOString(),
        };
        await createNews(reviewNews);

        // Goldberechnung anhand aktiver Events
        const bonusPercentages = activeEvents
          .filter((event) => event.bonusPercentage)
          .map((event) => event.bonusPercentage!);

        const goldEarned = calculateGoldReward(formData, {
          extraBonusPercentages: bonusPercentages,
        });

        // Profil aktualisieren: Gold hinzufügen
        await fetch("/api/profile/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gold: goldEarned }),
        });

        // Aktualisiere den Generatorstatus über den /api/generator Endpoint auf "DONE"
        if (selectedGenerator && selectedGenerator._id) {
          await fetch("/api/generator", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedGenerator._id,
              newStatus: "DONE",
            }),
          });
        }

        // Berechne das "overall rating" aus den 8 Bewertungsfeldern und bestimme das entsprechende Emoji:
        const overallRating = Math.round(
          (formData.obedience +
            formData.vibeDuringSex +
            formData.vibeAfterSex +
            formData.orgasmIntensity +
            formData.painlessness +
            formData.ballsWorshipping +
            formData.cumWorshipping +
            formData.didEverythingForHisPleasure) /
            8
        );

        const getEmojiForRating = (rating: number): string => {
          switch (rating) {
            case 1:
              return "⭐";
            case 2:
              return "⭐⭐";
            case 3:
              return "⭐⭐⭐";
            case 4:
              return "⭐⭐⭐⭐";
            case 5:
              return "⭐⭐⭐⭐⭐";
            default:
              return "⭐⭐⭐";
          }
        };

        const ratingEmoji = getEmojiForRating(overallRating);

        setSuccessMessage(
          `Bewertung erfolgreich erstellt! Du hast ${goldEarned} Gold erhalten.`
        );
        sendTelegramMessage(
          "user",
          `Ein Auftrag wurde gerade von dir bewertet! ${ratingEmoji} Schau rein.`
        );
      }

      // Formular zurücksetzen und Generatorauswahl löschen
      setFormData(initialFormData);
      setSelectedGenerator(null);
    } catch (error) {
      console.error("Error creating news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Akzeptierte Generatoren zur Bewertung
      </h2>

      {generators.length === 0 ? (
        <p className="text-gray-600">
          Keine akzeptierten Generatoren gefunden.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {generators.map((gen) => (
            <button
              key={gen._id}
              onClick={() => handleSelectGenerator(gen)}
              className={`p-4 text-left rounded-lg transition-all ${
                selectedGenerator?._id === gen._id
                  ? "bg-blue-100 border-2 border-blue-500"
                  : "bg-gray-300 hover:bg-gray-100 border-2 border-transparent"
              }`}
            >
              <h3 className="font-medium text-gray-800">
                {dayjs(gen.createdAt)
                  .locale("de")
                  .format("DD.MM.YYYY | HH:mm:ss") || gen._id}
              </h3>
            </button>
          ))}
        </div>
      )}

      {selectedGenerator && (
        <div className="space-y-6">
          <div className="border-b pb-4 mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Bewertung für:{" "}
              <span className="text-blue-600">
                {selectedGenerator.createdAt || selectedGenerator._id}
              </span>
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grundlegende Felder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                    Nachricht
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                    required
                  />
                </div>
              </div>

              {/* Bewertungsoptionen */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Gehorsam
                  </label>
                  <StarRating
                    rating={formData.obedience}
                    onChange={(v) => setFormData({ ...formData, obedience: v })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Stimmung während dem Sex
                  </label>
                  <StarRating
                    rating={formData.vibeDuringSex}
                    onChange={(v) =>
                      setFormData({ ...formData, vibeDuringSex: v })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Stimmung nach dem Sex
                  </label>
                  <StarRating
                    rating={formData.vibeAfterSex}
                    onChange={(v) =>
                      setFormData({ ...formData, vibeAfterSex: v })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Orgasmus
                  </label>
                  <StarRating
                    rating={formData.orgasmIntensity}
                    onChange={(v) =>
                      setFormData({ ...formData, orgasmIntensity: v })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Schmerzempfinden
                  </label>
                  <StarRating
                    rating={formData.painlessness}
                    onChange={(v) =>
                      setFormData({ ...formData, painlessness: v })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Interesse an deinen Eiern
                  </label>
                  <StarRating
                    rating={formData.ballsWorshipping}
                    onChange={(v) =>
                      setFormData({ ...formData, ballsWorshipping: v })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Interesse an deinem Sperma
                  </label>
                  <StarRating
                    rating={formData.cumWorshipping}
                    onChange={(v) =>
                      setFormData({ ...formData, cumWorshipping: v })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hat sie alles getan, damit du gut kommst?
                  </label>
                  <StarRating
                    rating={formData.didEverythingForHisPleasure}
                    onChange={(v) =>
                      setFormData({
                        ...formData,
                        didEverythingForHisPleasure: v,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes für zusätzliche Optionen */}
            <div className="flex space-x-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="didSquirt"
                  checked={formData.didSquirt}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Squirting erfolgt?</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="wasAnal"
                  checked={formData.wasAnal}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Analverkehr</span>
              </label>
            </div>

            {/* Zusätzliche Textfelder */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verbesserungsvorschläge
                </label>
                <input
                  type="text"
                  name="improvementSuggestion"
                  value={formData.improvementSuggestion}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zusätzliche Notizen
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                  required
                />
              </div>
            </div>

            {/* Option: Generator als fehlgeschlagen markieren */}
            <div className="space-y-4 border-t pt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isFailed"
                  checked={formData.isFailed}
                  onChange={handleChange}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-red-600 font-medium">
                  Generator als fehlgeschlagen markieren
                </span>
              </label>

              {formData.isFailed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gold abziehen
                    </label>
                    <input
                      type="number"
                      name="goldDeduction"
                      value={formData.goldDeduction}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exp abziehen
                    </label>
                    <input
                      type="number"
                      name="expDeduction"
                      value={formData.expDeduction}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      min="0"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {loading ? "Wird übermittelt..." : "News absenden"}
              </button>
            </div>
          </form>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsReviewForm;
