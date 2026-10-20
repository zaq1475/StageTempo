import { useState } from 'react';
import { calculateAllNoteDivisions, formatMs } from '../utils/audioCalculator';
import { Copy, Check, Table, CheckCircle2 } from 'lucide-react';
import { NoteMode } from '../types/tempo';

interface NoteDivisionsTableProps {
  bpm: number;
  noteMode?: NoteMode;
  onNoteModeChange?: (mode: NoteMode) => void;
}

export function NoteDivisionsTable({
  bpm,
  noteMode = 'straight',
  onNoteModeChange,
}: NoteDivisionsTableProps) {
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const rows = calculateAllNoteDivisions(bpm);

  const copyVal = (val: number, id: string) => {
    navigator.clipboard.writeText(val.toFixed(2));
    setCopiedCell(id);
    setTimeout(() => setCopiedCell(null), 1500);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-900/90 border border-slate-800 p-5 sm:p-6 shadow-xl flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              ตารางค่าตัวโน้ตมิลลิวินาที (Note Division Milliseconds Reference)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            ค่าเวลาสำหรับตั้งค่า Delay Pedal, Multi-FX, และ Reverb ทั้งแบบธรรมดา (Straight), จุด (Dotted), และ สามพยางค์ (Triplet)
          </p>
        </div>

        {/* Note Mode Quick Filter */}
        {onNoteModeChange && (
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onNoteModeChange('straight')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
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
              className={`px-2.5 py-1 rounded-lg transition-colors ${
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
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                noteMode === 'triplet'
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Triplets (3)
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-2.5 px-3">ตัวโน้ต (Note)</th>
              <th className="py-2.5 px-3">สัดส่วน</th>
              <th
                className={`py-2.5 px-3 text-right ${
                  noteMode === 'straight' ? 'text-amber-400 font-bold bg-amber-500/5 rounded-t-lg' : ''
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  {noteMode === 'straight' && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                  <span>ธรรมดา (Straight)</span>
                </div>
              </th>
              <th
                className={`py-2.5 px-3 text-right ${
                  noteMode === 'dotted' ? 'text-amber-400 font-bold bg-amber-500/5 rounded-t-lg' : ''
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  {noteMode === 'dotted' && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                  <span>จุด (Dotted ×1.5)</span>
                </div>
              </th>
              <th
                className={`py-2.5 px-3 text-right ${
                  noteMode === 'triplet' ? 'text-amber-400 font-bold bg-amber-500/5 rounded-t-lg' : ''
                }`}
              >
                <div className="flex items-center justify-end gap-1">
                  {noteMode === 'triplet' && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                  <span>สามพยางค์ (Triplet)</span>
                </div>
              </th>
              <th className="py-2.5 px-3 hidden md:table-cell">การนำไปใช้งาน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {rows.map((row) => {
              const isHalfNote = row.fraction === '1/2';
              const isSixtyFourth = row.fraction === '1/64';
              const isOneTwentyEighth = row.fraction === '1/128';

              const rowHighlight = isHalfNote
                ? 'bg-cyan-500/10 text-cyan-200'
                : isSixtyFourth
                ? 'bg-amber-500/10 text-amber-200'
                : isOneTwentyEighth
                ? 'bg-emerald-500/10 text-emerald-200'
                : 'hover:bg-slate-800/40 text-slate-300';

              return (
                <tr key={row.fraction} className={`transition-colors ${rowHighlight}`}>
                  <td className="py-2.5 px-3 font-sans font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{row.name}</span>
                      {isHalfNote && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-sans font-bold">
                          Delay 1/2
                        </span>
                      )}
                      {isSixtyFourth && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-sans font-bold">
                          Pre (ช้า)
                        </span>
                      )}
                      {isOneTwentyEighth && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-sans font-bold">
                          Pre (เร็ว)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-200">{row.fraction}</td>

                  {/* Straight */}
                  <td
                    className={`py-2.5 px-3 text-right tabular-nums ${
                      noteMode === 'straight' ? 'bg-amber-500/5 font-bold text-amber-300' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => copyVal(row.straightMs, `${row.fraction}-straight`)}
                      className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      title="คลิกเพื่อคัดลอก ms"
                    >
                      <span>{formatMs(row.straightMs, 2)} ms</span>
                      {copiedCell === `${row.fraction}-straight` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </td>

                  {/* Dotted */}
                  <td
                    className={`py-2.5 px-3 text-right tabular-nums text-slate-400 ${
                      noteMode === 'dotted' ? 'bg-amber-500/5 font-bold text-amber-300' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => copyVal(row.dottedMs, `${row.fraction}-dotted`)}
                      className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      title="คลิกเพื่อคัดลอก ms"
                    >
                      <span>{formatMs(row.dottedMs, 2)} ms</span>
                      {copiedCell === `${row.fraction}-dotted` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </td>

                  {/* Triplet */}
                  <td
                    className={`py-2.5 px-3 text-right tabular-nums text-slate-400 ${
                      noteMode === 'triplet' ? 'bg-amber-500/5 font-bold text-amber-300' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => copyVal(row.tripletMs, `${row.fraction}-triplet`)}
                      className="inline-flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                      title="คลิกเพื่อคัดลอก ms"
                    >
                      <span>{formatMs(row.tripletMs, 2)} ms</span>
                      {copiedCell === `${row.fraction}-triplet` ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                      )}
                    </button>
                  </td>

                  {/* Usage */}
                  <td className="py-2.5 px-3 hidden md:table-cell font-sans text-slate-400 text-[11px]">
                    {row.descriptionTh}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
