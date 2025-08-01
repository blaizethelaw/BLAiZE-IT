/**
 * @author yomboprime https://github.com/yomboprime
 *
 * To use this class, you need to add the following scripts to your HTML file:
 *
 *	<script src="js/GPUComputationRenderer.js"></script>
 *
 */

import {
	BufferAttribute,
	Camera,
	ClampToEdgeWrapping,
	DataTexture,
	FloatType,
	HalfFloatType,
	Mesh,
	NearestFilter,
	PlaneGeometry,
	RGBAFormat,
	Scene,
	ShaderMaterial,
	WebGLRenderTarget
} from 'three';

var GPUComputationRenderer = function (sizeX, sizeY, renderer) {
	this.variables = [];
	this.currentTextureIndex = 0;

	var scene = new Scene();
	var camera = new Camera();
	camera.position.z = 1;

	var passThruUniforms = {
		passThruTexture: { value: null }
	};

	this.addResolutionDefine = function (material) {
		material.defines.resolution = 'vec2( ' + sizeX.toFixed(1) + ', ' + sizeY.toFixed(1) + ' )';
	};

	this.createShaderMaterial = function (computeFragmentShader, uniforms) {
		uniforms = uniforms || {};

		var material = new ShaderMaterial({
			uniforms: uniforms,
			vertexShader: getPassThroughVertexShader(),
			fragmentShader: computeFragmentShader
		});

		this.addResolutionDefine(material);

		return material;
	};

	var passThruShader = this.createShaderMaterial(getPassThroughFragmentShader(), passThruUniforms);

	var mesh = new Mesh(new PlaneGeometry(2, 2), passThruShader);
	scene.add(mesh);

	this.addVariable = function (variableName, computeFragmentShader, initialValueTexture) {
		var material = this.createShaderMaterial(computeFragmentShader);

		var variable = {
			name: variableName,
			initialValueTexture: initialValueTexture,
			material: material,
			renderTargets: [],
			wrapS: null,
			wrapT: null,
			minFilter: NearestFilter,
			magFilter: NearestFilter
		};

		this.variables.push(variable);

		variable.renderTargets[0] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
		variable.renderTargets[1] = this.createRenderTarget(sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter);
		this.renderTexture(initialValueTexture, variable.renderTargets[0]);
		this.renderTexture(initialValueTexture, variable.renderTargets[1]);

		var uniforms = material.uniforms;

		for (var v = 0; v < this.variables.length; v++) {
			var selVar = this.variables[v];
			if (selVar.name !== variableName) {
				material.uniforms[selVar.name] = { value: null };
			}
		}

		return variable;
	};

	this.setVariableDependencies = function (variable, dependencies) {
		var material = variable.material;
		var uniforms = material.uniforms;

		for (var d = 0; d < dependencies.length; d++) {
			var depVar = dependencies[d];
			uniforms[depVar.name] = { value: null };
		}
	};

	this.init = function () {
		this.initVariables();
		this.initialized = true;
	};

	this.initVariables = function () {
		for (var v = 0; v < this.variables.length; v++) {
			var variable = this.variables[v];
			variable.renderTargets[0] = this.createRenderTarget();
			variable.renderTargets[1] = this.createRenderTarget();
			this.renderTexture(variable.initialValueTexture, variable.renderTargets[0]);
			this.renderTexture(variable.initialValueTexture, variable.renderTargets[1]);
		}
	};

	this.compute = function () {
		var currentTextureIndex = this.currentTextureIndex;
		var nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

		for (var v = 0, il = this.variables.length; v < il; v++) {
			var variable = this.variables[v];
			var uniforms = variable.material.uniforms;

			for (var d = 0, dl = this.variables.length; d < dl; d++) {
				var depVar = this.variables[d];
				if (uniforms.hasOwnProperty(depVar.name)) {
					uniforms[depVar.name].value = depVar.renderTargets[currentTextureIndex].texture;
				}
			}

			this.doRenderTarget(variable.material, variable.renderTargets[nextTextureIndex]);
		}

		this.currentTextureIndex = nextTextureIndex;
	};

	this.createRenderTarget = function (sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter) {
		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		wrapS = wrapS || ClampToEdgeWrapping;
		wrapT = wrapT || ClampToEdgeWrapping;

		minFilter = minFilter || NearestFilter;
		magFilter = magFilter || NearestFilter;

		var renderTarget = new WebGLRenderTarget(sizeXTexture, sizeYTexture, {
			wrapS: wrapS,
			wrapT: wrapT,
			minFilter: minFilter,
			magFilter: magFilter,
			format: RGBAFormat,
			type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent) ? HalfFloatType : FloatType,
			stencilBuffer: false
		});

		return renderTarget;
	};

	this.createTexture = function () {
		const data = new Float32Array(sizeX * sizeY * 4);
		const texture = new DataTexture(data, sizeX, sizeY, RGBAFormat, FloatType);
		texture.needsUpdate = true;
		return texture;
	};

	this.getCurrentRenderTarget = function (variable) {
		return variable.renderTargets[this.currentTextureIndex];
	};

	this.doRenderTarget = function (material, output) {
		mesh.material = material;
		renderer.setRenderTarget(output);
		renderer.render(scene, camera);
		mesh.material = passThruShader;
	};

	this.renderTexture = function (input, output) {
		passThruUniforms.passThruTexture.value = input;
		this.doRenderTarget(passThruShader, output);
		passThruUniforms.passThruTexture.value = null;
	};

	function getPassThroughVertexShader() {
		return `
			void main() {
				gl_Position = vec4( position, 1.0 );
			}
		`;
	}

	function getPassThroughFragmentShader() {
		return `
			uniform sampler2D passThruTexture;
			void main() {
				vec2 uv = gl_FragCoord.xy / resolution.xy;
				gl_FragColor = texture2D( passThruTexture, uv );
			}
		`;
	}
};

export { GPUComputationRenderer };
