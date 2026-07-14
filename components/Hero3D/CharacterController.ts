import * as THREE from "three";

export class CharacterController {
  private mixer: THREE.AnimationMixer;
  private actions: { [name: string]: THREE.AnimationAction } = {};
  private activeAction: THREE.AnimationAction | null = null;
  private defaultFadeDuration = 0.5;

  constructor(root: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(root);
  }

  setClips(clips: THREE.AnimationClip[]) {
    // Map animation clip names to semantic state keys (case-insensitive, prefix match)
    const stateMapping: { [state: string]: string[] } = {
      idle:        ["idle", "breathing", "breath", "rest", "neutral"],
      intro:       ["intro", "jump", "land", "landing", "entrance"],
      wave:        ["wave", "greet", "greeting", "hello", "hi"],
      thinking:    ["thinking", "think", "ponder"],
      glasses:     ["glasses", "adjust", "sunglasses"],
      thumbsup:    ["thumbsup", "thumbs", "approve"],
      point:       ["point", "pointing"],
      typing:      ["typing", "type"],
      celebrate:   ["celebrate", "cheer", "victory"],
      walk:        ["walk", "walking"],
      run:         ["run", "running"],
      sit:         ["sit", "sitting"],
      stand:       ["stand", "standing"],
      talk:        ["talk", "talking"],
      look:        ["look", "lookat"],
    };

    clips.forEach((clip) => {
      const clipName = clip.name.toLowerCase();
      let matchedState = clip.name; // default: use raw name as key

      for (const [state, synonyms] of Object.entries(stateMapping)) {
        if (synonyms.some((syn) => clipName.includes(syn))) {
          matchedState = state;
          break;
        }
      }

      // Register both the semantic key and the raw name for maximum flexibility
      this.actions[matchedState] = this.mixer.clipAction(clip);
      if (matchedState !== clip.name) {
        this.actions[clip.name] = this.mixer.clipAction(clip);
      }
    });
  }

  /**
   * Fade to a named animation state. Returns true if found, false if not.
   */
  fadeTo(stateName: string, duration: number = this.defaultFadeDuration): boolean {
    const nextAction = this.actions[stateName];
    if (!nextAction) {
      return false;
    }

    if (this.activeAction === nextAction) return true;

    const prevAction = this.activeAction;
    this.activeAction = nextAction;

    nextAction.reset();
    nextAction.setEffectiveWeight(1.0);
    nextAction.setEffectiveTimeScale(1.0);
    nextAction.clampWhenFinished = false;
    nextAction.loop = THREE.LoopRepeat;

    if (prevAction) {
      prevAction.crossFadeTo(nextAction, duration, true);
    } else {
      nextAction.play();
    }

    nextAction.play();
    return true;
  }

  /**
   * Play the clip at position `index` in the registered actions list.
   * Used as a fallback when no semantic idle clip is found.
   */
  fadeToClipByIndex(index: number, duration: number = this.defaultFadeDuration): boolean {
    const keys = Object.keys(this.actions);
    if (keys.length === 0) return false;
    const key = keys[Math.min(index, keys.length - 1)];
    return this.fadeTo(key, duration);
  }

  /**
   * Returns a list of all registered state/clip names.
   */
  getAvailableStates(): string[] {
    return Object.keys(this.actions);
  }

  update(delta: number) {
    this.mixer.update(delta);
  }

  destroy() {
    this.mixer.stopAllAction();
    this.actions = {};
    this.activeAction = null;
  }
}
