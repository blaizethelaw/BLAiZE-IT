import { render } from '@testing-library/react';
import Starfield from '../Starfield';

describe('Starfield', () => {
  test('renders container element', () => {
    const { container } = render(<Starfield />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
