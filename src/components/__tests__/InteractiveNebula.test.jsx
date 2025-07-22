import { render } from '@testing-library/react';
import InteractiveNebula from '../InteractiveNebula';

describe('InteractiveNebula', () => {
  test('renders canvas element', () => {
    const { container } = render(<InteractiveNebula />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
