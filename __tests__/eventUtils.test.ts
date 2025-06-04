import { getRecurringEventOccurrences } from '../util/eventUtils';
import { IEvent } from '../models/Event';

describe('getRecurringEventOccurrences', () => {
  const baseEvent: IEvent = {
    _id: '1',
    title: 'Test',
    description: 'D',
    startDate: new Date('2023-01-01T00:00:00Z'),
    endDate: new Date('2023-01-01T01:00:00Z'),
    recurring: true,
    recurrence: 'daily',
  } as any;

  it('generates occurrences within window', () => {
    const start = new Date('2023-01-02T00:00:00Z');
    const end = new Date('2023-01-04T00:00:00Z');
    const occ = getRecurringEventOccurrences(baseEvent, start, end);
    expect(occ).toHaveLength(3);
    expect(occ[0].startDate.toISOString()).toBe('2023-01-02T00:00:00.000Z');
    expect(occ[2].startDate.toISOString()).toBe('2023-01-04T00:00:00.000Z');
  });
});
