// utils/calculateGoldReward.ts

import { GeneratorReviewFormData } from "@/pages/news";

/**
 * Konfiguration für die Goldberechnung.
 */
export interface GoldCalculationConfig {
  baseGold?: number; // Minimalwert, Standard: 10
  maxGold?: number; // Maximalwert, Standard: 60
  bonusSquirt?: number; // Bonus bei Squirting, Standard: 75
  bonusAnal?: number; // Bonus bei Analverkehr, Standard: 15
  exponent?: number; // Nichtlinearitäts-Exponent für die Normalisierung, Standard: 1.5
  consistencyBonusFactor?: number; // Bonusfaktor bei sehr konsistenten Bewertungen, Standard: 5
  weights?: {
    obedience?: number;
    vibeDuringSex?: number;
    vibeAfterSex?: number;
    orgasmIntensity?: number;
    painlessness?: number;
    ballsWorshipping?: number;
    cumWorshipping?: number;
    didEverythingForHisPleasure?: number;
  };
  /**
   * Hier können zusätzliche Bonus-Prozente angegeben werden, die
   * auf den final berechneten Goldwert als Multiplikator angewandt werden.
   * Beispiel: [0.1] für +10%, [0.1, 0.05] für insgesamt +15%.
   */
  extraBonusPercentages?: number[];
}

/**
 * Standardkonfiguration – "obedience" ist am wichtigsten.
 */
const defaultGoldConfig: Required<GoldCalculationConfig> = {
  baseGold: 10,
  maxGold: 60,
  bonusSquirt: 75,
  bonusAnal: 15,
  exponent: 1.5,
  consistencyBonusFactor: 5,
  weights: {
    obedience: 0.3,
    vibeDuringSex: 0.1,
    vibeAfterSex: 0.2,
    orgasmIntensity: 0.15,
    painlessness: 0.25,
    ballsWorshipping: 0.1,
    cumWorshipping: 0.05,
    didEverythingForHisPleasure: 0.15,
  },
  extraBonusPercentages: [],
};

/**
 * Berechnet den Gold-Betrag für einen Auftrag anhand der Bewertungen.
 *
 * 1. Normalisierung: rating ∈ [1..5] → (rating - 1) / 4 ∈ [0..1]
 * 2. Nichtlinearität: normalized^exponent (z. B. exponent = 1.5)
 * 3. Gewichteter Durchschnitt → Score ∈ [0..1]
 * 4. Lineare Skalierung des Score in [baseGold..maxGold]
 * 5. Bonus für Squirting & Analverkehr
 * 6. Konsistenzbonus basierend auf der Standardabweichung der Bewertungen
 * 7. **Neue Bonus-Features:** Auf den resultierenden Wert wird ein
 *    Multiplikator angewandt, der sich aus extraBonusPercentages ergibt.
 *
 * @param review Die eingegebenen Bewertungsdaten
 * @param config (Optional) Konfiguration zur Anpassung der Berechnung inkl. zusätzlicher Bonus-Faktoren
 * @returns Der berechnete Gold-Betrag (gerundet)
 */
