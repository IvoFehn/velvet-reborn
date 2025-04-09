/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";

interface Question {
  id: string;
  text: string;
  description?: string; // Beschreibung der Frage
  category: string;
  image?: string; // Bildpfad oder URL für die Frage
}

interface SurveyAnswerRecord {
  question: Question;
  response: "yes" | "no" | "maybe" | "";
  reason: string;
}

interface SurveyProps {
  onSubmit?: (responses: Record<string, any>) => void;
}

// Importiere die Fragen aus einer externen Datei
import surveyQuestionsData from "@/data/surveyQuestions";

// Beispielfragen als Fallback, falls die externen Daten nicht geladen werden können
const surveyQuestions: Question[] = surveyQuestionsData || [
  {
    id: "q1",
    text: "Lesbisch",
    description: "Die Frau hat geschlechtsverkehr mit einer anderen Frau.",
    category: "Homo",
    image: "/api/placeholder/600/400",
  },
  {
    id: "q2",
    text: "Schwul",
    description:
      "Die Frau ist mit geschlechtsverkehr zwischen ihrem Partner und einer gleichgeschlechtlichen Person einverstanden.",
    category: "Homo",
    image: "/api/placeholder/600/400",
  },
  {
    id: "q3",
    text: "Dreier FFM",
    description:
      "Geschlechtsverkehr zwischen einer Frau, ihrem männlichen Partner und einer weiteren Frau.",
    category: "Gruppensex",
    image: "/api/placeholder/600/400",
  },
  {
    id: "q4",
    text: "Dreier MMF",
    description:
      "Geschlechtsverkehr zwischen einer Frau, ihrem männlichen Partner und einem weiteren Mann.",
    category: "Gruppensex",
    image: "/api/placeholder/600/400",
  },
];

