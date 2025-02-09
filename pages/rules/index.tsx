import React, { useState, useEffect } from "react";

const LegalBook = () => {
  const [hasAccepted, setHasAccepted] = useState(false);

  // Beim ersten Rendern prüfen, ob das Cookie bereits gesetzt ist
  useEffect(() => {
    if (
      typeof document !== "undefined" &&
      document.cookie.includes("rulesAccepted=true")
    ) {
      setHasAccepted(true);
    }
  }, []);

  // Handler für den Button "Gelesen und akzeptiert"
  const handleAccept = () => {
    const maxAge = 15552000; // 6 Monate in Sekunden (6 * 30 * 24 * 3600)
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
  ];

  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Gesetzbuch</h1>
          <p className="text-gray-600 text-lg">
            Aktuelle Fassung vom {new Date().toLocaleDateString("de-DE")}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Inhaltsverzeichnis */}
          <nav className="lg:w-64 xl:w-72 lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Inhaltsübersicht
              </h2>
              <ul className="space-y-2 border-l-2 border-gray-200 pl-4">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block text-gray-700 hover:text-blue-600 transition-colors text-sm leading-6 truncate"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Gesetzesabschnitte */}
          <div className="flex-1">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow mb-6 p-6"
              >
                <div className="flex items-baseline space-x-3">
                  <div className="flex-shrink-0">
                    <span className="h-8 w-8 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center font-medium">
                      §{section.id.slice(-2)}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <div className="ml-11 mt-4">
                  <p className="text-gray-600 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Button am Ende der Seite */}
        {!hasAccepted && (
          <div className="mt-8 text-center">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Gelesen und akzeptiert
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalBook;
