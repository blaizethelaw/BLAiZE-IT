export class Scene {
  add() {}
  remove() {}
}

export class PerspectiveCamera {
  constructor() {
    this.position = { z: 0 };
    this.aspect = 1;
  }
  updateProjectionMatrix() {}
}

export class WebGLRenderer {
  constructor() {
    this.domElement = document.createElement('canvas');
  }
  setSize() {}
  setPixelRatio() {}
  render() {}
  dispose() {}
}

export class AmbientLight {
  constructor() {}
}

export class PointLight {
  constructor() {
    this.position = { set() {} };
  }
}

export class PlaneGeometry {
  constructor() {}
}

export class BufferGeometry {
  constructor() {
    this.attributes = {};
  }
  setAttribute(name, attr) {
    this.attributes[name] = attr;
  }
}

export class BufferAttribute {
  constructor(array, itemSize) {
    this.array = array;
    this.itemSize = itemSize;
    this.needsUpdate = false;
  }
}

export class ShaderMaterial {
  constructor(params = {}) {
    this.uniforms = params.uniforms || {
      uTime: { value: 0 },
      uMouse: { value: { x: 0, y: 0 } },
      uTexture: { value: {} },
      uHover: { value: 0 }
    };
    this.transparent = params.transparent;
    this.side = params.side;
  }
}

export class Mesh {
  constructor() {
    this.rotation = { x: 0, y: 0 };
  }
}

export class PointsMaterial {
  constructor() {}
}

export class Points {
  constructor() {}
}

export class CanvasTexture {
  constructor() {
    this.needsUpdate = false;
  }
}

export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

export class Clock {
  getElapsedTime() {
    return 0;
  }
}

export const DoubleSide = 0;
export const AdditiveBlending = 0;
