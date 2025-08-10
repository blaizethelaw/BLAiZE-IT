import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import InteractiveLogo from '../InteractiveLogo';
import * as THREE from 'three';

describe('InteractiveLogo', () => {
  beforeEach(() => {
    THREE.Mesh.instances = [];
    THREE.WebGLRenderer.instances = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('calls requestAnimationFrame and updates mesh on mouse move and hover', () => {
    const windowAddSpy = jest.spyOn(window, 'addEventListener');
    const canvasAddSpy = jest.spyOn(HTMLCanvasElement.prototype, 'addEventListener');

    const { container } = render(<InteractiveLogo />);

    expect(window.requestAnimationFrame).toHaveBeenCalled();
    expect(windowAddSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(canvasAddSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(canvasAddSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));

    let mesh = THREE.Mesh.instances[THREE.Mesh.instances.length - 1];
    const material = mesh.material;

    fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
    expect(material.uniforms.uMouse.value.x).not.toBe(0.5);

    let canvas = container.querySelector('canvas');
    fireEvent.mouseEnter(canvas);

    canvas = container.querySelector('canvas');
    mesh = THREE.Mesh.instances[THREE.Mesh.instances.length - 1];
    expect(mesh.rotation.x).toBeGreaterThan(0);
    expect(mesh.material.uniforms.uHover.value).toBeGreaterThan(0);
  });

  test('responds to mouseleave by resetting hover uniform and rotation', () => {
    const { container } = render(<InteractiveLogo />);

    let canvas = container.querySelector('canvas');
    fireEvent.mouseEnter(canvas);
    canvas = container.querySelector('canvas');
    fireEvent.mouseLeave(canvas);

    const mesh = THREE.Mesh.instances[THREE.Mesh.instances.length - 1];
    expect(mesh.material.uniforms.uHover.value).toBe(0);
    expect(mesh.rotation.x).toBe(0);
  });

  test('cleans up event listeners and disposes renderer', () => {
    const windowRemoveSpy = jest.spyOn(window, 'removeEventListener');
    const canvasRemoveSpy = jest.spyOn(HTMLCanvasElement.prototype, 'removeEventListener');
    const disposeSpy = jest.spyOn(THREE.WebGLRenderer.prototype, 'dispose');

    const { unmount } = render(<InteractiveLogo />);
    unmount();

    expect(windowRemoveSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(windowRemoveSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(canvasRemoveSpy).toHaveBeenCalledWith('mouseenter', expect.any(Function));
    expect(canvasRemoveSpy).toHaveBeenCalledWith('mouseleave', expect.any(Function));
    expect(disposeSpy).toHaveBeenCalled();
  });
});
