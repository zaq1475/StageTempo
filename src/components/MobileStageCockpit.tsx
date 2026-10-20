import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Hand,
  Play,
  Square,
  Copy,
  Check,
  Plus,
  Minus,
  Edit3,
  ChevronDown,
  Disc3,
} from 'lucide-react';
import {
  TempoEfxCalculation,
  NoteMode,
  ClickSoundType,
  PreDelayChoice,
  GenrePreset,
} from '../types/tempo';
import { formatMs, getTempoName } from '../utils/audioCalculator';
import { GENRE_PRESETS, matchCurrentGenre } from '../utils/genrePresets';
import { useIsLandscape } from '../utils/useOrientation';

interface MobileStageCockpitProps {
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  calculation: TempoEfxCalculation;
  preDelayChoice: PreDelayChoice;
  onPreDelayChoiceChange: (choice: PreDelayChoice) => void;
  decayBeats: number;
  onDecayBeatsChange: (beats: number) => void;
  noteMode: NoteMode;
  onNoteModeChange: (noteMode: NoteMode) => void;
  isMetronomePlaying: boolean;
  onTogglePlay: () => void;
  soundType: ClickSoundType;
  onSoundTypeChange: (type: ClickSoundType) => void;
  activeBeat: number;
  onOpenGenreSheet?: () => void;
  onApplyGenrePreset?: (preset: GenrePreset) => void;
  isLandscape?: boolean;
}

const DECAY_BEAT_OPTIONS = [
  { value: 1, label: '1 Beat (1/4)' },
  { value: 1.5, label: '1.5 Beats' },
  { value: 2, label: '2 Beats (เริ่ม)' },
  { value: 3, label: '3 Beats' },
  { value: 4, label: '4 Beats (1/1)' },
  { value: 5, label: '5 Beats' },
];

