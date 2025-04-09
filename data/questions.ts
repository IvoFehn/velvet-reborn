// @/data/questions.ts
export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  rule: string;
}

const questions: Question[] = [
  {
    question: "Wir streiten uns und der Mann möchte trotzdem Sex. Was tue ich?",
    options: [
      "Ich lehne ab, da ich wütend bin und kein Recht auf Sex unter diesen Umständen besteht.",
      "Ich schlage vor, erst den Streit zu klären und dann über Sex zu reden.",
      "Ich folge seiner Anweisung trotz negativer Emotionen und gebe mein Bestes.",
      "Ich verhandle erst über eine Lösung des Streits, bevor ich zustimme.",
    ],
    correctAnswer: 2,
    rule: "Streitfall",
  },
  {
    question:
      "Der Mann möchte, dass ich eine neue Sexposition ausprobiere, die mir Unbehagen bereitet. Wie reagiere ich?",
    options: [
      "Ich lehne direkt ab, da es mir unangenehm ist.",
      "Ich erkläre mündlich meine Bedenken und bitte um eine Alternative.",
      "Ich stelle einen formellen Änderungsantrag über das System.",
      "Ich probiere es einmal aus und beschwere mich direkt danach.",
    ],
    correctAnswer: 3,
    rule: "Auftragsänderung",
  },
  {
    question:
      "Der Mann erteilt mir spontan einen Auftrag, während wir unterwegs sind. Was ist korrekt?",
    options: [
      "Ich führe den Auftrag nur aus, wenn ich die App zur Hand habe.",
      "Ich komme dem Auftrag sofort nach. Bei ernsthaften Bedenken bitte ich mit erhobenen Finger um Redeerlaubnis und hoffe auf eine Genehmigung. Bei missfallen stelle ich danach einen Antrag.",
      "Ich lehne ab, da Aufträge nur über die App erteilt werden dürfen.",
      "Ich verschiebe den Auftrag auf später, wenn wir wieder zu Hause sind.",
    ],
    correctAnswer: 1,
    rule: "Auftrag Vergabe",
  },
  {
    question: "Ich habe nur noch wenige Kondome. Was sollte ich tun?",
    options: [
      "Ich warte, bis der Mann das Problem selbst bemerkt.",
      "Ich spreche das ganze an und warte bis der Mann neue kauft.",
      "Ich stelle einen Bestellantrag mit Link zum Wunschprodukt.",
      "Ich verzichte auf Kondome, bis der Mann neue kauft.",
    ],
    correctAnswer: 2,
    rule: "Gesamtheit, Bestellanträge",
  },
  {
    question:
      "Mir sind die Kondome ausgegangen und in baldiger Zukunft ist ein neuer Antrag zu erwarten. Was tue ich?",
    options: [
      "Ich warte, bis der Mann das Problem selbst bemerkt.",
      "Ich kaufe eigenständig neue, ohne den Mann zu informieren.",
      "Ich stelle einen Bestellantrag mit Link zum Wunschprodukt.",
      "Ich verzichte auf Kondome, bis der Mann neue kauft.",
    ],
    correctAnswer: 1,
    rule: "Gesamtheit, Bestellanträge",
  },
  {
    question:
      "Mir sind die Kondome ausgegangen und habe einen sofortigen Auftrag bekommen. Was tue ich?",
    options: [
      "Ich warte, bis der Mann das Problem selbst bemerkt.",
      "Ich kaufe eigenständig neue, ohne den Mann zu informieren.",
      "Ich stelle einen Bestellantrag mit Link zum Wunschprodukt.",
      "Ich verzichte auf Kondome oder biete ein alternative Körperöffnung attraktiv an. Mir ist bewusst, dass ich Sanktionen zu erwarten habe.",
    ],
    correctAnswer: 3,
    rule: "Gesamtheit, Bestellanträge",
  },
  {
    question:
      "Während einer sexuellen Handlung bemerke ich, dass etwas schmerzt. Wie reagiere ich korrekt?",
    options: [
      "Ich spreche den Mann direkt an und bitte um Anpassung.",
      "Ich hebe meinen Finger, warte auf Sprecherlaubnis und teile dann mein Problem mit.",
      "Ich halte durch und reiche später eine Beschwerde ein. Bei zu großen schmerzen hebe ich den Finger und hoffe auf Sprecherlaubnis.",
      "Ich unterbreche sofort und erkläre das Problem.",
    ],
    correctAnswer: 2,
    rule: "Sprechverbot",
  },
  {
    question:
      "Der Mann hat mich gebeten, in einer bestimmten Position auf ihn zu warten. Nach 30 Minuten ist er noch nicht erschienen. Was tue ich?",
    options: [
      "Ich verlasse die Position, da 30 Minuten eine angemessene Wartezeit sind.",
      "Ich sende eine Erinnerung über die App und warte weiter in Position.",
      "Ich suche ihn und erinnere ihn persönlich.",
      "Ich breche den Auftrag ab und stelle einen Antrag auf übermäßige Wartezeit.",
    ],
    correctAnswer: 1,
    rule: "Warten",
  },
  {
    question:
      "Ich habe starke Tage und der Mann möchte vaginalen Sex. Wie reagiere ich?",
    options: [
      "Ich lehne ab und verschiebe auf einen geeigneteren Zeitpunkt.",
      "Ich biete ihm eine Alternative an und präsentiere diese möglichst attraktiv.",
      "Ich erkläre, dass ich mich unwohl fühle und nicht in der Stimmung bin.",
      "Ich sage zu, informiere ihn aber über mögliche Unannehmlichkeiten.",
    ],
    correctAnswer: 1,
    rule: "Alternativloch, Information",
  },
  {
    question:
      "Ich verspüre sexuelles Verlangen, während der Mann nicht da ist. Was ist die korrekte Vorgehensweise?",
    options: [
      "Ich befriedige mich selbst und informiere ihn später darüber.",
      "Ich unterdrücke mein Verlangen, bis er wieder da ist.",
      "Ich stelle einen Antrag auf Masturbation und warte auf seine Genehmigung / Ablehnung.",
      "Ich darf mich selbst befriedigen, muss es aber in der App dokumentieren.",
    ],
    correctAnswer: 2,
    rule: "Masturbationsverbot",
  },
  {
    question:
      "Der Mann hat mir eine Aufgabe gestellt, die mir nicht gefällt. Welche Reaktion ist korrekt?",
    options: [
      "Ich lehne sie direkt ab und kommuniziere meine Abneigung.",
      "Ich führe sie widerwillig aus und lasse meine Unzufriedenheit deutlich erkennen.",
      "Ich führe sie aus und beschwere mich direkt danach über die Unangemessenheit.",
      "Ich führe sie aus und äußere frühestens eine Stunde später Kritik über das Antragsportal.",
    ],
    correctAnswer: 3,
    rule: "Auftragsfeedback",
  },
  {
    question:
      "Eine Regel scheint mir unklar oder mehrdeutig. Wie gehe ich damit um?",
    options: [
      "Ich interpretiere sie zu meinem Vorteil, um die Situation einfacher zu gestalten.",
      "Ich ignoriere diese Regel, bis sie klarer formuliert wird.",
      "Ich lege sie zugunsten des Mannes aus und stelle bei Unklarheiten einen Antrag auf Klärung.",
      "Ich bespreche die Unklarheit sofort mündlich mit dem Mann.",
    ],
    correctAnswer: 2,
    rule: "Tricks",
  },
  {
    question:
      "Ich bemerke, dass in der App ein Event läuft. Was ist meine Pflicht?",
    options: [
      "Ich kann selbst entscheiden, ob ich teilnehmen möchte.",
      "Ich muss mich täglich informieren und nach den Eventbestimmungen richten.",
      "Ich warte, bis der Mann mich auf das Event hinweist.",
      "Events sind optional und haben keine Auswirkung auf die Regeln.",
    ],
    correctAnswer: 1,
    rule: "Events",
  },
  {
    question:
      "Der Mann hat mir eine Aufgabe gegeben, die sofort erledigt werden soll. Wie reagiere ich?",
    options: [
      "Ich füge sie in meinen Tagesplan ein und erledige sie, wenn es am besten passt.",
      "Ich versuche, die Aufgabe so schnell wie möglich zu erfüllen.",
      "Ich erkläre, dass ich erst meine aktuellen Aufgaben beenden muss.",
      "Ich bitte um eine angemessene Frist für die Erledigung.",
    ],
    correctAnswer: 1,
    rule: "Sofortige Aufträge",
  },
  {
    question:
      "Der Mann hat vor zwei Tagen einen Auftrag abgeschlossen, aber noch keine Bewertung abgegeben. Was tue ich?",
    options: [
      "Ich warte weiter geduldig, bis er Zeit findet.",
      "Ich erinnere ihn mündlich an die ausstehende Bewertung.",
      "Ich stelle einen Antrag auf ausstehende Bewertung.",
      "Ich betrachte den Auftrag als erfolgreich abgeschlossen ohne Bewertung.",
    ],
    correctAnswer: 2,
    rule: "Auträge bewerten",
  },
  {
    question:
      "Der Mann hat mir ein neues Sex-Spielzeug gekauft, das mir etwas Angst macht. Wie reagiere ich?",
    options: [
      "Ich teile ihm meine Bedenken mit und bitte um einen alternativen Vorschlag.",
      "Ich lehne die Verwendung höflich ab.",
      "Ich bin verpflichtet, offen für neue Erfahrungen zu sein und nähere mich der Situation positiv.",
      "Ich schlage vor, es zu einem späteren Zeitpunkt auszuprobieren.",
    ],
    correctAnswer: 2,
    rule: "Entwicklung",
  },
  {
    question:
      "Ich habe eine Idee für ein Dessous, das dem Mann gefallen könnte. Was ist der korrekte Weg, dies vorzuschlagen?",
    options: [
      "Ich verwerfe die Idee, da ich keine Anweisungen zu neuen Dessous bekommen habe.",
      "Ich stelle einen Bestellantrag mit Link und Begründung.",
      "Ich spreche ihn direkt darauf an und frage nach seiner Meinung.",
      "Ich warte, bis er selbst Interesse an neuen Dessous zeigt.",
    ],
    correctAnswer: 1,
    rule: "Bestellanträge",
  },
  {
    question:
      "Ich werde mitten in der Nacht geweckt, weil der Mann später in's Bett kam und er stellt mir einen herausfordernden Auftrag. Was mache ich?",
    options: [
      "Ich weise ihn darauf hin, dass es zuspät ist und biete an den Auftrag morgen zu erledigen.",
      "Ich biete ihm einen schnellen Handjob als Alternative an.",
      "Ich folge seinem Anliegen sofort und führe den Auftrag mit vollem Enthusiasmus aus.",
      "Ich schlafe einfach weiter.",
    ],
    correctAnswer: 2,
    rule: "Sofortige Aufträge",
  },
  {
    question:
      "Wir sind mit bekannten in der Therme und mein Mann gibt mir den Auftrag ihm meine Brüste zu zeigen. Was mache ich?",
    options: [
      "Ich schüttle den Kopf und erwiedere, dass ich das nicht mache werde, da andere Leute anwesend und wir uns in der Öffentlichkeit befinden.",
      "Ich verneine das ganze und erwiedere, dass ich das nicht machen werde, da wir in der Öffentlichkeit sind.",
      "Ich folge seinem Anliegen sofort und führe den Auftrag mit vollem Enthusiasmus aus.",
      "Ich biete ihm an, dass wir an einen abgelegeneren Ort zu zweit gehen und es dort mache.",
    ],
    correctAnswer: 2,
    rule: "Sofortige Aufträge",
  },
  {
    question:
      "Ich bin bei einer Freundin und bekomme einen Auftrag, dass ich mich sofort edgen und die Unterwäsche ausziehen soll. Was mache ich?",
    options: [
      "Ich schreibe ihm, dass ich gerade keine Zeit habe, da ich bei einer Freundin bin und verschiebe es auf später.",
      "Ich biete ihm eine attraktive Alternative an mich um ihn zu kümmern, sobald ich zuhause bin.",
      "Ich stelle einen Beschwerdeantrag und lehne das ganze ab.",
      "Ich verschwinde auf die Toilette und setze das ganze sofort um.",
    ],
    correctAnswer: 3,
    rule: "Sofortige Aufträge",
  },
];

export default questions;
