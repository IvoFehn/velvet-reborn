/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import StarRating from "@/components/starRating/StarRating";
import { Rating } from "@/models/News";
import { sendTelegramMessage } from "@/util/sendTelegramMessage";
import {
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiStar,
  FiExternalLink,
} from "react-icons/fi";

interface QuickTaskData {
  _id: string;
  title: string;
  description?: string;
  createdAt: string;
  status: "NEW" | "ACCEPTED" | "DONE" | "FAILED";
  url?: string;
}

interface QuickTaskReviewFormData {
  taskId: string;
  rating?: Rating | undefined;
  completionEffort?: Rating | undefined;
  creativity?: Rating | undefined;
  timeManagement?: Rating | undefined;
  followedInstructions?: Rating | undefined;
  additionalNotes: string;
  goldReward: number;
}

const initialFormData: QuickTaskReviewFormData = {
  taskId: "",
  rating: undefined,
  completionEffort: undefined,
  creativity: undefined,
  timeManagement: undefined,
  followedInstructions: undefined,
  additionalNotes: "",
  goldReward: 50, // Default gold reward
};

const QuickTaskReviewForm: React.FC = () => {
  const [quickTasks, setQuickTasks] = useState<QuickTaskData[]>([]);
  const [selectedTask, setSelectedTask] = useState<QuickTaskData | null>(null);
  const [formData, setFormData] =
    useState<QuickTaskReviewFormData>(initialFormData);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const fetchQuickTasks = async () => {
      try {
        const res = await fetch("/api/quicktasks?status=DONE");
        const data = await res.json();
        if (data.success) {
          setQuickTasks(data.data);
        }
      } catch (error) {
        console.error("Error fetching quick tasks:", error);
      }
    };

    fetchQuickTasks();
  }, []);

  const handleSelectTask = (task: QuickTaskData) => {
    setSelectedTask(task);
    setFormData({ ...initialFormData, taskId: task._id });
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? Number(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const calculateGoldReward = () => {
    let totalRating = 0;
    let ratingCount = 0;

    if (formData.rating !== undefined) {
      totalRating += formData.rating;
      ratingCount++;
    }
    if (formData.completionEffort !== undefined) {
      totalRating += formData.completionEffort;
      ratingCount++;
    }
    if (formData.creativity !== undefined) {
      totalRating += formData.creativity;
      ratingCount++;
    }
    if (formData.timeManagement !== undefined) {
      totalRating += formData.timeManagement;
      ratingCount++;
    }
    if (formData.followedInstructions !== undefined) {
      totalRating += formData.followedInstructions;
      ratingCount++;
    }

    if (ratingCount === 0) return 50;

    const avgRating = totalRating / ratingCount;
    const baseGold = 50;
    const goldMultiplier = avgRating / 3;

    return Math.round(baseGold * goldMultiplier);
  };

  useEffect(() => {
    if (selectedTask) {
      const calculatedGold = calculateGoldReward();
      setFormData((prev) => ({
        ...prev,
        goldReward: calculatedGold,
      }));
    }
  }, [
    formData.rating,
    formData.completionEffort,
    formData.creativity,
    formData.timeManagement,
    formData.followedInstructions,
    selectedTask,
  ]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (selectedTask && selectedTask._id) {
        await fetch(`/api/quicktasks?id=${selectedTask._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: formData.rating,
            completionEffort: formData.completionEffort,
            creativity: formData.creativity,
            timeManagement: formData.timeManagement,
            followedInstructions: formData.followedInstructions,
            additionalNotes: formData.additionalNotes,
            goldReward: formData.goldReward,
          }),
        });

        await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Bewertung: ${selectedTask.title}`,
            message: formData.additionalNotes || "",
            type: "review",
            seen: false,
            createdAt: new Date().toISOString(),
            quickTaskRating: formData.rating,
            quickTaskCompletionEffort: formData.completionEffort,
            quickTaskCreativity: formData.creativity,
            quickTaskTimeManagement: formData.timeManagement,
            quickTaskFollowedInstructions: formData.followedInstructions,
            quickTaskAdditionalNotes: formData.additionalNotes,
            quickTaskId: selectedTask._id,
          }),
        });

        await fetch("/api/profile/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gold: formData.goldReward }),
        });

        setSuccessMessage(
          `Bewertung erfolgreich erstellt! ${formData.goldReward} Gold wurden gutgeschrieben.`
        );

        let totalRating = 0;
        let ratingCount = 0;

        if (formData.rating !== undefined) {
          totalRating += formData.rating;
          ratingCount++;
        }
        if (formData.completionEffort !== undefined) {
          totalRating += formData.completionEffort;
          ratingCount++;
        }
        if (formData.creativity !== undefined) {
          totalRating += formData.creativity;
          ratingCount++;
        }
        if (formData.timeManagement !== undefined) {
          totalRating += formData.timeManagement;
          ratingCount++;
        }
        if (formData.followedInstructions !== undefined) {
          totalRating += formData.followedInstructions;
          ratingCount++;
        }

        const avgRating =
          ratingCount > 0 ? Math.round(totalRating / ratingCount) : 0;
        const stars = "⭐".repeat(avgRating) || "0 Sterne";

        sendTelegramMessage(
          "user",
          `Dein Quick Task "${selectedTask.title}" wurde bewertet! ${stars} Du hast ${formData.goldReward} Gold erhalten.`
        );

        setFormData(initialFormData);
        setSelectedTask(null);

        const res = await fetch("/api/quicktasks?status=DONE");
        const data = await res.json();
        if (data.success) {
          setQuickTasks(data.data);
        }
      }
    } catch (error) {
      console.error("Error creating review:", error);
      setErrorMessage("Fehler beim Erstellen der Bewertung");
    } finally {
      setLoading(false);
    }
  };

  const renderRatingSection = (
    label: string,
    field: keyof QuickTaskReviewFormData,
    value?: Rating
  ) => (
    <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {value !== undefined ? `${value}/5` : "Nicht bewertet"}
          </span>
          {value !== undefined && (
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, [field]: undefined }))
              }
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Zurücksetzen"
            >
              <FiXCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* Angepasste Logik für StarRating */}
        {value !== undefined ? (
          <StarRating
            rating={value}
            onChange={(v) => setFormData((prev) => ({ ...prev, [field]: v }))}
          />
        ) : (
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    [field]: starValue as Rating,
                  }))
                }
                className="p-1 text-gray-300 hover:text-yellow-400 transition-colors duration-200"
              >
                <svg
                  className="w-8 h-8 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-500">(0-5 Sterne)</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Task-Bewertung</h2>
            <p className="text-gray-500 mt-2">
              Wählen Sie einen abgeschlossenen Task aus und vergeben Sie eine
              Bewertung
            </p>
          </div>

          {quickTasks.length === 0 ? (
            <div className="bg-yellow-50 p-4 rounded-lg flex items-center space-x-3">
              <FiInfo className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-700">
                Keine abgeschlossenen Tasks verfügbar
              </span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {quickTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => handleSelectTask(task)}
                    className={`p-4 cursor-pointer transition-all transform hover:scale-[1.02] rounded-xl border-2 ${
                      selectedTask?._id === task._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(task.createdAt).toLocaleDateString("de-DE")}
                      </span>
                      {task.url && (
                        <a
                          href={task.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiExternalLink className="mr-1" />
                          Öffnen
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedTask && (
                <div className="border-t pt-8">
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Bewertung für: {selectedTask.title}
                    </h3>
                    {selectedTask.description && (
                      <p className="mt-2 text-gray-600">
                        {selectedTask.description}
                      </p>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {renderRatingSection(
                        "Gesamtbewertung",
                        "rating",
                        formData.rating
                      )}
                      {renderRatingSection(
                        "Einsatz & Mühe",
                        "completionEffort",
                        formData.completionEffort
                      )}
                      {renderRatingSection(
                        "Kreativität",
                        "creativity",
                        formData.creativity
                      )}
                      {renderRatingSection(
                        "Zeitmanagement",
                        "timeManagement",
                        formData.timeManagement
                      )}
                      {renderRatingSection(
                        "Anweisungstreue",
                        "followedInstructions",
                        formData.followedInstructions
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Gold-Belohnung
                        </label>
                        <div className="flex items-center space-x-3">
                          <FiStar className="w-6 h-6 text-yellow-500" />
                          <input
                            type="number"
                            name="goldReward"
                            value={formData.goldReward}
                            onChange={handleChange}
                            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            min="0"
                            required
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Kommentare & Notizen
                        </label>
                        <textarea
                          name="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={handleChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                          placeholder="Fügen Sie hier zusätzliche Anmerkungen hinzu..."
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all transform hover:shadow-lg disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <svg
                            className="animate-spin h-5 w-5 text-white"
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
                        ) : (
                          <>
                            <FiCheckCircle className="w-5 h-5" />
                            <span>Bewertung abschließen</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {successMessage && (
                    <div className="mt-6 p-4 bg-green-50 rounded-xl flex items-center space-x-3 border border-green-100">
                      <FiCheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-green-700">{successMessage}</span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="mt-6 p-4 bg-red-50 rounded-xl flex items-center space-x-3 border border-red-100">
                      <FiXCircle className="w-5 h-5 text-red-500" />
                      <span className="text-red-700">{errorMessage}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickTaskReviewForm;
