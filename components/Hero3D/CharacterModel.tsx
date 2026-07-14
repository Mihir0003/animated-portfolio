"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CharacterController } from "./CharacterController";
import { CursorController, TrackingBones } from "./CursorController";

// Error Boundary to catch GLTF loading failures (e.g. 404 file missing)
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
    console.warn("Failed to load GLB model. Displaying silhouette placeholder.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 1. Premium human silhouette placeholder (rendered if no GLB exists)
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

    // Gentle breathing float
    let floatY = Math.sin(time * 1.5) * 0.04;

    if (isIntroPlaying) {
      let jumpY = 0;
      let jumpZ = 0;
      let scaleOffset = 1.0;

      if (introProgress >= 0.55 && introProgress < 0.8) {
        // Jump phase
        const p = (introProgress - 0.55) / 0.25;
        jumpY = Math.sin(p * Math.PI) * 1.3;
        jumpZ = p * 2.5; // fly forward
        scaleOffset = 1.15;
      } else if (introProgress >= 0.8 && introProgress <= 1.0) {
        // Landing squash and settle back
        const p = (introProgress - 0.8) / 0.2;
        const squash = Math.sin(p * Math.PI) * 0.18 * (1 - p);
        groupRef.current.scale.set(1.2 * scaleOffset, (1.2 - squash) * scaleOffset, 1.2 * scaleOffset);
        jumpZ = 2.5 - p * 2.5;
      } else {
        groupRef.current.scale.setScalar(1.2);
      }

      groupRef.current.position.y = -1.25 + floatY + jumpY;
      groupRef.current.position.z = jumpZ;
    } else {
      // Settle scale
      groupRef.current.scale.setScalar(1.2);
      groupRef.current.position.y = -1.25 + floatY;
      groupRef.current.position.z = 0;

      // Pointer rotation parallax
      const targetRotationY = pointerRef.current.x * 0.35;
      const targetRotationX = -pointerRef.current.y * 0.2;

      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotationY, 0.05);

      if (headRef.current) {
        headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, targetRotationY * 0.6, 0.1);
        headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, targetRotationX * 0.6, 0.1);
      }
      if (chestRef.current) {
        chestRef.current.rotation.y = THREE.MathUtils.lerp(chestRef.current.rotation.y, targetRotationY * 0.3, 0.08);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.25, 0]} scale={1.2}>
      {/* Torso/Chest Silhouette Capsule */}
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
      <mesh position={[-0.45, 0.6, 0]} rotation={[0, 0, 0.1]}>
        <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
        <meshBasicMaterial color="#0b1320" />
      </mesh>
      <mesh position={[0.45, 0.6, 0]} rotation={[0, 0, -0.1]}>
        <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
        <meshBasicMaterial color="#0b1320" />
      </mesh>
    </group>
  );
};

// Internal loader component designed to load the GLB and register skeleton tracking
export interface BoneMappings {
  head?: string[];
  neck?: string[];
  chest?: string[];
  spine?: string[];
  eyeLeft?: string[];
  eyeRight?: string[];
}

