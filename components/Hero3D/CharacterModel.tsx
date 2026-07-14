"use client";

import React, { useRef, useEffect, useState, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { CharacterController } from "./CharacterController";
import { CursorController, TrackingBones } from "./CursorController";
import { TimelineConfig, DEFAULT_TIMELINE_CONFIG } from "./HeroTimeline";

export interface BoneMappings {
  head?: string[];
  neck?: string[];
  chest?: string[];
  spine?: string[];
  eyeLeft?: string[];
  eyeRight?: string[];
}

export interface AdditionalBones extends TrackingBones {
  hips?: THREE.Object3D;
  leftUpLeg?: THREE.Object3D;
  rightUpLeg?: THREE.Object3D;
  leftLeg?: THREE.Object3D;
  rightLeg?: THREE.Object3D;
  leftShoulder?: THREE.Object3D;
  rightShoulder?: THREE.Object3D;
  leftUpperArm?: THREE.Object3D;
  rightUpperArm?: THREE.Object3D;
  leftForeArm?: THREE.Object3D;
  rightForeArm?: THREE.Object3D;
}

// ─── Model Error Boundary with URL fallback logic ────────────────────────────
export class ModelErrorBoundary extends React.Component<
  {
    fallback: React.ReactNode;
    children: React.ReactNode;
    currentUrl: string;
    onTryNextUrl: () => void;
  },
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
    console.warn(`[Hero3D] Failed to load GLB: ${this.props.currentUrl}. Trying next...`, error);
    this.props.onTryNextUrl();
  }

  componentDidUpdate(prevProps: any) {
    if (prevProps.currentUrl !== this.props.currentUrl) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ─── Silhouette Placeholder (shown while loading or if model is missing) ──────
export const SilhouettePlaceholder: React.FC<{
  introProgress: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}> = ({ introProgress, pointerRef }) => {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!groupRef.current || !matRef.current) return;
    const time = state.clock.getElapsedTime();
    matRef.current.opacity = Math.min(introProgress / 0.15, 1);
    groupRef.current.position.y = -0.9 + Math.sin(time * 1.4) * 0.03;
    const ty = pointerRef.current.x * 0.25;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, ty, 0.05);
  });

  const sharedMat = (
    <meshStandardMaterial
      ref={matRef}
      color="#0f172a"
      roughness={0.5}
      metalness={0.1}
      transparent
      opacity={0}
    />
  );

  return (
    <group ref={groupRef}>
      {/* Torso */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.26, 0.16, 1.0, 16]} />
        {sharedMat}
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.18, 12]} />
        {sharedMat}
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        {sharedMat}
      </mesh>
      {/* Arms */}
      <mesh position={[-0.42, 0.6, 0]} rotation={[0, 0, 0.08]}>
        <capsuleGeometry args={[0.08, 0.55, 8, 16]} />
        {sharedMat}
      </mesh>
      <mesh position={[0.42, 0.6, 0]} rotation={[0, 0, -0.08]}>
        <capsuleGeometry args={[0.08, 0.55, 8, 16]} />
        {sharedMat}
      </mesh>
      {/* Legs */}
      <mesh position={[-0.15, -0.2, 0]}>
        <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
        {sharedMat}
      </mesh>
      <mesh position={[0.15, -0.2, 0]}>
        <capsuleGeometry args={[0.09, 0.6, 8, 16]} />
        {sharedMat}
      </mesh>
    </group>
  );
};

// ─── Default bone mapping rules ──────────────────────────────────────────────
const DEFAULT_BONE_MAPPINGS = {
  head: ["head", "mixamorighead", "bip001_head", "head_jnt", "head_bone", "cc_base_head"],
  neck: ["neck", "mixamoriigneck", "neck_jnt", "bip001_neck", "neck_bone", "cc_base_necktwist01"],
  chest: ["spine2", "chest", "upperchest", "spine_02", "mixamorigspine2", "bip001_spine2", "cc_base_spine02"],
  spine: ["spine1", "spine", "spine_01", "mixamorigspine1", "bip001_spine1", "cc_base_spine01"],
  eyeLeft: ["eyeleft", "eye_l", "lefteye", "mixamoriglefteyelid", "eye.l", "cc_base_l_eye"],
  eyeRight: ["eyeright", "eye_r", "righteye", "mixamorigrighteyelid", "eye.r", "cc_base_r_eye"],
};

