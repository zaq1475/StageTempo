import { useState, useEffect } from 'react';
import { ListMusic, Plus, Trash2, Play, Music, Sparkles } from 'lucide-react';
import { SetlistItem, PreDelayChoice } from '../types/tempo';
import { calculateTempoEfx, formatMs } from '../utils/audioCalculator';

interface SetlistManagerProps {
  currentBpm: number;
  onSelectSongBpm: (bpm: number) => void;
  preDelayChoice?: PreDelayChoice;
  decayBeats?: number;
}

const DEFAULT_SETLIST: SetlistItem[] = [
  {
    id: 's1',
    title: 'สายตาหลอกกันไม่ได้ (Ballad ช้า)',
    bpm: 72,
    key: 'C Major',
    notes: 'เพลงช้า Pre-Delay 1/64 ให้เสียงร้องลอยละมุน',
    createdAt: Date.now() - 4000,
  },
  {
    id: 's2',
    title: 'รักแรก (Medium Pop)',
    bpm: 96,
    key: 'G Major',
    notes: 'จังหวะปานกลาง Pre-Delay 1/64 บรรยากาศโปร่ง',
    createdAt: Date.now() - 3000,
  },
  {
    id: 's3',
    title: 'วัดปะหล่ะ? (Disco / Dance)',
    bpm: 120,
    key: 'D Minor',
    notes: 'จังหวะเร็ว Pre-Delay 1/64 กระชับ หางเสียงไม่ทับบีท',
    createdAt: Date.now() - 2000,
  },
  {
    id: 's4',
    title: 'ทรงอย่างแบด (Fast Rock)',
    bpm: 148,
    key: 'E Minor',
    notes: 'ร็อกเร็ว Pre-Delay 1/64 คมชัด หรือสลับ 1/32 สำหรับเพลงช้า',
    createdAt: Date.now() - 1000,
  },
];

export function SetlistManager({
  currentBpm,
  onSelectSongBpm,
  preDelayChoice = '1/64',
  decayBeats = 2,
}: SetlistManagerProps) {
  const [songs, setSongs] = useState<SetlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('stagetempo_setlist');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage error
    }
    return DEFAULT_SETLIST;
  });

  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBpm, setNewBpm] = useState(currentBpm.toString());
  const [newKey, setNewKey] = useState('');
  const [newNotes, setNewNotes] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('stagetempo_setlist', JSON.stringify(songs));
    } catch {
      // Ignore storage error
    }
  }, [songs]);

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const parsedBpm = parseInt(newBpm, 10);
    const validBpm = isNaN(parsedBpm) ? currentBpm : Math.max(30, Math.min(300, parsedBpm));

    const newSong: SetlistItem = {
      id: `song_${Date.now()}`,
      title: newTitle.trim(),
      bpm: validBpm,
      key: newKey.trim() || undefined,
      notes: newNotes.trim() || undefined,
      createdAt: Date.now(),
    };

    setSongs((prev) => [newSong, ...prev]);
    setNewTitle('');
    setNewKey('');
    setNewNotes('');
    setIsAdding(false);
  };

  const handleDeleteSong = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleResetSetlist = () => {
    setSongs(DEFAULT_SETLIST);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              คลังเพลงแสดงสด (Live Gig Setlist)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            บันทึกและกดเรียกใช้เทมโปพร้อมค่า Pre-Delay & Decay ประจำเพลงได้ทันทีใน 1 วินาที
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setNewBpm(currentBpm.toString());
              setIsAdding(!isAdding);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มเพลงใหม่</span>
          </button>

          {songs.length === 0 && (
            <button
              type="button"
              onClick={handleResetSetlist}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              โหลดเพลงตัวอย่าง
            </button>
          )}
        </div>
      </div>

      {/* Add Song Form */}
      {isAdding && (
        <form onSubmit={handleAddSong} className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>เพิ่มเพลงในคิวแสดงสด</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                ชื่อเพลง *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น เพลงรักปาฏิหาริย์"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                BPM *
              </label>
              <input
                type="number"
                min={30}
                max={300}
                required
                value={newBpm}
                onChange={(e) => setNewBpm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-amber-400 outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                คีย์เพลง (Key)
              </label>
              <input
                type="text"
                placeholder="เช่น Ab Major, F# Minor"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                โน้ตสำหรับนักดนตรี / ซาวด์เอ็นจิเนียร์
              </label>
              <input
                type="text"
                placeholder="เช่น อินโทรเปียโนเดี่ยว, ท่อนฮุก Reverb กว้าง"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg transition-colors"
            >
              บันทึกเพลง
            </button>
          </div>
        </form>
      )}

      {/* Song List */}
      <div className="space-y-2 mt-4">
        {songs.map((song) => {
          const isSelected = song.bpm === currentBpm;
          const calc = calculateTempoEfx(song.bpm, preDelayChoice || '1/64', decayBeats || 2);

          return (
            <div
              key={song.id}
              onClick={() => onSelectSongBpm(song.bpm)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-md'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Music className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {song.title}
                    </span>
                    {song.key && (
                      <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                        {song.key}
                      </span>
                    )}
                  </div>

                  {song.notes && (
                    <p className="text-xs text-slate-400 mt-0.5">{song.notes}</p>
                  )}

                  {/* Calculated Quick Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-mono">
                    <span className="text-amber-400 font-bold">{song.bpm} BPM</span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-slate-300">
                      Pre: <strong className="text-white">{formatMs(calc.preDelayMs, 1)}ms</strong> ({calc.preDelayDivision})
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-cyan-300">
                      Delay: <strong>{formatMs(calc.delayMs, 1)}ms</strong> (1/2)
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-amber-300">
                      Decay: <strong>{formatMs(calc.decayMs, 1)}ms</strong> ({calc.decaySec.toFixed(2)}s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSongBpm(song.bpm);
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{isSelected ? 'ใช้งานอยู่' : 'เลือกเพลง'}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDeleteSong(song.id, e)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  title="ลบเพลงนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
