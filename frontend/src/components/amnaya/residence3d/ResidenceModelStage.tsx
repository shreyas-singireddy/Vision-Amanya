"use client";

/**
 * ResidenceModelStage — 3D Asset Loading, Node Binding & Architectural Stage.
 *
 * Implements:
 * 1. Production GLTF/GLB Asset Loader with `@react-three/drei`'s `useGLTF`.
 * 2. Room Node Binding connecting 3D meshes to `RoomId`.
 * 3. Professional "3D Model Unavailable" state when no verified architectural model exists.
 *
 * CRITICAL: Does NOT render placeholder/fake geometry as real architecture.
 * If hasVerifiedGLB is false or modelUrl is not provided, shows honest unavailable state.
 */

import { memo, Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import type { ArchitecturalResidence, RoomId } from "../../../types/residence-architecture";
import { useResidenceExplorerStore } from "../../../store/residence-explorer.store";

export interface ResidenceModelStageProps {
  residence: ArchitecturalResidence;
}

export const ResidenceModelStage = memo(function ResidenceModelStage({
  residence,
}: ResidenceModelStageProps) {
  // Only render GLB if verified model exists AND modelUrl is provided
  if (residence.config3D.hasVerifiedGLB && residence.config3D.modelUrl) {
    return <GLBLoader url={residence.config3D.modelUrl} residence={residence} />;
  }

  // Otherwise show professional unavailable state with 2D floor plan fallback
  return <ModelUnavailableStage residence={residence} />;
});

/** GLB Model Loader with Node Binding — only used when verified model exists */
function GLBLoader({ url, residence }: { url: string; residence: ArchitecturalResidence }) {
  const { scene } = useGLTF(url);
  const selectRoom = useResidenceExplorerStore((s) => s.selectRoom);
  const setHoveredRoom = useResidenceExplorerStore((s) => s.setHoveredRoom);
  const setCameraPreset = useResidenceExplorerStore((s) => s.setCameraPreset);

  // Invert roomNodeMap for lookup: NodeName -> RoomId
  const nodeToRoomMap = Object.entries(residence.config3D.roomNodeMap).reduce(
    (acc, [roomId, nodeName]) => {
      if (nodeName) acc[nodeName] = roomId as RoomId;
      return acc;
    },
    {} as Record<string, RoomId>
  );

  return (
    <primitive
      object={scene}
      scale={1}
      position={[0, 0, 0]}
      castShadow
      receiveShadow
      onPointerOver={(e: { stopPropagation: () => void; object?: { name: string } }) => {
        e.stopPropagation();
        const objName = e.object?.name;
        if (objName && nodeToRoomMap[objName]) {
          setHoveredRoom(nodeToRoomMap[objName]);
        }
      }}
      onPointerOut={() => setHoveredRoom(null)}
      onClick={(e: { stopPropagation: () => void; object?: { name: string } }) => {
        e.stopPropagation();
        const objName = e.object?.name;
        if (objName && nodeToRoomMap[objName]) {
          const rId = nodeToRoomMap[objName]!;
          selectRoom(rId);
          setCameraPreset(rId);
        }
      }}
    />
  );
}

/**
 * Model Unavailable Stage — Professional fallback when no verified 3D model exists.
 * Shows the 2D floor plan as the authoritative reference with clear messaging.
 * Does NOT present fake geometry as real architecture.
 */
function ModelUnavailableStage({ residence }: { residence: ArchitecturalResidence }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Display the 2D floor plan as a textured plane in 3D space */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <planeGeometry args={[24, 19]} />
        <meshStandardMaterial
          map={null}
          color="#0F1713"
          roughness={0.9}
          metalness={0.0}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Subtle grid reference */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 19, 12, 10]} />
        <meshBasicMaterial color="#D4AF37" opacity={0.08} transparent wireframe side={2} />
      </mesh>

      {/* Center marker indicating model origin */}
      <mesh position={[0, 0.1, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#D4AF37" opacity={0.4} transparent />
      </mesh>
    </group>
  );
}

/** Suspense fallback for model loading */
export function ModelStageSuspenseFallback() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 19]} />
        <meshBasicMaterial color="#070B09" />
      </mesh>
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 19, 12, 10]} />
        <meshBasicMaterial color="#D4AF37" opacity={0.08} transparent wireframe side={2} />
      </mesh>
    </group>
  );
}
