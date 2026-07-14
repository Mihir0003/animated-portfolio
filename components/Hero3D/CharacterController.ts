import * as THREE from "three";

export class CharacterController {
  private mixer: THREE.AnimationMixer;
  private actions: { [name: string]: THREE.AnimationAction } = {};
  private activeAction: THREE.AnimationAction | null = null;
  private defaultFadeDuration = 0.5; // in seconds

  constructor(root: THREE.Object3D) {
    this.mixer = new THREE.AnimationMixer(root);
  }

  setClips(clips: THREE.AnimationClip[]) {
    // Map names to core supported states (case-insensitive checks)
    const stateMapping: { [state: string]: string[] } = {
      idle: ["idle", "breathing", "breath"],
      intro: ["intro", "jump", "land", "adjust"],
      interaction: ["interaction", "look", "track"],
      hover: ["hover"],
      wave: ["wave", "greet", "greeting"],
      thinking: ["thinking", "think"],
    };

    clips.forEach((clip) => {
      const clipName = clip.name.toLowerCase();
      let matchedState = clip.name; // default to original name if no match

      for (const [state, synonyms] of Object.entries(stateMapping)) {
        if (synonyms.some((syn) => clipName.includes(syn))) {
          matchedState = state;
          break;
        }
      }

      this.actions[matchedState] = this.mixer.clipAction(clip);
    });
  }

  fadeTo(stateName: string, duration: number = this.defaultFadeDuration) {
    const nextAction = this.actions[stateName];
    if (!nextAction) {
      console.warn(`Animation action for state "${stateName}" not found. Falling back.`);
      return;
    }

    if (this.activeAction === nextAction) return;

    const prevAction = this.activeAction;
    this.activeAction = nextAction;

    nextAction.reset();
    nextAction.setEffectiveWeight(1.0);
    nextAction.setEffectiveTimeScale(1.0);

    if (prevAction) {
      // Crossfade smoothly between clips (zero snapping)
      prevAction.crossFadeTo(nextAction, duration, true);
    } else {
      nextAction.play();
    }

    nextAction.play();
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
