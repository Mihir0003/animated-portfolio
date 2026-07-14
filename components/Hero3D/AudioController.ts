export class AudioController {
  private audio: HTMLAudioElement | null = null;
  private isAvailable: boolean = false;

  constructor(src: string = "/audio/hero.mp3") {
    if (typeof window === "undefined") return;

    this.audio = new Audio(src);
    this.audio.loop = false;

    // Check if the audio file can be played
    this.audio.addEventListener("canplaythrough", () => {
      this.isAvailable = true;
    }, { once: true });

    // Handle error gracefully if the audio file does not exist (e.g. 404)
    this.audio.addEventListener("error", () => {
      this.isAvailable = false;
      console.log("Audio file '/audio/hero.mp3' not found. Disabling soundtrack gracefully.");
    }, { once: true });
  }

  play() {
    if (!this.audio || !this.isAvailable) return;

    this.audio.currentTime = 0;
    this.audio.play().catch((err) => {
      console.warn("Audio playback blocked by browser security policy:", err);
    });
  }

  stop() {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(volume: number) {
    if (!this.audio) return;
    this.audio.volume = Math.max(0, Math.min(1, volume));
  }

  setMute(mute: boolean) {
    if (!this.audio) return;
    this.audio.muted = mute;
  }

  getIsAvailable(): boolean {
    return this.isAvailable;
  }

  destroy() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = "";
      this.audio = null;
    }
  }
}
