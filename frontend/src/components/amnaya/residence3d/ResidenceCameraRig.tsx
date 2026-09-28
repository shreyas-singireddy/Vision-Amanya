"use client";

/**
 * ResidenceCameraRig — Architectural Camera Management.
 *
 * Smoothly interpolates camera positioning based on:
 * 1. Active Camera Preset (Overview, Living, Master Suite, etc.)
 * 2. Room Selection from 2D or 3D
 * 3. OrbitControls for free user inspection
 */

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import type { ArchitecturalResidence } from "../../../types/residence-architecture";
import { useResidenceExplorerStore } from "../../../store/residence-explorer.store";

export interface ResidenceCameraRigProps {
  residence: ArchitecturalResidence;
}

export function ResidenceCameraRig({ residence }: ResidenceCameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();

  const activePresetId = useResidenceExplorerStore((s) => s.activeCameraPreset);
  const selectedRoomId = useResidenceExplorerStore((s) => s.selectedRoomId);

  // Target positions
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 18, 22));
  const targetLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    // 1. If a room is selected and has a custom camera preset, prioritize it
    if (selectedRoomId) {
      const room = residence.rooms.find((r) => r.id === selectedRoomId);
      if (room?.cameraPreset) {
        targetPos.current.set(
          room.cameraPreset.position[0],
          room.cameraPreset.position[1],
          room.cameraPreset.position[2]
        );
        targetLookAt.current.set(
          room.cameraPreset.target[0],
          room.cameraPreset.target[1],
          room.cameraPreset.target[2]
        );
        return;
      }
    }

    // 2. Otherwise use the active camera preset from the residence config
    const preset =
      residence.config3D.cameraPresets.find((p) => p.id === activePresetId) ||
      residence.config3D.cameraPresets[0];

    if (preset) {
      targetPos.current.set(preset.position[0], preset.position[1], preset.position[2]);
      targetLookAt.current.set(preset.target[0], preset.target[1], preset.target[2]);
    }
  }, [selectedRoomId, activePresetId, residence]);

  useFrame((_, delta) => {
    // Smooth dampening towards target camera position
    const step = Math.min(delta * 2.5, 1);
    camera.position.lerp(targetPos.current, step);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, step);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      minDistance={6}
      maxDistance={60}
      maxPolarAngle={Math.PI / 2.1} // Prevent going below floor plane
      minPolarAngle={0.1}
      makeDefault
    />
  );
}
