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
  const shakeTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      // 35° FOV — cinematic, Apple-keynote feel
      // Narrower than default (75°) = character appears MUCH larger and closer
      camera.fov = 35;
      camera.near = 0.01;
      camera.far = 50;
      camera.updateProjectionMatrix();
    }
  }, [camera]);

  useFrame((state) => {
    const pointer = pointerRef.current;
    const time = state.clock.getElapsedTime();

    // ── Responsive Z distances ──────────────────────────────────────────────
    // At FOV=35°, camera Z=2.2 → a 1.7-unit character fills ~85% of frame height
    // This is what makes the character "dominate" the Hero
    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1024;
    const targetZ  = isMobile ? 4.2 : isTablet ? 3.0 : 2.2;
    const startZ   = isMobile ? 7.0 : isTablet ? 5.5 : 4.5;

    // ── Camera shake on landing ─────────────────────────────────────────────
    let sx = 0, sy = 0;
    if (shouldShake) {
      if (shakeTimeRef.current === null) shakeTimeRef.current = time;
      const elapsed = time - shakeTimeRef.current;
      if (elapsed < 0.6) {
        const decay = Math.exp(-(elapsed / 0.6) * 5);
        sx = Math.sin(time * 60) * 0.06 * decay;
        sy = Math.cos(time * 55) * 0.06 * decay;
      } else {
        shakeTimeRef.current = null;
      }
    } else {
      shakeTimeRef.current = null;
    }

    // ── Intro: cinematic dolly-in ───────────────────────────────────────────
    if (isIntroPlaying) {
      let z = targetZ;

      if (introProgress <= 0.45) {
        // Slow push-in during fade-in
        const p = introProgress / 0.45;
        z = THREE.MathUtils.lerp(startZ, targetZ + 0.6, p);
      } else if (introProgress <= 0.75) {
        // Continue pushing closer
        const p = (introProgress - 0.45) / 0.3;
        z = THREE.MathUtils.lerp(targetZ + 0.6, targetZ + 0.1, p);
      } else {
        // Final settle
        const p = (introProgress - 0.75) / 0.25;
        z = THREE.MathUtils.lerp(targetZ + 0.1, targetZ, p);
      }

      camera.position.set(sx, 0.3 + sy, z);

    // ── Interactive: premium subtle parallax ────────────────────────────────
    } else {
      // Very subtle — premium portfolios have barely perceptible parallax
      const destX = pointer.x * 0.2 + sx;
      const destY = 0.3 + pointer.y * 0.15 + sy;
      const destZ = targetZ - Math.abs(pointer.x) * 0.08;

      camera.position.x = THREE.MathUtils.lerp(camera.position.x, destX, 0.025);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, destY, 0.025);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, destZ, 0.025);
    }

    // Always look at character's upper-body / chest-neck region
    camera.lookAt(0, 0.4, 0);
  });

  return null;
};
