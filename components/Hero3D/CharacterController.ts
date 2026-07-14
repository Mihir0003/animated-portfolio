import * as THREE from "three";

/**
 * CharacterController — Animation State Machine
 *
 * Supports any GLB model. Maps raw clip names to semantic states.
 * Adding new animation clips to the GLB automatically registers them.
 *
 * State hierarchy (in priority):
 *   idle | intro | wave | thinking | glasses | jump | walk | talk | celebrate | point | type
 */
export class CharacterController {
  private mixer: THREE.AnimationMixer;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private activeAction: THREE.AnimationAction | null = null;
  private readonly DEFAULT_FADE = 0.5;

  constructor(root: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(root);
  }

  // ── Clip registration ──────────────────────────────────────────────────────
  setClips(clips: THREE.AnimationClip[]) {
    // Map of semantic state → array of keyword synonyms (case-insensitive)
    const SYNONYMS: Record<string, string[]> = {
      loading:   ["loading", "load"],
      intro:     ["intro", "entrance", "appear", "arrive"],
      idle:      ["idle", "breathing", "breath", "rest", "neutral", "stand"],
      blink:     ["blink", "eyeblink"],
      smile:     ["smile", "grin"],
      thinking:  ["thinking", "think", "ponder", "scratch"],
      hover:     ["hover"],
      wave:      ["wave", "greet", "greeting", "hello", "hi"],
      point:     ["point", "pointing", "finger"],
      typing:    ["typing", "type", "code", "coding"],
      talk:      ["talk", "talking", "speak", "chat"],
      celebrate: ["celebrate", "cheer", "victory", "win", "thumbsup"],
      jump:      ["jump", "land", "leap", "bounce"],
      walk:      ["walk", "walking", "strut"],
      sleep:     ["sleep", "sleeping", "snore"],
      exit:      ["exit", "leave", "disappear"],
      error:     ["error", "fail", "glitch"],
    };

    clips.forEach((clip) => {
      const lower = clip.name.toLowerCase();
      let state = clip.name; // default: use raw name

      for (const [key, syns] of Object.entries(SYNONYMS)) {
        if (syns.some((s) => lower.includes(s))) {
          state = key;
          break;
        }
      }

      const action = this.mixer.clipAction(clip);
      action.loop = THREE.LoopRepeat;
      action.clampWhenFinished = false;

      // Register under semantic key and raw name (both usable)
      this.actions.set(state, action);
      if (state !== clip.name) {
        this.actions.set(clip.name, action);
      }
    });
  }

  // ── Crossfade to named state ───────────────────────────────────────────────
  /**
   * @returns true if the state was found and transition started
   */
  fadeTo(state: string, duration: number = this.DEFAULT_FADE): boolean {
    const next = this.actions.get(state);
    if (!next) return false;
    if (this.activeAction === next) return true;

    const prev = this.activeAction;
    this.activeAction = next;

    next.reset();
    next.setEffectiveWeight(1.0);
    next.setEffectiveTimeScale(1.0);

    if (prev) {
      prev.crossFadeTo(next, duration, true);
    }
    next.play();
    return true;
  }

  // ── Fallback: play clip by position index ─────────────────────────────────
  fadeToClipByIndex(index: number, duration: number = this.DEFAULT_FADE): boolean {
    const keys = Array.from(this.actions.keys());
    if (!keys.length) return false;
    return this.fadeTo(keys[Math.min(index, keys.length - 1)], duration);
  }

  // ── Utility ───────────────────────────────────────────────────────────────
  getAvailableStates(): string[] {
    return Array.from(this.actions.keys());
  }

  hasState(state: string): boolean {
    return this.actions.has(state);
  }

  update(delta: number) {
    this.mixer.update(delta);
  }

  destroy() {
    this.mixer.stopAllAction();
    this.actions.clear();
    this.activeAction = null;
  }
}
