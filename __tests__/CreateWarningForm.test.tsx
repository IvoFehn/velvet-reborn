import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateWarningForm from '../components/CreateWarningForm/CreateWarningForm';

(global as any).fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

describe('CreateWarningForm', () => {
  beforeEach(() => mockFetch.mockReset());

  it('shows error on empty submit', async () => {
    render(<CreateWarningForm />);
    fireEvent.submit(screen.getByRole('button', { name: /Verwarnung erstellen/i }).closest('form')!);
    expect(await screen.findByText(/Bitte geben Sie eine Warnungsnachricht ein/)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('submits form when message provided', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    render(<CreateWarningForm />);
    fireEvent.change(screen.getByLabelText(/Warnungsnachricht/), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /Verwarnung erstellen/i }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(screen.getByText(/Warnung erfolgreich erstellt/i)).toBeInTheDocument();
  });
});
