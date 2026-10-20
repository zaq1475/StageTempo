/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { metronome } from './utils/audioMetronome';
import { calculateTempoEfx } from './utils/audioCalculator';
import { ClickSoundType, NoteMode, PreDelayChoice, GenrePreset } from './types/tempo';
import { MobileStageCockpit } from './components/MobileStageCockpit';
import { BottomSheet } from './components/BottomSheet';
import { NoteDivisionsTable } from './components/NoteDivisionsTable';
import { SetlistManager } from './components/SetlistManager';
import { GenrePresetSheet } from './components/GenrePresetSheet';
import { matchCurrentGenre, getGenreDisplayName } from './utils/genrePresets';
import { useIsLandscape } from './utils/useOrientation';
import {
  Maximize2,
  Minimize2,
  Table,
  ListMusic,
  Disc3,
  Volume2,
} from 'lucide-react';

export default function App() {
  const isLandscape = useIsLandscape();
  const [bpm, setBpm] = useState<number>(104);
  const [preDelayChoice, setPreDelayChoice] = useState<PreDelayChoice>('1/64'); // เริ่มต้นที่ 1/64 ทั้งหมด
  const [decayBeats, setDecayBeats] = useState<number>(2); // เริ่มต้นที่ 2 Beats
  const [noteMode, setNoteMode] = useState<NoteMode>('straight');

  // Metronome states
  const [isMetronomePlaying, setIsMetronomePlaying] = useState<boolean>(false);
  const [activeBeat, setActiveBeat] = useState<number>(0);
  const [soundType, setSoundType] = useState<ClickSoundType>('woodblock');
  const [volume, setVolume] = useState<number>(0.8);
  const [isStageMode, setIsStageMode] = useState<boolean>(false);

  // Active BottomSheet modal (null = closed, 'notes' | 'setlist' | 'genre')
  const [activeSheet, setActiveSheet] = useState<'notes' | 'setlist' | 'genre' | null>(null);

  // Calculated Reverb & Delay results
  const calculation = calculateTempoEfx(bpm, preDelayChoice, decayBeats, noteMode);

  // Current genre name for display
  const currentGenreId = matchCurrentGenre(preDelayChoice, decayBeats, noteMode);
  const currentGenreName = getGenreDisplayName(currentGenreId);

  const handleApplyGenrePreset = useCallback((preset: GenrePreset) => {
    setPreDelayChoice(preset.preDelayChoice);
    setDecayBeats(preset.decayBeats);
    setNoteMode(preset.noteMode);
  }, []);

  useEffect(() => {
    metronome.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    metronome.setSoundType(soundType);
  }, [soundType]);

  useEffect(() => {
    metronome.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    metronome.setCallback((beat: number) => {
      setActiveBeat(beat);
    });
    return () => {
      metronome.stop();
    };
  }, []);

  const handleTogglePlay = useCallback(() => {
    const playing = metronome.toggle();
    setIsMetronomePlaying(playing);
  }, []);

  const handleBpmChange = useCallback((newBpm: number) => {
    setBpm(newBpm);
  }, []);

  return (
    <div
      className={`h-[100dvh] w-full flex flex-col justify-between overflow-hidden text-slate-100 select-none transition-colors duration-150 ${
        isStageMode ? 'bg-black' : 'bg-slate-950'
      }`}
    >
      {/* 1. TOP BAR: Compact & Clean */}
      <header className={`px-3.5 sm:px-5 ${isLandscape ? 'py-1.5' : 'py-2.5'} bg-slate-950/90 border-b border-slate-800/80 shrink-0`}>
        <div className={`${isLandscape ? 'max-w-5xl' : 'max-w-lg'} mx-auto flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full transition-all duration-75 ${
                isMetronomePlaying && activeBeat === 0
                  ? 'bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,1)]'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-sm font-black tracking-tight text-white">
              StageTempo Pro
            </span>
          </div>

          {/* Quick Sound & Stage Dark Mode Toggles */}
          <div className="flex items-center gap-1.5 text-xs">
            {/* Metronome Sound Click selector */}
            <button
              type="button"
              onClick={() => {
                const next: Record<ClickSoundType, ClickSoundType> = {
                  woodblock: 'rimshot',
                  rimshot: 'beep',
                  beep: 'mute',
                  mute: 'woodblock',
                };
                setSoundType(next[soundType]);
              }}
              className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
              title="เปลี่ยนเสียงเคาะ"
            >
              <Volume2 className="w-3 h-3 text-amber-400" />
              <span className="capitalize">{soundType}</span>
            </button>

            {/* Stage Dark Mode */}
            <button
              type="button"
              onClick={() => setIsStageMode(!isStageMode)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isStageMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900 text-slate-300 border-slate-800'
              }`}
              title="โหมดเวทีมืด (Stage Dark)"
            >
              {isStageMode ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN COCKPIT: Single-Screen No Scroll View in both Portrait & Landscape */}
      <main className={`flex-1 w-full px-2.5 sm:px-5 ${isLandscape ? 'py-1 sm:py-1.5' : 'py-2'} flex flex-col justify-between overflow-hidden`}>
        <MobileStageCockpit
          bpm={bpm}
          onBpmChange={handleBpmChange}
          calculation={calculation}
          preDelayChoice={preDelayChoice}
          onPreDelayChoiceChange={setPreDelayChoice}
          decayBeats={decayBeats}
          onDecayBeatsChange={setDecayBeats}
          noteMode={noteMode}
          onNoteModeChange={setNoteMode}
          isMetronomePlaying={isMetronomePlaying}
          onTogglePlay={handleTogglePlay}
          soundType={soundType}
          onSoundTypeChange={setSoundType}
          activeBeat={activeBeat}
          onOpenGenreSheet={() => setActiveSheet('genre')}
          onApplyGenrePreset={handleApplyGenrePreset}
          isLandscape={isLandscape}
        />
      </main>

      {/* 3. BOTTOM UTILITY BAR: Single-Tap Sheet Triggers */}
      <footer className={`px-3 sm:px-5 ${isLandscape ? 'py-1 sm:py-1.5' : 'py-2'} bg-slate-950 border-t border-slate-900 shrink-0`}>
        <div className={`${isLandscape ? 'max-w-5xl' : 'max-w-lg'} mx-auto grid grid-cols-3 gap-2`}>
          <button
            type="button"
            onClick={() => setActiveSheet('notes')}
            className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-slate-300 flex items-center justify-center gap-1.5 text-xs transition-colors active:scale-95"
          >
            <Table className="w-3.5 h-3.5 text-cyan-400" />
            <span className="truncate">ตารางโน้ต</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheet('setlist')}
            className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800/80 text-slate-300 flex items-center justify-center gap-1.5 text-xs transition-colors active:scale-95"
          >
            <ListMusic className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">คลังเพลง</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSheet('genre')}
            className={`py-1.5 px-2 rounded-xl border flex items-center justify-center gap-1.5 text-xs transition-colors active:scale-95 ${
              currentGenreId !== 'custom'
                ? 'bg-amber-400/10 border-amber-400/40 text-amber-300 font-semibold'
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800/80 text-slate-300'
            }`}
            title="เลือกพรีเซ็ตตามแนวเพลง (Genre Presets)"
          >
            <Disc3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">Genre: {currentGenreName}</span>
          </button>
        </div>
      </footer>

      {/* 4. BOTTOM SHEET DRAWERS (Opens without leaving or scrolling the main cockpit) */}
      <BottomSheet
        isOpen={activeSheet === 'notes'}
        onClose={() => setActiveSheet(null)}
        title="ตารางค่าตัวโน้ตมิลลิวินาที (Note Divisions)"
      >
        <NoteDivisionsTable
          bpm={bpm}
          noteMode={noteMode}
          onNoteModeChange={setNoteMode}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'setlist'}
        onClose={() => setActiveSheet(null)}
        title="คลังเพลงแสดงสด (Live Gig Setlist)"
      >
        <SetlistManager
          currentBpm={bpm}
          onSelectSongBpm={(selectedBpm) => {
            setBpm(selectedBpm);
            setActiveSheet(null);
          }}
          preDelayChoice={preDelayChoice}
          decayBeats={decayBeats}
        />
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === 'genre'}
        onClose={() => setActiveSheet(null)}
        title="พรีเซ็ตตามแนวเพลง (Genre Presets)"
      >
        <GenrePresetSheet
          currentBpm={bpm}
          preDelayChoice={preDelayChoice}
          decayBeats={decayBeats}
          noteMode={noteMode}
          onApplyPreset={handleApplyGenrePreset}
          onClose={() => setActiveSheet(null)}
        />
      </BottomSheet>
    </div>
  );
}
