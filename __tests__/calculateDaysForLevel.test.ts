import { calculateDaysForLevel } from '../util/calculateDaysForLevel';

describe('calculateDaysForLevel', () => {
  it('maps levels to days', () => {
    expect(calculateDaysForLevel(0, null)).toBe(0);
    expect(calculateDaysForLevel(1, null)).toBeCloseTo(3.1);
    expect(calculateDaysForLevel(2, null)).toBeCloseTo(4.1);
    expect(calculateDaysForLevel(3, null)).toBeCloseTo(6.1);
    expect(calculateDaysForLevel(4, null)).toBeCloseTo(8.1);
  });
});
