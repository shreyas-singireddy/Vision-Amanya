"use client";

/**
 * Lighting — Architectural Day / Dusk Lighting Rig.
 *
 * Provides physically believable lighting for Amnaya's 3D architecture.
 * Smoothly transitions light positions, colors, and intensities between Day
 * (crisp sunlight + sky fill) and Dusk (golden hour low-angle sun + warm exterior accents).
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useExperienceStore } from "./experience-store";

const DAY_SUN_COLOR = new THREE.Color("#FFF6EB");
const DAY_SKY_COLOR = new THREE.Color("#E8F2FB");
const DUSK_SUN_COLOR = new THREE.Color("#FFA452");
const DUSK_SKY_COLOR = new THREE.Color("#24384A");

export function Lighting() {
  const timeOfDay = useExperienceStore((state) => state.timeOfDay);

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);

  const isDusk = timeOfDay === "dusk";

  // Target values for lerping
  const targetSunPos = isDusk ? new THREE.Vector3(-45, 14, -25) : new THREE.Vector3(45, 55, 35);
  const targetSunInt = isDusk ? 1.4 : 2.4;
  const targetAmbInt = isDusk ? 0.35 : 0.65;
  const targetSunColor = isDusk ? DUSK_SUN_COLOR : DAY_SUN_COLOR;
  const targetSkyColor = isDusk ? DUSK_SKY_COLOR : DAY_SKY_COLOR;

  useFrame((_, delta) => {
    const lerpSpeed = Math.min(delta * 3, 0.1);

    if (sunRef.current) {
      sunRef.current.position.lerp(targetSunPos, lerpSpeed);
      sunRef.current.intensity = THREE.MathUtils.lerp(
        sunRef.current.intensity,
        targetSunInt,
        lerpSpeed
      );
      sunRef.current.color.lerp(targetSunColor, lerpSpeed);
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targetAmbInt,
        lerpSpeed
      );
      ambientRef.current.color.lerp(targetSkyColor, lerpSpeed);
    }

    if (hemiRef.current) {
      hemiRef.current.color.lerp(targetSkyColor, lerpSpeed);
    }
  });

  return (
    <group>
      {/* Primary Directional Sun Light */}
      <directionalLight
        ref={sunRef}
        position={[45, 55, 35]}
        intensity={2.4}
        color="#FFF6EB"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0005}
      />

      {/* Ambient Fill */}
      <ambientLight ref={ambientRef} intensity={0.65} color="#E8F2FB" />

      {/* Hemisphere Light — Sky vs Ground fill */}
      <hemisphereLight ref={hemiRef} args={["#E8F2FB", "#4A4237", 0.4]} />

      {/* Warm Exterior Architectural Accent Lights (active during Dusk) */}
      {isDusk && (
        <group>
          {/* Clubhouse entrance accent */}
          <pointLight
            position={[16, 5, -5]}
            intensity={4}
            color="#FFA852"
            distance={25}
            decay={2}
          />
          {/* Stilt entrance accent */}
          <pointLight position={[0, 4, 10]} intensity={5} color="#FFB86C" distance={30} decay={2} />
          {/* Balcony warm highlights */}
          <pointLight
            position={[-10, 14, 0]}
            intensity={3}
            color="#FFA852"
            distance={20}
            decay={2}
          />
        </group>
      )}
    </group>
  );
}
