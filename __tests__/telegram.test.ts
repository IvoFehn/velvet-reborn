import { sendTelegramMessage } from '../util/sendTelegramMessage';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('sendTelegramMessage', () => {
  it('posts message to API', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) } as any);
    await sendTelegramMessage('user', 'hi');
    expect(mockFetch).toHaveBeenCalledWith('/api/webhooks?service=telegram&action=send', expect.objectContaining({
      method: 'POST',
    }));
  });
});