function setSceneOpacity(scene: THREE.Object3D, opacity: number) {
  scene.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
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
  timelineConfig: TimelineConfig;
  onModelLoaded?: (dims: {
    height: number;
    width: number;
    depth: number;
    center: THREE.Vector3;
    minY: number;
    maxY: number;
  }) => void;
}> = ({
  modelUrl,
  isIntroPlaying,
  introProgress,
  pointerRef,
  animControllerRef,
  cursorControllerRef,
  boneMappings,
  timelineConfig,
  onModelLoaded,
}) => {
  const { scene, animations } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);
  const faceMeshesRef = useRef<THREE.Mesh[]>([]);
  const bonesRef = useRef<AdditionalBones>({});
  const opacityRef = useRef(0);
  const initialHipsYRef = useRef<number | null>(null);

  // Periodic blink values
  const blinkTimeRef = useRef(0);
  const blinkDurationRef = useRef(0.15);
  const nextBlinkInRef = useRef(3.0);

  const hasSittingAnim = useMemo(() => {
    return animations.some((anim) => {
      const name = anim.name.toLowerCase();
      return (
        name.includes("sit") ||
        name.includes("lie") ||
        name.includes("relax") ||
        name.includes("recline") ||
        name.includes("couch")
      );
    });
  }, [animations]);

  useEffect(() => {
    if (!scene) return;

    // ── 1. Calculate Bounding Box of original model ─────────────────────────
    const originalBox = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    originalBox.getSize(size);
    const center = new THREE.Vector3();
    originalBox.getCenter(center);

    const rawHeight = size.y;
    const rawWidth = size.x;
    const rawDepth = size.z;

    console.log(`[Hero3D] Loaded ${modelUrl}. Size:`, size, "Center:", center);

    // ── 2. Normalize scale & align feet to ground Y = -0.9 ───────────────────
    const TARGET_HEIGHT = 1.8; // Standarized height for all GLBs
    const scaleFactor = TARGET_HEIGHT / rawHeight;
    scene.scale.setScalar(scaleFactor);

    // Reposition scene root so bottom of model lies at local -0.9 and is centered
    const localMinY = originalBox.min.y * scaleFactor;
    const localCenter = center.clone().multiplyScalar(scaleFactor);

    scene.position.x = -localCenter.x;
    scene.position.y = -0.9 - localMinY; // Feet touch the Y = -0.9 plane
    scene.position.z = -localCenter.z;

    // Pass dimensions back to CharacterCanvas / CameraRig
    if (onModelLoaded) {
      onModelLoaded({
        height: TARGET_HEIGHT,
        width: rawWidth * scaleFactor,
        depth: rawDepth * scaleFactor,
        center: new THREE.Vector3(0, 0, 0),
        minY: -0.9,
        maxY: 0.9,
      });
    }

    // ── 3. Traverse materials & shadows ──────────────────────────────────────
    const faceMeshes: THREE.Mesh[] = [];
    scene.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.frustumCulled = false;

      // Keep track of meshes with facial morph targets
      if (mesh.morphTargetDictionary) {
        faceMeshes.push(mesh);
      }

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        if (!m) return;
        m.depthWrite = true;
        m.needsUpdate = true;
        if ((m as any).side === THREE.DoubleSide) {
          (m as any).polygonOffset = true;
          (m as any).polygonOffsetFactor = -1;
          (m as any).polygonOffsetUnits = -1;
        }
      });
    });
    faceMeshesRef.current = faceMeshes;

    // Start invisible
    setSceneOpacity(scene, 0);
    opacityRef.current = 0;

    // ── 4. Animation setup ───────────────────────────────────────────────────
    const animCtrl = new CharacterController(scene);
    animCtrl.setClips(animations);
    animControllerRef.current = animCtrl;
    if (!animCtrl.fadeTo("idle", 0) && animations.length > 0) {
      animCtrl.fadeToClipByIndex(0, 0);
    }

    // ── 5. Skeleton Discovery ────────────────────────────────────────────────
    const cursorCtrl = new CursorController();
    const bones: AdditionalBones = {};
    const active = { ...DEFAULT_BONE_MAPPINGS, ...boneMappings };

    scene.traverse((node) => {
      if (!node.isObject3D) return;
      const raw = node.name.toLowerCase().replace(/[\s\-\.]/g, "");
      const matches = (syns: string[]) =>
        syns.some((s) => raw.includes(s.replace(/[\s\-\.]/g, "")));

      if (matches(active.eyeLeft))  bones.eyeLeft  = node;
      else if (matches(active.eyeRight)) bones.eyeRight = node;
      else if (matches(active.head) && !raw.includes("headwear") && !raw.includes("hair"))
        bones.head = node;
      else if (matches(active.neck))  bones.neck  = node;
      else if (matches(active.chest)) bones.chest = node;
      else if (matches(active.spine)) bones.spine = node;
      
      // Shoulders
      else if (raw.includes("leftshoulder") || raw.includes("shoulderl") || raw.includes("shoulder_l"))
        bones.leftShoulder = node;
      else if (raw.includes("rightshoulder") || raw.includes("shoulderr") || raw.includes("shoulder_r"))
        bones.rightShoulder = node;
      
      // Upper arms
      else if (raw.includes("leftupperarm") || raw.includes("leftarm") || raw.includes("arm_l") || raw.includes("upperarm_l"))
        bones.leftUpperArm = node;
      else if (raw.includes("rightupperarm") || raw.includes("rightarm") || raw.includes("arm_r") || raw.includes("upperarm_r"))
        bones.rightUpperArm = node;

      // Forearms
      else if (raw.includes("leftforearm") || raw.includes("forearm_l") || raw.includes("forearml"))
        bones.leftForeArm = node;
      else if (raw.includes("rightforearm") || raw.includes("forearm_r") || raw.includes("forearmr"))
        bones.rightForeArm = node;
      
      // Hips / Pelvis
      else if (raw.includes("hips") || raw === "hip" || raw.includes("pelvis") || raw.includes("cc_base_hip"))
        bones.hips = node;

      // Legs (Thighs)
      else if (raw.includes("leftupleg") || raw.includes("upleg_l") || raw.includes("l_upleg") || raw.includes("thigh_l") || raw.includes("leftthigh") || raw.includes("cc_base_l_thigh"))
        bones.leftUpLeg = node;
      else if (raw.includes("rightupleg") || raw.includes("upleg_r") || raw.includes("r_upleg") || raw.includes("thigh_r") || raw.includes("rightthigh") || raw.includes("cc_base_r_thigh"))
        bones.rightUpLeg = node;

      // Legs (Calves / Knees)
      else if (raw.includes("leftleg") || raw.includes("leg_l") || raw.includes("l_leg") || raw.includes("shin_l") || raw.includes("leftshin") || raw.includes("cc_base_l_calf"))
        bones.leftLeg = node;
      else if (raw.includes("rightleg") || raw.includes("leg_r") || raw.includes("r_leg") || raw.includes("shin_r") || raw.includes("rightshin") || raw.includes("cc_base_r_calf"))
        bones.rightLeg = node;
    });

    if (bones.hips) {
      initialHipsYRef.current = bones.hips.position.y;
    }

    bonesRef.current = bones;
    cursorCtrl.setBones(bones);
    cursorControllerRef.current = cursorCtrl;

    return () => {
      animCtrl.destroy();
      animControllerRef.current = null;
      cursorControllerRef.current = null;
      bonesRef.current = {};
      initialHipsYRef.current = null;
    };
  }, [scene, animations, boneMappings]);

  // Sets facial morph weights dynamically
  const setMorphWeight = (name: string, weight: number) => {
    faceMeshesRef.current.forEach((mesh) => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      const keys = Object.keys(mesh.morphTargetDictionary);
      const key = keys.find((k) => k.toLowerCase().includes(name.toLowerCase()));
      if (key !== undefined) {
        const index = mesh.morphTargetDictionary[key];
        mesh.morphTargetInfluences[index] = weight;
      }
    });
  };

  // Procedural reclining pose (Awwwards Potato Designer style)
  const applyRecliningPose = (delta: number, time: number) => {
    const bones = bonesRef.current;
    if (!bones) return;

    // Hips tilted sideways and back
    if (bones.hips) {
      bones.hips.rotation.x = THREE.MathUtils.damp(bones.hips.rotation.x, -0.3, 2.5, delta);
      bones.hips.rotation.y = THREE.MathUtils.damp(bones.hips.rotation.y, 0.4, 2.5, delta);
      bones.hips.rotation.z = THREE.MathUtils.damp(bones.hips.rotation.z, -0.6, 2.5, delta);
      
      const baseHipsY = initialHipsYRef.current !== null ? initialHipsYRef.current : bones.hips.position.y;
      bones.hips.position.y = baseHipsY + Math.sin(time * 1.4) * 0.025;
    }

    // Spine and Chest counter-rotating upwards to face the camera
    if (bones.spine) {
      bones.spine.rotation.x = THREE.MathUtils.damp(bones.spine.rotation.x, 0.15 + Math.sin(time * 1.4) * 0.01, 2.5, delta);
      bones.spine.rotation.y = THREE.MathUtils.damp(bones.spine.rotation.y, -0.2, 2.5, delta);
      bones.spine.rotation.z = THREE.MathUtils.damp(bones.spine.rotation.z, 0.25, 2.5, delta);
    }
    if (bones.chest) {
      bones.chest.rotation.x = THREE.MathUtils.damp(bones.chest.rotation.x, 0.2 + Math.sin(time * 1.4) * 0.015, 2.5, delta);
      bones.chest.rotation.y = THREE.MathUtils.damp(bones.chest.rotation.y, -0.15, 2.5, delta);
      bones.chest.rotation.z = THREE.MathUtils.damp(bones.chest.rotation.z, 0.2, 2.5, delta);
    }

    // Left Arm: propping up the body
    if (bones.leftShoulder) {
      bones.leftShoulder.rotation.z = THREE.MathUtils.damp(bones.leftShoulder.rotation.z, -0.15, 2.5, delta);
    }
    if (bones.leftUpperArm) {
      bones.leftUpperArm.rotation.x = THREE.MathUtils.damp(bones.leftUpperArm.rotation.x, 0.3, 2.5, delta);
      bones.leftUpperArm.rotation.y = THREE.MathUtils.damp(bones.leftUpperArm.rotation.y, -0.2, 2.5, delta);
      bones.leftUpperArm.rotation.z = THREE.MathUtils.damp(bones.leftUpperArm.rotation.z, -0.7, 2.5, delta);
    }
    if (bones.leftForeArm) {
      bones.leftForeArm.rotation.y = THREE.MathUtils.damp(bones.leftForeArm.rotation.y, 0.8, 2.5, delta);
    }

    // Right Arm: resting casually
    if (bones.rightShoulder) {
      bones.rightShoulder.rotation.z = THREE.MathUtils.damp(bones.rightShoulder.rotation.z, 0.15, 2.5, delta);
    }
    if (bones.rightUpperArm) {
      bones.rightUpperArm.rotation.x = THREE.MathUtils.damp(bones.rightUpperArm.rotation.x, -0.15, 2.5, delta);
      bones.rightUpperArm.rotation.y = THREE.MathUtils.damp(bones.rightUpperArm.rotation.y, 0.1, 2.5, delta);
      bones.rightUpperArm.rotation.z = THREE.MathUtils.damp(bones.rightUpperArm.rotation.z, 0.6, 2.5, delta);
    }
    if (bones.rightForeArm) {
      bones.rightForeArm.rotation.y = THREE.MathUtils.damp(bones.rightForeArm.rotation.y, -0.3, 2.5, delta);
    }

    // Legs (left extended, right bent)
    if (bones.leftUpLeg) {
      bones.leftUpLeg.rotation.x = THREE.MathUtils.damp(bones.leftUpLeg.rotation.x, 0.3, 2.5, delta);
      bones.leftUpLeg.rotation.y = THREE.MathUtils.damp(bones.leftUpLeg.rotation.y, -0.2, 2.5, delta);
      bones.leftUpLeg.rotation.z = THREE.MathUtils.damp(bones.leftUpLeg.rotation.z, 0.1, 2.5, delta);
    }
    if (bones.rightUpLeg) {
      bones.rightUpLeg.rotation.x = THREE.MathUtils.damp(bones.rightUpLeg.rotation.x, -0.5, 2.5, delta);
      bones.rightUpLeg.rotation.y = THREE.MathUtils.damp(bones.rightUpLeg.rotation.y, 0.3, 2.5, delta);
      bones.rightUpLeg.rotation.z = THREE.MathUtils.damp(bones.rightUpLeg.rotation.z, 0.4, 2.5, delta);
    }
    if (bones.leftLeg) {
      bones.leftLeg.rotation.x = THREE.MathUtils.damp(bones.leftLeg.rotation.x, 0.05, 2.5, delta);
    }
    if (bones.rightLeg) {
      bones.rightLeg.rotation.x = THREE.MathUtils.damp(bones.rightLeg.rotation.x, 1.1, 2.5, delta);
    }
  };

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Update animations
    animControllerRef.current?.update(delta);

    // ── 1. Intro Animation Sequencing ───────────────────────────────────────
    if (isIntroPlaying) {
      let targetOpacity = 0;
      let posY = -0.9;

      if (introProgress <= timelineConfig.fadeInEnd) {
        // Fade in + rise up slightly
        const p = introProgress / timelineConfig.fadeInEnd;
        const ease = 1 - Math.pow(1 - p, 2);
        targetOpacity = ease;
        posY = -1.2 + 0.3 * ease;
      } else if (introProgress <= timelineConfig.riseEnd) {
        targetOpacity = 1.0;
        posY = -0.9;
      } else if (introProgress <= timelineConfig.breathEnd) {
        targetOpacity = 1.0;
        posY = -0.9 + Math.sin(time * 1.4) * 0.02;
        if (hasSittingAnim) animControllerRef.current?.fadeTo("sit", 0.6);
      } else if (introProgress <= timelineConfig.blinkEnd) {
        targetOpacity = 1.0;
        posY = -0.9 + Math.sin(time * 1.4) * 0.02;
        // Blink eyes during this phase
        const p = (introProgress - timelineConfig.breathEnd) / (timelineConfig.blinkEnd - timelineConfig.breathEnd);
        const blinkVal = Math.sin(p * Math.PI) * 0.95;
        setMorphWeight("blink", blinkVal);
      } else if (introProgress <= timelineConfig.lookEnd) {
        targetOpacity = 1.0;
        posY = -0.9 + Math.sin(time * 1.4) * 0.02;
        setMorphWeight("blink", 0);
        // Look toward visitor: align head to look straight forward
        if (bonesRef.current.head) {
          bonesRef.current.head.rotation.y = THREE.MathUtils.lerp(bonesRef.current.head.rotation.y, 0, 0.08);
          bonesRef.current.head.rotation.x = THREE.MathUtils.lerp(bonesRef.current.head.rotation.x, 0, 0.08);
        }
      } else if (introProgress <= timelineConfig.smileEnd) {
        targetOpacity = 1.0;
        posY = -0.9 + Math.sin(time * 1.4) * 0.02;
        // Smile morph active
        const p = (introProgress - timelineConfig.lookEnd) / (timelineConfig.smileEnd - timelineConfig.lookEnd);
        const smileVal = Math.sin(p * Math.PI) * 0.8;
        setMorphWeight("smile", smileVal);
      } else {
        // Adjust specs / pause
        targetOpacity = 1.0;
        posY = -0.9 + Math.sin(time * 1.4) * 0.025;
        setMorphWeight("smile", 0);
      }

      // Smooth opacity ramp
      opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, targetOpacity, 0.08);
      setSceneOpacity(scene, opacityRef.current);

      groupRef.current.position.set(0, posY, 0);
      groupRef.current.scale.setScalar(1);

      // Apply reclining pose during intro
      if (!hasSittingAnim) {
        applyRecliningPose(delta, time);
      } else {
        animControllerRef.current?.fadeTo("sit", 0.6);
      }

    // ── 2. Interactive Mode ──────────────────────────────────────────────────
    } else {
      // Natural random eye blinking
      blinkTimeRef.current += delta;
      if (blinkTimeRef.current >= nextBlinkInRef.current) {
        const elapsed = blinkTimeRef.current - nextBlinkInRef.current;
        if (elapsed < blinkDurationRef.current) {
          const progress = Math.sin((elapsed / blinkDurationRef.current) * Math.PI);
          setMorphWeight("blink", progress);
        } else {
          setMorphWeight("blink", 0);
          blinkTimeRef.current = 0;
          nextBlinkInRef.current = 2.5 + Math.random() * 4.0;
        }
      }

      // Enforce full visibility
      if (opacityRef.current < 0.99) {
        opacityRef.current = THREE.MathUtils.lerp(opacityRef.current, 1, 0.08);
        setSceneOpacity(scene, opacityRef.current);
      }

      // Breathing idle float
      groupRef.current.position.y = -0.9 + Math.sin(time * 1.4) * 0.035;

      if (hasSittingAnim) {
        animControllerRef.current?.fadeTo("sit", 0.5);
      } else {
        // Apply procedural reclining pose
        applyRecliningPose(delta, time);
      }

      // Skeletal bone tracking based on mouse movements with reclining look-at offsets
      const offsets = !hasSittingAnim ? {
        neck: { yaw: -0.25, pitch: 0.2 },
        head: { yaw: -0.2, pitch: 0.15 }
      } : undefined;

      cursorControllerRef.current?.update(pointerRef.current, delta, offsets);
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.9, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// ─── CharacterModel exports ───────────────────────────────────────────────────
interface CharacterModelProps {
  isIntroPlaying: boolean;
  introProgress: number;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  onModelLoaded?: (dims: {
    height: number;
    width: number;
    depth: number;
    center: THREE.Vector3;
    minY: number;
    maxY: number;
  }) => void;
  boneMappings?: BoneMappings;
  timelineConfig?: TimelineConfig;
}

export const CharacterModel: React.FC<CharacterModelProps> = ({
  isIntroPlaying,
  introProgress,
  pointerRef,
  onModelLoaded,
  boneMappings,
  timelineConfig = DEFAULT_TIMELINE_CONFIG,
}) => {
  const animControllerRef = useRef<CharacterController | null>(null);
  const cursorControllerRef = useRef<CursorController | null>(null);

  // URL fallback sequence state
  const [urlIndex, setUrlIndex] = useState(0);
  const urls = ["/models/character.glb", "/models/model.glb"];
  const currentUrl = urls[urlIndex];

  const tryNextUrl = () => {
    if (urlIndex < urls.length - 1) {
      setUrlIndex(urlIndex + 1);
    }
  };

  const silhouette = (
    <SilhouettePlaceholder
      introProgress={introProgress}
      pointerRef={pointerRef}
    />
  );

  return (
    <ModelErrorBoundary
      key={currentUrl}
      currentUrl={currentUrl}
      onTryNextUrl={tryNextUrl}
      fallback={silhouette}
    >
      <Suspense fallback={null}>
        <GLTFCharacterInner
          modelUrl={currentUrl}
          isIntroPlaying={isIntroPlaying}
          introProgress={introProgress}
          pointerRef={pointerRef}
          animControllerRef={animControllerRef}
          cursorControllerRef={cursorControllerRef}
          boneMappings={boneMappings}
          timelineConfig={timelineConfig}
          onModelLoaded={onModelLoaded}
        />
      </Suspense>
    </ModelErrorBoundary>
  );
};
