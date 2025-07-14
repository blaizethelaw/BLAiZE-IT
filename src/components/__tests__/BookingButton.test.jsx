import { render, screen } from '@testing-library/react';
import BookingButton from '../BookingButton';

describe('BookingButton', () => {
  test('renders link with correct text and href', () => {
    render(<BookingButton />);
    const link = screen.getByRole('link', { name: /book a free consultation/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/booking');
  });
});
