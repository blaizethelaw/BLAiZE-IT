import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

// Provide a minimal canvas mock so components using canvas don't crash in tests
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = () => ({
    fillRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    arc: () => {},
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    closePath: () => {},
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    setTransform: () => {},
    drawImage: () => {},
    getImageData: () => ({ data: [] }),
    putImageData: () => {},
    measureText: () => ({ width: 0 }),
    transform: () => {},
    rect: () => {},
    clip: () => {},
  });
});

// Simple smoke test to ensure the App component renders without crashing
describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
