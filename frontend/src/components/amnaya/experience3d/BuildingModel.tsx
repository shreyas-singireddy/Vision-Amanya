"use client";

/**
 * BuildingModel — 3D Architecture Model & Production GLB Pipeline.
 *
 * Supports loading production CAD GLB models via `@react-three/drei`'s `useGLTF`.
 * If no GLB path is passed (or until the CAD GLB is produced), it renders a high-fidelity
 * procedural 3D architectural model representing Vision Amnaya's 10-floor towers,
 * double-height stilt entrance, cantilevered balconies, glass facade, and 4-level clubhouse spine.
 *
 * Note: Procedural geometry is an isolated DEVELOPMENT PLACEHOLDER.
 */

import { useGLTF } from "@react-three/drei";

import { useExperienceStore } from "./experience-store";

export interface BuildingModelProps {
  /** Optional custom path to production `.glb` or `.gltf` asset */
  url?: string;
}

export function BuildingModel({ url }: BuildingModelProps) {
  const timeOfDay = useExperienceStore((state) => state.timeOfDay);
  const isDusk = timeOfDay === "dusk";

  // If a real GLB URL is supplied, load it
  if (url) {
    return <GLBModel url={url} />;
  }

  // Otherwise, render the procedural architectural model (Development Placeholder)
  return <ProceduralAmnayaModel isDusk={isDusk} />;
}

/** Production GLB Model Loader */
function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1} position={[0, 0, 0]} castShadow receiveShadow />;
}

/**
 * Procedural 3D Architectural Model of Amnaya.
 * Renders 4 residential towers (10 floors), double-height stilt base,
 * cantilevered balconies, glass windows, and clubhouse spine.
 */
function ProceduralAmnayaModel({ isDusk }: { isDusk: boolean }) {
  // Material definitions
  const wallColor = isDusk ? "#D6CFBF" : "#F4F0E8"; // Warm limestone concrete
  const bronzeColor = isDusk ? "#B88654" : "#A3744A"; // Accent bronze metal trim
  const glassColor = isDusk ? "#182E3D" : "#89ABC2"; // Tinted glass
  const stiltColor = isDusk ? "#232320" : "#363430"; // Dark stilt structural steel

  // Tower X positions for the 4 residential blocks
  const towerPositions: [number, number, number][] = [
    [-18, 0, -5],
    [-6, 0, 0],
    [6, 0, 0],
    [18, 0, -5],
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* ── Ground Double-Height Stilt Entrance Base ────────────────── */}
      <group position={[0, 2.5, 0]}>
        {/* Stilt roof slab */}
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[46, 0.4, 18]} />
          <meshStandardMaterial color={wallColor} roughness={0.4} />
        </mesh>
        {/* Stilt structural columns */}
        {[-20, -10, 0, 10, 20].map((x) =>
          [-6, 6].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0, z]} castShadow>
              <boxGeometry args={[0.6, 5, 0.6]} />
              <meshStandardMaterial color={stiltColor} roughness={0.3} metalness={0.7} />
            </mesh>
          ))
        )}
      </group>

      {/* ── 4 Residential Towers (10 Floors Each) ──────────────────── */}
      {towerPositions.map((pos, towerIdx) => (
        <group key={towerIdx} position={pos}>
          {/* Main Tower Core Body (10 floors = ~20 units height) */}
          <mesh position={[0, 15.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[9, 21, 14]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} />
          </mesh>

          {/* Glass Window Facades */}
          <mesh position={[0, 15.5, 7.05]}>
            <planeGeometry args={[8, 19.5]} />
            <meshStandardMaterial
              color={glassColor}
              roughness={0.1}
              metalness={0.8}
              opacity={0.85}
              transparent
            />
          </mesh>

          {/* 10 Floor Slab Horizontal Trim Lines */}
          {Array.from({ length: 10 }).map((_, floor) => (
            <group key={floor} position={[0, 5.5 + floor * 2.1, 0]}>
              {/* Floor Slab */}
              <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[9.4, 0.2, 14.4]} />
                <meshStandardMaterial color={bronzeColor} roughness={0.3} metalness={0.6} />
              </mesh>

              {/* Cantilevered Balcony Terrace (Front Facing) */}
              <mesh position={[0, -0.3, 8.2]} castShadow receiveShadow>
                <boxGeometry args={[8.4, 0.25, 2.4]} />
                <meshStandardMaterial color={wallColor} roughness={0.4} />
              </mesh>

              {/* Balcony Glass Guardrail */}
              <mesh position={[0, 0.25, 9.35]}>
                <boxGeometry args={[8.3, 0.8, 0.08]} />
                <meshStandardMaterial
                  color={glassColor}
                  roughness={0.1}
                  metalness={0.9}
                  opacity={0.6}
                  transparent
                />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* ── 25,000 sq.ft. Clubhouse Spine (4 Levels) ───────────────── */}
      <group position={[28, 5, -8]}>
        {/* Main Clubhouse Structure */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[14, 10, 16]} />
          <meshStandardMaterial color={wallColor} roughness={0.4} />
        </mesh>
        {/* Glass Facade */}
        <mesh position={[0, 0, 8.05]}>
          <planeGeometry args={[12, 8]} />
          <meshStandardMaterial
            color={glassColor}
            roughness={0.1}
            metalness={0.9}
            opacity={0.8}
            transparent
          />
        </mesh>

        {/* Rooftop Swimming Pool Structure */}
        <group position={[0, 5.2, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[12, 0.4, 14]} />
            <meshStandardMaterial color={stiltColor} roughness={0.3} />
          </mesh>

          {/* Pool Water Surface */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[9, 0.1, 10]} />
            <meshStandardMaterial
              color="#2B83A6"
              roughness={0.1}
              metalness={0.7}
              opacity={0.9}
              transparent
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
