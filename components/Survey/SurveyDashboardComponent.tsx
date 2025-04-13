// components/SurveyDashboard/SurveyDashboard.tsx
import React, { useState, useEffect } from "react";
import surveyQuestions from "@/data/surveyQuestions";
import { ChevronDown, Download, Printer } from "lucide-react";

interface SurveyResponseData {
  _id: string;
  answers: {
    questionId: string;
    response: "yes" | "no" | "maybe";
    reason: string;
  }[];
  averageScore: number;
  submittedAt: string;
}

interface CategoryResults {
  category: string;
  yes: number;
  no: number;
  maybe: number;
  total: number;
  percentage: number;
  isOpen: boolean;
}

interface QuestionResults {
  id: string;
  text: string;
  category: string;
  yes: number;
  no: number;
  maybe: number;
  total: number;
  reasons: string[];
}

const SurveyDashboard: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyResponseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<string>("all");
  const [categoryResults, setCategoryResults] = useState<CategoryResults[]>([]);
  const [questionResults, setQuestionResults] = useState<QuestionResults[]>([]);
  const [averageScore, setAverageScore] = useState<number>(0);

  // Daten laden
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/surveys");

        if (!response.ok) {
          throw new Error("Fehler beim Laden der Umfrage-Daten");
        }

        const data = await response.json();
        setSurveys(data);
        setSelectedSurvey("all");
        setLoading(false);
      } catch (err) {
        setError((err as Error).message || "Ein Fehler ist aufgetreten");
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  // Statistiken berechnen, wenn sich die Umfrage oder die ausgewählte Umfrage ändert
  useEffect(() => {
    if (surveys.length === 0) return;

    // Durchschnitt berechnen
    if (selectedSurvey === "all") {
      setAverageScore(
        surveys.reduce((sum, s) => sum + s.averageScore, 0) / surveys.length
      );
    } else {
      const survey = surveys.find((s) => s._id === selectedSurvey);
      setAverageScore(survey ? survey.averageScore : 0);
    }

    // Bestimme, welche Umfragen analysiert werden sollen
    const surveysToAnalyze =
      selectedSurvey === "all"
        ? surveys
        : surveys.filter((s) => s._id === selectedSurvey);

    // Kategorien ermitteln
    const categories = [...new Set(surveyQuestions.map((q) => q.category))];

    // Kategorien-Statistiken berechnen
    const categoryStats = categories.map((category) => {
      const questions = surveyQuestions.filter((q) => q.category === category);
      const questionIds = questions.map((q) => q.id);

      let yesCount = 0;
      let noCount = 0;
      let maybeCount = 0;

      surveysToAnalyze.forEach((survey) => {
        survey.answers.forEach((answer) => {
          if (questionIds.includes(answer.questionId)) {
            if (answer.response === "yes") yesCount++;
            else if (answer.response === "no") noCount++;
            else if (answer.response === "maybe") maybeCount++;
          }
        });
      });

      const total = yesCount + noCount + maybeCount;
      const percentage = total > 0 ? Math.round((yesCount / total) * 100) : 0;

      return {
        category,
        yes: yesCount,
        no: noCount,
        maybe: maybeCount,
        total,
        percentage,
        isOpen: false, // Standardmäßig geschlossen
      };
    });

    setCategoryResults(categoryStats);

    // Fragen-Statistiken berechnen
    const questionStats = surveyQuestions.map((question) => {
      let yesCount = 0;
      let noCount = 0;
      let maybeCount = 0;
      const reasons: string[] = [];

      surveysToAnalyze.forEach((survey) => {
        survey.answers.forEach((answer) => {
          if (answer.questionId === question.id) {
            if (answer.response === "yes") yesCount++;
            else if (answer.response === "no") noCount++;
            else if (answer.response === "maybe") {
              maybeCount++;
              if (answer.reason) reasons.push(answer.reason);
            }
          }
        });
      });

      const total = yesCount + noCount + maybeCount;

      return {
        id: question.id,
        text: question.text,
        category: question.category,
        yes: yesCount,
        no: noCount,
        maybe: maybeCount,
        total,
        reasons,
      };
    });

    setQuestionResults(questionStats);
  }, [selectedSurvey, surveys]);

  // Akkordeon öffnen/schließen
  const toggleCategory = (category: string) => {
    setCategoryResults((prev) =>
      prev.map((item) =>
        item.category === category ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  // Datum formatieren
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getResponseColor = (percentage: number) => {
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const ResponseBar = ({
    yes,
    no,
    maybe,
    total,
  }: {
    yes: number;
    no: number;
    maybe: number;
    total: number;
  }) => {
    if (total === 0)
      return (
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div className="bg-gray-300 h-3 w-full"></div>
        </div>
      );

    return (
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div className="flex h-full">
          <div
            className="bg-green-500 transition-all duration-500"
            style={{ width: `${(yes / total) * 100}%` }}
          />
          <div
            className="bg-yellow-500 transition-all duration-500"
            style={{ width: `${(maybe / total) * 100}%` }}
          />
          <div
            className="bg-red-500 transition-all duration-500"
            style={{ width: `${(no / total) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  // CSV Export Funktion
  const exportToCsv = () => {
    // CSV Header
    const headers = [
      "Frage",
      "Kategorie",
      "Ja",
      "Vielleicht",
      "Nein",
      "Ja-Prozent",
    ];

    // CSV Daten
    const rows = questionResults.map((q) => {
      const jaPercent = q.total > 0 ? (q.yes / q.total) * 100 : 0;
      return [q.text, q.category, q.yes, q.maybe, q.no, jaPercent.toFixed(1)];
    });

    // CSV-String erstellen
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => {
        // Text in Anführungszeichen setzen und Kommas escapen
        return row
          .map((cell) => {
            if (
              typeof cell === "string" &&
              (cell.includes(",") || cell.includes('"'))
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(",");
      }),
    ].join("\n");

    // Download initiieren
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `umfrage-export-${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-gray-500">
          <div className="w-12 h-12 mx-auto mb-2">
            <ChevronDown className="animate-bounce" />
          </div>
          Lade Ergebnisse...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 p-6 rounded-xl text-center">
        <div className="text-red-600 font-medium mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    );

  if (surveys.length === 0)
    return (
      <div className="bg-white p-6 rounded-xl text-center">
        <div className="text-gray-600 mb-4">
          Keine Umfrageergebnisse vorhanden
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Umfrageauswertung
        </h1>

        {/* Survey Selection */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSurvey("all")}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedSurvey === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Alle Umfragen ({surveys.length})
            </button>
            {surveys.map((survey) => (
              <button
                key={survey._id}
                onClick={() => setSelectedSurvey(survey._id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedSurvey === survey._id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {formatDate(survey.submittedAt)} •{" "}
                {survey.averageScore.toFixed(1)}%
              </button>
            ))}
          </div>
        </div>

        {/* Overall Score Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider">
                Durchschnittsbewertung
              </h2>
              <p className="mt-1 text-4xl font-bold">
                {averageScore.toFixed(1)}%
              </p>
            </div>
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${getResponseColor(
                averageScore
              )}`}
            >
              <span className="text-2xl font-bold text-white">
                {Math.round(averageScore)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-4">
        {categoryResults.map((category) => (
          <div
            key={category.category}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            {/* Category Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCategory(category.category)}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {category.category}
                </h3>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="text-sm text-gray-600">
                    <span className="text-green-600 font-medium">
                      {category.yes} Ja
                    </span>
                    {" • "}
                    <span className="text-yellow-600 font-medium">
                      {category.maybe} Vielleicht
                    </span>
                    {" • "}
                    <span className="text-red-600 font-medium">
                      {category.no} Nein
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-sm text-gray-500">
                    {category.total} Antworten
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-24 hidden sm:block">
                  <ResponseBar {...category} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-medium">
                    {category.percentage}%
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      category.isOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Questions */}
            {category.isOpen && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                {questionResults
                  .filter((q) => q.category === category.category)
                  .map((question) => (
                    <div
                      key={question.id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {question.text}
                        </h4>
                        <div className="flex items-center justify-between space-x-4">
                          <div className="flex-1">
                            <ResponseBar {...question} />
                          </div>
                          <span className="text-sm text-gray-600 whitespace-nowrap">
                            {question.total > 0
                              ? ((question.yes / question.total) * 100).toFixed(
                                  1
                                )
                              : "0.0"}
                            %
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div className="p-2 bg-green-50 rounded">
                          <div className="text-green-700 font-medium">
                            {question.yes}
                          </div>
                          <div className="text-gray-600">Ja</div>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded">
                          <div className="text-yellow-700 font-medium">
                            {question.maybe}
                          </div>
                          <div className="text-gray-600">Vielleicht</div>
                        </div>
                        <div className="p-2 bg-red-50 rounded">
                          <div className="text-red-700 font-medium">
                            {question.no}
                          </div>
                          <div className="text-gray-600">Nein</div>
                        </div>
                      </div>

                      {question.reasons.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                              <span className="text-sm font-medium text-gray-700">
                                Begründungen ({question.reasons.length})
                              </span>
                              <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                            </summary>
                            <ul className="mt-2 space-y-2 pl-4">
                              {question.reasons.map((reason, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 before:content-['-'] before:mr-2 before:text-gray-400"
                                >
                                  {reason}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-3">
        <button
          onClick={exportToCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <Printer className="w-5 h-5 mr-2" />
          Drucken
        </button>
      </div>
    </div>
  );
};

export default SurveyDashboard;