export function calculateGoldReward(
  review: GeneratorReviewFormData,
  config?: GoldCalculationConfig
): number {
  // Konfiguration zusammenführen und extraBonusPercentages sicherstellen
  const mergedConfig: Required<GoldCalculationConfig> = {
    baseGold: config?.baseGold ?? defaultGoldConfig.baseGold,
    maxGold: config?.maxGold ?? defaultGoldConfig.maxGold,
    bonusSquirt: config?.bonusSquirt ?? defaultGoldConfig.bonusSquirt,
    bonusAnal: config?.bonusAnal ?? defaultGoldConfig.bonusAnal,
    exponent: config?.exponent ?? defaultGoldConfig.exponent,
    consistencyBonusFactor:
      config?.consistencyBonusFactor ??
      defaultGoldConfig.consistencyBonusFactor,
    weights: {
      obedience:
        config?.weights?.obedience ?? defaultGoldConfig.weights.obedience,
      vibeDuringSex:
        config?.weights?.vibeDuringSex ??
        defaultGoldConfig.weights.vibeDuringSex,
      vibeAfterSex:
        config?.weights?.vibeAfterSex ?? defaultGoldConfig.weights.vibeAfterSex,
      orgasmIntensity:
        config?.weights?.orgasmIntensity ??
        defaultGoldConfig.weights.orgasmIntensity,
      painlessness:
        config?.weights?.painlessness ?? defaultGoldConfig.weights.painlessness,
      ballsWorshipping:
        config?.weights?.ballsWorshipping ??
        defaultGoldConfig.weights.ballsWorshipping,
      cumWorshipping:
        config?.weights?.cumWorshipping ??
        defaultGoldConfig.weights.cumWorshipping,
      didEverythingForHisPleasure:
        config?.weights?.didEverythingForHisPleasure ??
        defaultGoldConfig.weights.didEverythingForHisPleasure,
    },
    extraBonusPercentages: config?.extraBonusPercentages ?? [],
  };

  // Liste der Bewertungsfelder
  const ratingFields: (keyof Pick<
    GeneratorReviewFormData,
    | "obedience"
    | "vibeDuringSex"
    | "vibeAfterSex"
    | "orgasmIntensity"
    | "painlessness"
    | "ballsWorshipping"
    | "cumWorshipping"
    | "didEverythingForHisPleasure"
  >)[] = [
    "obedience",
    "vibeDuringSex",
    "vibeAfterSex",
    "orgasmIntensity",
    "painlessness",
    "ballsWorshipping",
    "cumWorshipping",
    "didEverythingForHisPleasure",
  ];

  let weightedSum = 0;
  let totalWeight = 0;
  const normalizedRatings: number[] = [];

  for (const field of ratingFields) {
    const rating = review[field];
    // Normalisieren auf [0..1]
    const normalized = (rating - 1) / 4;
    normalizedRatings.push(normalized);

    // Nichtlinearer Effekt
    const effectiveRating = Math.pow(normalized, mergedConfig.exponent);

    // Gewicht (immer Zahl, ggf. 0, falls nicht definiert)
    const weight = mergedConfig.weights[field] ?? 0;
    weightedSum += effectiveRating * weight;
    totalWeight += weight;
  }

  // Gewichteter Durchschnitt
  const compositeScore = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Skaliere den Score in den Bereich [baseGold..maxGold]
  const ratingGold =
    mergedConfig.baseGold +
    compositeScore * (mergedConfig.maxGold - mergedConfig.baseGold);

  // Konsistenzbonus: Honoriert geringe Abweichung der Bewertungen
  const mean =
    normalizedRatings.reduce((acc, val) => acc + val, 0) /
    normalizedRatings.length;
  const variance =
    normalizedRatings.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
    normalizedRatings.length;
  const std = Math.sqrt(variance);

  // Je niedriger std, desto höher der Bonus → max bei std=0, min bei std>=1
  const consistencyBonus =
    mergedConfig.consistencyBonusFactor * (1 - Math.min(std, 1));

  // Bonus für Squirting und Anal
  const bonusGold =
    (review.didSquirt ? mergedConfig.bonusSquirt : 0) +
    (review.wasAnal ? mergedConfig.bonusAnal : 0);

  // Berechnung des Gesamtwerts vor Anwendung zusätzlicher prozentualer Boni
  const baseTotalGold = ratingGold + consistencyBonus + bonusGold;

  // Anwenden der zusätzlichen Bonus-Prozente:
  // Es werden alle extraBonusPercentages aufsummiert (z. B. 0.1 + 0.05 = 0.15)
  // und der Gesamtwert wird entsprechend erhöht.
  const totalBonusPercentage = mergedConfig.extraBonusPercentages.reduce(
    (acc, bonus) => acc + bonus,
    0
  );
  const finalGold = Math.round(baseTotalGold * (1 + totalBonusPercentage));
  return finalGold;
}
