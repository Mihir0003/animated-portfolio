import gsap from "gsap";

export interface TimelineConfig {
  duration: number;   // Total duration in seconds (e.g., 6.0 to 8.0)
  fadeInEnd: number;  // Progress [0-1] where fade-in ends
  riseEnd: number;    // Progress [0-1] where rise ends
  breathEnd: number;  // Progress [0-1] where idle breathing phase ends
  blinkEnd: number;   // Progress [0-1] where blinking phase ends
  lookEnd: number;    // Progress [0-1] where look-toward-visitor phase ends
  smileEnd: number;   // Progress [0-1] where smiling phase ends
  adjustEnd: number;  // Progress [0-1] where future adjust specs/jacket phase ends
}

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
  duration: 7.2,      // 7.2 seconds total intro
  fadeInEnd: 0.15,    // 0% -> 15% (Fade in)
  riseEnd: 0.32,      // 15% -> 32% (Rise from below)
  breathEnd: 0.48,    // 32% -> 48% (Gentle breathing)
  blinkEnd: 0.62,     // 48% -> 62% (Blink eyes)
  lookEnd: 0.76,      // 62% -> 76% (Look toward visitor)
  smileEnd: 0.88,     // 76% -> 88% (Smile)
  adjustEnd: 0.96,    // 88% -> 96% (Adjust specs / pause)
};

interface TimelineCallbacks {
  onUpdate: (progress: number) => void;
  onComplete: () => void;
  onLandingImpact: () => void;
}

/**
 * Creates the cinematic intro GSAP Timeline.
 * Drives a normalized progress variable (0 to 1) over a configurable duration.
 */
export const createHeroTimeline = (
  callbacks: TimelineCallbacks,
  config: TimelineConfig = DEFAULT_TIMELINE_CONFIG
): gsap.core.Timeline => {
  const tl = gsap.timeline({
    paused: true,
    onComplete: () => {
      callbacks.onComplete();
    },
  });

  const proxy = { progress: 0 };

  tl.to(proxy, {
    progress: 1.0,
    duration: config.duration,
    ease: "power1.inOut",
    onUpdate: () => {
      callbacks.onUpdate(proxy.progress);
    },
  });

  // Micro impact / camera shake trigger at a configurable moment (e.g. at lookEnd)
  tl.add(() => {
    callbacks.onLandingImpact();
  }, config.lookEnd * config.duration);

  return tl;
};
