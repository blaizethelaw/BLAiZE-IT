import * as THREE from 'three';

// Enhanced GPU Computation Renderer with mobile optimizations
export default class MobileGPUComputationRenderer {
  constructor(sizeX, sizeY, renderer) {
    this.variables = [];
    this.currentTextureIndex = 0;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.renderer = renderer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.camera.position.z = 1;

    // Use HalfFloat on mobile for better performance
    this.dataType = this.isMobile() ? THREE.HalfFloatType : THREE.FloatType;

    this.passThruUniforms = {
      passThruTexture: { value: null }
    };

    this.init();
  }

  isMobile() {
    return /(iPad|iPhone|iPod|Android)/g.test(navigator.userAgent);
  }

  addResolutionDefine(material) {
    material.defines.resolution = `vec2(${this.sizeX.toFixed(1)}, ${this.sizeY.toFixed(1)})`;
  }

  createShaderMaterial(computeFragmentShader, uniforms = {}) {
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: this.getPassThroughVertexShader(),
      fragmentShader: computeFragmentShader
    });

    this.addResolutionDefine(material);
    return material;
  }

  init() {
    const passThruShader = this.createShaderMaterial(this.getPassThroughFragmentShader(), this.passThruUniforms);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), passThruShader);
    this.scene.add(mesh);
    this.mesh = mesh;
    this.passThruShader = passThruShader;
  }

  addVariable(variableName, computeFragmentShader, initialValueTexture) {
    const material = this.createShaderMaterial(computeFragmentShader);

    const variable = {
      name: variableName,
      initialValueTexture: initialValueTexture,
      material: material,
      renderTargets: [],
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter
    };

    this.variables.push(variable);

    variable.renderTargets[0] = this.createRenderTarget();
    variable.renderTargets[1] = this.createRenderTarget();
    this.renderTexture(initialValueTexture, variable.renderTargets[0]);
    this.renderTexture(initialValueTexture, variable.renderTargets[1]);

    return variable;
  }

  createRenderTarget() {
    return new THREE.WebGLRenderTarget(this.sizeX, this.sizeY, {
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      type: this.dataType,
      stencilBuffer: false
    });
  }

  createTexture() {
    const size = this.sizeX * this.sizeY * 4;
    const data = this.dataType === THREE.HalfFloatType ?
      new Uint16Array(size) : new Float32Array(size);

    return new THREE.DataTexture(data, this.sizeX, this.sizeY, THREE.RGBAFormat, this.dataType);
  }

  compute() {
    const currentTextureIndex = this.currentTextureIndex;
    const nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

    for (let v = 0; v < this.variables.length; v++) {
      const variable = this.variables[v];
      const uniforms = variable.material.uniforms;

      // Set dependencies
      for (let d = 0; d < this.variables.length; d++) {
        const depVar = this.variables[d];
        if (uniforms.hasOwnProperty(depVar.name)) {
          uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
        }
      }

      this.doRenderTarget(variable.material, variable.renderTargets[nextTextureIndex]);
    }

    this.currentTextureIndex = nextTextureIndex;
  }

  getCurrentRenderTarget(variable) {
    return variable.renderTargets[this.currentTextureIndex];
  }

  doRenderTarget(material, output) {
    this.mesh.material = material;
    this.renderer.setRenderTarget(output);
    this.renderer.render(this.scene, this.camera);
    this.mesh.material = this.passThruShader;
  }

  renderTexture(input, output) {
    this.passThruUniforms.passThruTexture.value = input;
    this.doRenderTarget(this.passThruShader, output);
    this.passThruUniforms.passThruTexture.value = null;
  }

  getPassThroughVertexShader() {
    return `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `;
  }

  getPassThroughFragmentShader() {
    return `
      uniform sampler2D passThruTexture;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        gl_FragColor = texture2D(passThruTexture, uv);
      }
    `;
  }
}
