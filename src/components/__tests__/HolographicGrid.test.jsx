import { render } from '@testing-library/react';
import HolographicGrid from '../HolographicGrid';

describe('HolographicGrid', () => {
  test('renders canvas element', () => {
    const { container } = render(<HolographicGrid />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
