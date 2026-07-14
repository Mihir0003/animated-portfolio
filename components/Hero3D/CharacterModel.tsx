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
    console.warn("[Hero3D] GLB failed to load — silhouette displayed.", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

// ─── Silhouette Placeholder ───────────────────────────────────────────────────
export const SilhouettePlaceholder: React.FC<{
  introProgress: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ introProgress, pointerRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!groupRef.current || !matRef.current) return;
    const time = state.clock.getElapsedTime();
    // Fade in with intro
    matRef.current.opacity = Math.min(introProgress / 0.45, 1);
    // Gentle breathing float
    groupRef.current.position.y = Math.sin(time * 1.4) * 0.03;
    // Pointer rotation
    const ty = pointerRef.current.x * 0.3;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      ty,
      0.05
    );
  });

  const sharedMat = (
    <meshStandardMaterial
      ref={matRef}
      color="#1a2a40"
      roughness={0.4}
      metalness={0.3}
      transparent
      opacity={0}
    />
  );

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.28, 0.18, 1.0, 20]} />
        {sharedMat}
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.18, 16]} />
        {sharedMat}
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.23, 32, 32]} />
        {sharedMat}
      </mesh>
      {/* Left arm */}
      <mesh position={[-0.44, 0.58, 0]} rotation={[0, 0, 0.08]}>
        <capsuleGeometry args={[0.085, 0.6, 8, 16]} />
        {sharedMat}
      </mesh>
      {/* Right arm */}
      <mesh position={[0.44, 0.58, 0]} rotation={[0, 0, -0.08]}>
        <capsuleGeometry args={[0.085, 0.6, 8, 16]} />
        {sharedMat}
      </mesh>
      {/* Left leg */}
      <mesh position={[-0.16, -0.22, 0]}>
        <capsuleGeometry args={[0.1, 0.62, 8, 16]} />
        {sharedMat}
      </mesh>
      {/* Right leg */}
      <mesh position={[0.16, -0.22, 0]}>
        <capsuleGeometry args={[0.1, 0.62, 8, 16]} />
        {sharedMat}
      </mesh>
    </group>
  );
};

// ─── Bone Mappings ────────────────────────────────────────────────────────────
export interface BoneMappings {
  head?: string[];
  neck?: string[];
  chest?: string[];
  spine?: string[];
  eyeLeft?: string[];
  eyeRight?: string[];
}

// Covers Mixamo, Ready Player Me, Blender Rigify, BIP, and custom rigs
const DEFAULT_BONE_MAPPINGS: Required<BoneMappings> = {
  head: [
    "head", "mixamorighead", "bip001_head", "head_jnt",
    "head_bone", "bone_head", "cc_base_head",
  ],
  neck: [
    "neck", "mixamoriigneck", "neck_jnt", "bip001_neck",
    "neck_bone", "bone_neck", "cc_base_necktwist01",
  ],
  chest: [
    "spine2", "chest", "upperchest", "spine_02",
    "mixamorigspine2", "bip001_spine2", "spine_top",
    "cc_base_spine02", "upperarm",
  ],
  spine: [
    "spine1", "spine", "spine_01", "mixamorigspine1",
    "bip001_spine1", "spine_mid", "cc_base_spine01",
  ],
  eyeLeft: [
    "eyeleft", "eye_l", "lefteye", "mixamoriglefteyelid",
    "eye.l", "l_eye", "left_eye", "cc_base_r_eye",
  ],
  eyeRight: [
    "eyeright", "eye_r", "righteye", "mixamorigrighteyelid",
    "eye.r", "r_eye", "right_eye", "cc_base_l_eye",
  ],
};

// ─── Opacity Helper ───────────────────────────────────────────────────────────
function setSceneOpacity(scene: THREE.Object3D, opacity: number) {
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];
    mats.forEach((m) => {
      if (!m) return;
      (m as THREE.MeshStandardMaterial).transparent = true;
      (m as THREE.MeshStandardMaterial).opacity = opacity;
    });
  });
}

