import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import InteractiveLogo from '../InteractiveLogo';
import * as THREE from 'three';

describe('InteractiveLogo', () => {
  beforeEach(() => {
    THREE.Mesh.instances = [];
    THREE.WebGLRenderer.instances = [];
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(cb, 16); // ~60fps
      return 1;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('calls requestAnimationFrame and updates mesh on mouse move', () => {
    const windowAddSpy = jest.spyOn(window, 'addEventListener');

    render(<InteractiveLogo />);

    expect(window.requestAnimationFrame).toHaveBeenCalled();
    expect(windowAddSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));

    const mesh = THREE.Mesh.instances[THREE.Mesh.instances.length - 1];
    const material = mesh.material;

    fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });

    act(() => {
        jest.advanceTimersByTime(16);
    });

    expect(material.uniforms.uMouse.value.x).not.toBe(0.5);
  });

  test('cleans up event listeners', () => {
    const windowRemoveSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<InteractiveLogo />);
    unmount();

    expect(windowRemoveSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
