import React from "react";

interface IntroductionProps {
  onStart: () => void;
}

const SurveyIntroduction: React.FC<IntroductionProps> = ({ onStart }) => {
  return (
    <div className="py-8 px-4 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-blue-500 font-semibold">
              Präferenz-Umfrage
            </div>
            <p className="mt-2 text-gray-500">
              Diese kurze Umfrage soll dabei helfen, ein besseres Verständnis
              dafür zu bekommen, wie engagiert du die App nutzen möchtest – rein
              hypothetisch, falls der Mann spontan die Idee hätte, dies
              umzusetzen. Sie betrifft auch deine persönlichen Grenzen, wobei er
              sich in bestimmten Fällen, falls er es für notwendig hält, dazu
              berechtigt sieht, diese zu überschreiten, was du in den Regeln
              zugestimmt hast. Bitte nimm dir einen Moment Zeit und beantworte
              die folgenden Fragen ehrlich. Alle drei Monate wird die Umfrage
              erneut gestellt, um mögliche Veränderungen deiner Präferenzen zu
              erkennen. Wichtig hierbei ist, dass du nur die Dinge verneinst,
              die du dir unter keinen Umständen vorstellen kannst. © AI
              Generated Content by DeepSeek Ltd. China
            </p>
            <button
              onClick={onStart}
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Umfrage starten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyIntroduction;
