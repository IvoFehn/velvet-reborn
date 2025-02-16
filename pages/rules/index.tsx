import React, { useState, useEffect } from "react";

const LegalBook = () => {
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      document.cookie.includes("rulesAccepted=true")
    ) {
      setHasAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    const maxAge = 15552000;
    document.cookie = `rulesAccepted=true; max-age=${maxAge}; path=/`;
    setHasAccepted(true);
  };

  const sections = [
    {
      id: "section01",
      title: "Regeln",
      content:
        "Die Regeln gelten immer, egal ob gerade ein Auftrag ausgeführt wird oder nicht.",
    },
    {
      id: "section02",
      title: "Sichtweise",
      content:
        "Denke aus der Sicht des Mannes! Die Aufgabe der Frau ist bei jedem Auftrag, jeder Weekly, jeder Quicktask aus der Sicht des Mannes zu handeln. Wenn sie Entscheidungsfreiheit hat, soll sie immer das tun, was dem Mann am besten gefallen könnte.",
    },
    {
      id: "section03",
      title: "Verhalten",
      content:
        "Wenn der Mann die Frau anfassen möchte, dann bleibt diese stehen, bis der Mann fertig ist, und stellt sich so hin, wie sie glaubt, dass der Mann am besten alle Löcher anfassen kann. Dies gilt für Fotze und Arsch, bspw. durch Beine spreizen und nach vorn beugen.",
    },
    {
      id: "section04",
      title: "Bewertung",
      content:
        "Die Frau strebt danach, die bestmögliche Bewertung für den Sex zu erhalten.",
    },
    {
      id: "section05",
      title: "Verhalten Wiederholung",
      content:
        "Wenn der Mann die Frau anfassen möchte, dann bleibt diese stehen und stellt sich so hin, wie sie glaubt, dass der Mann am besten alle Löcher anfassen kann. Dies gilt für Fotze und Arsch.",
    },
    {
      id: "section06",
      title: "Auftrag Vergabe",
      content:
        "Der Mann darf jederzeit live einen Auftrag vergeben. Er benötigt die App nicht. Wenn die Frau sich nicht sicher ist, ob das vom Mann Gewünschte ein Auftrag ist, dann fragt sie nach, ob dies einer ist. Änderungsanträge und Ablehnungsanträge können dann live gestellt werden. Der Mann hat auch hier das Recht, diese abzulehnen.",
    },
    {
      id: "section07",
      title: "Auftragsänderung",
      content:
        "Ist ein Auftrag gestellt, hat die Frau die Möglichkeit, diesen per Antrag abzulehnen oder zu ändern. Der Mann hat das Recht, über diese Anträge zu entscheiden. Sollte ein Auftrag gesetzt sein, wird dieser ohne Widerworte ausgeführt.",
    },
    {
      id: "section08",
      title: "Sofortige Aufträge",
      content:
        "Sollten Aufträge sofort verrichtet werden, versucht die Frau, die Aufträge so schnell wie möglich zu erfüllen.",
    },
    {
      id: "section09",
      title: "Auftragsfeedback",
      content:
        "Über einen Auftrag wird bis frühestens eine Stunde nach dem Auftrag nicht gemeckert, und auch wenn der Auftrag der Frau nicht gefällt, wird dies beim Sex nicht gemerkt.",
    },
    {
      id: "section10",
      title: "Information",
      content:
        "Die Frau informiert den Mann rechtzeitig bei Tagen oder Krankheiten.",
    },
    {
      id: "section11",
      title: "Fehlende Aufgaben",
      content:
        "Aufgaben, die einfach nicht gemacht wurden oder zu schlecht für jegliche Bewertung umgesetzt wurden, können vom Mann als fehlgeschlagen markiert werden und bestraft oder sanktioniert werden.",
    },
    {
      id: "section12",
      title: "Lustlevel",
      content:
        "Die Frau ist verpflichtet, auf das Lustlevel zu achten und dafür zu sorgen, dass es im besten Fall niemals zu weit ansteigt.",
    },
    {
      id: "section13",
      title: "App-Nutzung",
      content:
        "Die Frau ist verpflichtet, regelmäßig in die App zu schauen, um sich auf den neuesten Stand zu bringen.",
    },
    {
      id: "section14",
      title: "Regeländerungen",
      content:
        "Die Frau ist jederzeit damit einverstanden, wenn sich Regeln oder Features ändern. Sie nimmt Regeländerungen oder Feature-Änderungen stillschweigend hin. Sämtliche Meinungsverschiedenheiten über Regeländerungen dürfen über das Ticket-System erfolgen. Allerdings darf der Mann darüber entscheiden, ob er auf die Beschwerde der Frau eingeht oder nicht.",
    },
    {
      id: "section15",
      title: "Streitfall",
      content:
        "Im Falle einses Streites (egal welcher Schwere) hat die Frau trotzdem den Anweisung des Mannes folgezuleisten. Sex und negative Emotionen sind voneinander zu trennen. Die Frau muss trotz der negativen Emotionen das beste geben, um Aufträge möglichst erfolgreich abzuschließen oder die Regeln beizubehalten.",
    },
    {
      id: "section16",
      title: "Entwicklung",
      content:
        "Die Frau ist dazu verpflichtet sich weiterzuentwickeln und neuen Erfahrungen nicht trotzig oder abgeneigt gegenüber zu treten.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-12 text-center space-y-4">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 p-1 rounded-2xl">
            <div className="bg-white px-6 py-3 rounded-xl">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gesetzbuch
              </h1>
            </div>
          </div>
          <p className="text-lg text-gray-600 font-medium">
            Fassung vom {new Date().toLocaleDateString("de-DE")}
            <span className="ml-2 text-blue-500">✦</span>
          </p>
        </header>

        <div className="grid gap-6 md:gap-8">
          {sections.map((section) => (
            <article
              key={section.id}
              className="relative group bg-white backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 md:p-8 border border-white/20 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <span className="text-white font-medium">
                        {section.id.slice(-2)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {section.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {!hasAccepted && (
          <div className="sticky bottom-6 mt-12 animate-fade-in-up">
            <div className="max-w-md mx-auto px-4">
              <button
                onClick={handleAccept}
                className="w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <span>Regeln akzeptieren</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalBook;
