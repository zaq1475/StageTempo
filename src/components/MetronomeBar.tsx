import { Play, Square, Volume2, VolumeX, Radio } from 'lucide-react';
import { ClickSoundType } from '../types/tempo';

interface MetronomeBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  soundType: ClickSoundType;
  onSoundTypeChange: (type: ClickSoundType) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  activeBeat: number;
  bpm: number;
}

export function MetronomeBar({
  isPlaying,
  onTogglePlay,
  soundType,
  onSoundTypeChange,
  volume,
  onVolumeChange,
  activeBeat,
  bpm,
}: MetronomeBarProps) {
  return (
    <div className="w-full max-w-xl rounded-2xl bg-slate-900/80 border border-slate-800 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
      {/* Play/Stop Button + Beat Counter */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`flex-1 sm:flex-initial h-12 px-6 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-md active:scale-95 ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-4 h-4 fill-current" />
              <span>หยุดเสียง (STOP)</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>เปิดเมโทรนอม (PLAY)</span>
            </>
          )}
        </button>

        {/* Visual Pulse Beat Circle */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <div
            className={`w-4 h-4 rounded-full transition-transform duration-75 ${
              isPlaying
                ? activeBeat === 0
                  ? 'bg-amber-400 scale-125 shadow-[0_0_12px_rgba(251,191,36,1)]'
                  : 'bg-cyan-400 scale-110 shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                : 'bg-slate-700'
            }`}
          />
          <span className="font-mono text-xs font-bold text-slate-300">
            {isPlaying ? `Beat ${activeBeat + 1}` : 'Ready'}
          </span>
        </div>
      </div>

      {/* Sound Type & Volume Controls */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
        {/* Sound Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onSoundTypeChange('woodblock')}
            className={`px-2 py-1 rounded transition-colors ${
              soundType === 'woodblock'
                ? 'bg-slate-800 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Woodblock
          </button>
          <button
            type="button"
            onClick={() => onSoundTypeChange('rimshot')}
            className={`px-2 py-1 rounded transition-colors ${
              soundType === 'rimshot'
                ? 'bg-slate-800 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rimshot
          </button>
          <button
            type="button"
            onClick={() => onSoundTypeChange('beep')}
            className={`px-2 py-1 rounded transition-colors ${
              soundType === 'beep'
                ? 'bg-slate-800 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Beep
          </button>
          <button
            type="button"
            onClick={() => onSoundTypeChange('mute')}
            className={`px-2 py-1 rounded transition-colors ${
              soundType === 'mute'
                ? 'bg-slate-800 text-rose-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="เฉพาะไฟกะพริบ ไม่มีเสียง"
          >
            <Radio className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2 text-slate-400">
          <button
            type="button"
            onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
            className="hover:text-slate-200 transition-colors"
            title={volume === 0 ? 'เปิดเสียง' : 'ปิดเสียง'}
          >
            {volume === 0 || soundType === 'mute' ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={soundType === 'mute' ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            title={`ระดับเสียง: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}
