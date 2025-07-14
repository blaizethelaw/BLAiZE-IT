import React from 'react';
import { render } from '@testing-library/react';
import App from '../App';

// Simple smoke test to ensure the App component renders without crashing

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