const PreferenceSurvey: React.FC<SurveyProps> = ({ onSubmit }) => {
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswerRecord[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [surveyFinished, setSurveyFinished] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  useEffect(() => {
    const initialRecords: SurveyAnswerRecord[] = surveyQuestions.map((q) => ({
      question: q,
      response: "",
      reason: "",
    }));
    setSurveyAnswers(initialRecords);
  }, []);

  const handleResponseChange = (response: "yes" | "no" | "maybe") => {
    const updatedRecords = [...surveyAnswers];
    updatedRecords[currentQuestionIndex] = {
      ...updatedRecords[currentQuestionIndex],
      response,
      // Wenn eine neue Antwort gewählt wird und diese nicht "maybe" ist, setze den Grund zurück
      reason:
        response !== "maybe" ? "" : updatedRecords[currentQuestionIndex].reason,
    };
    setSurveyAnswers(updatedRecords);
    setShowError(false);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updatedRecords = [...surveyAnswers];
    updatedRecords[currentQuestionIndex] = {
      ...updatedRecords[currentQuestionIndex],
      reason: e.target.value,
    };
    setSurveyAnswers(updatedRecords);
    setShowError(false);
  };

  const handleNextQuestion = () => {
    const currentRecord = surveyAnswers[currentQuestionIndex];

    // Überprüfen, ob eine Antwort gewählt wurde
    if (!currentRecord.response) {
      setShowError(true);
      return;
    }

    // Überprüfen, ob bei "maybe" eine Begründung gegeben wurde
    if (currentRecord.response === "maybe" && !currentRecord.reason.trim()) {
      setShowError(true);
      return;
    }

    if (currentQuestionIndex < surveyAnswers.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Letzte Frage: Zusammenfassung anzeigen
      setSurveyFinished(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowError(false);
    }
  };

  const handleSubmitSurvey = () => {
    const responses: Record<string, any> = {};
    surveyAnswers.forEach((record) => {
      responses[record.question.id] = {
        response: record.response,
        reason: record.reason,
      };
    });
    if (onSubmit) onSubmit(responses);
    alert("Umfrage erfolgreich abgeschickt!");
  };

  const getResponseColor = (response: string) => {
    switch (response) {
      case "yes":
        return "bg-green-500 hover:bg-green-600 ring-green-400";
      case "maybe":
        return "bg-yellow-500 hover:bg-yellow-600 ring-yellow-400";
      case "no":
        return "bg-red-500 hover:bg-red-600 ring-red-400";
      default:
        return "bg-gray-200 hover:bg-gray-300 ring-gray-400";
    }
  };

  if (surveyAnswers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!surveyFinished) {
    const currentRecord = surveyAnswers[currentQuestionIndex];
    return (
      <div className="bg-gray-100 min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 md:p-8">
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span className="font-medium">
                  Frage {currentQuestionIndex + 1} von {surveyAnswers.length}
                </span>
                <span className="font-medium bg-gray-200 px-3 py-1 rounded-full text-xs">
                  {currentRecord.question.category}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / surveyAnswers.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            {currentRecord.question.image && (
              <div className="mb-6 overflow-hidden rounded-lg shadow-md">
                <img
                  src={currentRecord.question.image}
                  alt={`Bild zu: ${currentRecord.question.text}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {currentRecord.question.text}
            </h2>

            {currentRecord.question.description && (
              <p className="text-gray-600 mb-6">
                {currentRecord.question.description}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              {["yes", "maybe", "no"].map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    handleResponseChange(option as "yes" | "no" | "maybe")
                  }
                  className={`py-3 rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                    currentRecord.response === option
                      ? `${getResponseColor(option)} text-white ring-2`
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  {option === "yes"
                    ? "Ja"
                    : option === "maybe"
                    ? "Vielleicht"
                    : "Nein"}
                </button>
              ))}
            </div>

            {currentRecord.response === "maybe" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unter welchen Voraussetzungen würdest du &ldquo;Ja&ldquo;
                  wählen?
                </label>
                <textarea
                  value={currentRecord.reason}
                  onChange={handleReasonChange}
                  placeholder="Bitte gib hier deine Begründung ein..."
                  className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition-colors ${
                    showError && !currentRecord.reason.trim()
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  rows={4}
                ></textarea>
                {showError && !currentRecord.reason.trim() && (
                  <p className="text-red-500 text-sm mt-1">
                    Bei &ldquo;Vielleicht&ldquo; ist eine Begründung
                    erforderlich
                  </p>
                )}
              </div>
            )}

            {showError && !currentRecord.response && (
              <p className="text-red-500 text-sm mb-4">
                Bitte wähle eine Antwort aus
              </p>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`py-2 px-6 rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
                  currentQuestionIndex === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400"
                }`}
              >
                Zurück
              </button>
              <button
                onClick={handleNextQuestion}
                className="py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                {currentQuestionIndex < surveyAnswers.length - 1
                  ? "Weiter"
                  : "Zusammenfassung"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Zusammenfassung der Antworten
  return (
    <div className="bg-gray-100 min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-8">
            Zusammenfassung deiner Antworten
          </h2>

          <div className="space-y-6 mb-8">
            {surveyAnswers.map((record, index) => (
              <div
                key={record.question.id}
                className="p-5 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {record.question.image && (
                  <div className="mb-4 overflow-hidden rounded-lg shadow-sm h-24 w-auto">
                    <img
                      src={record.question.image}
                      alt={`Bild zu: ${record.question.text}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <span className="font-semibold text-lg">
                    {index + 1}. {record.question.text}
                  </span>
                  <span className="text-xs bg-gray-200 px-3 py-1 rounded-full">
                    {record.question.category}
                  </span>
                </div>

                {record.question.description && (
                  <p className="text-gray-600 text-sm mb-3">
                    {record.question.description}
                  </p>
                )}

                <div className="mb-2">
                  <span className="font-medium">Deine Antwort: </span>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-white font-medium text-sm ${
                      record.response === "yes"
                        ? "bg-green-500"
                        : record.response === "maybe"
                        ? "bg-yellow-500"
                        : record.response === "no"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  >
                    {record.response === "yes"
                      ? "Ja"
                      : record.response === "maybe"
                      ? "Vielleicht"
                      : record.response === "no"
                      ? "Nein"
                      : "Keine Antwort"}
                  </span>
                </div>

                {record.reason && (
                  <div>
                    <span className="font-medium">Deine Begründung: </span>
                    <p className="text-gray-700 mt-1 pl-3 border-l-2 border-gray-300 italic">
                      {record.reason}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmitSurvey}
              className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md"
            >
              Umfrage abschicken
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSurvey;
