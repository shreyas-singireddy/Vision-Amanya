"use client";

/**
 * EnvironmentRig — Architectural Sky, Ground, Landscape, and Lake Surface.
 *
 * Renders the site surrounding Vision Amnaya:
 *   - Ground plane (warm stone texture tone)
 *   - 2-acre Central Garden landscape (emerald lawn + tree planting proxies)
 *   - 25-acre Lake view surface (Osman Sagar catchment representation)
 *   - Sky fog & color transitions reacting to Day / Dusk mode.
 */

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

import { useExperienceStore } from "./experience-store";

const DAY_FOG = new THREE.Color("#E8F1F8");
const DUSK_FOG = new THREE.Color("#0F1A24");

export function EnvironmentRig() {
  const timeOfDay = useExperienceStore((state) => state.timeOfDay);
  const waterRef = useRef<THREE.Mesh>(null);
  const fogRef = useRef<THREE.FogExp2>(null);

  const isDusk = timeOfDay === "dusk";

  // Gentle water movement animation
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.005;
    }
    if (fogRef.current) {
      fogRef.current.color.lerp(isDusk ? DUSK_FOG : DAY_FOG, 0.05);
    }
  });

  return (
    <group>
      {/* Sky Fog */}
      <fogExp2 ref={fogRef} attach="fog" args={["#E8F1F8", 0.006]} />

      {/* Ground Plane — Site Footprint (5.3 acres representation) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial
          color={isDusk ? "#181816" : "#EBE7DF"}
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* 2-Acre Central Garden Lawn */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.01, 12]} receiveShadow>
        <planeGeometry args={[45, 65]} />
        <meshStandardMaterial
          color={isDusk ? "#152E20" : "#2E6B4B"}
          roughness={0.8}
          metalness={0.05}
        />
      </mesh>

      {/* Tree proxies along central garden spine */}
      {[-24, -14, -4, 6, 16, 26].map((z, i) => (
        <group key={i} position={[-26, 0, z + 6]}>
          {/* Trunk */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 3, 8]} />
            <meshStandardMaterial color="#4A382A" roughness={0.9} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 4, 0]} castShadow>
            <coneGeometry args={[2.2, 4.5, 8]} />
            <meshStandardMaterial color={isDusk ? "#1A3D2B" : "#357A57"} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 25-Acre Lake Surface Representation (Northern Boundary) */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -75]} receiveShadow>
        <planeGeometry args={[260, 120]} />
        <meshStandardMaterial
          color={isDusk ? "#122A3B" : "#326388"}
          roughness={0.2}
          metalness={0.6}
          opacity={0.92}
          transparent
        />
      </mesh>
    </group>
  );
}
