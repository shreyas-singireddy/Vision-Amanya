"use client";

/**
 * AmenitySceneCanvas — React Three Fiber Canvas for the Amenities Experience.
 *
 * Reuses the same R3F/Three.js infrastructure as the main Amnaya3DExperience.
 * Adds amenity-specific camera presets, hotspot markers on the podium/garden,
 * and GSAP-smooth camera transitions driven by the amenity store.
 */

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";
import { useAmenityStore } from "./amenity-store";
import { AMENITIES } from "./amenity-data";
import { cn } from "@utils/cn";

/* ── Shared temp vectors (avoids per-frame allocations) ─────────────────── */
const tempPos = new THREE.Vector3();
const tempTarget = new THREE.Vector3();

/* ── Overview camera preset ─────────────────────────────────────────────── */
const OVERVIEW_POSITION: [number, number, number] = [45, 30, 50];
const OVERVIEW_TARGET: [number, number, number] = [0, 6, 0];

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Inner Camera Controller — drives lerp based on active amenity           */
/* ══════════════════════════════════════════════════════════════════════════ */

function AmenityCameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const reduced = useReducedMotionPreference();
  const isTransitioning = useRef(false);

  const targetPos = useRef(new THREE.Vector3(...OVERVIEW_POSITION));
  const targetLook = useRef(new THREE.Vector3(...OVERVIEW_TARGET));

  const activeAmenityId = useAmenityStore((s) => s.activeAmenityId);
  const setTransitioning = useAmenityStore((s) => s.setTransitioning);

  useEffect(() => {
    let pos: [number, number, number] = OVERVIEW_POSITION;
    let look: [number, number, number] = OVERVIEW_TARGET;

    if (activeAmenityId) {
      const amenity = AMENITIES.find((a) => a.id === activeAmenityId);
      if (amenity) {
        pos = amenity.cameraPosition;
        look = amenity.cameraTarget;
      }
    }

    targetPos.current.set(...pos);
    targetLook.current.set(...look);
    isTransitioning.current = true;

    if (reduced && controlsRef.current) {
      camera.position.copy(targetPos.current);
      controlsRef.current.target.copy(targetLook.current);
      controlsRef.current.update();
      isTransitioning.current = false;
      setTransitioning(false);
    }
  }, [activeAmenityId, camera, reduced, setTransitioning]);

  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current || reduced) return;

    const lerpSpeed = Math.min(delta * 2.8, 0.08);

    tempPos.copy(camera.position).lerp(targetPos.current, lerpSpeed);
    camera.position.copy(tempPos);

    tempTarget.copy(controlsRef.current.target).lerp(targetLook.current, lerpSpeed);
    controlsRef.current.target.copy(tempTarget);
    controlsRef.current.update();

    if (
      camera.position.distanceTo(targetPos.current) < 0.15 &&
      controlsRef.current.target.distanceTo(targetLook.current) < 0.15
    ) {
      isTransitioning.current = false;
      setTransitioning(false);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      panSpeed={0.4}
      minDistance={8}
      maxDistance={120}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.04}
      target={OVERVIEW_TARGET}
    />
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Amenity Hotspot Markers — 3D HTML markers placed on the podium/garden   */
/* ══════════════════════════════════════════════════════════════════════════ */

function AmenityHotspots() {
  const activeAmenityId = useAmenityStore((s) => s.activeAmenityId);
  const selectAmenity = useAmenityStore((s) => s.selectAmenity);

  return (
    <group>
      {AMENITIES.map((amenity) => {
        const isActive = activeAmenityId === amenity.id;
        return (
          <Html
            key={amenity.id}
            position={amenity.hotspotPosition}
            center
            distanceFactor={40}
            zIndexRange={[100, 0]}
          >
            <button
              onClick={() => selectAmenity(isActive ? null : amenity.id)}
              className="group relative flex items-center justify-center p-2 focus-visible:outline-none"
              aria-label={`Explore ${amenity.name}`}
            >
              {/* Outer ring */}
              <span
                className={cn(
                  "absolute h-7 w-7 rounded-full border transition-all duration-300",
                  isActive
                    ? "scale-125 border-accent-400 bg-accent-500/25 animate-pulse"
                    : "border-white/60 bg-black/25 group-hover:scale-110 group-hover:border-accent-400"
                )}
              />
              {/* Inner core */}
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors duration-300",
                  isActive ? "bg-accent-400 shadow-md shadow-accent-400/50" : "bg-white group-hover:bg-accent-300"
                )}
              />
              {/* Tooltip */}
              <span className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16em] text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 hidden sm:block">
                {amenity.name}
              </span>
            </button>
          </Html>
        );
      })}
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Amenity Scene — architectural model + environment (reuses proven geo)   */
/* ══════════════════════════════════════════════════════════════════════════ */

