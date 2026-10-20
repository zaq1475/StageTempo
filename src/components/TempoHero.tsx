import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Hand,
  Play,
  Square,
  Volume2,
  VolumeX,
  RotateCcw,
  Plus,
  Minus,
  Edit3,
  Check,
} from 'lucide-react';
import { ClickSoundType } from '../types/tempo';
import { getTempoName } from '../utils/audioCalculator';

interface TempoHeroProps {
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  isMetronomePlaying: boolean;
  onTogglePlay: () => void;
  soundType: ClickSoundType;
  onSoundTypeChange: (type: ClickSoundType) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  activeBeat: number;
}

export function TempoHero({
  bpm,
  onBpmChange,
  isMetronomePlaying,
  onTogglePlay,
  soundType,
  onSoundTypeChange,
  volume,
  onVolumeChange,
  activeBeat,
}: TempoHeroProps) {
  // Tap states
  const tapHistoryRef = useRef<number[]>([]);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [tapCount, setTapCount] = useState<number>(0);
  const [lastIntervalMs, setLastIntervalMs] = useState<number | null>(null);

  // Manual inline edit state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(bpm.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const tapTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setEditValue(bpm.toString());
  }, [bpm]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditSubmit = () => {
    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed) && parsed >= 30 && parsed <= 300) {
      onBpmChange(parsed);
    }
    setIsEditing(false);
  };

  // Tap handler
  const handleTap = useCallback(() => {
    const now = performance.now();
    setIsTapping(true);
    setTimeout(() => setIsTapping(false), 120);

    if (tapTimeoutRef.current !== null) {
      clearTimeout(tapTimeoutRef.current);
    }
    tapTimeoutRef.current = window.setTimeout(() => {
      tapHistoryRef.current = [];
      setTapCount(0);
      setLastIntervalMs(null);
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
      const lastInv = intervals[intervals.length - 1];
      setLastIntervalMs(lastInv);

      let validIntervals = intervals;
      if (intervals.length >= 4) {
        const sorted = [...intervals].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        validIntervals = intervals.filter(
          (inv) => inv >= median * 0.65 && inv <= median * 1.45
        );
        if (validIntervals.length === 0) validIntervals = intervals;
      }

      const avgInterval = validIntervals.reduce((a, b) => a + b, 0) / validIntervals.length;
      if (avgInterval > 0) {
        const calculatedBpm = Math.round(Math.max(30, Math.min(300, 60000 / avgInterval)));
        onBpmChange(calculatedBpm);
      }
    }
  }, [onBpmChange]);

  // Keyboard shortcut Spacebar
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleTap]);

  const tempoInfo = getTempoName(bpm);

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-7 flex flex-col items-center">
      {/* Top Pulse & Metronome Row */}
      <div className="w-full flex items-center justify-between text-xs pb-4 border-b border-slate-800/70">
        {/* Beat LED lights */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((b) => {
              const active = isMetronomePlaying && activeBeat === b;
              return (
                <span
                  key={b}
                  className={`h-2 rounded-full transition-all duration-75 ${
                    active
                      ? b === 0
                        ? 'w-6 bg-amber-400'
                        : 'w-4 bg-cyan-400'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-slate-400 font-mono text-[11px] ml-1">
            {isMetronomePlaying ? `Beat ${activeBeat + 1}` : '4/4'}
          </span>
        </div>

        {/* Metronome Sound & Play Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isMetronomePlaying
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isMetronomePlaying ? (
              <>
                <Square className="w-3 h-3 fill-current" />
                <span>หยุดเสียง</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>เปิดเสียงเคาะ</span>
              </>
            )}
          </button>

          {isMetronomePlaying && (
            <button
              type="button"
              onClick={() => onSoundTypeChange(soundType === 'mute' ? 'woodblock' : 'mute')}
              className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              title={soundType === 'mute' ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {soundType === 'mute' ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Main Big BPM Centerpiece */}
      <div className="flex flex-col items-center my-6 select-none">
        <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-1">
          Tempo
        </span>

        {isEditing ? (
          <div className="flex items-center gap-2 my-2">
            <input
              ref={inputRef}
              type="number"
              min={30}
              max={300}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-40 text-center text-7xl font-mono font-black text-amber-400 bg-slate-950 border border-amber-500/50 rounded-xl px-2 py-1 outline-none"
            />
            <button
              type="button"
              onClick={handleEditSubmit}
              className="p-3 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            className="group flex items-baseline gap-2.5 cursor-pointer active:scale-[0.98] transition-transform"
            title="คลิกเพื่อพิมพ์ตัวเลข BPM โดยตรง"
          >
            <span className="text-8xl sm:text-9xl font-black font-mono tracking-tight text-amber-400 tabular-nums">
              {bpm}
            </span>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                BPM
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-2.5 h-2.5" /> แก้ไข
              </span>
            </div>
          </div>
        )}

        {/* Clean Tempo Metadata */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span className="text-slate-200 font-medium">{tempoInfo.label}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{tempoInfo.desc}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="font-mono text-slate-400">1/4 = {(60000 / bpm).toFixed(1)} ms</span>
        </div>
      </div>

      {/* Tactile Big Minimal TAP Button */}
      <div className="w-full max-w-lg flex flex-col items-center">
        <button
          type="button"
          onClick={handleTap}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-100 border outline-none select-none cursor-pointer ${
            isTapping
              ? 'scale-[0.98] bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-lg shadow-amber-500/20'
              : 'bg-slate-950 hover:bg-slate-900 text-white border-slate-800 hover:border-amber-400/50'
          }`}
        >
          <Hand className={`w-5 h-5 ${isTapping ? 'text-slate-950' : 'text-amber-400'}`} />
          <span className="text-lg font-bold tracking-tight">
            TAP TEMPO
          </span>
          {tapCount > 0 && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              #{tapCount}
            </span>
          )}
        </button>

        {/* Tap Helper & Reset */}
        <div className="w-full flex items-center justify-between text-xs text-slate-500 mt-2 px-1">
          <span>แตะหน้าจอ หรือกด Spacebar</span>
          {tapCount > 0 && (
            <button
              type="button"
              onClick={() => {
                tapHistoryRef.current = [];
                setTapCount(0);
                setLastIntervalMs(null);
              }}
              className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ต Tap</span>
            </button>
          )}
        </div>
      </div>

      {/* Minimal Slider & Stepper Bar */}
      <div className="w-full max-w-lg mt-5 pt-4 border-t border-slate-800/60">
        <input
          type="range"
          min={40}
          max={240}
          step={1}
          value={bpm}
          onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
        />

        {/* Quick Steppers */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onBpmChange(Math.max(30, bpm - 1))}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono transition-colors active:scale-95"
              title="ลด 1 BPM"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onBpmChange(Math.min(300, bpm + 1))}
              className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono transition-colors active:scale-95"
              title="เพิ่ม 1 BPM"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onBpmChange(Math.round(bpm / 2))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-cyan-400 transition-colors"
              title="ลดลงครึ่งหนึ่ง (/2)"
            >
              ÷2
            </button>
            <button
              type="button"
              onClick={() => onBpmChange(Math.min(300, bpm * 2))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-cyan-400 transition-colors"
              title="เพิ่มขึ้นเท่าตัว (x2)"
            >
              ×2
            </button>
          </div>

          {/* Quick preset tempos */}
          <div className="hidden sm:flex items-center gap-1">
            {[75, 95, 120, 140].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onBpmChange(t)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                  bpm === t
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
