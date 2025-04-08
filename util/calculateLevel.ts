/* eslint-disable @typescript-eslint/no-explicit-any */

import dayjs from "dayjs";

// Mongoose Lean Document Typen
type LevelThresholds = {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  _id: any;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};

// Aktualisierte Funktion zur Berechnung des Mood-Levels
// mit dynamischen Schwellenwerten
export const calculateLevel = (
  createdAt: Date,
  thresholds: LevelThresholds | null
): number => {
  const createdDate = dayjs(createdAt);
  const now = dayjs();
  const daysDiff = now.diff(createdDate, "day", true); // exakte Differenz in Tagen

  // Standardwerte verwenden, wenn keine benutzerdefinierten Schwellenwerte vorliegen
  const t = thresholds || {
    level1: 3,
    level2: 4,
    level3: 6,
    level4: 8,
  };

  // Schwellenwerte zur Bestimmung des Levels anhand der benutzerdefinierten Werte
  if (daysDiff > t.level4) {
    return 4;
  } else if (daysDiff > t.level3) {
    return 3;
  } else if (daysDiff > t.level2) {
    return 2;
  } else if (daysDiff > t.level1) {
    return 1;
  } else {
    return 0;
  }
};