function AmenitySceneContent() {
  const setSceneLoaded = useAmenityStore((s) => s.setSceneLoaded);

  useEffect(() => {
    // Signal load complete after first render
    const timer = setTimeout(() => setSceneLoaded(true), 800);
    return () => clearTimeout(timer);
  }, [setSceneLoaded]);

  const wallColor = "#F4F0E8";
  const bronzeColor = "#A3744A";
  const glassColor = "#89ABC2";
  const stiltColor = "#363430";
  const towerPositions: [number, number, number][] = [
    [-18, 0, -5],
    [-6, 0, 0],
    [6, 0, 0],
    [18, 0, -5],
  ];

  return (
    <group>
      {/* Directional sun */}
      <directionalLight
        position={[45, 55, 35]}
        intensity={2.2}
        color="#FFF6EB"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.65} color="#E8F2FB" />
      <hemisphereLight args={["#E8F2FB", "#4A4237", 0.35]} />

      {/* Sky fog */}
      <fogExp2 attach="fog" args={["#E8F1F8", 0.006]} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#EBE7DF" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* 2-acre central garden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, 0.01, 12]} receiveShadow>
        <planeGeometry args={[45, 65]} />
        <meshStandardMaterial color="#2E6B4B" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Garden trees */}
      {[-24, -14, -4, 6, 16, 26].map((z, i) => (
        <group key={i} position={[-26, 0, z + 6]}>
          <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.35, 3, 8]} />
            <meshStandardMaterial color="#4A382A" roughness={0.9} />
          </mesh>
          <mesh position={[0, 4, 0]} castShadow>
            <coneGeometry args={[2.2, 4.5, 8]} />
            <meshStandardMaterial color="#357A57" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Lake surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -75]} receiveShadow>
        <planeGeometry args={[260, 120]} />
        <meshStandardMaterial
          color="#326388"
          roughness={0.2}
          metalness={0.6}
          opacity={0.92}
          transparent
        />
      </mesh>

      {/* Stilt entrance base */}
      <group position={[0, 2.5, 0]}>
        <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[46, 0.4, 18]} />
          <meshStandardMaterial color={wallColor} roughness={0.4} />
        </mesh>
        {[-20, -10, 0, 10, 20].map((x) =>
          [-6, 6].map((z) => (
            <mesh key={`${x}-${z}`} position={[x, 0, z]} castShadow>
              <boxGeometry args={[0.6, 5, 0.6]} />
              <meshStandardMaterial color={stiltColor} roughness={0.3} metalness={0.7} />
            </mesh>
          ))
        )}
      </group>

      {/* 4 Residential Towers */}
      {towerPositions.map((pos, ti) => (
        <group key={ti} position={pos}>
          <mesh position={[0, 15.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[9, 21, 14]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} />
          </mesh>
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
          {Array.from({ length: 10 }).map((_, floor) => (
            <group key={floor} position={[0, 5.5 + floor * 2.1, 0]}>
              <mesh castShadow>
                <boxGeometry args={[9.4, 0.2, 14.4]} />
                <meshStandardMaterial color={bronzeColor} roughness={0.3} metalness={0.6} />
              </mesh>
              <mesh position={[0, -0.3, 8.2]} castShadow receiveShadow>
                <boxGeometry args={[8.4, 0.25, 2.4]} />
                <meshStandardMaterial color={wallColor} roughness={0.4} />
              </mesh>
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

      {/* Clubhouse spine */}
      <group position={[28, 5, -8]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14, 10, 16]} />
          <meshStandardMaterial color={wallColor} roughness={0.4} />
        </mesh>
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
        {/* Rooftop pool deck */}
        <group position={[0, 5.2, 0]}>
          <mesh receiveShadow>
            <boxGeometry args={[12, 0.4, 14]} />
            <meshStandardMaterial color={stiltColor} roughness={0.3} />
          </mesh>
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

      {/* Podium sports deck */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 5.6, 0]} receiveShadow>
        <planeGeometry args={[46, 20]} />
        <meshStandardMaterial color="#C8C0B0" roughness={0.6} />
      </mesh>

      {/* Basketball court markings (approximate) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, 5.65, 14]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#8B6914" roughness={0.7} />
      </mesh>

      {/* Amenity hotspot markers */}
      <AmenityHotspots />

      {/* Camera */}
      <AmenityCameraController />
    </group>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  Exported Canvas                                                          */
/* ══════════════════════════════════════════════════════════════════════════ */

export interface AmenitySceneCanvasProps {
  className?: string;
}

export function AmenitySceneCanvas({ className }: AmenitySceneCanvasProps) {
  return (
    <Canvas
      camera={{
        fov: 42,
        near: 0.5,
        far: 400,
        position: OVERVIEW_POSITION,
      }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      shadows
      className={cn("h-full w-full bg-[#0A120E]", className)}
    >
      <Suspense fallback={null}>
        <AmenitySceneContent />
      </Suspense>
    </Canvas>
  );
}
