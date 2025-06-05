import { addExp } from '../util/addExp';
import { addGold } from '../util/addGold';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('resource utilities', () => {
  beforeEach(() => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) } as any);
  });

  afterEach(() => {
    mockFetch.mockClear();
  });

  it('addExp posts to API', async () => {
    await addExp(5);
    expect(mockFetch).toHaveBeenCalledWith('/api/profile/update', expect.objectContaining({
      method: 'PUT',
    }));
  });

  it('addGold posts to API', async () => {
    await addGold(10);
    expect(mockFetch).toHaveBeenCalledWith('/api/profile/update', expect.objectContaining({
      method: 'PUT',
    }));
  });
});
