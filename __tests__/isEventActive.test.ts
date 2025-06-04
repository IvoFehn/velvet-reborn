import { isEventActive } from '../util/isEventActive';

(global as any).fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('isEventActive', () => {
  afterEach(() => mockFetch.mockReset());

  it('returns true if an event is active', async () => {
    const now = new Date();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ events: [{ startDate: now, endDate: new Date(now.getTime() + 1000) }] })
    });
    await expect(isEventActive()).resolves.toBe(true);
  });

  it('returns false if no events', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ events: [] }) });
    await expect(isEventActive()).resolves.toBe(false);
  });
});
