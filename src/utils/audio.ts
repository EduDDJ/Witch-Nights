/**
 * Procedural Audio Synthesizer for Witch Nights
 * Generates retro arcade / occult sound effects without external asset dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  public enabled: boolean = true;
  public volume: number = 0.8; // 0.0 to 1.0

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime);
    }
  }

  private connectOut(gain: GainNode) {
    if (this.masterGain) {
      gain.connect(this.masterGain);
    } else if (this.ctx) {
      gain.connect(this.ctx.destination);
    }
  }

  public playTestBeep() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // safe ignore
    }
  }

  public playShoot(_type?: 'wand' | 'shotgun' | 'wisp' | 'lightning' | 'nova' | 'cauldron' | 'sword' | 'fireball' | 'plant') {
    // Weapon shooting sounds disabled to prevent auditory fatigue from continuous auto-fire
  }

  public playHit() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // safe ignore
    }
  }

  public playBite() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.14);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch {
      // safe ignore
    }
  }

  public playRoar() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.linearRampToValueAtTime(65, t + 0.3);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch {
      // safe ignore
    }
  }

  public playEnemyDeath() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Instantaneous crisp bubble / wood pop (zero attack lag)
      const peakFreq = 1080 + (Math.random() - 0.5) * 160;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(peakFreq, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.04);

      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch {
      // safe ignore
    }
  }

  public playFootstepLeaves() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const duration = 0.065; // Short, subtle leaf crunch

      // Filtered noise buffer for dry leaves / foliage rustle
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Bandpass centered on foliage rustle frequencies (1.4kHz - 3.2kHz)
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(2.0, t);
      const centerFreq = 1800 + (Math.random() - 0.5) * 400;
      bandpass.frequency.setValueAtTime(centerFreq, t);
      bandpass.frequency.exponentialRampToValueAtTime(centerFreq * 0.55, t + duration);

      // Lowpass to keep it soft and organic
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(3600, t);

      // Quiet footstep volume
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.028, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      noiseSource.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(gain);
      this.connectOut(gain);

      noiseSource.start(t);
      noiseSource.stop(t + duration);
    } catch {
      // safe ignore
    }
  }

  public playDash() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const duration = 0.22;

      // 1. Aerodynamic modulated filtered noise for an authentic, airy "swoosh"
      const bufferSize = Math.floor(this.ctx.sampleRate * duration);
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Sweeping bandpass filter (whoosh curve)
      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(1.8, t);
      bandpass.frequency.setValueAtTime(320, t);
      bandpass.frequency.exponentialRampToValueAtTime(1600, t + 0.07);
      bandpass.frequency.exponentialRampToValueAtTime(220, t + duration);

      // Lowpass smoothing filter
      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(2400, t);
      lowpass.frequency.exponentialRampToValueAtTime(800, t + duration);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.22, t + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      whiteNoise.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(noiseGain);
      this.connectOut(noiseGain);
      whiteNoise.start(t);
      whiteNoise.stop(t + duration);

      // 2. Soft sub-harmonic air displacement layer
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.06);
      osc.frequency.exponentialRampToValueAtTime(90, t + duration);

      oscGain.gain.setValueAtTime(0.001, t);
      oscGain.gain.exponentialRampToValueAtTime(0.08, t + 0.05);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(oscGain);
      this.connectOut(oscGain);
      osc.start(t);
      osc.stop(t + duration);
    } catch {
      // safe ignore
    }
  }

  public playWhoosh() {
    this.playDash();
  }

  public playExpPickup() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, t);
      osc.frequency.exponentialRampToValueAtTime(1200, t + 0.07);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch {
      // safe ignore
    }
  }

  public playExplosion() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // safe ignore
    }
  }

  public playLevelUp() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const notes = [392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        this.connectOut(gain);
        osc.start(t);
        osc.stop(t + 0.25);
      });
    } catch {
      // safe ignore
    }
  }

  public playPlayerHurt() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch {
      // safe ignore
    }
  }

  public playWitchDeal() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // ominous low bell & chime
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, t);
      osc1.frequency.exponentialRampToValueAtTime(55, t + 1.2);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, t);
      osc2.frequency.exponentialRampToValueAtTime(440, t + 1.0);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      this.connectOut(gain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 1.2);
      osc2.stop(t + 1.2);
    } catch {
      // safe ignore
    }
  }
}

export const soundEngine = new SoundEngine();
