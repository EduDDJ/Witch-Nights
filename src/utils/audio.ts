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

  public playShoot(type: 'wand' | 'shotgun' | 'wisp' | 'lightning' | 'nova' | 'cauldron') {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      this.connectOut(gain);

      if (type === 'wand') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
      } else if (type === 'shotgun') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
      } else if (type === 'wisp') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
        gain.gain.setValueAtTime(0.06, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
      } else if (type === 'lightning') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.05);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.2);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      } else if (type === 'nova') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
      } else {
        // cauldron splash
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.linearRampToValueAtTime(180, t + 0.2);
        gain.gain.setValueAtTime(0.09, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
      }
    } catch {
      // safe ignore
    }
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

  public playEnemyDeath() {
    if (!this.enabled || this.volume <= 0.01) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.16);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.16);
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
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(950, t + 0.08);
      osc.frequency.exponentialRampToValueAtTime(150, t + 0.22);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      this.connectOut(gain);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch {
      // safe ignore
    }
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
