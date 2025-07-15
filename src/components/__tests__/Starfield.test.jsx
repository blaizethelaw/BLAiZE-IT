import { render } from '@testing-library/react';
import Starfield from '../Starfield';

describe('Starfield', () => {
  test('renders canvas element', () => {
    const { container } = render(<Starfield />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
