import { useState } from 'react';
import { Copy, Check, Minus, Equal, Music2, ChevronDown } from 'lucide-react';
import { TempoEfxCalculation, NoteMode, PreDelayChoice } from '../types/tempo';
import { formatMs } from '../utils/audioCalculator';

interface VocalReverbCardProps {
  calculation: TempoEfxCalculation;
  preDelayChoice?: PreDelayChoice;
  onPreDelayChoiceChange?: (choice: PreDelayChoice) => void;
  decayBeats?: number;
  onDecayBeatsChange?: (beats: number) => void;
  noteMode: NoteMode;
  onNoteModeChange: (noteMode: NoteMode) => void;
}

const DECAY_BEAT_OPTIONS = [
  { value: 1, label: '1 Beat (1/4)' },
  { value: 1.5, label: '1.5 Beats' },
  { value: 2, label: '2 Beats (1/2 เริ่มต้น)' },
  { value: 3, label: '3 Beats' },
  { value: 4, label: '4 Beats (1 ห้อง)' },
  { value: 5, label: '5 Beats' },
];

export function VocalReverbCard({
  calculation,
  preDelayChoice = '1/64',
  onPreDelayChoiceChange,
  decayBeats = 2,
  onDecayBeatsChange,
  noteMode,
  onNoteModeChange,
}: VocalReverbCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const {
    preDelayDivision,
    preDelayMs,
    delayMs,
    decayMs,
    decaySec,
    noteMultiplier,
  } = calculation;

  // Percentage for the minimal visual bar
  const preDelayPercent = Math.min(35, Math.max(8, (preDelayMs / delayMs) * 100));
  const decayPercent = 100 - preDelayPercent;

  // Helper label for note mode
  const getNoteModeBadge = () => {
    if (noteMode === 'dotted') return 'Dotted (·)';
    if (noteMode === 'triplet') return 'Triplet (3)';
    return 'ธรรมดา';
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 sm:p-7 flex flex-col">
      {/* Top Header: Title & Note Mode Selector Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-5 border-b border-slate-800/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              ค่า Reverb & Delay สำหรับเสียงร้อง
            </h2>
            {noteMode !== 'straight' && (
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Mode: {getNoteModeBadge()} (×{noteMultiplier.toFixed(2)})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ตั้งค่าหางเสียงให้จบพอดีห้องเพลง (Tempo-Synced) ป้องกันเสียงก้องทับกัน
          </p>
        </div>

        {/* Note Mode Selector (Note ธรรมดา / Dotted / Triplets) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start lg:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Music2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-medium text-slate-300">สัดส่วนโน้ต:</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/90 text-xs">
            <button
              type="button"
              onClick={() => onNoteModeChange('straight')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                noteMode === 'straight'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="โน้ตธรรมดา (Straight - คูณ 1.0)"
            >
              โน้ตธรรมดา
            </button>

            <button
              type="button"
              onClick={() => onNoteModeChange('dotted')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                noteMode === 'dotted'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="โน้ตประจุด (Dotted - คูณ 1.5)"
            >
              Dotted (·)
            </button>

            <button
              type="button"
              onClick={() => onNoteModeChange('triplet')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                noteMode === 'triplet'
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="โน้ตสามพยางค์ (Triplets - คูณ 2/3)"
            >
              Triplets (3)
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Controls Bar: Pre-Delay Switcher (1/64 Default vs 1/32) & Decay Beats */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3.5 my-4 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400">Pre-Delay:</span>
          {onPreDelayChoiceChange ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPreDelayChoiceChange('1/64')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  preDelayChoice === '1/64'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                1/64 (เริ่มต้น)
              </button>
              <button
                type="button"
                onClick={() => onPreDelayChoiceChange('1/32')}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  preDelayChoice === '1/32'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                1/32
              </button>
            </div>
          ) : (
            <span className="font-mono text-amber-300 font-bold">โน้ต {preDelayDivision}</span>
          )}
        </div>

        {/* Decay Beats Dropdown */}
        {onDecayBeatsChange && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">ความยาว Decay:</span>
            <div className="relative">
              <select
                value={decayBeats}
                onChange={(e) => onDecayBeatsChange(parseFloat(e.target.value))}
                className="appearance-none bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-bold rounded-lg pl-2.5 pr-6 py-1 outline-none cursor-pointer hover:border-amber-400"
              >
                {DECAY_BEAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 3 Core Results Grid - Minimal, Big Numbers, Equation Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* 1. Pre-Delay */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Pre-Delay
              </span>
              <span className="text-xs font-mono font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                โน้ต {preDelayDivision} {noteMode !== 'straight' ? `(${getNoteModeBadge()})` : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {preDelayChoice === '1/64' ? '1/64 (ค่าเริ่มต้น)' : '1/32'}
              {noteMode === 'dotted' && ' × 1.5'}
              {noteMode === 'triplet' && ' × 2/3'}
            </p>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                {formatMs(preDelayMs, 2)}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">ms</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">เว้นช่องว่างก่อนหางเสียง</span>
            <button
              type="button"
              onClick={() => copyToClipboard(preDelayMs.toFixed(2), 'predelay')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="คัดลอก Pre-Delay (ms)"
            >
              {copiedKey === 'predelay' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* 2. Delay (Target Beats) */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800/90 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Target Delay
              </span>
              <span className="text-xs font-mono font-semibold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">
                {decayBeats} Beats {noteMode !== 'straight' ? `(${getNoteModeBadge()})` : ''}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {decayBeats} × 1 จังหวะ {noteMode === 'dotted' && '× 1.5'}{noteMode === 'triplet' && '× 2/3'}
            </p>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan-300 tabular-nums tracking-tight">
                {formatMs(delayMs, 2)}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">ms</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">กรอบเวลาอ้างอิง ({decayBeats} จังหวะ)</span>
            <button
              type="button"
              onClick={() => copyToClipboard(delayMs.toFixed(2), 'delay')}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
              title="คัดลอก Delay (ms)"
            >
              {copiedKey === 'delay' ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* 3. Decay (Delay - PreDelay) */}
        <div className="rounded-xl bg-gradient-to-b from-slate-950 via-slate-950 to-amber-950/20 border border-amber-500/40 p-4 flex flex-col justify-between shadow-md shadow-amber-500/5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Decay (หางเสียง)
              </span>
              <span className="text-xs font-mono font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded">
                {decayBeats}B - Pre
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              ความยาว Reverb สำหรับใส่มิกเซอร์
            </p>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-300 tabular-nums tracking-tight">
                {formatMs(decayMs, 2)}
              </span>
              <span className="text-xs font-mono text-slate-400 font-semibold">ms</span>
              <span className="text-xs font-mono text-slate-400">
                ({decaySec.toFixed(2)}s)
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
            <span className="text-[11px] text-amber-200/80">หางเสียงดับพอดี {decayBeats} Beats</span>
            <button
              type="button"
              onClick={() => copyToClipboard(decayMs.toFixed(2), 'decay')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors"
              title="คัดลอก Decay (ms)"
            >
              {copiedKey === 'decay' ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>คัดลอก ms</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Timeline Bar - Clean, Minimal & Self-explanatory */}
      <div className="mt-5 pt-5 border-t border-slate-800/70">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>แผนภาพมิติเสียงร้อง (Acoustic Timeline)</span>
          <span className="font-mono text-slate-300 font-medium">
            รวม Delay = {formatMs(delayMs, 1)} ms ({decayBeats} Beats)
          </span>
        </div>

        <div className="relative w-full h-8 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 flex items-center">
          {/* Vocal Dry Impulse */}
          <div className="w-2.5 h-full bg-rose-500 shrink-0 flex items-center justify-center" title="เสียงร้องคำแรก (Dry Attack)" />

          {/* Pre-Delay Gap */}
          <div
            style={{ width: `${preDelayPercent}%` }}
            className="h-full bg-slate-900 border-r-2 border-amber-400/80 flex items-center justify-center"
            title={`Pre-Delay: ${formatMs(preDelayMs, 2)} ms`}
          >
            <span className="text-[10px] font-mono text-amber-400 font-bold truncate px-1">
              Pre: {formatMs(preDelayMs, 0)}ms
            </span>
          </div>

          {/* Reverb Decay Tail */}
          <div
            style={{ width: `${decayPercent}%` }}
            className="h-full bg-gradient-to-r from-amber-500/30 to-amber-500/5 flex items-center justify-between px-3"
            title={`Decay: ${formatMs(decayMs, 2)} ms`}
          >
            <span className="text-[10px] font-mono text-amber-200 truncate">
              หางเสียง Decay: {formatMs(decayMs, 0)}ms ({decaySec.toFixed(2)}s)
            </span>
            <span className="text-[10px] text-cyan-400 font-mono">สิ้นสุด {decayBeats}B</span>
          </div>
        </div>

        {/* Minimal Equation Summary */}
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-400 font-mono flex-wrap">
          <span className="text-cyan-400 font-medium">Delay {decayBeats}B ({formatMs(delayMs, 1)}ms)</span>
          <Minus className="w-3 h-3 text-slate-600" />
          <span className="text-amber-400 font-medium">Pre-Delay ({formatMs(preDelayMs, 1)}ms)</span>
          <Equal className="w-3 h-3 text-slate-600" />
          <span className="text-amber-300 font-bold">Decay ({formatMs(decayMs, 1)}ms)</span>
        </div>
      </div>
    </div>
  );
}
