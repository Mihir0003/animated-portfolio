"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface CameraRigProps {
  isIntroPlaying: boolean;
  introProgress: number;
  shouldShake: boolean;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  isIntroPlaying,
  introProgress,
  shouldShake,
  pointerRef,
}) => {
  const { camera, size } = useThree();
  const shakeTimeStart = useRef<number | null>(null);

  // 35° FOV — cinematic perspective, not too wide, not too narrow
  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 35;
      camera.near = 0.1;
      camera.far = 100;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state) => {
    const pointer = pointerRef.current;
    const time = state.clock.getElapsedTime();

    // Responsive Z dolly — pull out more on mobile to see full character body
    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1024;
    const defaultZ = isMobile ? 6.5 : isTablet ? 5.2 : 4.8;
    const initialZ = isMobile ? 10.0 : isTablet ? 8.5 : 7.5;

    let targetZ = defaultZ;
    let shakeOffsetX = 0;
    let shakeOffsetY = 0;

    // ── Camera Shake on landing impact ──────────────────────────────────────
    if (shouldShake) {
      if (shakeTimeStart.current === null) {
        shakeTimeStart.current = time;
      }
      const elapsed = time - shakeTimeStart.current;
      const duration = 0.8;

      if (elapsed < duration) {
        const p = elapsed / duration;
        const decay = Math.exp(-p * 4.5);
        const intensity = 0.15 * decay;
        shakeOffsetX = Math.sin(time * 50) * intensity;
        shakeOffsetY = Math.cos(time * 45) * intensity;
      } else {
        shakeTimeStart.current = null;
      }
    } else {
      shakeTimeStart.current = null;
    }

    // ── Cinematic intro dolly ────────────────────────────────────────────────
    if (isIntroPlaying) {
      if (introProgress < 0.55) {
        // Slow zoom-in
        const p = introProgress / 0.55;
        targetZ = THREE.MathUtils.lerp(initialZ, defaultZ + 0.5, p);
      } else if (introProgress >= 0.55 && introProgress < 0.8) {
        // Pull back slightly before landing
        const p = (introProgress - 0.55) / 0.25;
        targetZ = THREE.MathUtils.lerp(defaultZ + 0.5, defaultZ + 1.0, p);
      } else {
        // Slam back in on landing
        const p = (introProgress - 0.8) / 0.2;
        targetZ = THREE.MathUtils.lerp(defaultZ - 0.5, defaultZ, p);
      }

      camera.position.x = shakeOffsetX;
      camera.position.y = 0.3 + shakeOffsetY;
      camera.position.z = targetZ;
    } else {
      // ── Interactive parallax mode ──────────────────────────────────────────
      const destX = pointer.x * 0.45 + shakeOffsetX;
      const destY = 0.3 + pointer.y * 0.3 + shakeOffsetY;
      const destZ = defaultZ - Math.abs(pointer.x) * 0.18;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, destX, 0.04);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, destY, 0.04);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, destZ, 0.04);
    }

    // Camera always aims at chest/head region of the character
    camera.lookAt(0, 0.2, 0);
  });

  return null;
};
