"use client";

import React from "react";
import { ContactShadows } from "@react-three/drei";

export const Lights: React.FC = () => {
  return (
    <>
      {/* Ambient lighting for soft base illumination */}
      <ambientLight intensity={0.4} />

      {/* Key Light: Primary illumination source casting soft shadows */}
      <directionalLight
        position={[-3, 5, 4]}
        intensity={3.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        color="#ecf4ff"
      />

      {/* Fill Light: Soft blue light to open up dark shadow areas */}
      <directionalLight
        position={[4, 2, 2]}
        intensity={1.2}
        color="#4de4ff"
      />

      {/* Rim Light: High-intensity backlighting to create a halo edge effect */}
      <directionalLight
        position={[3, 4, -4]}
        intensity={5.5}
        color="#ff8f3f"
      />

      {/* Bounce Light: Soft bottom illumination reflecting ground colors */}
      <directionalLight
        position={[0, -3, 0]}
        intensity={0.6}
        color="#34f5b3"
      />

      {/* Ground Contact Shadows */}
      <ContactShadows
        position={[0, -1.25, 0]}
        opacity={0.7}
        scale={5.5}
        blur={2.4}
        far={1.8}
        color="#05111f"
      />
    </>
  );
};
