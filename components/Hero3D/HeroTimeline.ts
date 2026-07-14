import gsap from "gsap";

interface TimelineCallbacks {
  onUpdate:       (progress: number) => void;
  onComplete:     () => void;
  onLandingImpact: () => void;
}

/**
 * Hero Intro Timeline — Apple / Awwwards premium style
 *
 * Total duration: 3.6 seconds
 *
 * Phase 1  0.0s – 1.5s  progress 0 → 0.45   Fade-in + rise from below
 * Phase 2  1.5s – 2.6s  progress 0.45 → 0.75  Breathing idle, cursor activating
 * Phase 3  2.6s          onLandingImpact        Micro-shake callback
 * Phase 4  2.6s – 3.6s  progress 0.75 → 1.0   Settle into interactive
 */
export const createHeroTimeline = (
  callbacks: TimelineCallbacks
): gsap.core.Timeline => {
  const tl = gsap.timeline({
    paused: true,
    onUpdate:  () => callbacks.onUpdate(tl.progress()),
    onComplete: () => callbacks.onComplete(),
  });

  const proxy = { p: 0 };

  // Phase 1: Character rises and fades in
  tl.to(proxy, {
    p: 0.45,
    duration: 1.5,
    ease: "power2.out",
    onUpdate: () => callbacks.onUpdate(proxy.p),
  });

  // Phase 2: Breathing idle (smooth, relaxed)
  tl.to(proxy, {
    p: 0.75,
    duration: 1.1,
    ease: "power1.inOut",
    onUpdate: () => callbacks.onUpdate(proxy.p),
  });

  // Phase 3: Landing micro-impact
  tl.add(() => callbacks.onLandingImpact(), "+=0");

  // Phase 4: Settle into interactive idle
  tl.to(proxy, {
    p: 1.0,
    duration: 1.0,
    ease: "power2.out",
    onUpdate: () => callbacks.onUpdate(proxy.p),
  });

  return tl;
};
