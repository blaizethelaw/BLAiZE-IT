import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// JSDOM does not provide these encoders by default
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Provide a basic IntersectionObserver mock for tests
class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver;

// JSDOM doesn't implement scrollIntoView
window.HTMLElement.prototype.scrollIntoView = function() {};

// Mock canvas getContext for Three.js and other canvas usage
HTMLCanvasElement.prototype.getContext = () => {
  return {
    canvas: document.createElement('canvas'),
    getContextAttributes: jest.fn(),
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    getImageData: jest.fn(),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
  };
};