// ─── GLTFCharacterInner ───────────────────────────────────────────────────────
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
  const opacityRef = useRef(0);
  const interactiveRef = useRef(false);

  useEffect(() => {
    if (!scene) return;

    // ── Material setup ─────────────────────────────────────────────────────
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;

      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((mat) => {
        if (!mat) return;
        const m = mat as THREE.MeshStandardMaterial;
        m.depthWrite = true;
        m.needsUpdate = true;
        // Fix Z-fighting on double-sided materials
        if (m.side === THREE.DoubleSide) {
          m.polygonOffset = true;
          m.polygonOffsetFactor = -1;
          m.polygonOffsetUnits = -1;
        }
      });
    });

    // Start fully transparent — fade in during intro
    setSceneOpacity(scene, 0);
    opacityRef.current = 0;
    interactiveRef.current = false;

    // ── Animation controller ───────────────────────────────────────────────
    const animCtrl = new CharacterController(scene);
    animCtrl.setClips(animations);
    animControllerRef.current = animCtrl;

    // Play idle if available, else fallback to first clip
    if (!animCtrl.fadeTo("idle", 0) && animations.length > 0) {
      animCtrl.fadeToClipByIndex(0, 0);
    }

    console.log("[Hero3D] States:", animCtrl.getAvailableStates());

    // ── Cursor / bone controller ───────────────────────────────────────────
    const cursorCtrl = new CursorController();
    const bones: TrackingBones = {};
    const active = { ...DEFAULT_BONE_MAPPINGS, ...boneMappings };

    scene.traverse((node) => {
      if (!node.isObject3D) return;
      const raw = node.name.toLowerCase().replace(/[\s\-\.]/g, "");
      const matches = (syns: string[]) =>
        syns.some((s) => raw.includes(s.replace(/[\s\-\.]/g, "")));

      if (matches(active.eyeLeft))  bones.eyeLeft  = node;
      else if (matches(active.eyeRight)) bones.eyeRight = node;
      else if (
        matches(active.head) &&
        !raw.includes("headwear") &&
        !raw.includes("hair")
      )
        bones.head = node;
      else if (matches(active.neck))  bones.neck  = node;
      else if (matches(active.chest)) bones.chest = node;
      else if (matches(active.spine)) bones.spine = node;
    });

    console.log("[Hero3D] Bones found:", Object.keys(bones));
    cursorCtrl.setBones(bones);
    cursorControllerRef.current = cursorCtrl;

    return () => {
      animCtrl.destroy();
      animControllerRef.current = null;
      cursorControllerRef.current = null;
      interactiveRef.current = false;
    };
  }, [scene, animations, boneMappings]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Always update animation mixer
    animControllerRef.current?.update(delta);

    // ── INTRO SEQUENCE ───────────────────────────────────────────────────────
    if (isIntroPlaying) {
      interactiveRef.current = false;

      let targetOpacity = 0;

      if (introProgress <= 0.45) {
        // Phase 1: Fade in + rise from below
        const p = introProgress / 0.45;
        const ease = 1 - Math.pow(1 - p, 2); // ease-out quad
        targetOpacity = ease;
        groupRef.current.position.y = -0.4 * (1 - ease);
      } else if (introProgress <= 0.75) {
        // Phase 2: Breathing idle
        targetOpacity = 1;
        groupRef.current.position.y = Math.sin(time * 1.4) * 0.025;
        animControllerRef.current?.fadeTo("idle", 0.8);
      } else {
        // Phase 3: Settle to interactive
        targetOpacity = 1;
        groupRef.current.position.y = Math.sin(time * 1.4) * 0.03;
      }

      // Smooth opacity ramp (lerp per-frame)
      opacityRef.current = THREE.MathUtils.lerp(
        opacityRef.current,
        targetOpacity,
        Math.min(delta * 3, 1)
      );
      setSceneOpacity(scene, opacityRef.current);

      groupRef.current.position.x = 0;
      groupRef.current.position.z = 0;
      groupRef.current.scale.setScalar(1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        0.08
      );

    // ── INTERACTIVE MODE ─────────────────────────────────────────────────────
    } else {
      if (!interactiveRef.current) {
        // First frame of interactive — ensure opacity=1
        interactiveRef.current = true;
        opacityRef.current = 1;
        setSceneOpacity(scene, 1);
        animControllerRef.current?.fadeTo("idle", 0.5);
      }

      // Breathing float
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        0,
        0.06
      );
      groupRef.current.position.y = Math.sin(time * 1.4) * 0.03;
      groupRef.current.position.z = 0;
      groupRef.current.scale.setScalar(1);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        0.06
      );

      // Bone cursor follow
      cursorControllerRef.current?.update(pointerRef.current, delta);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// ─── Public CharacterModel ────────────────────────────────────────────────────
export interface CharacterModelProps {
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

  return (
    <ModelErrorBoundary
      fallback={
        <SilhouettePlaceholder
          introProgress={introProgress}
          pointerRef={pointerRef}
        />
      }
    >
      <Suspense fallback={null}>
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
