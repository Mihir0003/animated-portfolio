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
    head: 0.85,  // 85%
    neck: 0.55,  // 55%
    chest: 0.25, // 25%
    spine: 0.1,  // 10%
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

  update(
    pointer: { x: number; y: number },
    delta: number,
    offsets?: {
      neck?: { yaw: number; pitch: number };
      head?: { yaw: number; pitch: number };
    }
  ) {
    // pointer.x and pointer.y are normalized between [-1, 1]
    const targetYaw = pointer.x;
    const targetPitch = pointer.y;

    const slerpRotation = (
      bone: THREE.Object3D | undefined,
      weight: number,
      limit: { yaw: number; pitch: number },
      baseYaw: number = 0,
      basePitch: number = 0
    ) => {
      if (!bone) return;

      // Calculate target yaw (Y) and pitch (X) weighted and clamped around base offset
      const destYaw = THREE.MathUtils.clamp(baseYaw + targetYaw * limit.yaw * weight, -limit.yaw + baseYaw, limit.yaw + baseYaw);
      const destPitch = THREE.MathUtils.clamp(basePitch - targetPitch * limit.pitch * weight, -limit.pitch + basePitch, limit.pitch + basePitch);

      // Smoothly slerp to target quaternion to avoid gimbal lock flips
      const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(destPitch, destYaw, 0, "YXZ"));
      bone.quaternion.slerp(targetQ, 0.08);
    };

    const neckOff = offsets?.neck || { yaw: 0, pitch: 0 };
    const headOff = offsets?.head || { yaw: 0, pitch: 0 };

    // Apply cursor movement calculations down the hierarchy
    slerpRotation(this.bones.eyeLeft, this.weights.eyes, this.limits.eyes);
    slerpRotation(this.bones.eyeRight, this.weights.eyes, this.limits.eyes);
    slerpRotation(this.bones.head, this.weights.head, this.limits.head, headOff.yaw, headOff.pitch);
    slerpRotation(this.bones.neck, this.weights.neck, this.limits.neck, neckOff.yaw, neckOff.pitch);
    slerpRotation(this.bones.chest, this.weights.chest, this.limits.chest);
    slerpRotation(this.bones.spine, this.weights.spine, this.limits.spine);
  }
}
