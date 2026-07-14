"use client";

import React, { useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

// Custom subtle vignette — cinema framing without edge crush
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

  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);

    // 1. Base render
    comp.addPass(new RenderPass(scene, camera));

    // 2. Subtle bloom — glow on bright areas (rim light, accent colours)
    //    Low strength to avoid dark-halo edge artefacts
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      0.20,  // strength  — keep low
      0.50,  // radius    — wide soft glow
      0.90   // threshold — only very bright pixels bloom
    );
    comp.addPass(bloom);

    // 3. Vignette — subtle cinema frame
    const vignette = new ShaderPass(VignetteShader);
    vignette.uniforms["offset"].value   = 1.1;
    vignette.uniforms["darkness"].value = 0.85;
    comp.addPass(vignette);

    return comp;
  }, [gl, scene, camera, size]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size]);

  // Priority 1 → replaces R3F's default render pass
  useFrame(() => {
    composer.render();
  }, 1);

  return null;
};
