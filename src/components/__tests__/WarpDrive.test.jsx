import { render } from '@testing-library/react';
import WarpDrive from '../WarpDrive';

describe('WarpDrive', () => {
  test('renders canvas element', () => {
    const { container } = render(<WarpDrive />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
});
