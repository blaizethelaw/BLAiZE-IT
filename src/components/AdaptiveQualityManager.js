class AdaptiveQualityManager {
    constructor(renderer, scene) {
        this.renderer = renderer;
        this.scene = scene;
        this.qualitySettings = {
            pixelRatio: window.devicePixelRatio,
            // Add other quality settings here, e.g., shadow map size, texture resolution
        };
        this.performanceMonitor = {
            frameTimes: [],
            stable: true,
            gpuUtilization: 0, // Placeholder
        };
        this.lastFrameTime = performance.now();
    }

    update() {
        const now = performance.now();
        const frameTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.performanceMonitor.frameTimes.push(frameTime);
        if (this.performanceMonitor.frameTimes.length > 60) {
            this.performanceMonitor.frameTimes.shift();
        }

        const averageFrameTime = this.performanceMonitor.frameTimes.reduce((a, b) => a + b, 0) / this.performanceMonitor.frameTimes.length;

        if (averageFrameTime > 20) { // Slower than 50fps
            this.reduceRenderQuality();
            this.performanceMonitor.stable = false;
        } else if (averageFrameTime < 16) { // Faster than 60fps
            this.increaseQuality();
            this.performanceMonitor.stable = true;
        }
    }

    reduceRenderQuality() {
        if (this.qualitySettings.pixelRatio > 0.5) {
            this.qualitySettings.pixelRatio = Math.max(this.qualitySettings.pixelRatio * 0.9, 0.5);
            this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
            console.log(`Reduced pixel ratio to ${this.qualitySettings.pixelRatio}`);
        }
    }

    increaseQuality() {
        if (this.qualitySettings.pixelRatio < window.devicePixelRatio) {
            this.qualitySettings.pixelRatio = Math.min(this.qualitySettings.pixelRatio * 1.1, window.devicePixelRatio);
            this.renderer.setPixelRatio(this.qualitySettings.pixelRatio);
            console.log(`Increased pixel ratio to ${this.qualitySettings.pixelRatio}`);
        }
    }
}

export { AdaptiveQualityManager };
