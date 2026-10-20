import { GenrePreset, GenrePresetId, PreDelayChoice, NoteMode } from '../types/tempo';

export const GENRE_PRESETS: GenrePreset[] = [
  {
    id: 'pop',
    name: 'POP',
    labelTh: 'เพลงป๊อป / สากลทั่วไป',
    preDelayChoice: '1/64',
    decayBeats: 2,
    noteMode: 'straight',
    tagline: 'Pre 1/64 · 2 Beats · ธรรมดา',
    descriptionTh: 'ค่ามาตรฐานยอดนิยม หางเสียงลงครึ่งห้องเพลง (2 Beats) คำร้องชัด ไม่ล้นทับดนตรี',
  },
  {
    id: 'rock',
    name: 'ROCK',
    labelTh: 'เพลงร็อก / เมทัล / ความเร็วสูง',
    preDelayChoice: '1/64',
    decayBeats: 1,
    noteMode: 'straight',
    tagline: 'Pre 1/64 · 1 Beat · ธรรมดา',
    descriptionTh: 'กระชับ คมชัด หางเสียงสั้นเพียง 1 จังหวะ (1 Beat) เสียงกีตาร์และกลองชัดเจนไม่เบลอ',
  },
  {
    id: 'ballad',
    name: 'BALLARD',
    labelTh: 'เพลงช้า / บัลลาด / อะคูสติก',
    preDelayChoice: '1/32',
    decayBeats: 3,
    noteMode: 'dotted',
    tagline: 'Pre 1/32 · 3 Beats · Dotted (·)',
    descriptionTh: 'เว้นช่องไฟกว้างด้วย 1/32 และหางเสียงหวานยาว 3 จังหวะ Dotted สร้างมิติโอบอุ้มเสียงร้อง',
  },
  {
    id: 'edm',
    name: 'EDM/DANCE',
    labelTh: 'อิเล็กทรอนิกส์ / แดนซ์ / ดิสโก้',
    preDelayChoice: '1/64',
    decayBeats: 1.5,
    noteMode: 'straight',
    tagline: 'Pre 1/64 · 1.5 Beats · ธรรมดา',
    descriptionTh: 'หางเสียง 1.5 จังหวะ ซิงก์กับจังหวะ Upbeat และ Drop สวิงเข้ากับบีทได้อย่างลงตัว',
  },
];

export const DEFAULT_PRESET: GenrePreset = {
  id: 'default',
  name: 'DEFAULT',
  labelTh: 'ค่าเริ่มต้น',
  preDelayChoice: '1/64',
  decayBeats: 2,
  noteMode: 'straight',
  tagline: 'Pre 1/64 · 2 Beats · ธรรมดา',
  descriptionTh: 'ค่าเริ่มต้นสำหรับการแสดงสดทั่วไป Pre-Delay 1/64 note และ Decay 2 Beats ในรูปแบบโน้ตธรรมดา',
};

/**
 * ตรวจสอบว่าการตั้งค่าปัจจุบันตรงกับ Genre Preset ใดหรือไม่
 */
export function matchCurrentGenre(
  preDelayChoice: PreDelayChoice,
  decayBeats: number,
  noteMode: NoteMode
): GenrePresetId {
  // If exactly matches BALLARD
  if (preDelayChoice === '1/32' && decayBeats === 3 && noteMode === 'dotted') {
    return 'ballad';
  }
  // If exactly matches ROCK
  if (preDelayChoice === '1/64' && decayBeats === 1 && noteMode === 'straight') {
    return 'rock';
  }
  // If exactly matches EDM/DANCE
  if (preDelayChoice === '1/64' && decayBeats === 1.5 && noteMode === 'straight') {
    return 'edm';
  }
  // If matches POP / DEFAULT
  if (preDelayChoice === '1/64' && decayBeats === 2 && noteMode === 'straight') {
    return 'pop';
  }
  return 'custom';
}

export function getGenreDisplayName(genreId: GenrePresetId): string {
  switch (genreId) {
    case 'pop':
      return 'POP';
    case 'rock':
      return 'ROCK';
    case 'ballad':
      return 'BALLARD';
    case 'edm':
      return 'EDM/DANCE';
    case 'default':
      return 'DEFAULT';
    default:
      return 'Custom';
  }
}
