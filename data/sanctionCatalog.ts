// data/sanctionCatalog.ts
import { ISanctionTemplate } from "@/types/index";

// Explizit die Typsignatur für den Katalog definieren
const sanctionCatalog: Record<1 | 2 | 3 | 4 | 5, ISanctionTemplate[]> = {
  // Schweregrad 1 (leicht)
  1: [
    {
      title: "Kurze Hausarbeit",
      description: "Eine kurze Hausarbeit als leichte Sanktion",
      task: "Staub wischen im Wohnzimmer",
      amount: 10,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 5,
    },
    {
      title: "Ordnung machen",
      description: "Persönliche Sachen aufräumen",
      task: "Kleidung ordentlich verstauen und Schreibtisch aufräumen",
      amount: 15,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 5,
    },
    {
      title: "Pflanzen gießen",
      description: "Sich um die Pflanzen kümmern",
      task: "Alle Pflanzen in der Wohnung gießen",
      amount: 5,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 3,
    },
    {
      title: "Kurzes Lernpensum",
      description: "Eine kurze Lerneinheit absolvieren",
      task: "Vokabeln wiederholen oder ein kurzes Lernkapitel durcharbeiten",
      amount: 15,
      unit: "Minuten",
      category: "Lernen",
      escalationFactor: 10,
    },
  ],

  // Schweregrad 2
  2: [
    {
      title: "Mittlere Hausarbeit",
      description: "Eine mittlere Hausarbeit als Sanktion",
      task: "Bad putzen (Waschbecken und Toilette)",
      amount: 20,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 10,
    },
    {
      title: "Geschirr spülen",
      description: "Das angesammelte Geschirr spülen",
      task: "Komplettes angesammeltes Geschirr spülen und abtrocknen",
      amount: 25,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 10,
    },
    {
      title: "Mittleres Lernpensum",
      description: "Eine mittlere Lerneinheit absolvieren",
      task: "Ein mittelgroßes Kapitel durcharbeiten oder Aufgaben lösen",
      amount: 30,
      unit: "Minuten",
      category: "Lernen",
      escalationFactor: 15,
    },
    {
      title: "Leichte Sporteinheit",
      description: "Eine leichte sportliche Aktivität durchführen",
      task: "Joggen oder Gymnastik",
      amount: 20,
      unit: "Minuten",
      category: "Sport",
      escalationFactor: 10,
    },
  ],

  // Schweregrad 3
  3: [
    {
      title: "Größere Hausarbeit",
      description: "Eine größere Hausarbeit als Sanktion",
      task: "Komplettes Bad reinigen inkl. Dusche/Badewanne",
      amount: 40,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 15,
    },
    {
      title: "Küche putzen",
      description: "Die Küche gründlich reinigen",
      task: "Küche reinigen inkl. Arbeitsflächen und Herd",
      amount: 45,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 15,
    },
    {
      title: "Fortgeschrittenes Lernpensum",
      description: "Eine längere Lerneinheit absolvieren",
      task: "Ein komplexes Thema durcharbeiten oder mehrere Aufgaben lösen",
      amount: 45,
      unit: "Minuten",
      category: "Lernen",
      escalationFactor: 20,
    },
    {
      title: "Mittlere Sporteinheit",
      description: "Eine mittlere sportliche Aktivität durchführen",
      task: "Krafttraining oder längeres Kardiotraining",
      amount: 30,
      unit: "Minuten",
      category: "Sport",
      escalationFactor: 15,
    },
  ],

  // Schweregrad 4
  4: [
    {
      title: "Umfangreiche Hausarbeit",
      description: "Eine umfangreiche Hausarbeit als Sanktion",
      task: "Staubsaugen und Wischen der gesamten Wohnung",
      amount: 60,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 20,
    },
    {
      title: "Fenster putzen",
      description: "Alle Fenster gründlich reinigen",
      task: "Alle Fenster der Wohnung von innen und außen putzen",
      amount: 75,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 25,
    },
    {
      title: "Intensives Lernpensum",
      description: "Eine intensive Lerneinheit absolvieren",
      task: "Ein schwieriges Thema durcharbeiten oder eine Prüfungssimulation",
      amount: 90,
      unit: "Minuten",
      category: "Lernen",
      escalationFactor: 30,
    },
    {
      title: "Intensive Sporteinheit",
      description: "Eine intensive sportliche Aktivität durchführen",
      task: "Komplettes Workout mit hoher Intensität",
      amount: 45,
      unit: "Minuten",
      category: "Sport",
      escalationFactor: 20,
    },
  ],

  // Schweregrad 5 (schwer)
  5: [
    {
      title: "Maximale Hausarbeit",
      description: "Eine maximale Hausarbeit als schwere Sanktion",
      task: "Komplette Grundreinigung der Wohnung (alle Räume)",
      amount: 120,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 30,
    },
    {
      title: "Große Aufräumaktion",
      description: "Eine große Aufräum- und Organisationsaufgabe",
      task: "Keller, Dachboden oder Garage aufräumen und organisieren",
      amount: 150,
      unit: "Minuten",
      category: "Hausarbeit",
      escalationFactor: 30,
    },
    {
      title: "Umfassendes Lernpensum",
      description: "Ein umfassendes Lernpensum absolvieren",
      task: "Einen gesamten Lernbereich durcharbeiten oder eine Projektarbeit",
      amount: 180,
      unit: "Minuten",
      category: "Lernen",
      escalationFactor: 45,
    },
    {
      title: "Maximale Sporteinheit",
      description: "Eine maximale sportliche Herausforderung",
      task: "Langlauf, intensives Intervalltraining oder ähnlich anspruchsvolle Aktivität",
      amount: 90,
      unit: "Minuten",
      category: "Sport",
      escalationFactor: 30,
    },
    {
      title: "Soziale Verpflichtung",
      description: "Eine soziale Verpflichtung übernehmen",
      task: "Ehrenamtliche Tätigkeit oder Hilfe für Bedürftige",
      amount: 3,
      unit: "Stunden",
      category: "Soziales",
      escalationFactor: 60,
    },
  ],
};

export default sanctionCatalog;
