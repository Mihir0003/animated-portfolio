"use client";

import React from "react";
import { ContactShadows } from "@react-three/drei";

export const Lights: React.FC = () => {
  return (
    <>
      {/* ── Ambient: prevents totally dark faces ──────────────────────────── */}
      <ambientLight intensity={0.7} />

      {/* ── Key Light: main source, cool white, soft shadow ───────────────── */}
      <directionalLight
        position={[-3, 6, 4]}
        intensity={3.5}
        color="#ecf4ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.005}
        shadow-normalBias={0.02}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={8}
        shadow-camera-bottom={-3}
      />

      {/* ── Fill Light: portfolio accent cyan — opens shadow areas ────────── */}
      <directionalLight
        position={[5, 2, 3]}
        intensity={1.4}
        color="#4de4ff"
      />

      {/* ── Rim Light: warm orange halo, separates character from background ─ */}
      <directionalLight
        position={[2, 5, -5]}
        intensity={6.0}
        color="#ff8f3f"
      />

      {/* ── Bounce Light: subtle green bounce from ground ─────────────────── */}
      <directionalLight
        position={[0, -4, 0]}
        intensity={0.5}
        color="#34f5b3"
      />

      {/* ── Hair / Top Light: soft overhead fill ─────────────────────────── */}
      <directionalLight
        position={[0, 8, 0]}
        intensity={0.8}
        color="#d0e8ff"
      />

      {/* ── Contact Shadows: soft pool under feet ─────────────────────────── */}
      <ContactShadows
        position={[0, -0.98, 0]}
        opacity={0.5}
        scale={3}
        blur={4}
        far={1.2}
        color="#020c18"
      />
    </>
  );
};