const defaultBoneMappings: Required<BoneMappings> = {
  head: ["head"],
  neck: ["neck"],
  chest: ["spine2", "chest", "upperchest"],
  spine: ["spine1", "spine", "spine01"],
  eyeLeft: ["eyeleft", "eye_l", "lefteye"],
  eyeRight: ["eyeright", "eye_r", "righteye"],
};

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

    // Instantiate controllers
    const animController = new CharacterController(scene);
    animController.setClips(animations);
    animControllerRef.current = animController;

    const cursorController = new CursorController();
    const bones: TrackingBones = {};

    const activeMappings = { ...defaultBoneMappings, ...boneMappings };

    // Search and register bones relative to target hierarchy
    scene.traverse((node) => {
      if (node.isObject3D) {
        const name = node.name.toLowerCase();

        const matches = (synonyms: string[]) =>
          synonyms.some((syn) => name.includes(syn));

        if (matches(activeMappings.head) && !name.includes("headwear")) {
          bones.head = node;
        } else if (matches(activeMappings.neck)) {
          bones.neck = node;
        } else if (matches(activeMappings.chest)) {
          bones.chest = node;
        } else if (matches(activeMappings.spine)) {
          bones.spine = node;
        } else if (matches(activeMappings.eyeLeft)) {
          bones.eyeLeft = node;
        } else if (matches(activeMappings.eyeRight)) {
          bones.eyeRight = node;
        }
      }
    });

    cursorController.setBones(bones);
    cursorControllerRef.current = cursorController;

    animController.fadeTo("idle", 0);

    return () => {
      animController.destroy();
      animControllerRef.current = null;
      cursorControllerRef.current = null;
    };
  }, [scene, animations, boneMappings]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Update animations
    if (animControllerRef.current) {
      animControllerRef.current.update(delta);
    }

    if (isIntroPlaying) {
      let jumpY = 0;
      let jumpZ = 0;
      let scaleX = 1.2;
      let scaleY = 1.2;
      let scaleZ = 1.2;

      // Trigger intro state animation
      if (animControllerRef.current) {
        animControllerRef.current.fadeTo("intro", 0.3);
      }

      if (introProgress < 0.55) {
        // Idle hover
        groupRef.current.position.y = -1.25 + Math.sin(time * 2.0) * 0.04;
      } else if (introProgress >= 0.55 && introProgress < 0.8) {
        // Jumping up and forward
        const p = (introProgress - 0.55) / 0.25;
        jumpY = Math.sin(p * Math.PI) * 1.5;
        jumpZ = p * 2.6;

        // Stretch perspective
        const stretch = Math.sin(p * Math.PI) * 0.12;
        scaleX = 1.2 * (1 - stretch);
        scaleY = 1.2 * (1 + stretch * 1.5);
        scaleZ = 1.2 * (1 + stretch);
      } else {
        // Landing impact settle
        const p = (introProgress - 0.8) / 0.2;
        const squash = Math.sin(p * Math.PI) * 0.22 * (1 - p);
        scaleX = 1.2 * (1 + squash * 1.1);
        scaleY = 1.2 * (1 - squash * 1.4);
        scaleZ = 1.2 * (1 + squash * 1.1);
        jumpZ = 2.6 - p * 2.6;
      }

      groupRef.current.position.y = -1.25 + jumpY;
      groupRef.current.position.z = jumpZ;
      groupRef.current.scale.set(scaleX, scaleY, scaleZ);
    } else {
      // Interactive cursor track mode
      if (animControllerRef.current) {
        animControllerRef.current.fadeTo("idle", 0.5);
      }

      // Default floating
      groupRef.current.position.y = -1.25 + Math.sin(time * 1.5) * 0.05;
      groupRef.current.position.z = 0;
      groupRef.current.scale.setScalar(1.2);

      // Rotate skeletal bones using CursorController
      if (cursorControllerRef.current) {
        cursorControllerRef.current.update(pointerRef.current, delta);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -1.25, 0]} scale={1.2}>
      <primitive object={scene} />
    </group>
  );
};

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

  // Setup preload to cache GLTF model
  useEffect(() => {
    try {
      useGLTF.preload(modelUrl);
    } catch (e) {}
  }, [modelUrl]);

  return (
    <ModelErrorBoundary
      fallback={
        <SilhouettePlaceholder
          isIntroPlaying={isIntroPlaying}
          introProgress={introProgress}
          pointerRef={pointerRef}
        />
      }
    >
      <GLTFCharacterInner
        modelUrl={modelUrl}
        isIntroPlaying={isIntroPlaying}
        introProgress={introProgress}
        pointerRef={pointerRef}
        animControllerRef={animControllerRef}
        cursorControllerRef={cursorControllerRef}
        boneMappings={boneMappings}
      />
    </ModelErrorBoundary>
  );
};
