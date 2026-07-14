"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraRigProps {
  isIntroPlaying: boolean;
  introProgress: number;
  shouldShake: boolean;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  isIntroPlaying,
  introProgress,
  shouldShake,
}) => {
  const { camera, size } = useThree();
  const shakeTimeStart = useRef<number | null>(null);

  // Set camera projection properties on start
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 35; // 35-degree field of view
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state) => {
    const pointer = state.pointer;
    const time = state.clock.getElapsedTime();

    // 1. Responsive Z-dolly offsets based on screen width
    const isMobile = size.width < 768;
    const defaultZ = isMobile ? 5.8 : 4.2;
    const initialZ = isMobile ? 8.5 : 7.2;

    let targetZ = defaultZ;
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;

    // 2. Camera Shake Calculation during impact
    if (shouldShake) {
      if (shakeTimeStart.current === null) {
        shakeTimeStart.current = time;
      }
      const elapsed = time - shakeTimeStart.current;
      const duration = 0.8; // 800ms shake

      if (elapsed < duration) {
        const p = elapsed / duration;
        const decay = Math.exp(-p * 4.5); // rapid decay
        const shakeIntensity = 0.15 * decay;

        shakeOffsetX = Math.sin(time * 50) * shakeIntensity;
        shakeOffsetY = Math.cos(time * 45) * shakeIntensity;
      } else {
        shakeTimeStart.current = null;
      }
    } else {
      shakeTimeStart.current = null;
    }

    // 3. Cinematic Dolly & Parallax Transitions
    if (isIntroPlaying) {
      if (introProgress < 0.55) {
        // Slow zoom in
        const p = introProgress / 0.55;
        targetZ = THREE.MathUtils.lerp(initialZ, defaultZ + 0.4, p);
      } else if (introProgress >= 0.55 && introProgress < 0.8) {
        // Anticipation zoom back before jump
        const p = (introProgress - 0.55) / 0.25;
        targetZ = THREE.MathUtils.lerp(defaultZ + 0.4, defaultZ + 0.8, p);
      } else if (introProgress >= 0.8 && introProgress <= 1.0) {
        // Settle from jump impact
        const p = (introProgress - 0.8) / 0.2;
        targetZ = THREE.MathUtils.lerp(defaultZ - 0.4, defaultZ, p);
      }

      camera.position.x = shakeOffsetX;
      camera.position.y = 0.2 + shakeOffsetY;
      camera.position.z = targetZ;
    } else {
      // 4. Interactive Tracking: Subtle Parallax
      const destX = pointer.x * 0.55 + shakeOffsetX;
      const destY = 0.2 + pointer.y * 0.35 + shakeOffsetY;
      const destZ = defaultZ - Math.abs(pointer.x) * 0.22;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, destX, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, destY, 0.05);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, destZ, 0.05);
    }

    // Ensure camera centers target on character chest/head region
    camera.lookAt(0, 0.05, 0);
  });

  return null;
};
