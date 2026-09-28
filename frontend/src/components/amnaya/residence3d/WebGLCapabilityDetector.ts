/**
 * WebGL Capability Detector.
 * Safely checks if the browser environment supports WebGL without throwing errors.
 */

export function detectWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl && gl instanceof WebGLRenderingContext || (window as unknown as { WebGL2RenderingContext?: typeof WebGLRenderingContext }).WebGL2RenderingContext && gl instanceof (window as unknown as { WebGL2RenderingContext: typeof WebGLRenderingContext }).WebGL2RenderingContext);
  } catch {
    return false;
  }
}
