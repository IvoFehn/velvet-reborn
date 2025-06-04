import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from '../hooks/use-mobile';

describe('useIsMobile', () => {
  function setup(width: number) {
    (window as any).innerWidth = width;
    const listeners: { change: ((e: any) => void)[] } = { change: [] };
    window.matchMedia = jest.fn().mockImplementation(() => ({
      addEventListener: (_: string, cb: (e: any) => void) => listeners.change.push(cb),
      removeEventListener: () => {},
    }));
    return { listeners };
  }

  it('detects mobile width', () => {
    const { listeners } = setup(500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
    act(() => listeners.change.forEach(fn => fn({}))); // trigger update
    expect(result.current).toBe(true);
  });

  it('detects desktop width', () => {
    const { listeners } = setup(1200);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    act(() => listeners.change.forEach(fn => fn({}))); // trigger update
    expect(result.current).toBe(false);
  });
});
