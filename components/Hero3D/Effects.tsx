"use client";

import React, { useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

// Custom subtle vignette — premium cinema framing
const VignetteShader = {
  name: "VignetteShader",
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    offset:   { value: 1.0 },
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
      float vigor = smoothstep(offset, offset - 0.42, dist * darkness);
      gl_FragColor = vec4(texel.rgb * vigor, texel.a);
    }
  `,
};

export const Effects: React.FC = () => {
  const { gl, scene, camera, size } = useThree();

  // Detect mobile devices to disable expensive post-processing compositing loops
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const mobileUA = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const narrowScreen = size.width < 768;
    return mobileUA || narrowScreen;
  }, [size.width]);

  const composer = useMemo(() => {
    if (isMobile) return null; // Bypass composer completely on mobile devices to preserve 60 FPS

    const comp = new EffectComposer(gl);

    // 1. Core render pass
    comp.addPass(new RenderPass(scene, camera));

    // 2. High quality bloom pass (subtle glow on highlights)
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.20,  // strength
      0.50,  // radius
      0.90   // threshold
    );
    comp.addPass(bloom);

    // 3. Cinematic vignette pass
    const vignette = new ShaderPass(VignetteShader);
    vignette.uniforms["offset"].value   = 1.1;
    vignette.uniforms["darkness"].value = 0.85;
    comp.addPass(vignette);

    return comp;
  }, [gl, scene, camera, size, isMobile]);

  useEffect(() => {
    if (composer) {
      composer.setSize(size.width, size.height);
    }
  }, [composer, size]);

  // If composer is active, priority > 0 tells Fiber to bypass default rendering and use composer
  useFrame(() => {
    if (composer) {
      composer.render();
    }
  }, composer ? 1 : 0);

  return null;
};
