"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";
import { Volume2, VolumeX, RotateCcw, Play } from "lucide-react";
import * as THREE from "three";
import { CameraRig } from "./CameraRig";
import { Lights } from "./Lights";
import { Environment } from "./Environment";
import { Effects } from "./Effects";
import { CharacterModel } from "./CharacterModel";
import { AudioController } from "./AudioController";
import { createHeroTimeline } from "./HeroTimeline";
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

  const audioControllerRef = useRef<AudioController | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Initialize AudioController instance
  useEffect(() => {
    const audio = new AudioController("/audio/hero.mp3");
    audioControllerRef.current = audio;

    // Periodically check if sound file becomes playable (canplaythrough event fired)
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
    });

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
        // Restart cinematic timeline in sync with the audio track
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
        }}
        className="w-full h-full pointer-events-none"
      >
        <AdaptiveDpr />
        <CameraRig
          isIntroPlaying={isIntroPlaying}
          introProgress={introProgress}
          shouldShake={shouldShake}
          pointerRef={pointer}
        />
        <Lights />
        <Environment />
        <Effects />
        <CharacterModel
          modelUrl="/models/model.glb"
          isIntroPlaying={isIntroPlaying}
          introProgress={introProgress}
          pointerRef={pointer}
        />
      </Canvas>

      {/* Floating HUD status indicator overlay */}
      {!isIntroPlaying && (
        <div className="absolute top-4 left-4 pointer-events-none bg-[#4de4ff]/10 border border-[#4de4ff]/30 px-3 py-1.5 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4de4ff]" />
            <span className="font-orbitron text-[9px] text-[#4de4ff] uppercase tracking-widest font-semibold">Interactive Mode: Active</span>
          </div>
        </div>
      )}

      {/* Audio & Timeline Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10 pointer-events-auto">
        {/* Render audio button only if the MP3 file successfully loaded */}
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

        {/* Replay Cinematic Sequence */}
        <button
          onClick={runTimeline}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0b1b2f]/80 border border-white/10 text-white/70 hover:text-white hover:border-white/30 backdrop-blur-md transition-all duration-300 active:scale-95"
          title="Replay Cinematic Intro"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Unmute CTA Overlay */}
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

      {/* Cinematic letterbox templates */}
      <div
        className={`absolute inset-x-0 top-0 h-8 bg-black/80 pointer-events-none transition-transform duration-700 z-10 ${
          isIntroPlaying ? "translate-y-0" : "-translate-y-full"
        }`}
      />
      <div
        className={`absolute inset-x-0 bottom-0 h-8 bg-black/80 pointer-events-none transition-transform duration-700 z-10 ${
          isIntroPlaying ? "translate-y-0" : "translate-y-full"
        }`}
      />
    </div>
  );
};
