import { ClickSoundType } from '../types/tempo';

class MetronomeEngine {
  private audioCtx: AudioContext | null = null;
  private isRunning: boolean = false;
  private bpm: number = 120;
  private soundType: ClickSoundType = 'woodblock';
  private volume: number = 0.8;
  private currentBeat: number = 0;
  private beatsPerMeasure: number = 4;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private onBeatCallback: ((beat: number) => void) | null = null;

  constructor() {
    // AudioContext will be initialized on user interaction
  }

  private initAudio() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setCallback(cb: (beat: number) => void) {
    this.onBeatCallback = cb;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(20, Math.min(320, newBpm));
  }

  public setSoundType(type: ClickSoundType) {
    this.soundType = type;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public setBeatsPerMeasure(beats: number) {
    this.beatsPerMeasure = beats;
  }

  private playClick(time: number, isAccent: boolean) {
    if (!this.audioCtx || this.soundType === 'mute') return;

    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    const baseVol = this.volume * (isAccent ? 1.0 : 0.6);

    if (this.soundType === 'woodblock') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isAccent ? 1200 : 800, time);
      osc.frequency.exponentialRampToValueAtTime(isAccent ? 300 : 200, time + 0.04);
      gainNode.gain.setValueAtTime(baseVol, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
      osc.start(time);
      osc.stop(time + 0.05);
    } else if (this.soundType === 'rimshot') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(isAccent ? 2400 : 1600, time);
      gainNode.gain.setValueAtTime(baseVol * 0.7, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
      osc.start(time);
      osc.stop(time + 0.04);
    } else {
      // Beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(isAccent ? 1760 : 880, time);
      gainNode.gain.setValueAtTime(baseVol, time);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
      osc.start(time);
      osc.stop(time + 0.07);
    }
  }

  private scheduleNext() {
    if (!this.audioCtx || !this.isRunning) return;

    // Lookahead: schedule notes that will play in next 100ms
    const lookaheadTime = 0.1;
    while (this.nextNoteTime < this.audioCtx.currentTime + lookaheadTime) {
      const isAccent = this.currentBeat === 0;
      this.playClick(this.nextNoteTime, isAccent);

      // Trigger beat visual callback with timing
      const delayToNotify = Math.max(0, (this.nextNoteTime - this.audioCtx.currentTime) * 1000);
      const beatForCallback = this.currentBeat;
      setTimeout(() => {
        if (this.isRunning && this.onBeatCallback) {
          this.onBeatCallback(beatForCallback);
        }
      }, delayToNotify);

      // Advance
      const secondsPerBeat = 60.0 / this.bpm;
      this.nextNoteTime += secondsPerBeat;
      this.currentBeat = (this.currentBeat + 1) % this.beatsPerMeasure;
    }

    this.timerId = window.setTimeout(() => this.scheduleNext(), 25);
  }

  public start() {
    this.initAudio();
    if (this.isRunning || !this.audioCtx) return;

    this.isRunning = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioCtx.currentTime + 0.05;
    this.scheduleNext();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.currentBeat = 0;
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }
}

export const metronome = new MetronomeEngine();
