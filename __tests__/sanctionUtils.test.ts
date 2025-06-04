import axios from 'axios';
import {
  giveSanction,
  deleteSanction,
  escalateSanction,
  getSanctionTemplates
} from '../util/sanctionUtils';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

(global as any).fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('sanctionUtils', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('giveSanction posts to API', async () => {
    mockedAxios.post.mockResolvedValue({ data: { success: true, data: { id: '1' } } });
    const result = await giveSanction(2, 3, 'r');
    expect(mockedAxios.post).toHaveBeenCalledWith('/api/sanctions/random', {
      severity: 2,
      deadlineDays: 3,
      reason: 'r'
    });
    expect(result).toEqual({ id: '1' });
  });

  it('deleteSanction calls delete endpoint', async () => {
    mockedAxios.delete.mockResolvedValue({ data: { success: true } });
    const ok = await deleteSanction('abc');
    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/sanctions/abc');
    expect(ok).toBe(true);
  });

  it('escalateSanction uses fetch API', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    const result = await escalateSanction('42');
    expect(mockFetch).toHaveBeenCalledWith('/api/sanctions/escalate', expect.objectContaining({ method: 'PUT' }));
    expect(result).toEqual({ ok: true });
  });

  it('getSanctionTemplates filters by level', () => {
    const templates = getSanctionTemplates(1);
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.every(t => t.level === 1)).toBe(true);
  });
});
