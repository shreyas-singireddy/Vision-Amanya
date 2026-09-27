"use client";

/**
 * AmnayaCanvas — React Three Fiber Canvas Composition.
 *
 * Configures the WebGL context, ACESFilmic tone mapping, antialiasing,
 * camera projection matrix, and Suspense fallback for the 3D scene.
 */

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { BuildingModel } from "./BuildingModel";
import { CameraController } from "./CameraController";
import { EnvironmentRig } from "./EnvironmentRig";
import { Hotspots } from "./Hotspots";
import { Lighting } from "./Lighting";

export interface AmnayaCanvasProps {
  modelUrl?: string;
}

export function AmnayaCanvas({ modelUrl }: AmnayaCanvasProps) {
  return (
    <Canvas
      camera={{
        fov: 45,
        near: 0.5,
        far: 400,
        position: [45, 30, 50],
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      shadows
      className="h-full w-full bg-[#0A120E]"
    >
      <Suspense fallback={null}>
        <CameraController />
        <Lighting />
        <EnvironmentRig />
        <BuildingModel url={modelUrl} />
        <Hotspots />
      </Suspense>
    </Canvas>
  );
}
