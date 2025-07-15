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
