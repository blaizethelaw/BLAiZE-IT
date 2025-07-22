import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import ScrollToTopButton from '../ScrollToTopButton';

describe('ScrollToTopButton', () => {
  test('scrolls to top when clicked', () => {
    window.scrollTo = jest.fn();
    const { getByRole } = render(<ScrollToTopButton />);
    const btn = getByRole('button', { name: /scroll to top/i });
    fireEvent.click(btn);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
