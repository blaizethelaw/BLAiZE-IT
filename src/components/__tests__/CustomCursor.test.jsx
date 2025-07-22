import { render } from '@testing-library/react';
import CustomCursor from '../CustomCursor';

describe('CustomCursor', () => {
  test('adds cursor elements to document', () => {
    render(<CustomCursor />);
    expect(document.querySelector('.blaize-cursor')).toBeInTheDocument();
    expect(document.querySelector('.blaize-cursor-follower')).toBeInTheDocument();
  });
});