export function MobileStageCockpit({
  bpm,
  onBpmChange,
  calculation,
  preDelayChoice,
  onPreDelayChoiceChange,
  decayBeats,
  onDecayBeatsChange,
  noteMode,
  onNoteModeChange,
  isMetronomePlaying,
  onTogglePlay,
  soundType: _soundType,
  onSoundTypeChange: _onSoundTypeChange,
  activeBeat,
  onOpenGenreSheet,
  onApplyGenrePreset,
  isLandscape: propIsLandscape,
}: MobileStageCockpitProps) {
  const detectedLandscape = useIsLandscape();
  const isLandscape = propIsLandscape !== undefined ? propIsLandscape : detectedLandscape;

  // Tap states: store history in ref to prevent setState inside updater callback
  const tapHistoryRef = useRef<number[]>([]);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [tapCount, setTapCount] = useState<number>(0);
  const tapTimeoutRef = useRef<number | null>(null);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inline edit state for BPM
  const [isEditingBpm, setIsEditingBpm] = useState<boolean>(false);
  const [bpmInput, setBpmInput] = useState<string>(bpm.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBpmInput(bpm.toString());
  }, [bpm]);

  useEffect(() => {
    if (isEditingBpm && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingBpm]);

  const handleBpmSubmit = () => {
    const val = parseInt(bpmInput, 10);
    if (!isNaN(val) && val >= 30 && val <= 300) {
      onBpmChange(val);
    }
    setIsEditingBpm(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Tap handler
  const handleTap = useCallback(() => {
    const now = performance.now();
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 100);

    if (tapTimeoutRef.current !== null) {
      clearTimeout(tapTimeoutRef.current);
    }
    tapTimeoutRef.current = window.setTimeout(() => {
      tapHistoryRef.current = [];
      setTapCount(0);
    }, 2200);

    const history = tapHistoryRef.current;
    const next = [...history, now].slice(-8);
    tapHistoryRef.current = next;
    setTapCount(next.length);

    if (next.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < next.length; i++) {
        intervals.push(next[i] - next[i - 1]);
      }
      let valid = intervals;
      if (intervals.length >= 4) {
        const sorted = [...intervals].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        valid = intervals.filter((inv) => inv >= median * 0.65 && inv <= median * 1.45);
        if (valid.length === 0) valid = intervals;
      }
      const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
      if (avg > 0) {
        const calculated = Math.round(Math.max(30, Math.min(300, 60000 / avg)));
        onBpmChange(calculated);
      }
    }
  }, [onBpmChange]);

  // Spacebar support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleTap]);

  const {
    preDelayDivision,
    preDelayMs,
    delayMs,
    decayMs,
    decaySec,
  } = calculation;

  const tempo = getTempoName(bpm);
  const activeGenreId = matchCurrentGenre(preDelayChoice, decayBeats, noteMode);

  const applyGenre = (p: GenrePreset) => {
    if (onApplyGenrePreset) {
      onApplyGenrePreset(p);
    } else {
      onPreDelayChoiceChange(p.preDelayChoice);
      onDecayBeatsChange(p.decayBeats);
      onNoteModeChange(p.noteMode);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* LANDSCAPE VIEW: Dedicated 2-Column Studio Cockpit (Guaranteed Zero-Scroll) */
  /* -------------------------------------------------------------------------- */
  if (isLandscape) {
    return (
      <div className="w-full h-full flex flex-row items-stretch justify-between gap-2.5 sm:gap-3.5 max-w-5xl mx-auto overflow-hidden">
        {/* LEFT COLUMN: Controls, BPM Hero & Tap / Metronome */}
        <div className="w-[49%] flex flex-col justify-between gap-1.5 min-h-0">
          {/* Top Quick Strip: Genre Pills + Note Mode + Pre-delay Switcher */}
          <div className="flex flex-col gap-1 p-1 bg-slate-900/90 border border-slate-800/90 rounded-xl text-xs shrink-0">
            {/* Genre Row */}
            <div className="flex items-center justify-between gap-1">
              <button
                type="button"
                onClick={onOpenGenreSheet}
                className="flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 transition-colors shrink-0"
                title="เปิดหน้าต่างเลือกแนวเพลงทั้งหมด"
              >
                <Disc3 className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  GENRE:
                </span>
              </button>

              <div className="flex items-center gap-1 flex-1 justify-end overflow-hidden">
                {GENRE_PRESETS.map((p) => {
                  const isSelected = activeGenreId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyGenre(p)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black transition-all active:scale-95 truncate ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                      }`}
                      title={`${p.name}: Pre ${p.preDelayChoice}, Decay ${p.decayBeats}B, โน้ต${p.noteMode === 'dotted' ? ' Dotted' : ' ธรรมดา'}`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note Mode & Pre-Delay Toggle Row */}
            <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/80">
              {/* Note Mode Segmented Buttons */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onNoteModeChange('straight')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                    noteMode === 'straight'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ธรรมดา
                </button>
                <button
                  type="button"
                  onClick={() => onNoteModeChange('dotted')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                    noteMode === 'dotted'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dotted
                </button>
                <button
                  type="button"
                  onClick={() => onNoteModeChange('triplet')}
                  className={`px-1.5 py-0.5 rounded text-[10px] transition-all ${
                    noteMode === 'triplet'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Triplet
                </button>
              </div>

              {/* Pre-Delay Toggle: 1/64 (Default) vs 1/32 */}
              <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
                <span className="text-slate-500 text-[9px]">Pre:</span>
                <button
                  type="button"
                  onClick={() => onPreDelayChoiceChange('1/64')}
                  className={`px-1.5 py-0.5 rounded font-mono transition-colors text-[9px] ${
                    preDelayChoice === '1/64'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Pre-Delay 1/64 โน้ต (ค่าเริ่มต้น)"
                >
                  1/64
                </button>
                <button
                  type="button"
                  onClick={() => onPreDelayChoiceChange('1/32')}
                  className={`px-1.5 py-0.5 rounded font-mono transition-colors text-[9px] ${
                    preDelayChoice === '1/32'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                  title="Pre-Delay 1/32 โน้ต"
                >
                  1/32
                </button>
              </div>
            </div>
          </div>

          {/* Compact BPM Hero */}
          <div className="rounded-xl bg-slate-900/80 border border-slate-800/90 p-2 sm:p-2.5 flex flex-col justify-between shadow-md flex-1 min-h-0">
            {/* LED Pulse & Tempo info */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3].map((b) => (
                  <span
                    key={b}
                    className={`h-1.5 rounded-full transition-all duration-75 ${
                      isMetronomePlaying && activeBeat === b
                        ? b === 0
                          ? 'w-4 bg-amber-400'
                          : 'w-3 bg-cyan-400'
                        : 'w-1.5 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="truncate max-w-[80px] sm:max-w-none">{tempo.label}</span>
                <span aria-hidden="true" className="text-slate-700">·</span>
                <span className="font-mono text-slate-300">1/4 = {(60000 / bpm).toFixed(0)}ms</span>
              </div>
            </div>

            {/* BPM Display */}
            <div className="flex items-center justify-center my-auto py-0.5">
              {isEditingBpm ? (
                <input
                  ref={inputRef}
                  type="number"
                  min={30}
                  max={300}
                  value={bpmInput}
                  onChange={(e) => setBpmInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleBpmSubmit();
                    if (e.key === 'Escape') setIsEditingBpm(false);
                  }}
                  onBlur={handleBpmSubmit}
                  className="w-28 text-center text-5xl font-mono font-black text-amber-400 bg-slate-950 border border-amber-500/50 rounded-xl outline-none"
                />
              ) : (
                <div
                  onClick={() => setIsEditingBpm(true)}
                  className="flex items-baseline gap-1.5 cursor-pointer active:scale-95 transition-transform select-none"
                  title="แตะเพื่อพิมพ์ตัวเลข BPM"
                >
                  <span className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-amber-400 tabular-nums leading-none">
                    {bpm}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-400">BPM</span>
                    <span className="text-[8px] text-slate-500 flex items-center gap-0.5">
                      <Edit3 className="w-2 h-2" /> แตะแก้
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Steppers & Range Slider */}
            <div className="w-full flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onBpmChange(Math.max(30, bpm - 1))}
                className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 active:scale-90 shrink-0"
                title="ลด 1"
              >
                <Minus className="w-3 h-3" />
              </button>

              <input
                type="range"
                min={40}
                max={240}
                step={1}
                value={bpm}
                onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
                className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <button
                type="button"
                onClick={() => onBpmChange(Math.min(300, bpm + 1))}
                className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 active:scale-90 shrink-0"
                title="เพิ่ม 1"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Tap Tempo & Metronome Play Row */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Tap Button */}
            <button
              type="button"
              onClick={handleTap}
              className={`flex-1 h-12 sm:h-14 rounded-xl flex items-center justify-center gap-2 transition-all select-none cursor-pointer border active:scale-[0.97] outline-none ${
                isTapping
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md shadow-amber-500/30'
                  : 'bg-slate-900 hover:bg-slate-850 text-white border-slate-800 hover:border-amber-400/50 shadow-sm'
              }`}
              aria-label="Tap Tempo"
            >
              <Hand className={`w-5 h-5 ${isTapping ? 'text-slate-950 scale-110' : 'text-amber-400'}`} />
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base font-black tracking-tight">
                  TAP TEMPO
                </span>
                {tapCount > 0 && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    #{tapCount}
                  </span>
                )}
              </div>
            </button>

            {/* Metronome Click Button */}
            <button
              type="button"
              onClick={onTogglePlay}
              className={`w-16 sm:w-20 h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all border active:scale-95 shrink-0 ${
                isMetronomePlaying
                  ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title={isMetronomePlaying ? 'หยุดเสียงเคาะ' : 'เปิดเสียงเคาะเมโทรนอม'}
            >
              {isMetronomePlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">STOP</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current text-amber-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">CLICK</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: PRE-DELAY & REVERB DECAY (THE CRITICAL DATA) */}
        <div className="w-[51%] flex flex-col justify-between gap-1.5 min-h-0">
          {/* 1. Pre-Delay Card */}
          <div className="rounded-xl bg-slate-900/90 border border-slate-800/90 p-2 sm:p-2.5 flex flex-col justify-between shadow-md flex-1 min-h-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  PRE-DELAY
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300">
                  {preDelayDivision} Note
                </span>
              </div>
              <div className="text-[9px] text-slate-500">
                {preDelayChoice === '1/64' ? '1/64 (ค่าเริ่มต้น)' : '1/32 (สลับใช้)'}
              </div>
            </div>

            {/* Huge Pre-Delay Numbers */}
            <div className="my-auto py-0.5 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tabular-nums tracking-tight">
                {formatMs(preDelayMs, 2)}
              </span>
              <span className="text-xs font-mono text-slate-400">ms</span>
            </div>

            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[9px] text-slate-400 truncate">เว้นหัวคำร้องให้คมชัด</span>
              <button
                type="button"
                onClick={() => copyToClipboard(preDelayMs.toFixed(2), 'predelay')}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-[10px]"
                title="คัดลอก ms"
              >
                {copiedKey === 'predelay' ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>ก๊อป ms</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 2. Reverb Decay Card (with Dropdown List for Beats) */}
          <div className="rounded-xl bg-gradient-to-b from-slate-900/90 to-amber-950/20 border border-amber-500/40 p-2 sm:p-2.5 flex flex-col justify-between shadow-md flex-1 min-h-0">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                  DECAY (RT60)
                </span>

                {/* Decay Beats Dropdown List */}
                <div className="relative">
                  <select
                    value={decayBeats}
                    onChange={(e) => onDecayBeatsChange(parseFloat(e.target.value))}
                    className="appearance-none bg-slate-950 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-lg pl-1.5 pr-4 py-0.5 outline-none cursor-pointer hover:border-amber-400 transition-colors"
                    title="เลือกจำนวน Beat สำหรับ Decay"
                  >
                    {DECAY_BEAT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.value} Beat{opt.value > 1 ? 's' : ''} {opt.value === 2 ? '(เริ่ม)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-2.5 h-2.5 text-amber-400 absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="text-[9px] text-slate-400 font-mono">
                Delay ({decayBeats}B) - Pre
              </div>
            </div>

            {/* Huge Decay Numbers */}
            <div className="my-auto py-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-300 tabular-nums tracking-tight">
                  {formatMs(decayMs, 2)}
                </span>
                <span className="text-xs font-mono text-amber-400">ms</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                ≈ {decaySec.toFixed(2)} วินาที
              </div>
            </div>

            <div className="pt-1.5 border-t border-amber-500/20 flex items-center justify-between">
              <span className="text-[9px] text-amber-200/80">{decayBeats} Beats</span>
              <button
                type="button"
                onClick={() => copyToClipboard(decayMs.toFixed(2), 'decay')}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-bold"
                title="คัดลอก Decay (ms)"
              >
                {copiedKey === 'decay' ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <>
                    <Copy className="w-2.5 h-2.5" />
                    <span>ก๊อป ms</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Compact Equation Strip */}
          <div className="py-1 px-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[10px] font-mono shrink-0">
            <div className="flex items-center gap-1 text-slate-400 truncate">
              <span className="text-cyan-400 font-semibold">{decayBeats}B: {formatMs(delayMs, 1)}ms</span>
              <span>−</span>
              <span className="text-amber-400 font-semibold">Pre: {formatMs(preDelayMs, 1)}ms</span>
              <span>=</span>
              <span className="text-amber-300 font-bold">{formatMs(decayMs, 1)}ms</span>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(delayMs.toFixed(2), 'delay')}
              className="text-slate-500 hover:text-cyan-400 flex items-center gap-1 shrink-0 ml-1.5"
              title={`คัดลอก Delay (${decayBeats} Beats)`}
            >
              {copiedKey === 'delay' ? (
                <span className="text-emerald-400 text-[9px]">คัดลอกแล้ว</span>
              ) : (
                <span className="text-[9px]">ก๊อป Delay</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* PORTRAIT VIEW: Established Single-Screen Layout (Guaranteed Zero-Scroll)   */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="w-full flex-1 flex flex-col justify-between gap-2 sm:gap-3 max-w-lg mx-auto">
      {/* 1. TOP SELECTOR STRIP: GENRE PRESETS & FINE TUNING */}
      <div className="flex flex-col gap-1.5 shrink-0">
        {/* Genre Presets Quick Switcher */}
        <div className="flex items-center justify-between gap-1 p-1 bg-slate-900/95 border border-slate-800/90 rounded-xl text-xs">
          <button
            type="button"
            onClick={onOpenGenreSheet}
            className="flex items-center gap-1.5 pl-1.5 pr-2 py-0.5 rounded-lg text-slate-300 hover:text-amber-400 hover:bg-slate-800/50 transition-colors"
            title="เปิดหน้าต่างเลือกพรีเซ็ตแนวเพลงทั้งหมด"
          >
            <Disc3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
              GENRE:
            </span>
          </button>

          <div className="flex items-center gap-1 flex-1 justify-end">
            {GENRE_PRESETS.map((p) => {
              const isSelected = activeGenreId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyGenre(p)}
                  className={`px-2 py-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                  title={`${p.name}: Pre ${p.preDelayChoice}, Decay ${p.decayBeats} Beats, โน้ต${p.noteMode === 'dotted' ? ' Dotted' : ' ธรรมดา'}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Mode & Pre-Delay Switcher */}
        <div className="flex items-center justify-between gap-1 p-1 bg-slate-900/70 border border-slate-800/80 rounded-xl text-xs">
          {/* Note Mode Segmented Buttons */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => onNoteModeChange('straight')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all text-[11px] ${
                noteMode === 'straight'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ธรรมดา
            </button>
            <button
              type="button"
              onClick={() => onNoteModeChange('dotted')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all text-[11px] ${
                noteMode === 'dotted'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dotted (·)
            </button>
            <button
              type="button"
              onClick={() => onNoteModeChange('triplet')}
              className={`px-2 py-0.5 rounded-lg font-medium transition-all text-[11px] ${
                noteMode === 'triplet'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Triplet (3)
            </button>
          </div>

          {/* Pre-Delay Toggle: 1/64 (Default) vs 1/32 */}
          <div className="flex items-center gap-1 border-l border-slate-800 pl-1 text-[11px]">
            <span className="text-slate-500 hidden sm:inline text-[10px]">Pre:</span>
            <button
              type="button"
              onClick={() => onPreDelayChoiceChange('1/64')}
              className={`px-1.5 py-0.5 rounded font-mono transition-colors text-[10px] ${
                preDelayChoice === '1/64'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
              title="Pre-Delay 1/64 โน้ต (ค่าเริ่มต้น)"
            >
              1/64 (เริ่ม)
            </button>
            <button
              type="button"
              onClick={() => onPreDelayChoiceChange('1/32')}
              className={`px-1.5 py-0.5 rounded font-mono transition-colors text-[10px] ${
                preDelayChoice === '1/32'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
              title="Pre-Delay 1/32 โน้ต"
            >
              1/32
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HERO: BPM & COMPACT SLIDER */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800/90 p-3.5 sm:p-4 flex flex-col items-center justify-center shrink-0 shadow-lg">
        {/* LED beat pulse indicator */}
        <div className="flex items-center justify-between w-full mb-1">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((b) => (
              <span
                key={b}
                className={`h-1.5 rounded-full transition-all duration-75 ${
                  isMetronomePlaying && activeBeat === b
                    ? b === 0
                      ? 'w-5 bg-amber-400'
                      : 'w-3.5 bg-cyan-400'
                    : 'w-1.5 bg-slate-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{tempo.label}</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span className="font-mono text-slate-300">1/4 = {(60000 / bpm).toFixed(1)}ms</span>
          </div>
        </div>

        {/* Huge BPM Display */}
        {isEditingBpm ? (
          <div className="flex items-center gap-2 my-1">
            <input
              ref={inputRef}
              type="number"
              min={30}
              max={300}
              value={bpmInput}
              onChange={(e) => setBpmInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleBpmSubmit();
                if (e.key === 'Escape') setIsEditingBpm(false);
              }}
              onBlur={handleBpmSubmit}
              className="w-32 text-center text-6xl font-mono font-black text-amber-400 bg-slate-950 border border-amber-500/50 rounded-xl outline-none"
            />
          </div>
        ) : (
          <div
            onClick={() => setIsEditingBpm(true)}
            className="flex items-baseline gap-2 cursor-pointer active:scale-95 transition-transform my-0.5 select-none"
            title="แตะเพื่อพิมพ์ตัวเลข BPM"
          >
            <span className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-amber-400 tabular-nums">
              {bpm}
            </span>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-400">BPM</span>
              <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                <Edit3 className="w-2.5 h-2.5" /> แตะเพื่อพิมพ์
              </span>
            </div>
          </div>
        )}

        {/* Compact Slider & Steppers Row */}
        <div className="w-full flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => onBpmChange(Math.max(30, bpm - 1))}
            className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 font-mono text-xs active:scale-90"
            title="ลด 1"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min={40}
            max={240}
            step={1}
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
            className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />

          <button
            type="button"
            onClick={() => onBpmChange(Math.min(300, bpm + 1))}
            className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 font-mono text-xs active:scale-90"
            title="เพิ่ม 1"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. HERO SECONDARY: PRE-DELAY & REVERB DECAY (WITH BEATS DROPDOWN LIST) */}
      <div className="grid grid-cols-2 gap-2.5 shrink-0">
        {/* Pre-Delay Card */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-3 sm:p-3.5 flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                PRE-DELAY
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300">
                {preDelayDivision} Note
              </span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {preDelayChoice === '1/64' ? '1/64 (ค่าเริ่มต้น)' : '1/32 (สลับใช้)'}
            </div>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums tracking-tight">
                {formatMs(preDelayMs, 2)}
              </span>
              <span className="text-xs font-mono text-slate-400">ms</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">เว้นหัวคำร้อง</span>
            <button
              type="button"
              onClick={() => copyToClipboard(preDelayMs.toFixed(2), 'predelay')}
              className="p-1 rounded bg-slate-950 text-slate-300 hover:text-white border border-slate-800 text-xs"
              title="คัดลอก ms"
            >
              {copiedKey === 'predelay' ? (
                <Check className="w-3 h-3 text-emerald-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>

        {/* Reverb Decay Card with Drop Down List for Beats */}
        <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-amber-950/20 border border-amber-500/40 p-3 sm:p-3.5 flex flex-col justify-between shadow-lg shadow-amber-500/5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">
                DECAY (RT60)
              </span>

              {/* Decay Beats Dropdown List */}
              <div className="relative">
                <select
                  value={decayBeats}
                  onChange={(e) => onDecayBeatsChange(parseFloat(e.target.value))}
                  className="appearance-none bg-slate-950 border border-amber-500/40 text-amber-300 text-[10px] font-bold rounded-lg pl-2 pr-5 py-0.5 outline-none cursor-pointer hover:border-amber-400 transition-colors"
                  title="เลือกจำนวน Beat สำหรับ Decay"
                >
                  {DECAY_BEAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                      {opt.value} Beat{opt.value > 1 ? 's' : ''} {opt.value === 2 ? '(เริ่ม)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-amber-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Delay ({decayBeats}B) - Pre
            </div>

            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 tabular-nums tracking-tight">
                {formatMs(decayMs, 2)}
              </span>
              <span className="text-xs font-mono text-amber-400">ms</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              ≈ {decaySec.toFixed(2)} วินาที
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex items-center justify-between">
            <span className="text-[10px] text-amber-200/80">{decayBeats} Beats</span>
            <button
              type="button"
              onClick={() => copyToClipboard(decayMs.toFixed(2), 'decay')}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-bold"
              title="คัดลอก Decay (ms)"
            >
              {copiedKey === 'decay' ? (
                <Check className="w-3 h-3" />
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>ก๊อป ms</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. COMPACT TIME EQUATION STRIP */}
      <div className="py-1.5 px-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-1.5 text-slate-400 truncate">
          <span className="text-cyan-400 font-semibold">{decayBeats}B: {formatMs(delayMs, 1)}ms</span>
          <span>−</span>
          <span className="text-amber-400 font-semibold">Pre: {formatMs(preDelayMs, 1)}ms</span>
          <span>=</span>
          <span className="text-amber-300 font-bold">{formatMs(decayMs, 1)}ms</span>
        </div>

        <button
          type="button"
          onClick={() => copyToClipboard(delayMs.toFixed(2), 'delay')}
          className="text-slate-500 hover:text-cyan-400 flex items-center gap-1 shrink-0 ml-2"
          title={`คัดลอก Delay (${decayBeats} Beats)`}
        >
          {copiedKey === 'delay' ? (
            <span className="text-emerald-400 text-[10px]">คัดลอกแล้ว</span>
          ) : (
            <span className="text-[10px]">ก๊อป Delay</span>
          )}
        </button>
      </div>

      {/* 5. NATURAL THUMB ZONE: MASSIVE TAP BUTTON + AUDIO METRONOME */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Massive Tap Tempo Button */}
        <button
          type="button"
          onClick={handleTap}
          className={`flex-1 h-20 sm:h-24 rounded-2xl flex items-center justify-center gap-3 transition-all select-none cursor-pointer border active:scale-[0.97] outline-none ${
            isTapping
              ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 hover:bg-slate-850 text-white border-slate-800 hover:border-amber-400/50 shadow-md'
          }`}
          aria-label="Tap Tempo"
        >
          <Hand className={`w-7 h-7 sm:w-8 sm:h-8 ${isTapping ? 'text-slate-950 scale-110' : 'text-amber-400'}`} />
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight">
                TAP TEMPO
              </span>
              {tapCount > 0 && (
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  #{tapCount}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              แตะตามจังหวะเพลง (หรือ Spacebar)
            </span>
          </div>
        </button>

        {/* Metronome Play/Stop Toggle Button */}
        <button
          type="button"
          onClick={onTogglePlay}
          className={`w-20 sm:w-24 h-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all border active:scale-95 shrink-0 ${
            isMetronomePlaying
              ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/30'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
          title={isMetronomePlaying ? 'หยุดเสียงเคาะ' : 'เปิดเสียงเคาะเมโทรนอม'}
        >
          {isMetronomePlaying ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-wider">STOP</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">CLICK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
