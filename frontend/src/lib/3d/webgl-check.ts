/**
 * WebGL Capability Detector.
 *
 * Checks whether the browser supports WebGL 1.0 or WebGL 2.0 rendering contexts
 * before mounting Three.js / React Three Fiber canvases.
 */

export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");

    return Boolean(gl && gl instanceof WebGLRenderingContext);
  } catch {
    return false;
  }
}
