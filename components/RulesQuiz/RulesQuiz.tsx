// @/components/RulesQuiz.tsx
import React, { useState, useEffect } from "react";
import questions, { Question } from "@/data/questions";
import rulesData from "@/data/rules";

// Deterministic shuffle using seed for SSR compatibility
function seededRandom(seed: number) {
  let value = seed;
  return function() {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

interface RulesQuizProps {
  onQuizPass?: () => void;
  onAccept?: () => void;
}

interface AnswerRecord {
  question: Question;
  selectedAnswer?: number;
}

const RulesQuiz: React.FC<RulesQuizProps> = ({ onQuizPass, onAccept }) => {
  const [quizAnswers, setQuizAnswers] = useState<AnswerRecord[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Hilfsfunktion: Auswahl von 15 Fragen,
  // sodass wenn möglich zu jeder Regel mindestens eine Frage ausgewählt wird.
  const selectRandomQuestions = (
    questionsList: Question[],
    count: number
  ): Question[] => {
    // Use deterministic seed based on current date (changes daily)
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const random = seededRandom(seed);
    
    const groups: { [rule: string]: Question[] } = {};
    questionsList.forEach((q) => {
      if (!groups[q.rule]) groups[q.rule] = [];
      groups[q.rule].push(q);
    });

    const selected: Question[] = [];
    // Eine Frage pro Gruppe (wenn Gruppenanzahl <= count)
    Object.values(groups).forEach((group) => {
      if (selected.length < count) {
        const randomIndex = Math.floor(random() * group.length);
        selected.push(group[randomIndex]);
      }
    });

    // Auffüllen bis count erreicht wird
    const remaining = questionsList.filter((q) => !selected.includes(q));
    while (selected.length < count && remaining.length > 0) {
      const randIndex = Math.floor(random() * remaining.length);
      selected.push(remaining[randIndex]);
      remaining.splice(randIndex, 1);
    }

    // Deterministic shuffle
    return selected.sort(() => random() - 0.5);
  };

  // Initialisiere das Quiz bei Erstladung - nur client-side
  useEffect(() => {
    // Delay to ensure client-side execution
    const initQuiz = () => {
      const selectedQuestions = selectRandomQuestions(questions, 15);
      // Für jede Frage ein AnswerRecord anlegen, ohne Vorauswahl
      const initialRecords = selectedQuestions.map((q) => ({ question: q }));
      setQuizAnswers(initialRecords);
      setIsLoading(false);
    };
    
    // Use setTimeout to ensure this runs after hydration
    setTimeout(initQuiz, 0);
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    const updatedRecords = [...quizAnswers];
    updatedRecords[currentQuestionIndex] = {
      ...updatedRecords[currentQuestionIndex],
      selectedAnswer: answerIndex,
    };
    setQuizAnswers(updatedRecords);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizAnswers.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const countCorrectAnswers = () => {
    return quizAnswers.filter(
      (record) =>
        record.selectedAnswer !== undefined &&
        record.selectedAnswer === record.question.correctAnswer
    ).length;
  };

  const rulesToReview = () => {
    const wrongRules = new Set<string>();
    quizAnswers.forEach((record) => {
      if (
        record.selectedAnswer === undefined ||
        record.selectedAnswer !== record.question.correctAnswer
      ) {
        wrongRules.add(record.question.rule);
      }
    });
    return Array.from(wrongRules);
  };

  const handleResetQuiz = () => {
    // Reset des Quiz und Neuladen der Fragen
    const selectedQuestions = selectRandomQuestions(questions, 15);
    const initialRecords = selectedQuestions.map((q) => ({ question: q }));
    setQuizAnswers(initialRecords);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
  };

  const handleAcceptRules = () => {
    // Maximal mögliche Gültigkeit (2038-Jahr-Problem)
    const maxAge = 2147483647; // ~68 Jahre
    document.cookie = `acceptedRules=true; max-age=${maxAge}; path=/`;
    alert("Regeln wurden akzeptiert. Du wirst zur Hauptseite weitergeleitet.");
    if (onAccept) onAccept();
    if (onQuizPass) onQuizPass();
  };

  const handleSkipQuiz = () => {
    setShowPasswordInput(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "Sexlust") {
      handleAcceptRules();
    } else if (passwordInput) {
      alert("Falsches Passwort!");
    }
    setPasswordInput("");
    setShowPasswordInput(false);
  };

  // Show loading state during initial load and hydration
  if (isLoading || quizAnswers.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-32 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-24 mx-auto"></div>
          </div>
          <p className="mt-4 text-gray-600">Lade Quiz...</p>
        </div>
      </div>
    );
  }

  // Styling Konstanten
  const buttonBaseStyle =
    "py-2 px-4 rounded transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-50";
  const primaryButtonStyle = `${buttonBaseStyle} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
  const secondaryButtonStyle = `${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400`;
  const disabledButtonStyle = `${buttonBaseStyle} bg-gray-300 text-gray-500 cursor-not-allowed`;

  if (!quizFinished) {
    const currentRecord = quizAnswers[currentQuestionIndex];
    const question = currentRecord.question;
    const isAnswerSelected = currentRecord.selectedAnswer !== undefined;

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8 relative">
            {/* Unauffälliger Skip-Link */}
            <div
              className="absolute top-3 right-3 text-gray-300 hover:text-gray-400 text-xs cursor-pointer transition-colors"
              onClick={handleSkipQuiz}
              title="Support"
            >
              ?
            </div>

            {/* Passwort-Eingabe Overlay */}
            {showPasswordInput && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                  <h3 className="text-lg font-semibold mb-4">
                    Passwort eingeben
                  </h3>
                  <form onSubmit={handlePasswordSubmit}>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded mb-4"
                      placeholder="Passwort"
                      autoFocus
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordInput(false);
                          setPasswordInput("");
                        }}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Bestätigen
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              Regelverständnis Quiz
            </h1>
            <p className="text-gray-600 text-center mb-6">
              Beantworte alle Fragen. Deine Ergebnisse werden dir am Ende
              angezeigt.
            </p>
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>
                  Frage {currentQuestionIndex + 1} von {quizAnswers.length}
                </span>
                <span>Regel: {question.rule}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / quizAnswers.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {question.question}
              </h2>
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                      currentRecord.selectedAnswer === index
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`flex-shrink-0 h-5 w-5 border rounded-full mt-0.5 mr-3 flex items-center justify-center ${
                          currentRecord.selectedAnswer === index
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {currentRecord.selectedAnswer === index && (
                          <span className="h-2 w-2 rounded-full bg-white"></span>
                        )}
                      </div>
                      <span className="text-gray-700">{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={handlePreviousQuestion}
                className={
                  currentQuestionIndex > 0
                    ? secondaryButtonStyle
                    : disabledButtonStyle
                }
                disabled={currentQuestionIndex === 0}
              >
                Zurück
              </button>
              <button
                onClick={handleNextQuestion}
                className={
                  isAnswerSelected ? primaryButtonStyle : disabledButtonStyle
                }
                disabled={!isAnswerSelected}
              >
                {currentQuestionIndex < quizAnswers.length - 1
                  ? "Weiter"
                  : "Ergebnisse anzeigen"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Zusammenfassung: Ergebnisse und Überprüfung
  const correctCount = countCorrectAnswers();
  const percentageCorrect = ((correctCount / quizAnswers.length) * 100).toFixed(
    0
  );
  const reviewRules = rulesToReview();

  return (
    <div className="bg-gray-50 min-h-screen pt-32">
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Zusammenfassung
        </h2>
        <p
          className={`text-xl text-center mb-6 ${
            correctCount === quizAnswers.length
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          Du hast {correctCount} von {quizAnswers.length} Fragen richtig
          beantwortet ({percentageCorrect}%)
        </p>

        {/* Detaillierte Übersicht pro Frage */}
        <div className="space-y-6 mb-8">
          {quizAnswers.map((record, index) => {
            const userAnswerIndex = record.selectedAnswer;
            const isCorrect = userAnswerIndex === record.question.correctAnswer;
            return (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">
                    Frage {index + 1} - Regel: {record.question.rule}
                  </span>
                  <span
                    className={`font-semibold ${
                      isCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isCorrect ? "Richtig" : "Falsch"}
                  </span>
                </div>
                <p className="mb-1">
                  <span className="font-semibold">Frage:</span>{" "}
                  {record.question.question}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Deine Antwort:</span>{" "}
                  {userAnswerIndex !== undefined
                    ? record.question.options[userAnswerIndex]
                    : "Keine Antwort"}
                </p>
                {!isCorrect && (
                  <p className="mb-1">
                    <span className="font-semibold">Richtige Antwort:</span>{" "}
                    {record.question.options[record.question.correctAnswer]}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Falls falsch beantwortete Fragen vorhanden sind */}
        {reviewRules.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">
              Regeln zur Wiederholung
            </h3>
            <ul className="list-disc list-inside">
              {reviewRules.map((ruleName) => {
                const ruleObj = rulesData.find((r) => r.title === ruleName);
                return (
                  <li key={ruleName} className="mb-2">
                    <span className="font-semibold">{ruleName}:</span>{" "}
                    {ruleObj ? ruleObj.content : "Kein Regeltext gefunden."}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="flex justify-center space-x-4">
          <button onClick={handleResetQuiz} className={secondaryButtonStyle}>
            Quiz wiederholen
          </button>
          {correctCount === quizAnswers.length && (
            <button onClick={handleAcceptRules} className={primaryButtonStyle}>
              Regeln akzeptieren
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RulesQuiz;
