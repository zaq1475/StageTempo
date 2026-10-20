import { useState, useRef, useEffect } from 'react';
import { Plus, Minus, Edit3, Check } from 'lucide-react';
import { getTempoName } from '../utils/audioCalculator';

interface BpmControlsProps {
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  activeBeat: number; // 0, 1, 2, 3
  isMetronomePlaying: boolean;
}

const PRESET_TEMPOS = [
  { label: '65', desc: 'Ballad ช้า' },
  { label: '85', desc: 'R&B / Soul' },
  { label: '100', desc: 'Mid Pop' },
  { label: '120', desc: 'Dance / Pop' },
  { label: '135', desc: 'Rock / Funk' },
  { label: '150', desc: 'Fast Uptempo' },
];

export function BpmControls({
  bpm,
  onBpmChange,
  activeBeat,
  isMetronomePlaying,
}: BpmControlsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(bpm.toString());
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (!isNaN(parsed) && parsed >= 20 && parsed <= 320) {
      onBpmChange(parsed);
    }
    setIsEditing(false);
  };

  const tempoInfo = getTempoName(bpm);

  return (
    <div className="w-full max-w-xl flex flex-col items-center">
      {/* Visual LED Beat Ticker (Beats 1-4) */}
      <div className="w-full flex items-center justify-between gap-2 mb-4 px-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Beat Pulse:
          </span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((b) => {
              const isActive = isMetronomePlaying && activeBeat === b;
              const isFirstBeat = b === 0;
              return (
                <div
                  key={b}
                  className={`h-2.5 rounded-full transition-all duration-75 ${
                    isActive
                      ? isFirstBeat
                        ? 'w-7 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]'
                        : 'w-5 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]'
                      : 'w-4 bg-slate-800'
                  }`}
                  title={`Beat ${b + 1}`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">{tempoInfo.label}</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-500">{tempoInfo.desc}</span>
        </div>
      </div>

      {/* Primary GIGANTIC BPM Display */}
      <div className="relative w-full py-4 px-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center shadow-lg">
        <span className="text-xs uppercase font-semibold tracking-widest text-slate-400 mb-1">
          Tempo / Beats Per Minute
        </span>

        {isEditing ? (
          <div className="flex items-center gap-2 my-2">
            <input
              ref={inputRef}
              type="number"
              min={20}
              max={320}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-36 text-center text-6xl font-bold font-mono text-amber-400 bg-slate-950 border border-amber-500/50 rounded-xl px-2 py-1 outline-none"
            />
            <button
              type="button"
              onClick={handleEditSubmit}
              className="p-3 rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold transition-colors"
            >
              <Check className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditing(true)}
            title="คลิกเพื่อพิมพ์ค่า BPM โดยตรง"
            className="group flex items-baseline gap-2 cursor-pointer select-none my-1 transition-transform active:scale-[0.98]"
          >
            <span className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tight text-amber-400 tabular-nums drop-shadow-[0_4px_16px_rgba(251,191,36,0.15)] group-hover:text-amber-300">
              {bpm}
            </span>
            <div className="flex flex-col items-start">
              <span className="text-xl sm:text-2xl font-bold text-slate-400 group-hover:text-amber-400 transition-colors">
                BPM
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 className="w-2.5 h-2.5" /> พิมพ์
              </span>
            </div>
          </div>
        )}

        {/* Quarter Note Duration Info */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
          <span>ความยาว 1 จังหวะ (1/4):</span>
          <span className="font-mono text-amber-300/90 tabular-nums font-semibold">
            {(60000 / bpm).toFixed(2)} ms
          </span>
        </div>
      </div>

      {/* BPM Precision Slider */}
      <div className="w-full mt-5 px-1">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
          <span>40 BPM (Slow)</span>
          <span className="text-slate-400 font-sans text-xs">ลากเพื่อปรับความเร็ว</span>
          <span>240 BPM (Fast)</span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={40}
            max={240}
            step={1}
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value, 10))}
            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
          />
        </div>
      </div>

      {/* Steppers & Quick Multiply */}
      <div className="grid grid-cols-6 gap-2 w-full mt-4">
        <button
          type="button"
          onClick={() => onBpmChange(Math.max(30, bpm - 5))}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-slate-300 active:scale-95"
          title="ลดลง 5 BPM"
        >
          <span className="text-xs font-mono font-bold">-5</span>
        </button>

        <button
          type="button"
          onClick={() => onBpmChange(Math.max(30, bpm - 1))}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-slate-300 active:scale-95"
          title="ลดลง 1 BPM"
        >
          <span className="flex items-center text-xs font-mono font-bold">
            <Minus className="w-3.5 h-3.5" /> 1
          </span>
        </button>

        <button
          type="button"
          onClick={() => onBpmChange(Math.round(bpm / 2))}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-slate-300 active:scale-95"
          title="ลดความเร็วลงครึ่งหนึ่ง (/2 Half-time)"
        >
          <span className="text-[11px] font-mono font-semibold text-cyan-400">÷ 2</span>
        </button>

        <button
          type="button"
          onClick={() => onBpmChange(Math.min(320, bpm * 2))}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-slate-300 active:scale-95"
          title="เพิ่มความเร็วเท่าตัว (x2 Double-time)"
        >
          <span className="text-[11px] font-mono font-semibold text-cyan-400">× 2</span>
        </button>

        <button
          type="button"
          onClick={() => onBpmChange(Math.min(320, bpm + 1))}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-slate-300 active:scale-95"
          title="เพิ่มขึ้น 1 BPM"
        >
          <span className="flex items-center text-xs font-mono font-bold">
            <Plus className="w-3.5 h-3.5" /> 1
          </span>
        </button>

        <button
          type="button"
          onClick={() => onBpmChange(Math.min(320, bpm + 5))}
          className="flex flex-col items-center justify-center py-2.5 px-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors text-slate-300 active:scale-95"
          title="เพิ่มขึ้น 5 BPM"
        >
          <span className="text-xs font-mono font-bold">+5</span>
        </button>
      </div>

      {/* Quick Tempo Presets */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 w-full mt-3">
        <span className="text-[11px] text-slate-500 mr-1">เทมโปสำเร็จรูป:</span>
        {PRESET_TEMPOS.map((item) => {
          const val = parseInt(item.label, 10);
          const isCurrent = bpm === val;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onBpmChange(val)}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                isCurrent
                  ? 'bg-amber-400/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {item.label} <span className="text-[10px] text-slate-500">({item.desc})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
