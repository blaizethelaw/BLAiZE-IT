import { render } from '@testing-library/react';
import WarpTunnel from '../WarpTunnel';

describe('WarpTunnel', () => {
  test('renders canvas element', () => {
    const { container } = render(<WarpTunnel />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
