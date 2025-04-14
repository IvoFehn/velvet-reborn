// @/data/rules.ts
export interface Rule {
  title: string;
  content: string;
}

// @/data/rules.ts
export interface Rule {
  title: string;
  content: string;
}

const rules: Rule[] = [
  // Originale Regeln aus dem Input:
  {
    title: "Streitfall",
    content:
      "Im Falle eines Streites muss die Frau trotz ihrer Emotionen den Anweisungen des Mannes folgen – außer es handelt sich um eindeutig zuzuordnende Schuld des Mannes.",
  },
  {
    title: "Auftragsänderung",
    content:
      "Bei Änderungswünschen ist ein formeller Änderungsantrag über die App zu stellen. Die Frau muss dem Antrag folgen und ggf. um eine Alternative bitten.",
  },
  {
    title: "Auftrag Vergabe",
    content:
      "Spontan erteilte Aufträge sollten nur ausgeführt werden, wenn diese offiziell sind – andernfalls ist vor Ausführung nachzufragen.",
  },
  {
    title: "Gesamtheit, Bestellanträge",
    content:
      "Ist ein Bedarf an Nachschub (z. B. Kondome) vorhanden, muss ein Bestellantrag gestellt werden, der den Link zum gewünschten Produkt enthält.",
  },
  {
    title: "Sprechverbot",
    content:
      "Während eines Auftrags darf die Frau den Mann nicht ohne dessen Erlaubnis ansprechen – stattdessen erfolgt eine nonverbale Rückmeldung.",
  },
  {
    title: "Warten",
    content:
      "Nach der Aufforderung muss die Frau in Position bleiben und geduldig auf den Mann warten. Erinnerungen können via App gesendet werden.",
  },
  {
    title: "Alternativloch, Information",
    content:
      "Bei Unwohlsein in Bezug auf bestimmte Praktiken (z. B. bei der Menstruation) muss die Frau alternative Vorschläge unterbreiten.",
  },
  {
    title: "Masturbationsverbot",
    content:
      "Eigenständige Masturbation ist der Frau nicht gestattet – bei Verlangen ist ein formaler Antrag zu stellen.",
  },
  {
    title: "Auftragsfeedback",
    content:
      "Feedback zu einem Auftrag sollte unmittelbar oder über das Antragsportal erfolgen – Kritik darf nicht im direkten Verlauf geäußert werden.",
  },
  {
    title: "Tricks",
    content:
      "Unklarheiten in den Regeln sind zugunsten des Mannes auszulegen. Bei Zweifeln muss ein Antrag gestellt werden.",
  },
  {
    title: "Events",
    content:
      "Die Frau hat sich täglich über laufende Events zu informieren und diese, sofern verpflichtend, zu befolgen.",
  },
  {
    title: "Sofortige Aufträge",
    content:
      "Aufträge, die sofort erfüllt werden sollen, sind so zeitnah wie möglich abzuarbeiten. Egal zu welcher Uhrzeit oder an welchem Ort.",
  },
  {
    title: "Auträge bewerten",
    content:
      "Abgeschlossene Aufträge sind innerhalb von 24 Stunden zu bewerten – bei Versäumnis kann ein Antrag zur Nachforderung gestellt werden.",
  },
  {
    title: "Entwicklung",
    content:
      "Die Frau ist dazu verpflichtet, sich stets offen für neue Erfahrungen zu zeigen und sich weiterzuentwickeln.",
  },
  {
    title: "Bestellanträge",
    content:
      "Bestellanträge sind über das App-System einzureichen und müssen einen Link zum gewünschten Produkt enthalten.",
  },
  {
    title: "Erster Login",
    content:
      "Die App ist möglichst früh zu überprüfen. Am besten direkt morgens nach dem aufsthen, damit der Gesundheitsstatus direkt eingetragen werden kann und der Mann bescheid weiß.",
  },
  {
    title: "Gedehnt",
    content:
      "Wenn der Mann anfordert, dass die Frau gedehnt ist, dann bedeutet das, dass sie so gedehnt ist, dass er direkt reinstecken kann ohne, dass sie dabei Schmerzen empfindet oder ihr Gesicht verzieht. Alles darunter ist nicht gedehnt.",
  },
  {
    title: "Edged sein",
    content:
      "Edged sein bedeutet, dass die Frau kurz vorm kommen ist und nach wenigen Schlägen (5-15) kommt, wenn sie das ganze nicht zurückhält. Alles weniger als das ist nicht edged.",
  },
  {
    title: "Vorgefeuchtet",
    content:
      "Wenn die Frau sich vorfeuchten soll, dann ist präferriert naturfeucht zu wählen, wenn das wirklich nicht möglich ist und nicht explizit erwünscht ist, dann darf sie Gleitgel benutzen. Sie hat sich selbst so feucht zu halten, dass der Mann direkt reinstecken kann ohne, dass sie dabei Schmerzen verspürt oder das Gesicht verzieht. Alles weniger als das ist nicht vorgefeuchtet.",
  },

  // Erweiterungen, welche in den sections thematisch vorkommen, in rules aber fehlen:
  {
    title: "Perspektive & Haltung",
    content:
      "Die Regeln gelten immer, unabhängig davon, ob ein Auftrag ausgeführt wird oder nicht. Die Frau handelt stets aus der Perspektive des Mannes und trifft Entscheidungen so, dass sie dessen Wünsche bestmöglich entspricht.",
  },
  {
    title: "Körperliche Interaktion und Bereitstellung",
    content:
      "Wenn der Mann die Frau anfassen möchte, bleibt diese stehen, bis er fertig ist, und stellt sich in der Position auf, von der sie glaubt, dass sie dem Mann am besten gefällt – beispielsweise durch Beine spreizen und nach vorn beugen. Sie muss alle nutzbaren Löcher zur Verfügung stellen und, falls ein Loch aufgrund gesundheitlicher Gründe nicht nutzbar ist, eine attraktive Alternative anbieten.",
  },
  {
    title: "Regelvertrautheit und Änderungsmanagement",
    content:
      "Die Frau ist verpflichtet, sich selbstständig über den aktuellen Regelstand zu informieren und etwaige Änderungen über das Ticket-System zu klären. Regeländerungen des Mannes gelten als stillschweigend hingenommen.",
  },
  {
    title: "App-Nutzung und Informationspflicht",
    content:
      "Die Frau muss die App regelmäßig prüfen – idealerweise täglich, mindestens jedoch wöchentlich – um stets über Aufträge, Änderungen, Events und die aktuelle Gesundheitsanzeige informiert zu sein.",
  },
  {
    title: "Live-Aufträge und Honorierung",
    content:
      "Der Mann kann jederzeit live, auch mündlich, einen Auftrag vergeben – die Frau hat im Zweifelsfall nachzufragen, ob es sich um einen Auftrag handelt. Für Live-Aufträge kann sie pauschal 20 Gold fordern, wobei der Anspruch innerhalb von 24 Stunden geltend gemacht werden muss.",
  },
  {
    title: "Daily Tasks und Konsequenzen",
    content:
      "Die Frau ist verpflichtet, tägliche Aufgaben (Daily Tasks) gewissenhaft zu erledigen. Werden Aufgaben nicht oder unzureichend umgesetzt, können sie als fehlgeschlagen markiert und mit Straf- oder Haushaltsaufgaben sanktioniert werden.",
  },
  {
    title: "Feedback und Bewertungsverfahren",
    content:
      "Bewertungen zu Aufträgen sollen innerhalb von 24 Stunden erfolgen. Versäumt der Mann dies, kann die Frau einen Antrag auf Erinnerung stellen. Beschwerden dürfen erst frühestens eine Stunde nach Abschluss eines Auftrags erhoben werden und nicht den laufenden Sex stören.",
  },
  {
    title: "Gesundheitsanzeige und Krankheitsmeldung",
    content:
      "Die Gesundheitsangabe der Frau muss stets wahrheitsgetreu erfolgen und bei jeder Änderung (z. B. Krankheit) umgehend aktualisiert werden. Falschaussagen werden streng sanktioniert – auch im Streitfall hat die Frau dennoch den Anweisungen des Mannes Folge zu leisten, wobei negative Emotionen vom Ablauf des Sex getrennt zu betrachten sind.",
  },
  {
    title: "Masturbationsverbot und Lustkontrolle",
    content:
      "Die Frau ist verpflichtet, den Mann stets über ihr sexuelles Verlangen zu informieren. Eigenständige Masturbation ist verboten – bei gesteigertem Verlangen ist ein formaler Antrag zu stellen. Zudem muss sie darauf achten, dass ihr Lustlevel nicht übermäßig ansteigt; Missachtung kann zu Sanktionen führen.",
  },
  {
    title: "Gesamtheit des Sex und Verantwortlichkeit für Zubehör",
    content:
      "Die Frau trägt die organisatorische Verantwortung rund um den Sex – dazu gehört das Bereitstellen und regelmäßige Nachfüllen von Kondomen, Gleitgel sowie die Reinigung und Pflege des Einsatzortes und der Spielutensilien. Der Mann ist ausschließlich für den Sex selbst verantwortlich.",
  },
  {
    title: "Sprechverbot und Handzeichenregelung",
    content:
      "Während eines Auftrags darf die Frau nicht von sich aus sprechen. Möchte sie etwas mitteilen, erfolgt zunächst ein Handzeichen – eine verbale Äußerung ist erst nach ausdrücklicher Erlaubnis des Mannes gestattet.",
  },
  {
    title: "Bestellanträge und Einlösung von Items",
    content:
      "Anträge für Bestellungen (z. B. für Dessous, Kondome oder Gleitgel) sind über das Antragsportal einzureichen und müssen stets einen Link zum gewünschten Produkt enthalten. Gekaufte Items werden vom Mann einzulösen – nach Einlösung gelten diese als verbraucht, ohne Anspruch auf Rückerstattung.",
  },
  {
    title: "Erweiterte Warteregel",
    content:
      "Nach vollständiger Vorbereitung ist die Frau verpflichtet, auf den Mann zu warten und ihre Position nicht zu verlassen. Erst nach Abschluss des Auftrags – sofern nichts anderes vereinbart wurde – darf sie ihre Position aufgeben.",
  },
  {
    title: "Antwortzeit",
    content:
      "Die Frau hat auf Tickets oder Anträge schnellstmöglich zu antworten. Ihr wird für eine Antwort im Ticket eine Frist gesetzt, welche einzuhalten ist.",
  },
];

export default rules;
