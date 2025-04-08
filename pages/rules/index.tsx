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
      title: "Entwicklung",
      content:
        "Die Frau ist dazu verpflichtet sich weiterzuentwickeln und neuen Erfahrungen nicht trotzig oder abgeneigt gegenüber zu treten.",
    },
    {
      id: "section04",
      title: "Regelvertrautheit",
      content:
        "Die Frau muss mit den Regeln vertraut sein und sich selbstständig auf den neusten Stand bringen. Die Regeln können jederzeit frei und ohne Absprache vom Mann erweitert werden. Eine Regeländerung bzw. Erweiterung wird stillschweigend hingenommen. Sämtliche Meinungsverschiedenheiten über Regeländerungen dürfen über das Ticket-System erfolgen. Allerdings darf der Mann darüber entscheiden, ob er auf die Beschwerde der Frau eingeht oder nicht.",
    },
    {
      id: "section05",
      title: "Auftrag Vergabe",
      content:
        "Der Mann darf jederzeit live einen Auftrag vergeben. Er benötigt die App nicht. Wenn die Frau sich nicht sicher ist, ob das vom Mann Gewünschte ein Auftrag ist, dann fragt sie nach, ob dies einer ist. Änderungsanträge und Ablehnungsanträge können dann live gestellt werden. Der Mann hat auch hier das Recht, diese abzulehnen. Die Frau hat das Recht für Live-Aufträge pauschal 20 Gold zu verlangen. Der Anspruch muss über einen Antrag binnen 24 Stunden geltend gemacht werden, ansonsten verfällt der Anspruch.",
    },
    {
      id: "section06",
      title: "Auftragsänderung",
      content:
        "Ist ein Auftrag gestellt, hat die Frau die Möglichkeit, diesen per Antrag abzulehnen oder zu ändern. Der Mann hat das Recht, über diese Anträge zu entscheiden. Sollte ein Auftrag gesetzt sein, wird dieser ohne Widerworte ausgeführt. Sollte ein Auftrag mündlich vergeben werden, darf die Frau ebenfalls mündlich nach Erfragung der Redeerlaubnis um Änderung oder Ablehnung bitten, welche vom Mann aber ebenfalls grundlos abgelehnt werden dürfen.",
    },
    {
      id: "section07",
      title: "Sofortige Aufträge",
      content:
        "Sollten Aufträge sofort verrichtet werden, versucht die Frau, die Aufträge so schnell wie möglich zu erfüllen.",
    },
    {
      id: "section08",
      title: "Auftragsfeedback",
      content:
        "Über einen Auftrag wird bis frühestens eine Stunde nach dem Auftrag nicht gemeckert, und auch wenn der Auftrag der Frau nicht gefällt, wird dies beim Sex nicht gemerkt.",
    },
    {
      id: "section09",
      title: "Auträge bewerten",
      content:
        "Der Mann sollte einen Auftrag binnen 24 Stunden bewerten. Ist das ganze nach dieser Frist noch nicht passiert, darf die Frau einen Antrag auf ausstehende Bewertung stellen, um den Mann zu erinnern. Die Frau ist dafür verantwortlich bewertet zu werden. Kümmert sie sich nicht um ihre Bewertung, so kann ihr das als Sorgfaltspflichtverletzung ausgelegt werden.",
    },
    {
      id: "section10",
      title: "Daily Tasks",
      content: "Die Frau ist verpflichtet die Daily Tasks zu erledigen.",
    },
    {
      id: "section11",
      title: "Fehlende Aufgaben",
      content:
        "Aufgaben, die einfach nicht gemacht wurden oder zu schlecht für jegliche Bewertung umgesetzt wurden, können vom Mann als fehlgeschlagen markiert werden und bestraft oder sanktioniert werden.",
    },
    {
      id: "section12",
      title: "Sichtbarkeit & App-Nutzung",
      content:
        "Die Frau ist verpflichtet, regelmäßig in die App zu schauen, um sich auf den neuesten Stand zu bringen. Vorzugsweise soll die Frau jeden Tag in die App schauen, mindestens jedoch ein Mal die Woche.",
    },
    {
      id: "section13",
      title: "Gesundheitsanzeige",
      content:
        "Die Gesundheitsangabe ist wahrheitsgetreu und nicht leichtfertig anzugeben. Nur wenn sie wirklich einen Gesundheitszustand hat, welcher bestimmte Praktiken nicht zulässt, darf diese daran angepasst werden. Außerdem ist dieser bei jeder Änderung anzupassen. Falschaussagen werden stark sanktioniert.",
    },
    {
      id: "section14",
      title: "Information",
      content:
        "Die Frau informiert den Mann rechtzeitig bei Tagen oder Krankheiten.",
    },
    {
      id: "section15",
      title: "Lustlevel",
      content:
        "Die Frau ist verpflichtet, auf das Lustlevel zu achten und dafür zu sorgen, dass es im besten Fall niemals zu weit ansteigt.",
    },
    {
      id: "section16",
      title: "Masturbationsverbot",
      content:
        "Die Frau hat den Mann immer und ausnahmslos über ihr Verlangen zu informieren. Eigenständige Masturbation ist verboten. Wenn die Frau masturbieren möchte, hat sie einen Antrag zu stellen und auf eine Genehmigung oder weitere Anweisungen des Mannes zu warten.",
    },
    {
      id: "section17",
      title: "Verhalten",
      content:
        "Wenn der Mann die Frau anfassen möchte, dann bleibt diese stehen, bis der Mann fertig ist, und stellt sich so hin, wie sie glaubt, dass der Mann am besten alle Löcher anfassen kann. Dies gilt für Fotze und Arsch, bspw. durch Beine spreizen und nach vorn beugen.",
    },
    {
      id: "section18",
      title: "Alternativloch",
      content:
        "Die Frau muss dem Mann immer alle nutzbaren Löcher zur Verfügung stellen. Sollte er eins fordern, welches aktuell aus bspw. gesundheitlichen Gründen nicht nutzbar ist, hat sie ihm eine Alternative (sofern möglich) anzubieten und schmackhaft zu machen und zu präsentieren.",
    },
    {
      id: "section19",
      title: "Sprechverbot",
      content:
        "Während eines Auftrags oder anderer sexueller Handlungen darf die Frau den Mann nicht ohne Aufforderung ansprechen oder störende Geräusche von sich geben, die das Erlebnis beeinträchtigen könnten. [...]",
    },
    {
      id: "section20",
      title: "Warten",
      content:
        "Die Frau hat nach vollständiger Vorbereitung auf den Mann zu warten und darf ihre Position nicht verlassen. [...]",
    },
    {
      id: "section21",
      title: "Bewertung",
      content:
        "Die Frau strebt danach, die bestmögliche Bewertung für den Sex zu erhalten.",
    },
    {
      id: "section22",
      title: "Gesamtheit",
      content:
        "Die Frau hat sich um die Gesamtheit des Sex zu kümmern. Das beinhaltet [...] Die einzige Aufgabe des Mannes ist der Sex selbst.",
    },
    {
      id: "section23",
      title: "Bestellanträge",
      content:
        "Über das Antragssystem kann die Frau Bestellanträge stellen. [...]",
    },
    {
      id: "section24",
      title: "Items einlösen",
      content:
        "Gekaufte Items sind vom Mann einzulösen, damit er sieht, dass diese auch gekauft wurden. [...]",
    },
    {
      id: "section25",
      title: "Events",
      content:
        "Die Frau muss sich täglich darüber informieren, ob gerade Events am Laufen sind und sich nach den Eventbestimmungen richten.",
    },
    {
      id: "section26",
      title: "Streitfall",
      content:
        "Im Falle eines Streites hat die Frau trotzdem den Anweisungen des Mannes folgezuleisten. Sex und negative Emotionen sind voneinander zu trennen. [...]",
    },
    {
      id: "section27",
      title: "Tricks",
      content:
        "Tricks oder absichtliches Missverstehen sind nicht erlaubt. Regeln, Beschreibungen o.ä. sind immer zugunsten des Mannes und seinem Wohlbefinden auszulegen. [...]",
    },
    {
      id: "section28",
      title: "Anträge als erste Wahl",
      content:
        "Beschwerden, Anliegen, Wünsche o.ä. die mit Sex oder Praktiken drum herum im Zusammenhang stehen, sind immer über einen Antrag zu klären und bis zur Klärung stillschweigend hinzunehmen. [...]",
    },
    {
      id: "section29",
      title: "Sanktionierung",
      content:
        "Bei mangelnder Leistung oder Missachtung der Regeln können Sanktionen in Form von bspw. Haushaltsaufgaben oder Strafaufgaben auferlegt werden.",
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
          <div className="flex-1">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
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
