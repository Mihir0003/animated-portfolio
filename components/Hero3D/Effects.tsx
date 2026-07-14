"use client";

import React, { useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

// Custom Vignette Shader to add subtle cinema frame shading
const VignetteShader = {
  name: "VignetteShader",
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    offset: { value: 1.0 },
    darkness: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = vUv - vec2(0.5);
      float dist = length(uv);
      float vigor = smoothstep(offset, offset - 0.45, dist * darkness);
      gl_FragColor = vec4(texel.rgb * vigor, texel.a);
    }
  `,
};

export const Effects: React.FC = () => {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    
    // 1. Rendering Pass
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    // 2. High Performance Bloom Pass (Subtle glow)
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.35, // strength
      0.3,  // radius
      0.88  // threshold
    );
    comp.addPass(bloomPass);

    // 3. Vignette Pass
    const vignettePass = new ShaderPass(VignetteShader);
    vignettePass.uniforms["offset"].value = 0.95;
    vignettePass.uniforms["darkness"].value = 1.2;
    comp.addPass(vignettePass);

    return comp;
  }, [gl, scene, camera, size]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  // Priority > 0 tells Fiber to skip the default frame rendering and use our composer
  useFrame(() => {
    composer.render();
  }, 1);

  return null;
};
