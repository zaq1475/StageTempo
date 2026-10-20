import { TempoEfxCalculation, NoteDivisionRow, NoteMode, PreDelayChoice } from '../types/tempo';

/**
 * คำนวณค่า Pre-Delay, Target Delay (ตาม Beats) และ Decay สำหรับ Reverb เสียงร้อง
 * ตามข้อกำหนด:
 * - Pre-Delay เริ่มต้นเป็น 1/64 ทั้งหมด (3,750 / BPM ms)
 * - มีปุ่มปรับสลับเป็น 1/32 (7,500 / BPM ms)
 * - Decay เริ่มต้นที่ 2 Beat (120,000 / BPM ms)
 * - มี Dropdown list ให้เลือก Decay Beat เป็น: 1, 1.5, 2, 3, 4, 5 Beats
 * - Decay = Target Delay (จาก Beat ที่เลือก) - Pre-Delay (ms)
 * - Note Mode:
 *   - straight (โน้ตธรรมดา): × 1.0 (Default)
 *   - dotted (โน้ตประจุด): × 1.5
 *   - triplet (โน้ตสามพยางค์): × 2/3
 */
export function calculateTempoEfx(
  bpm: number,
  preDelayDivision: PreDelayChoice = '1/64',
  decayBeats: number = 2,
  noteMode: NoteMode = 'straight'
): TempoEfxCalculation {
  const safeBpm = Math.max(20, Math.min(320, bpm || 120));
  const beatDurationMs = 60000 / safeBpm; // 1/4 beat in ms

  // ตัวคูณสัดส่วนโน้ต (Note Multiplier)
  let noteMultiplier = 1.0;
  if (noteMode === 'dotted') {
    noteMultiplier = 1.5;
  } else if (noteMode === 'triplet') {
    noteMultiplier = 2 / 3;
  }

  // Pre-Delay calculation:
  // 1/4 = 60000 / BPM
  // 1/64 = (60000 / BPM) / 16 = 3750 / BPM (ค่าเริ่มต้น Default)
  // 1/32 = (60000 / BPM) / 8 = 7500 / BPM
  const basePreDelayMs = preDelayDivision === '1/64' ? 3750 / safeBpm : 7500 / safeBpm;
  const preDelayMs = basePreDelayMs * noteMultiplier;

  // Target Delay calculation ตามจำนวน Beat (เช่น 1, 1.5, 2, 3, 4, 5 Beats)
  const validBeats = [1, 1.5, 2, 3, 4, 5].includes(decayBeats) ? decayBeats : 2;
  const delayMs = (validBeats * beatDurationMs) * noteMultiplier;

  // Decay calculation: Delay (ตาม Beat) - PreDelay
  const decayMs = Math.max(0, delayMs - preDelayMs);
  const decaySec = decayMs / 1000;

  return {
    bpm: safeBpm,
    beatDurationMs,
    preDelayDivision,
    preDelayMs,
    decayBeats: validBeats,
    delayMs,
    decayMs,
    decaySec,
    noteMode,
    noteMultiplier,
  };
}

/**
 * คำนวณตารางค่าตัวโน้ตทั้งหมดสำหรับ Delay & Reverb
 */
export function calculateAllNoteDivisions(bpm: number): NoteDivisionRow[] {
  const safeBpm = Math.max(20, Math.min(320, bpm || 120));
  const quarterMs = 60000 / safeBpm;

  const notes = [
    { name: 'Whole Note (ตัวกลม)', fraction: '1/1', factor: 4, desc: '4 จังหวะเต็ม (4 Beats / 1 ห้องเพลง 4/4)' },
    { name: 'Dotted Half Note', fraction: '3/4', factor: 3, desc: '3 จังหวะ (3 Beats)' },
    { name: 'Half Note (ตัวขาว)', fraction: '1/2', factor: 2, desc: '2 จังหวะ (2 Beats - ค่าเริ่มต้น Decay)' },
    { name: 'Dotted Quarter Note', fraction: '3/8', factor: 1.5, desc: '1.5 จังหวะ (1.5 Beats)' },
    { name: 'Quarter Note (ตัวดำ)', fraction: '1/4', factor: 1, desc: '1 จังหวะมาตรฐาน (1 Beat)' },
    { name: '8th Note (เขบ็ต 1 ชั้น)', fraction: '1/8', factor: 0.5, desc: 'ครึ่งจังหวะ (0.5 Beat)' },
    { name: '16th Note (เขบ็ต 2 ชั้น)', fraction: '1/16', factor: 0.25, desc: '1/4 จังหวะ (Slapback)' },
    { name: '32nd Note (เขบ็ต 3 ชั้น) - [Pre-Delay]', fraction: '1/32', factor: 0.125, desc: 'Pre-Delay 1/32 โน้ต' },
    { name: '64th Note (เขบ็ต 4 ชั้น) - [Pre-Delay เริ่มต้น]', fraction: '1/64', factor: 0.0625, desc: 'Pre-Delay 1/64 โน้ต (ค่าเริ่มต้น)' },
  ];

  return notes.map((item) => {
    const straightMs = quarterMs * item.factor;
    const dottedMs = straightMs * 1.5;
    const tripletMs = (straightMs * 2) / 3;

    return {
      name: item.name,
      fraction: item.fraction,
      straightMs,
      dottedMs,
      tripletMs,
      descriptionTh: item.desc,
    };
  });
}

/**
 * แปลงค่า ms ให้อ่านง่าย พร้อมความแม่นยำ 2 ตำแหน่ง
 */
export function formatMs(val: number, decimals: number = 2): string {
  if (isNaN(val) || !isFinite(val)) return '0.00';
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * ดึงคำจำกัดความเทมโปภาษาดนตรีสากล
 */
export function getTempoName(bpm: number): { label: string; desc: string; mood: string } {
  if (bpm < 60) return { label: 'Largo', desc: 'ช้ามาก สงบนิ่ง', mood: 'Very Slow' };
  if (bpm < 76) return { label: 'Adagio', desc: 'ช้า บัลลาดซึ้งๆ', mood: 'Slow Ballad' };
  if (bpm < 108) return { label: 'Andante', desc: 'จังหวะก้าวเดิน ปานกลาง', mood: 'Medium Walking' };
  if (bpm < 128) return { label: 'Moderato / Pop', desc: 'ปานกลาง กระชับ อบอุ่น', mood: 'Pop Groove' };
  if (bpm < 168) return { label: 'Allegro', desc: 'เร็ว สนุกสนาน คึกคัก', mood: 'Fast / Upbeat' };
  return { label: 'Presto / Vivace', desc: 'เร็วมาก พลังงานสูง', mood: 'Very Fast / Rock' };
}
