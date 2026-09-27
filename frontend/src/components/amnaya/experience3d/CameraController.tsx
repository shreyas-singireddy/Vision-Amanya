"use client";

/**
 * CameraController — Architectural camera navigation engine.
 *
 * Smoothly interpolates camera position and OrbitControls target between preset
 * viewpoints (Overview, Building Elevation, Lake View, Clubhouse, Central Garden).
 * Enforces strict architectural bounds to prevent clipping, ground pass-through, or void zooming.
 */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { useReducedMotionPreference } from "@hooks/use-reduced-motion";

import { CAMERA_PRESETS, useExperienceStore } from "./experience-store";

const tempPos = new THREE.Vector3();
const tempTarget = new THREE.Vector3();

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const presetView = useExperienceStore((state) => state.presetView);
  const reduced = useReducedMotionPreference();
  const { camera } = useThree();

  const isTransitioning = useRef(false);

  // Target vectors for lerp
  const targetPos = useRef(new THREE.Vector3(...CAMERA_PRESETS.overview.position));
  const targetLook = useRef(new THREE.Vector3(...CAMERA_PRESETS.overview.target));

  // Whenever presetView changes, set the new lerp target
  useEffect(() => {
    const preset = CAMERA_PRESETS[presetView];
    if (!preset) return;

    targetPos.current.set(...preset.position);
    targetLook.current.set(...preset.target);
    isTransitioning.current = true;

    // Under reduced motion, immediately snap camera position
    if (reduced && controlsRef.current) {
      camera.position.copy(targetPos.current);
      controlsRef.current.target.copy(targetLook.current);
      controlsRef.current.update();
      isTransitioning.current = false;
    }
  }, [presetView, camera, reduced]);

  // Frame interpolation loop
  useFrame((_, delta) => {
    if (!isTransitioning.current || !controlsRef.current || reduced) return;

    const lerpSpeed = Math.min(delta * 3.5, 0.1);

    // Lerp camera position
    tempPos.copy(camera.position).lerp(targetPos.current, lerpSpeed);
    camera.position.copy(tempPos);

    // Lerp orbit target
    tempTarget.copy(controlsRef.current.target).lerp(targetLook.current, lerpSpeed);
    controlsRef.current.target.copy(tempTarget);
    controlsRef.current.update();

    // Check if close enough to stop lerping
    if (
      camera.position.distanceTo(targetPos.current) < 0.1 &&
      controlsRef.current.target.distanceTo(targetLook.current) < 0.1
    ) {
      isTransitioning.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.6}
      zoomSpeed={0.8}
      panSpeed={0.5}
      minDistance={10}
      maxDistance={110}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.04} // Stay above ground plane
      target={CAMERA_PRESETS.overview.target}
    />
  );
}
