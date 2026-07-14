"use client";

import React, { useRef, useEffect, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CharacterController } from "./CharacterController";
import { CursorController, TrackingBones } from "./CursorController";

// ─── Error Boundary ───────────────────────────────────────────────────────────
export class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("[CharacterModel] Failed to load GLB. Showing silhouette.", error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Silhouette Placeholder (rendered when no GLB exists yet) ─────────────────
export const SilhouettePlaceholder: React.FC<{
  isIntroPlaying: boolean;
  introProgress: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ isIntroPlaying, introProgress, pointerRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const chestRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    const floatY = Math.sin(time * 1.5) * 0.04;

    if (isIntroPlaying) {
      let jumpY = 0;
      let jumpZ = 0;
      if (introProgress >= 0.55 && introProgress < 0.8) {
        const p = (introProgress - 0.55) / 0.25;
        jumpY = Math.sin(p * Math.PI) * 1.3;
        jumpZ = p * 2.5;
      } else if (introProgress >= 0.8) {
        const p = (introProgress - 0.8) / 0.2;
        jumpZ = 2.5 - p * 2.5;
        const squash = Math.sin(p * Math.PI) * 0.18 * (1 - p);
        groupRef.current.scale.set(1 + squash * 0.15, 1 - squash, 1 + squash * 0.15);
      } else {
        groupRef.current.scale.setScalar(1);
      }
      groupRef.current.position.y = -1.0 + floatY + jumpY;
      groupRef.current.position.z = jumpZ;
    } else {
      groupRef.current.scale.setScalar(1);
      groupRef.current.position.y = -1.0 + floatY;
      groupRef.current.position.z = 0;

      const ty = pointerRef.current.x * 0.35;
      const tx = -pointerRef.current.y * 0.2;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, 0.05);
      if (headRef.current) {
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, ty * 0.6, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, tx * 0.6, 0.1);
      }
      if (chestRef.current) {
        chestRef.current.rotation.y = THREE.MathUtils.lerp(chestRef.current.rotation.y, ty * 0.3, 0.08);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.0, 0]}>
      {/* Torso */}
      <mesh ref={chestRef} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.3, 0.18, 1.0, 16]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.18, 16]} />
        <meshBasicMaterial color="#090d16" />
      </mesh>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color="#111c2a" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.45, 0.6, 0]}>
        <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
        <meshBasicMaterial color="#0b1320" />
      </mesh>
      <mesh position={[0.45, 0.6, 0]}>
        <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
        <meshBasicMaterial color="#0b1320" />
      </mesh>
    </group>
  );
};

// ─── Bone Mappings Config ─────────────────────────────────────────────────────
export interface BoneMappings {
  head?: string[];
  neck?: string[];
  chest?: string[];
  spine?: string[];
  eyeLeft?: string[];
  eyeRight?: string[];
}

const defaultBoneMappings: Required<BoneMappings> = {
  // Covers: Mixamo, Ready Player Me, Blender Rigify, manual rig naming
  head: ["head", "mixamorighead", "bip001_head", "head_jnt"],
  neck: ["neck", "mixamoriigneck", "neck_jnt", "bip001_neck"],
  chest: ["spine2", "chest", "upperchest", "spine_02", "mixamorigspine2", "bip001_spine2", "spine_top"],
  spine: ["spine1", "spine", "spine_01", "mixamorigspine1", "bip001_spine1", "spine_mid"],
  eyeLeft: ["eyeleft", "eye_l", "lefteye", "mixamoriglefteyelid", "eye.l"],
  eyeRight: ["eyeright", "eye_r", "righteye", "mixamorigrighteyelid", "eye.r"],
};

