import * as THREE from 'three';

// Enhanced Adaptive Quality Manager with advanced mobile optimizations
export default class AdaptiveQualityManager {
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.qualitySettings = {
      pixelRatio: Math.min(window.devicePixelRatio, 2), // Cap at 2x for performance
      particleCount: this.getInitialParticleCount(),
      rayMarchSteps: this.getInitialRayMarchSteps(),
      postProcessing: true,
    };
    this.performanceMonitor = {
      frameTimes: [],
      stable: true,
      gpuUtilization: 0,
      lastFrameTime: performance.now(),
    };
    this.isLowEnd = this.detectLowEndDevice();
    this.memoryBudget = this.calculateMemoryBudget();
  }

  detectLowEndDevice() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return true;

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

    // Detect low-end GPUs
    const lowEndGPUs = ['powervr', 'adreno 3', 'adreno 4', 'mali-4', 'intel'];
    return lowEndGPUs.some(gpu => renderer.toLowerCase().includes(gpu)) ||
           navigator.hardwareConcurrency < 4;
  }

  getInitialParticleCount() {
    if (this.isLowEnd) return 25000;
    if (window.innerWidth < 768) return 50000;
    return 100000;
  }

  getInitialRayMarchSteps() {
    return this.isLowEnd ? 16 : 32;
  }

  calculateMemoryBudget() {
    // Conservative estimate: 2MB per million screen pixels
    const screenPixels = window.innerWidth * window.innerHeight;
    return Math.floor(screenPixels * 2 / 1000000); // MB
  }

  update() {
    const now = performance.now();
    const frameTime = now - this.performanceMonitor.lastFrameTime;
    this.performanceMonitor.lastFrameTime = now;

    this.performanceMonitor.frameTimes.push(frameTime);
    if (this.performanceMonitor.frameTimes.length > 60) {
      this.performanceMonitor.frameTimes.shift();
    }

    const avgFrameTime = this.performanceMonitor.frameTimes.reduce((a, b) => a + b, 0) / this.performanceMonitor.frameTimes.length;

    // GPU bound detection (simplified)
    if (avgFrameTime > 33) { // Slower than 30fps
      this.reduceRenderQuality();
      this.performanceMonitor.stable = false;
    } else if (avgFrameTime < 13 && this.performanceMonitor.frameTimes.length >= 30) { // Faster than 75fps
      this.increaseQuality();
      this.performanceMonitor.stable = true;
    }
  }

  reduceRenderQuality() {
    // Reduce pixel ratio first
    if (this.qualitySettings.pixelRatio > 0.5) {
      this.qualitySettings.pixelRatio = Math.max(this.qualitySettings.pixelRatio * 0.9, 0.5);
      this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
      return;
    }

    // Then reduce particle count
    if (this.qualitySettings.particleCount > 10000) {
      this.qualitySettings.particleCount *= 0.8;
    }

    // Disable post-processing
    this.qualitySettings.postProcessing = false;
  }

  increaseQuality() {
    if (this.qualitySettings.pixelRatio < Math.min(window.devicePixelRatio, 2)) {
      this.qualitySettings.pixelRatio = Math.min(this.qualitySettings.pixelRatio * 1.05, Math.min(window.devicePixelRatio, 2));
      this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
    }
  }
}
