/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";

interface Question {
  id: string;
  text: string;
  description?: string;
  category: string;
  image?: string;
}

interface SurveyAnswerRecord {
  question: Question;
  response: "yes" | "no" | "maybe" | "";
  reason: string;
}

interface APIAnswer {
  questionId: string;
  response: "yes" | "no" | "maybe";
  reason: string;
}

interface SurveyStatus {
  canRetake: boolean;
  average: number | null;
}

interface SurveyProps {
  onSubmit?: (responses: Record<string, any>) => void;
  introTitle?: string;
  introDescription?: string;
  introImage?: string;
}

// Importiere die Fragen aus einer externen Datei
import surveyQuestions from "@/data/surveyQuestions";

// SurveyIntroduction Komponente
const SurveyIntroduction: React.FC<{
  title?: string;
  description?: string;
  image?: string;
  onStart: () => void;
  averageScore?: number | null;
}> = ({ title, description, image, onStart, averageScore }) => {
  return (
    <div className="bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 md:p-8 text-center">
          {image && (
            <div className="mb-6 overflow-hidden rounded-lg shadow-md max-w-md mx-auto">
              <img
                src={image}
                alt="Umfrage Einführungsbild"
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title || "Willkommen zu unserer Umfrage"}
          </h1>

          <div className="text-gray-600 mb-8 max-w-xl mx-auto">
            <p className="mb-4">
              {description ||
                `
Diese kurze Umfrage soll dabei helfen, ein besseres Verständnis dafür zu bekommen, 
wie engagiert du die App nutzen möchtest – rein hypothetisch, falls der Mann spontan 
die Idee hätte, dies umzusetzen. Sie betrifft auch deine persönlichen Grenzen, wobei 
er sich in bestimmten Fällen, falls er es für notwendig hält, dazu berechtigt sieht, 
diese zu überschreiten, was du in den Regeln zugestimmt hast. Bitte nimm dir einen 
Moment Zeit und beantworte die folgenden Fragen ehrlich. Alle drei Monate wird die 
Umfrage erneut gestellt, um mögliche Veränderungen deiner Präferenzen zu erkennen. 
Wichtig hierbei ist, dass du nur die Dinge verneinst, die du dir unter keinen Umständen 
vorstellen kannst. 

Antworte bitte komplett ehrlich. 
`}
            </p>
            <p>
              Die Umfrage besteht aus {surveyQuestions.length} Fragen und dauert
              etwa {Math.ceil(surveyQuestions.length / 4)} Minuten.
            </p>

            {averageScore !== null && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium">
                  Dein Durchschnittswert aus der letzten Umfrage:
                </p>
                <div className="mt-2 flex items-center justify-center">
                  <div className="relative w-full max-w-xs h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ease-out"
                      style={{ width: `${averageScore || 0}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white mix-blend-difference">
                      {averageScore !== null ? averageScore?.toFixed(1) : "0.0"}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onStart}
            className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md mx-auto"
          >
            Mit der Umfrage beginnen
          </button>
        </div>
      </div>
    </div>
  );
};

// SurveyLockedMessage Komponente
const SurveyLockedMessage: React.FC<{
  averageScore: number | null;
}> = ({ averageScore }) => {
  // Berechne das Datum, an dem die Umfrage wieder verfügbar sein wird
  const getNextAvailableDate = () => {
    const now = new Date();
    now.setMonth(now.getMonth() + 3);
    return now.toLocaleDateString("de-DE");
  };

  return (
    <div className="bg-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 md:p-8 text-center">
          <div className="mb-6 text-amber-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V7a3 3 0 00-3-3H7a3 3 0 00-3 3v4h14V7a3 3 0 00-3-3h-1a3 3 0 00-3 3z"
              />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Umfrage noch nicht verfügbar
          </h1>

          <div className="text-gray-600 mb-8 max-w-xl mx-auto">
            <p className="mb-4">
              Du hast die Umfrage bereits in den letzten drei Monaten
              ausgefüllt. Die nächste Umfrage wird ab dem{" "}
              <strong>{getNextAvailableDate()}</strong> verfügbar sein.
            </p>

            {averageScore !== null && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-medium">
                  Dein Durchschnittswert aus der letzten Umfrage:
                </p>
                <div className="mt-2 flex items-center justify-center">
                  <div className="relative w-full max-w-xs h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ease-out"
                      style={{ width: `${averageScore}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white mix-blend-difference">
                      {averageScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const PreferenceSurvey: React.FC<SurveyProps> = ({
  onSubmit,
  introTitle,
  introDescription,
  introImage,
}) => {
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswerRecord[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [surveyFinished, setSurveyFinished] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [showIntroduction, setShowIntroduction] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [canTakeSurvey, setCanTakeSurvey] = useState<boolean>(false);
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Beim ersten Laden prüfen, ob der Benutzer die Umfrage ausfüllen darf
  useEffect(() => {
    const checkSurveyStatus = async () => {
      try {
        const response = await fetch("/api/survey/status");
        if (!response.ok) {
          throw new Error("Fehler beim Abrufen des Survey-Status");
        }

        const data: SurveyStatus = await response.json();
        setCanTakeSurvey(data.canRetake);
        setAverageScore(data.average);
      } catch (error) {
        console.error("Fehler beim Überprüfen des Survey-Status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSurveyStatus();
  }, []);

  useEffect(() => {
    const initialRecords: SurveyAnswerRecord[] = surveyQuestions.map((q) => ({
      question: q,
      response: "",
      reason: "",
    }));
    setSurveyAnswers(initialRecords);
  }, []);

  const handleStartSurvey = () => {
    setShowIntroduction(false);
  };

  const handleResponseChange = (response: "yes" | "no" | "maybe") => {
    const updatedRecords = [...surveyAnswers];
    updatedRecords[currentQuestionIndex] = {
      ...updatedRecords[currentQuestionIndex],
      response,
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

    if (!currentRecord.response) {
      setShowError(true);
      return;
    }

    if (currentRecord.response === "maybe" && !currentRecord.reason.trim()) {
      setShowError(true);
      return;
    }

    if (currentQuestionIndex < surveyAnswers.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setSurveyFinished(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setShowError(false);
    }
  };

  const handleSubmitSurvey = async () => {
    // Formatiere die Antworten für die API
    const apiAnswers: APIAnswer[] = surveyAnswers.map((record) => ({
      questionId: record.question.id,
      response: record.response as "yes" | "no" | "maybe", // Type casting, da wir bereits validiert haben
      reason: record.reason,
    }));

    setSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers: apiAnswers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fehler beim Speichern der Umfrage");
      }

      const data = await response.json();

      // Optional: Callback für externe Komponenten
      if (onSubmit) {
        const formattedResponses: Record<string, any> = {};
        surveyAnswers.forEach((record) => {
          formattedResponses[record.question.id] = {
            response: record.response,
            reason: record.reason,
          };
        });
        onSubmit(formattedResponses);
      }

      // Zeige Erfolgsmeldung
      alert(
        "Umfrage erfolgreich abgeschickt! Dein Durchschnittswert: " +
          data.averageScore.toFixed(1) +
          "%"
      );

      // Aktualisiere den Status, damit der Benutzer nicht sofort eine neue Umfrage starten kann
      setCanTakeSurvey(false);
      setAverageScore(data.averageScore);
    } catch (error) {
      console.error("Fehler beim Absenden der Umfrage:", error);
      setSubmitError((error as Error).message || "Ein Fehler ist aufgetreten.");
    } finally {
      setSubmitting(false);
    }
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

  // Zeige Ladeindikator während der Status überprüft wird
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Zeige eine Nachricht, wenn der Benutzer die Umfrage noch nicht ausfüllen darf
  if (!canTakeSurvey) {
    return <SurveyLockedMessage averageScore={averageScore} />;
  }

  if (surveyAnswers.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  // Zeige die Einführung, wenn showIntroduction true ist
  if (showIntroduction) {
    return (
      <SurveyIntroduction
        title={introTitle}
        description={introDescription}
        image={introImage}
        onStart={handleStartSurvey}
        averageScore={averageScore}
      />
    );
  }

  if (!surveyFinished) {
    const currentRecord = surveyAnswers[currentQuestionIndex];
    return (
      <div className="py-8 px-4">
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

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg">
              <p className="font-medium">Fehler:</p>
              <p>{submitError}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleSubmitSurvey}
              disabled={submitting}
              className={`py-3 px-8 ${
                submitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white rounded-lg transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-md`}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Wird gesendet...
                </span>
              ) : (
                "Umfrage abschicken"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceSurvey;
