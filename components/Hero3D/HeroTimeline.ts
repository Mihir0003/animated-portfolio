import gsap from "gsap";

interface TimelineCallbacks {
  onUpdate: (progress: number) => void;
  onComplete: () => void;
  onLandingImpact: () => void;
}

/**
 * Cinematic Hero Intro Timeline — Vebe/Codex style dramatic character entrance.
 *
 * Sequence:
 *  0.0s → 0.8s  — Black screen / hold (letterbox bars visible)
 *  0.8s → 2.2s  — Character slides in fast from RIGHT + below (dramatic sweep)
 *  2.2s → 2.6s  — Overshoots position (elastic overshoot)
 *  2.6s → 3.2s  — Settle + landing impact + camera shake
 *  3.2s → 5.0s  — Breathing idle, cursor tracking activates
 */
export const createHeroTimeline = (callbacks: TimelineCallbacks): gsap.core.Timeline => {
  const tl = gsap.timeline({
    paused: true,
    onUpdate: () => {
      callbacks.onUpdate(tl.progress());
    },
    onComplete: () => {
      callbacks.onComplete();
    },
  });

  const dummy = { progress: 0 };

  // 1. Brief cinematic hold — character is off-screen (0s - 0.6s)
  tl.to(dummy, {
    progress: 0.05,
    duration: 0.6,
    ease: "none",
  });

  // 2. Dramatic slide entrance — character sweeps in from right (0.6s - 1.8s)
  //    Fast, high-energy, cinematic. Like a superhero landing.
  tl.to(dummy, {
    progress: 0.62,
    duration: 1.2,
    ease: "expo.out",
  });

  // 3. Overshoot bounce — character goes slightly past center then snaps back (1.8s - 2.4s)
  tl.to(dummy, {
    progress: 0.78,
    duration: 0.6,
    ease: "back.out(2.5)",
  });

  // 4. Landing impact trigger (exactly at 2.4s)
  tl.add(() => {
    callbacks.onLandingImpact();
  }, 2.4);

  // 5. Settle to final idle position (2.4s - 3.8s)
  tl.to(dummy, {
    progress: 1.0,
    duration: 1.4,
    ease: "elastic.out(1, 0.6)",
  });

  return tl;
};
