import { render } from '@testing-library/react';
import ThreeScene from '../ThreeScene';

describe('ThreeScene', () => {
  test('renders container element', () => {
    const { container } = render(<ThreeScene />);
    const div = container.querySelector('div');
    expect(div).toBeInTheDocument();
  });
});
