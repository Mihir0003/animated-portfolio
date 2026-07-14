import gsap from "gsap";

interface TimelineCallbacks {
  onUpdate: (progress: number) => void;
  onComplete: () => void;
  onLandingImpact: () => void;
}

/**
 * Creates the cinematic intro GSAP Timeline.
 * Drives a normalized progress variable which R3F components (model, camera)
 * use to animate positions, scales, and triggers.
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

  // 1. Initial Fade In & Idle Breathing (0s - 3.5s)
  tl.to(dummy, {
    progress: 0.4, // adjusts glasses & look
    duration: 3.5,
    ease: "power1.inOut",
  });

  // 2. Anticipation Pause (3.5s - 4.8s)
  tl.to(dummy, {
    progress: 0.55, // body rotates/leans back slightly
    duration: 1.3,
    ease: "power2.inOut",
  });

  // 3. Jump Toward Camera (4.8s - 5.8s)
  tl.to(dummy, {
    progress: 0.8, // translate forward & scale up
    duration: 1.0,
    ease: "power3.in",
  });

  // 4. Landing Impact Beat Trigger (exactly at 5.8s)
  tl.add(() => {
    callbacks.onLandingImpact();
  }, 5.8);

  // 5. Land & Settle back to interactive center (5.8s - 8.0s)
  tl.to(dummy, {
    progress: 1.0, // settle position, squash-stretch scale
    duration: 2.2,
    ease: "power2.out",
  });

  return tl;
};
