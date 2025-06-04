import { cn } from '../lib/utils';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('allows duplicate class names', () => {
    expect(cn('foo', 'bar', 'foo')).toBe('foo bar foo');
  });
});
