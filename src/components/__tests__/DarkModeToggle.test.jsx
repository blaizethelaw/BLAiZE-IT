import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import DarkModeToggle from '../DarkModeToggle';

describe('DarkModeToggle', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('toggles the dark class on the html element', () => {
    const { getByRole } = render(<DarkModeToggle />);
    const btn = getByRole('button', { name: /toggle dark mode/i });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    fireEvent.click(btn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
