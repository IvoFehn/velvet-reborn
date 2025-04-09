// @/components/LegalBook.tsx
import React, { useState, useEffect } from "react";
import RulesQuiz from "@/components/RulesQuiz/RulesQuiz";
import sections from "@/data/rules";

const LegalBook: React.FC = () => {
  const [hasAccepted, setHasAccepted] = useState<boolean>(false);
  const [hasPassedQuiz, setHasPassedQuiz] = useState<boolean>(false);

  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      document.cookie.includes("acceptedRules=true")
    ) {
      setHasAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    const maxAge = 15552000;
    document.cookie = `acceptedRules=true; max-age=${maxAge}; path=/`;
    setHasAccepted(true);
  };

  return (
    <div className="relative">
      {/* Immer sichtbarer Teil: Das Gesetzbuch */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Gesetzbuch</h1>
          <p className="text-gray-600 text-lg">
            Aktuelle Fassung vom {new Date().toLocaleDateString("de-DE")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="flex-1">
            {sections.map((section) => (
              <section
                key={section.title}
                id={section.title}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6 p-6"
              >
                <h2 className="text-2xl font-semibold text-gray-900">
                  {section.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mt-2">
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz-Abschnitt: Unerlässlich für die Regelakzeptanz */}
      {!hasAccepted && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-gray-200">
          <h2 className="text-xl font-bold text-center text-gray-900 mb-6">
            Beantworte alle Fragen, dann kannst du die Regeln akzeptieren.
          </h2>

          {!hasPassedQuiz ? (
            // Das Quiz ist eingebunden als eigener Bereich und kann jederzeit eingesehen werden.
            <RulesQuiz
              onQuizPass={() => setHasPassedQuiz(true)}
              onAccept={handleAccept}
            />
          ) : (
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                Quiz erfolgreich bestanden!
              </h3>
              <p className="mb-6 text-gray-700">
                Du hast das Regelquiz erfolgreich abgeschlossen. Bestätige deine
                Akzeptanz der Regeln.
              </p>
              <button
                onClick={handleAccept}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
              >
                Regeln endgültig bestätigen
              </button>
            </div>
          )}
        </div>
      )}

      {/* Optionaler Hinweis für bereits akzeptierte Regeln */}
      {hasAccepted && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-center">
            Du hast die Regeln bereits akzeptiert.
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalBook;
