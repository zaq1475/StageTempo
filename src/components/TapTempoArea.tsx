import { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Hand, Volume2, Sparkles } from 'lucide-react';

interface TapTempoAreaProps {
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  isMetronomePlaying: boolean;
}

export function TapTempoArea({
  bpm,
  onBpmChange,
}: TapTempoAreaProps) {
  const tapHistoryRef = useRef<number[]>([]);
  const [isTapping, setIsTapping] = useState<boolean>(false);
  const [lastTapIntervalMs, setLastTapIntervalMs] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState<number>(0);
  const [rippleKey, setRippleKey] = useState<number>(0);
  const [audioFeedback, setAudioFeedback] = useState<boolean>(false);

  const tapTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize short tap click sound
  const playTapClick = useCallback(() => {
    if (!audioFeedback) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      const osc = audioContextRef.current.createOscillator();
      const gain = audioContextRef.current.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, audioContextRef.current.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, audioContextRef.current.currentTime + 0.03);
      gain.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioContextRef.current.destination);
      osc.start();
      osc.stop(audioContextRef.current.currentTime + 0.035);
    } catch {
      // Ignore audio errors
    }
  }, [audioFeedback]);

  const handleTap = useCallback(() => {
    const now = performance.now();
    setIsTapping(true);
    setRippleKey((prev) => prev + 1);
    playTapClick();

    setTimeout(() => setIsTapping(false), 120);

    // Reset tap sequence if user waits > 2200ms
    if (tapTimeoutRef.current !== null) {
      clearTimeout(tapTimeoutRef.current);
    }
    tapTimeoutRef.current = window.setTimeout(() => {
      tapHistoryRef.current = [];
      setTapCount(0);
      setLastTapIntervalMs(null);
    }, 2200);

    const history = tapHistoryRef.current;
    const next = [...history, now].slice(-10);
    tapHistoryRef.current = next;
    setTapCount(next.length);

    if (next.length >= 2) {
      // Calculate intervals between consecutive taps
      const intervals: number[] = [];
      for (let i = 1; i < next.length; i++) {
        intervals.push(next[i] - next[i - 1]);
      }

      const latestInterval = intervals[intervals.length - 1];
      setLastTapIntervalMs(latestInterval);

      // Calculate average interval with basic outlier suppression if >= 4 taps
      let usableIntervals = intervals;
      if (intervals.length >= 4) {
        const sorted = [...intervals].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        usableIntervals = intervals.filter(
          (inv) => inv >= median * 0.65 && inv <= median * 1.45
        );
        if (usableIntervals.length === 0) usableIntervals = intervals;
      }

      const avgInterval =
        usableIntervals.reduce((sum, val) => sum + val, 0) / usableIntervals.length;

      if (avgInterval > 0) {
        const rawBpm = 60000 / avgInterval;
        const clampedBpm = Math.round(Math.max(30, Math.min(300, rawBpm)));
        onBpmChange(clampedBpm);
      }
    }
  }, [playTapClick, onBpmChange]);

  const handleReset = useCallback(() => {
    tapHistoryRef.current = [];
    setTapCount(0);
    setLastTapIntervalMs(null);
  }, []);

  // Keyboard shortcut: Spacebar to tap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTap]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Tap Status Bar */}
      <div className="flex items-center justify-between w-full max-w-xl mb-3 px-1 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-medium">
            {tapCount > 0 ? `เคาะไปแล้ว ${tapCount} ครั้ง` : 'กดปุ่มเคาะ หรือ กด Spacebar'}
          </span>
          {lastTapIntervalMs !== null && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono text-amber-400/90 tabular-nums">
                {lastTapIntervalMs.toFixed(1)} ms
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAudioFeedback(!audioFeedback)}
            title={audioFeedback ? 'ปิดเสียงเคาะ Tap' : 'เปิดเสียงเคาะ Tap'}
            className={`p-1.5 rounded-lg border transition-colors ${
              audioFeedback
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {tapCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg transition-colors text-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>รีเซ็ต Tap</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Massive Tap Button */}
      <button
        type="button"
        onClick={handleTap}
        className={`relative w-full max-w-xl h-44 sm:h-52 rounded-2xl flex flex-col items-center justify-center select-none cursor-pointer transition-all duration-100 border outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
          isTapping
            ? 'scale-[0.98] bg-gradient-to-b from-amber-500/25 to-amber-600/30 border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.35)]'
            : 'bg-gradient-to-b from-slate-900/90 via-slate-900 to-slate-950 border-slate-800/90 hover:border-amber-500/40 hover:from-slate-900 shadow-xl'
        }`}
        aria-label="Tap Tempo Button"
      >
        {/* Subtle grid texture */}
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />

        {/* Dynamic Ripple on Tap */}
        {isTapping && (
          <span
            key={rippleKey}
            className="absolute inset-4 rounded-xl border border-amber-400/40 animate-ping pointer-events-none"
          />
        )}

        <div className="relative z-10 flex flex-col items-center">
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-100 mb-2 ${
              isTapping
                ? 'scale-110 bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/50'
                : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
            }`}
          >
            <Hand className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>TAP TEMPO</span>
            {tapCount > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                #{tapCount}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            แตะตามจังหวะเพลงอย่างน้อย 2-4 ครั้ง หรือกดปุ่ม <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs">Spacebar</kbd>
          </p>

          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
            <Sparkles className="w-3 h-3 text-amber-400/80" />
            <span>คำนวณค่าเฉลี่ยแบบเรียลไทม์พร้อมกรองความคลาดเคลื่อน</span>
          </div>
        </div>
      </button>
    </div>
  );
}