// ─── GLTFCharacterInner ───────────────────────────────────────────────────────
// This component is wrapped in Suspense so useGLTF suspends correctly.
const GLTFCharacterInner: React.FC<{
  modelUrl: string;
  isIntroPlaying: boolean;
  introProgress: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  animControllerRef: React.MutableRefObject<CharacterController | null>;
  cursorControllerRef: React.MutableRefObject<CursorController | null>;
  boneMappings?: BoneMappings;
}> = ({
  modelUrl,
  isIntroPlaying,
  introProgress,
  pointerRef,
  animControllerRef,
  cursorControllerRef,
  boneMappings,
}) => {
  const { scene, animations } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!scene) return;

    // ── Shadow + material traversal ───────────────────────────────────────
    scene.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        const mesh = node as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.frustumCulled = false;

        // Fix materials to avoid Z-fighting black lines
        const fixMaterial = (mat: THREE.Material) => {
          mat.depthWrite = true;
          mat.needsUpdate = true;
          // If material is double-sided (common source of black lines), keep it but fix polygonOffset
          if ((mat as any).side === THREE.DoubleSide) {
            (mat as any).polygonOffset = true;
            (mat as any).polygonOffsetFactor = -1;
            (mat as any).polygonOffsetUnits = -1;
          }
        };

        if (Array.isArray(mesh.material)) {
          mesh.material.forEach(fixMaterial);
        } else if (mesh.material) {
          fixMaterial(mesh.material as THREE.Material);
        }
      }
    });

    // ── Animation controller ──────────────────────────────────────────────
    const animController = new CharacterController(scene);
    animController.setClips(animations);
    animControllerRef.current = animController;

    // Try playing idle first; if not found, play first available clip
    const didPlay = animController.fadeTo("idle", 0);
    if (!didPlay && animations.length > 0) {
      animController.fadeToClipByIndex(0, 0);
    }

    // ── Cursor controller ─────────────────────────────────────────────────
    const cursorController = new CursorController();
    const bones: TrackingBones = {};
    const activeMappings = { ...defaultBoneMappings, ...boneMappings };

    scene.traverse((node) => {
      if (!node.isObject3D) return;
      const name = node.name.toLowerCase().replace(/[\s\-\.]/g, "");
      const matches = (synonyms: string[]) =>
        synonyms.some((syn) => name.includes(syn.toLowerCase().replace(/[\s\-\.]/g, "")));

      // Priority ordering: more specific checks first
      if (matches(activeMappings.eyeLeft)) {
        bones.eyeLeft = node;
      } else if (matches(activeMappings.eyeRight)) {
        bones.eyeRight = node;
      } else if (matches(activeMappings.head) && !name.includes("headwear") && !name.includes("hair")) {
        bones.head = node;
      } else if (matches(activeMappings.neck)) {
        bones.neck = node;
      } else if (matches(activeMappings.chest)) {
        bones.chest = node;
      } else if (matches(activeMappings.spine)) {
        bones.spine = node;
      }
    });

    console.log("[CharacterModel] Bones found:", Object.keys(bones));
    console.log("[CharacterModel] Animations found:", animations.map(a => a.name));

    cursorController.setBones(bones);
    cursorControllerRef.current = cursorController;

    return () => {
      animController.destroy();
      animControllerRef.current = null;
      cursorControllerRef.current = null;
    };
  }, [scene, animations, boneMappings]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // ── Update animation mixer ────────────────────────────────────────────
    animControllerRef.current?.update(delta);

    if (isIntroPlaying) {
      let jumpY = 0;
      let jumpZ = 0;
      let scaleX = 1, scaleY = 1, scaleZ = 1;

      // Try to use the intro / jump clip if available
      animControllerRef.current?.fadeTo("intro", 0.3);

      if (introProgress < 0.55) {
        // Gentle pre-intro float
        groupRef.current.position.y = -1.0 + Math.sin(time * 2.0) * 0.04;
      } else if (introProgress >= 0.55 && introProgress < 0.8) {
        // Jump phase
        const p = (introProgress - 0.55) / 0.25;
        jumpY = Math.sin(p * Math.PI) * 1.5;
        jumpZ = p * 2.6;
        const stretch = Math.sin(p * Math.PI) * 0.12;
        scaleX = 1 - stretch;
        scaleY = 1 + stretch * 1.5;
        scaleZ = 1 + stretch;
      } else {
        // Land + squash phase
        const p = (introProgress - 0.8) / 0.2;
        const squash = Math.sin(p * Math.PI) * 0.22 * (1 - p);
        scaleX = 1 + squash * 1.1;
        scaleY = 1 - squash * 1.4;
        scaleZ = 1 + squash * 1.1;
        jumpZ = 2.6 - p * 2.6;
      }

      groupRef.current.position.y = -1.0 + jumpY;
      groupRef.current.position.z = jumpZ;
      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
    } else {
      // ── Interactive cursor-follow mode ────────────────────────────────────
      animControllerRef.current?.fadeTo("idle", 0.5);

      // Gentle breathing float
      groupRef.current.position.y = -1.0 + Math.sin(time * 1.5) * 0.05;
      groupRef.current.position.z = 0;
      groupRef.current.scale.setScalar(1);

      // Bone cursor tracking
      cursorControllerRef.current?.update(pointerRef.current, delta);
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.0, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// ─── Loading Fallback (inside canvas) ────────────────────────────────────────
const LoadingFallback: React.FC = () => null; // Canvas renders nothing during Suspense

// ─── Public CharacterModel Component ─────────────────────────────────────────
interface CharacterModelProps {
  modelUrl: string;
  isIntroPlaying: boolean;
  introProgress: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  boneMappings?: BoneMappings;
}

export const CharacterModel: React.FC<CharacterModelProps> = ({
  modelUrl,
  isIntroPlaying,
  introProgress,
  pointerRef,
  boneMappings,
}) => {
  const animControllerRef = useRef<CharacterController | null>(null);
  const cursorControllerRef = useRef<CursorController | null>(null);

  const silhouette = (
    <SilhouettePlaceholder
      isIntroPlaying={isIntroPlaying}
      introProgress={introProgress}
      pointerRef={pointerRef}
    />
  );

  return (
    <ModelErrorBoundary fallback={silhouette}>
      <Suspense fallback={<LoadingFallback />}>
        <GLTFCharacterInner
          modelUrl={modelUrl}
          isIntroPlaying={isIntroPlaying}
          introProgress={introProgress}
          pointerRef={pointerRef}
          animControllerRef={animControllerRef}
          cursorControllerRef={cursorControllerRef}
          boneMappings={boneMappings}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
};
