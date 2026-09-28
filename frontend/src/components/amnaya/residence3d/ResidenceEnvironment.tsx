"use client";

/**
 * ResidenceEnvironment — Lighting, Ambient Shadows, and Architectural Material Environment.
 */

import { memo } from "react";
import { ContactShadows } from "@react-three/drei";
import { useResidenceExplorerStore } from "../../../store/residence-explorer.store";

export const ResidenceEnvironment = memo(function ResidenceEnvironment() {
  const lightingMode = useResidenceExplorerStore((s) => s.lightingMode);

  // Dynamic values based on visualization lighting mode
  const isDay = lightingMode === "day";
  const isEvening = lightingMode === "evening";
  const isNight = lightingMode === "night";

  const ambientColor = isDay ? "#FAF8F5" : isEvening ? "#E2D4C9" : "#1A1E2E";
  const ambientIntensity = isDay ? 0.65 : isEvening ? 0.5 : 0.35;

  const sunColor = isDay ? "#FFF9ED" : isEvening ? "#FFA959" : "#6B7B9E";
  const sunIntensity = isDay ? 1.25 : isEvening ? 0.95 : 0.25;

  const fillColor = isDay ? "#D8E5F0" : isEvening ? "#4A4E69" : "#222B45";
  const fillIntensity = isDay ? 0.45 : isEvening ? 0.4 : 0.25;

  return (
    <>
      {/* Ambient Lighting */}
      <ambientLight intensity={ambientIntensity} color={ambientColor} />

      {/* Key Sun Directional Light */}
      <directionalLight
        position={isDay ? [25, 35, 20] : isEvening ? [35, 18, 15] : [10, 40, 10]}
        intensity={sunIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
        color={sunColor}
      />

      {/* Fill Light for subtle shadow depth */}
      <directionalLight position={[-20, 15, -15]} intensity={fillIntensity} color={fillColor} />

      {/* Night Interior Downlight Glow */}
      {isNight && (
        <>
          <pointLight position={[0, 4, 0]} intensity={1.2} color="#FFE6B3" distance={25} />
          <pointLight position={[-5, 3.5, -4]} intensity={0.9} color="#FFD180" distance={18} />
          <pointLight position={[5, 3.5, 3]} intensity={0.9} color="#FFD180" distance={18} />
        </>
      )}

      {/* Soft Contact Shadows on ground plane */}
      <ContactShadows
        position={[0, -0.05, 0]}
        opacity={isNight ? 0.35 : 0.55}
        scale={45}
        blur={2.4}
        far={10}
        resolution={1024}
        color="#080C0A"
      />
    </>
  );
});
