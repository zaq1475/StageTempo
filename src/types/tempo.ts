export type NoteMode = 'straight' | 'dotted' | 'triplet';

export type PreDelayChoice = '1/64' | '1/32';

export type GenrePresetId = 'default' | 'pop' | 'rock' | 'ballad' | 'edm' | 'custom';

export interface GenrePreset {
  id: GenrePresetId;
  name: string;
  labelTh: string;
  preDelayChoice: PreDelayChoice;
  decayBeats: number;
  noteMode: NoteMode;
  tagline: string;
  descriptionTh: string;
}

export interface TempoEfxCalculation {
  bpm: number;
  beatDurationMs: number; // 1/4 note in ms (60000 / BPM)
  preDelayDivision: PreDelayChoice; // '1/64' (default) or '1/32'
  preDelayMs: number; // 3750/BPM for 1/64, 7500/BPM for 1/32 adjusted by noteMode
  decayBeats: number; // 1, 1.5, 2 (default), 3, 4, 5
  delayMs: number; // (decayBeats * 60000 / BPM) adjusted by noteMode
  decayMs: number; // delayMs - preDelayMs
  decaySec: number; // decayMs / 1000
  noteMode: NoteMode;
  noteMultiplier: number; // 1 for straight, 1.5 for dotted, 2/3 for triplet
}

export interface NoteDivisionRow {
  name: string;
  fraction: string;
  straightMs: number;
  dottedMs: number;
  tripletMs: number;
  descriptionTh: string;
}

export interface SetlistItem {
  id: string;
  title: string;
  bpm: number;
  key?: string;
  notes?: string;
  createdAt: number;
}

export type ClickSoundType = 'woodblock' | 'rimshot' | 'beep' | 'mute';
