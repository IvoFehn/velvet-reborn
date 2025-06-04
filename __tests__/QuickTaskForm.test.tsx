import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickTaskForm from '../components/QuickTaskForm/QuickTaskForm';
import * as telegram from '../util/sendTelegramMessage';

(global as any).fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;
jest.spyOn(telegram, 'sendTelegramMessage').mockResolvedValue({ success: true } as any);

describe('QuickTaskForm component', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('submits new task', async () => {
    mockFetch.mockResolvedValue({ json: async () => ({ success: true }) });
    render(<QuickTaskForm />);
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 't' } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'd' } });
    fireEvent.click(screen.getByRole('button', { name: /Quick Task erstellen/i }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(await screen.findByText(/erfolgreich erstellt/i)).toBeInTheDocument();
  });
});
