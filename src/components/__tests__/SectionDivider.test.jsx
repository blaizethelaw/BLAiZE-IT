import { render } from '@testing-library/react';
import SectionDivider from '../SectionDivider';

describe('SectionDivider', () => {
  test('applies rotate-180 class when flip prop is true', () => {
    const { container } = render(<SectionDivider flip />);
    const svg = container.querySelector('svg');
    expect(svg.classList.contains('rotate-180')).toBe(true);
  });

  test('does not apply rotate-180 class by default', () => {
    const { container } = render(<SectionDivider />);
    const svg = container.querySelector('svg');
    expect(svg.classList.contains('rotate-180')).toBe(false);
  });
});
