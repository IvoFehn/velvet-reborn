import { calculateGoldReward, GoldCalculationConfig } from '../lib/calculateGold';

describe('calculateGoldReward', () => {
  const baseReview: any = {
    obedience: 3,
    vibeDuringSex: 3,
    vibeAfterSex: 3,
    orgasmIntensity: 3,
    painlessness: 3,
    ballsWorshipping: 3,
    cumWorshipping: 3,
    didEverythingForHisPleasure: 3,
    didSquirt: false,
    wasAnal: false,
  };

  it('calculates default reward', () => {
    expect(calculateGoldReward(baseReview)).toBe(33);
  });

  it('applies extra bonus percentages', () => {
    const config: GoldCalculationConfig = { extraBonusPercentages: [0.1] };
    expect(calculateGoldReward(baseReview, config)).toBe(36);
  });
});
