import { ILevelThresholds } from "@/models/LevelThresholds";

// Funktion zur umgekehrten Berechnung: Level -> Tage mit dynamischen Schwellenwerten
export const calculateDaysForLevel = (
  level: number,
  thresholds: ILevelThresholds | null
): number => {
  // Standardwerte verwenden, wenn keine benutzerdefinierten Schwellenwerte vorliegen
  const t = thresholds || {
    level1: 3,
    level2: 4,
    level3: 6,
    level4: 8,
  };

  // Einen kleinen Wert hinzufügen (0.1), um sicherzustellen, dass wir über dem Schwellenwert liegen
  switch (level) {
    case 4:
      return t.level4 + 0.1;
    case 3:
      return t.level3 + 0.1;
    case 2:
      return t.level2 + 0.1;
    case 1:
      return t.level1 + 0.1;
    case 0:
    default:
      return 0;
  }
};
