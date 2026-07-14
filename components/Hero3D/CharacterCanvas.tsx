"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Volume2, VolumeX, Play } from "lucide-react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Lights } from "./Lights";
import { Environment } from "./Environment";
import { Effects } from "./Effects";
import { CharacterModel } from "./CharacterModel";
import { AudioController } from "./AudioController";
import { createHeroTimeline, DEFAULT_TIMELINE_CONFIG } from "./HeroTimeline";
import { useCursor } from "@/hooks/useCursor";
import { useIntroAnimation } from "@/hooks/useIntroAnimation";

export const CharacterCanvas: React.FC = () => {
  const pointer = useCursor();
  const {
    isIntroPlaying,
    setIsIntroPlaying,
    introProgress,
    setIntroProgress,
    shouldShake,
    startShake,
  } = useIntroAnimation();

  const [isMuted, setIsMuted] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [modelDimensions, setModelDimensions] = useState<{
    height: number;
    width: number;
    depth: number;
    center: THREE.Vector3;
    minY: number;
    maxY: number;
  } | null>(null);

  const audioControllerRef = useRef<AudioController | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Initialize AudioController instance
  useEffect(() => {
    const audio = new AudioController("/audio/hero.mp3");
    audioControllerRef.current = audio;

    const checkAudioAvailability = () => {
      if (audio.getIsAvailable()) {
        setAudioAvailable(true);
      }
    };

    const interval = setInterval(checkAudioAvailability, 200);

    return () => {
      clearInterval(interval);
      audio.destroy();
    };
  }, []);

  // Construct and trigger the GSAP cinematic intro sequence
  const runTimeline = () => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    setIsIntroPlaying(true);
    setIntroProgress(0);

    timelineRef.current = createHeroTimeline({
      onUpdate: (progress) => {
        setIntroProgress(progress);
      },
      onLandingImpact: () => {
        startShake();
      },
      onComplete: () => {
        setIsIntroPlaying(false);
      },
    }, DEFAULT_TIMELINE_CONFIG);

    timelineRef.current.play();

    if (!isMuted && audioControllerRef.current) {
      audioControllerRef.current.play();
    }
  };

  // Trigger silent intro automatically on load
  useEffect(() => {
    runTimeline();
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  const handleToggleSound = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);

    if (audioControllerRef.current) {
      audioControllerRef.current.setMute(nextMute);
      if (!nextMute) {
        audioControllerRef.current.stop();
        runTimeline();
      } else {
        audioControllerRef.current.stop();
      }
    }
  };

  return (
    <div className="w-full h-full relative select-none overflow-hidden group pointer-events-none">
      {/* 3D Viewport Canvas */}
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          alpha: true,
        }}
        className="w-full h-full pointer-events-none"
      >
        <AdaptiveDpr />
        <CameraRig
          isIntroPlaying={isIntroPlaying}
          introProgress={introProgress}
          shouldShake={shouldShake}
          pointerRef={pointer}
          modelDimensions={modelDimensions}
        />
        <Lights />
        <Environment />
        <Effects />
        <CharacterModel
          isIntroPlaying={isIntroPlaying}
          introProgress={introProgress}
          pointerRef={pointer}
          onModelLoaded={setModelDimensions}
          timelineConfig={DEFAULT_TIMELINE_CONFIG}
        />
      </Canvas>

      {/* Optional: Floating Audio Controls (rendered on top of Canvas) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10 pointer-events-auto">
        {audioAvailable && (
          <button
            onClick={handleToggleSound}
            className={`flex items-center justify-center w-10 h-10 rounded-xl border backdrop-blur-md transition-all duration-300 active:scale-95 ${
              isMuted
                ? "bg-[#0b1b2f]/80 border-white/10 text-white/50 hover:text-white hover:border-white/30"
                : "bg-[#4de4ff]/10 border-[#4de4ff]/40 text-[#4de4ff] hover:bg-[#4de4ff]/20 hover:border-[#4de4ff] shadow-[0_0_10px_rgba(77,228,255,0.2)]"
            }`}
            title={isMuted ? "Unmute Soundtrack" : "Mute Sound"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}
      </div>

      {/* Unmute CTA Overlay (rendered on top of Canvas) */}
      {audioAvailable && isMuted && isIntroPlaying && introProgress < 0.2 && (
        <button
          onClick={handleToggleSound}
          className="absolute inset-0 bg-[#05111f]/60 hover:bg-[#05111f]/50 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300 pointer-events-auto z-20 group/btn cursor-pointer"
        >
          <div className="bg-[#0b1b2f]/95 border border-[#4de4ff]/40 hover:border-[#4de4ff] text-[#4de4ff] px-5 py-3 rounded-2xl font-orbitron font-semibold text-xs tracking-wider uppercase flex items-center gap-3 shadow-[0_8px_30px_rgba(0,229,255,0.15)] group-hover/btn:shadow-[0_8px_30px_rgba(0,229,255,0.3)] transition-all duration-300 transform group-hover/btn:-translate-y-0.5">
            <Play size={14} className="fill-[#4de4ff]" />
            Play Intro With Sound
          </div>
        </button>
      )}
    </div>
  );
};
