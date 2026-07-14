import * as THREE from "three";

export interface TrackingBones {
  head?: THREE.Object3D;
  neck?: THREE.Object3D;
  chest?: THREE.Object3D;
  spine?: THREE.Object3D;
  eyeLeft?: THREE.Object3D;
  eyeRight?: THREE.Object3D;
}

export class CursorController {
  private bones: TrackingBones = {};

  // Configurable weights (influence hierarchy)
  private weights = {
    eyes: 1.0,   // 100%
    head: 0.9,   // 90%
    neck: 0.6,   // 60%
    chest: 0.3,  // 30%
    spine: 0.15, // 15%
  };

  // Rotation limits in radians (yaw = y-axis, pitch = x-axis)
  private limits = {
    eyes: { yaw: 0.26, pitch: 0.26 },    // ~15 deg
    head: { yaw: 0.78, pitch: 0.52 },    // ~45/30 deg
    neck: { yaw: 0.52, pitch: 0.35 },    // ~30/20 deg
    chest: { yaw: 0.26, pitch: 0.17 },   // ~15/10 deg
    spine: { yaw: 0.14, pitch: 0.09 },   // ~8/5 deg
  };

  // Damping rate parameter for frame-rate independent easing
  private dampingFactor = 4.5;

  setBones(bones: TrackingBones) {
    this.bones = bones;
  }

  update(pointer: { x: number; y: number }, delta: number) {
    // pointer.x and pointer.y are normalized between [-1, 1]
    const targetYaw = pointer.x;
    const targetPitch = pointer.y;

    const dampRotation = (
      bone: THREE.Object3D | undefined,
      weight: number,
      limit: { yaw: number; pitch: number }
    ) => {
      if (!bone) return;

      // Calculate target yaw (Y) and pitch (X) weighted and clamped
      const destYaw = THREE.MathUtils.clamp(targetYaw * limit.yaw * weight, -limit.yaw, limit.yaw);
      // Invert pitch direction so character looks up when pointer goes up
      const destPitch = THREE.MathUtils.clamp(-targetPitch * limit.pitch * weight, -limit.pitch, limit.pitch);

      // Smoothly interpolate rotations (frame-rate independent damp)
      bone.rotation.y = THREE.MathUtils.damp(bone.rotation.y, destYaw, this.dampingFactor, delta);
      bone.rotation.x = THREE.MathUtils.damp(bone.rotation.x, destPitch, this.dampingFactor, delta);
    };

    // Apply cursor movement calculations down the hierarchy
    dampRotation(this.bones.eyeLeft, this.weights.eyes, this.limits.eyes);
    dampRotation(this.bones.eyeRight, this.weights.eyes, this.limits.eyes);
    dampRotation(this.bones.head, this.weights.head, this.limits.head);
    dampRotation(this.bones.neck, this.weights.neck, this.limits.neck);
    dampRotation(this.bones.chest, this.weights.chest, this.limits.chest);
    dampRotation(this.bones.spine, this.weights.spine, this.limits.spine);
  }
}
