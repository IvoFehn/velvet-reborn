import { calculateLevel } from '../util/calculateLevel';

describe('calculateLevel', () => {
  it('returns 0 for new entries', () => {
    const createdAt = new Date();
    expect(calculateLevel(createdAt, null)).toBe(0);
  });

  it('respects thresholds', () => {
    const days = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
    expect(calculateLevel(days(4), null)).toBe(1);
    expect(calculateLevel(days(5), null)).toBe(2);
    expect(calculateLevel(days(7), null)).toBe(3);
    expect(calculateLevel(days(9), null)).toBe(4);
  });
});
