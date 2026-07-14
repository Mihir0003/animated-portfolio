"use client";

import React from "react";
import { Environment as DreiEnvironment } from "@react-three/drei";

export const Environment: React.FC = () => {
  return (
    <>
      {/* Studio HDRI — even, premium lighting base */}
      <DreiEnvironment preset="studio" />

      {/* Atmospheric fog — adds depth, separates character from background */}
      {/* @ts-ignore */}
      <fog attach="fog" args={["#020c18", 8, 22]} />
    </>
  );
};
