import { Check, Sparkles, Disc3, RotateCcw } from 'lucide-react';
import { GenrePreset, GenrePresetId, PreDelayChoice, NoteMode } from '../types/tempo';
import { GENRE_PRESETS, DEFAULT_PRESET, matchCurrentGenre } from '../utils/genrePresets';
import { calculateTempoEfx, formatMs } from '../utils/audioCalculator';

interface GenrePresetSheetProps {
  currentBpm: number;
  preDelayChoice: PreDelayChoice;
  decayBeats: number;
  noteMode: NoteMode;
  onApplyPreset: (preset: GenrePreset) => void;
  onClose?: () => void;
}

export function GenrePresetSheet({
  currentBpm,
  preDelayChoice,
  decayBeats,
  noteMode,
  onApplyPreset,
  onClose,
}: GenrePresetSheetProps) {
  const activeGenreId = matchCurrentGenre(preDelayChoice, decayBeats, noteMode);

  const handleSelect = (preset: GenrePreset) => {
    onApplyPreset(preset);
    if (onClose) {
      setTimeout(() => onClose(), 250);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 text-slate-100">
      {/* Intro info box */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
        <Disc3 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <p className="text-slate-200 font-semibold mb-0.5">
            พรีเซ็ตตามแนวเพลง (Genre Presets)
          </p>
          <p>
            เลือกแนวเพลงเพื่อปรับค่า Pre-Delay, Decay Beats และสัดส่วนโน้ตให้เหมาะกับลักษณะดนตรีทันที (BPM ปัจจุบัน: <span className="font-mono text-amber-300 font-bold">{currentBpm}</span>)
          </p>
        </div>
      </div>

      {/* Genre Presets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {GENRE_PRESETS.map((preset) => {
          const isSelected = activeGenreId === preset.id;
          const calc = calculateTempoEfx(
            currentBpm,
            preset.preDelayChoice,
            preset.decayBeats,
            preset.noteMode
          );

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelect(preset)}
              className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-400/80 ring-1 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black tracking-wide text-white">
                      {preset.name}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                        <Check className="w-3 h-3 stroke-[3]" /> กำลังใช้งาน
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{preset.labelTh}</p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300">
                    {preset.tagline}
                  </span>
                </div>
              </div>

              {/* Calculated Preview Box for this preset at current BPM */}
              <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Pre-Delay:</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-bold text-slate-200">
                      {formatMs(calc.preDelayMs, 1)}
                    </span>
                    <span className="text-[10px] text-slate-500">ms</span>
                    <span className="text-[9px] text-slate-500">({preset.preDelayChoice})</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-amber-400/80 block">Decay:</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-bold text-amber-300">
                      {formatMs(calc.decayMs, 1)}
                    </span>
                    <span className="text-[10px] text-amber-400/70">ms</span>
                    <span className="text-[9px] text-slate-500">({calc.decaySec.toFixed(2)}s)</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-snug">
                {preset.descriptionTh}
              </p>
            </button>
          );
        })}
      </div>

      {/* Default / Reset Button */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          <span>ค่าเริ่มต้น (Default): </span>
          <span className="text-slate-300 font-mono">Pre-Delay 1/64 · Decay 2 Beats · โน้ตธรรมดา</span>
        </div>

        <button
          type="button"
          onClick={() => handleSelect(DEFAULT_PRESET)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
            activeGenreId === 'default'
              ? 'bg-amber-400 text-slate-950 border-amber-300'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
          title="รีเซ็ตเป็นค่าเริ่มต้น"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>ใช้ค่า Default</span>
        </button>
      </div>
    </div>
  );
}
