export class Scene {
  add() {}
  remove() {}
}
export class PerspectiveCamera {
  constructor() {
    this.position = { z: 0 };
  }
  updateProjectionMatrix() {}
}
export class WebGLRenderer {
  constructor() {
    this.domElement = document.createElement('canvas');
  }
  setSize() {}
  render() {}
}
export class TextureLoader {
  load() { return {}; }
}
export class PlaneGeometry {
  constructor() {}
}
export class ShaderMaterial {
  constructor(params = {}) {
    this.uniforms = params.uniforms || {
      uTime: { value: 0 },
      uMouse: { value: { x: 0, y: 0 } }
    };
  }
}
export class Mesh {
  constructor() {}
}
export class Clock {
  getElapsedTime() {
    return 0;
  }
}
export class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
