"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraRigProps {
  isIntroPlaying: boolean;
  introProgress: number;
  shouldShake: boolean;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  modelDimensions: {
    height: number;
    width: number;
    depth: number;
    center: THREE.Vector3;
    minY: number;
    maxY: number;
  } | null;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  isIntroPlaying,
  introProgress,
  shouldShake,
  pointerRef,
  modelDimensions,
}) => {
  const { camera, size } = useThree();
  const shakeTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      // 35° Field of view for premium cinematic keynote rendering
      camera.fov = 35;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state) => {
    const pointer = pointerRef.current;
    const time = state.clock.getElapsedTime();

    // Default reference sizing if model hasn't loaded yet
    let height = 1.8;
    let width = 0.6;
    let centerY = 0;

    if (modelDimensions) {
      height = modelDimensions.height;
      width = modelDimensions.width;
      centerY = modelDimensions.center.y;
    }

    // Target fraction: character occupies ~80% of screen height
    const targetFraction = 0.8;

    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    // FOV in radians
    const fovRad = (camera.fov * Math.PI) / 180;
    const halfFov = fovRad / 2;

    // Calculate camera distance to fit character height
    let targetZ = (height / targetFraction) / (2 * Math.tan(halfFov));

    // Responsive aspect checks for portrait layouts (mobiles)
    const aspect = size.width / size.height;
    if (aspect < 1) {
      // Fit by width in portrait to prevent cutting off sides
      const visibleWidth = width / targetFraction;
      const distanceForWidth = (visibleWidth / aspect) / (2 * Math.tan(halfFov));
      targetZ = Math.max(targetZ, distanceForWidth);
    }

    // Set dynamic near/far clip planes to prevent clipping artifacts
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.near = Math.max(0.01, targetZ * 0.1);
      camera.far = targetZ * 10;
      camera.updateProjectionMatrix();
    }

    // Position lookAt and camera heights
    const lookAtY = centerY + height * 0.05;
    const cameraY = centerY + height * 0.08;

    // Calculate camera horizontal pan offset (right positioning for desktop)
    let targetOffsetX = 0;
    if (aspect >= 1.2) {
      // Desktop: offset camera left to place character on right side of screen
      targetOffsetX = -targetZ * 0.28;
    } else if (aspect >= 0.8) {
      // Tablet: offset slightly left so it overlaps background content nicely
      targetOffsetX = -targetZ * 0.15;
    } else {
      // Mobile: keep character centered in viewport
      targetOffsetX = 0;
    }

    // ── Screen impact shake ─────────────────────────────────────────────────
    let sx = 0, sy = 0;
    if (shouldShake) {
      if (shakeTimeRef.current === null) shakeTimeRef.current = time;
      const elapsed = time - shakeTimeRef.current;
      if (elapsed < 0.6) {
        const decay = Math.exp(-(elapsed / 0.6) * 5);
        sx = Math.sin(time * 65) * 0.06 * decay;
        sy = Math.cos(time * 60) * 0.06 * decay;
      } else {
        shakeTimeRef.current = null;
      }
    } else {
      shakeTimeRef.current = null;
    }

    // ── Position animations ─────────────────────────────────────────────────
    let finalX = targetOffsetX;
    let finalY = cameraY;
    let finalZ = targetZ;

    if (isIntroPlaying) {
      const startZ = targetZ * 1.8; // dolly in from far back
      const startX = 0;             // start centered

      if (introProgress <= 0.45) {
        const p = introProgress / 0.45;
        finalZ = THREE.MathUtils.lerp(startZ, targetZ + 0.6, p);
        finalX = THREE.MathUtils.lerp(startX, targetOffsetX, p);
      } else if (introProgress <= 0.75) {
        const p = (introProgress - 0.45) / 0.3;
        finalZ = THREE.MathUtils.lerp(targetZ + 0.6, targetZ + 0.1, p);
        finalX = targetOffsetX;
      } else {
        const p = (introProgress - 0.75) / 0.25;
        finalZ = THREE.MathUtils.lerp(targetZ + 0.1, targetZ, p);
        finalX = targetOffsetX;
      }

      camera.position.set(finalX + sx, finalY + sy, finalZ);
    } else {
      // ── Interactive premium subtle parallax ────────────────────────────────
      const destX = targetOffsetX + pointer.x * (targetZ * 0.08) + sx;
      const destY = cameraY + pointer.y * (height * 0.08) + sy;
      const destZ = targetZ - Math.abs(pointer.x) * (targetZ * 0.03);

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, destX, 0.03);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, destY, 0.03);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, destZ, 0.03);
    }

    // Look at target character height center
    const currentLookAtY = THREE.MathUtils.lerp(
      lookAtY - height * 0.1,
      lookAtY,
      isIntroPlaying ? introProgress : 1
    );
    camera.lookAt(0, currentLookAtY, 0);
  });

  return null;
};
