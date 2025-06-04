import { fetchNews, createNews } from '../util/createNews';

// Mock global fetch
(global as any).fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('createNews utilities', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('fetchNews requests all news by default', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: ['n'] }) });
    const result = await fetchNews();
    expect(mockFetch).toHaveBeenCalledWith('/api/news');
    expect(result).toEqual(['n']);
  });

  it('fetchNews accepts query params', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: ['x'] }) });
    const result = await fetchNews({ type: 'general', id: '1' });
    expect(mockFetch).toHaveBeenCalledWith('/api/news?type=general&id=1');
    expect(result).toEqual(['x']);
  });

  it('createNews posts new entry', async () => {
    const news = { title: 't', content: 'c' } as any;
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({ data: news }) });
    const result = await createNews(news);
    expect(mockFetch).toHaveBeenCalledWith('/api/news', expect.objectContaining({ method: 'POST' }));
    expect(result).toEqual(news);
  });
});
