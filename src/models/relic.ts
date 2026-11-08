// Импортируем картинки звезд (их по-прежнему импортируем напрямую, так как их мало)
import starBlack from '../assets/relics/star/Black.png';
import starYellow from '../assets/relics/star/Yellow.png';
import starRed from '../assets/relics/star/Red.png';
import starViolet from '../assets/relics/star/Violet.png';

// 1. Все возможные состояния релика
export type RelicState =
  | 'no' | '0'
  | '1y' | '2y' | '3y' | '4y' | '5y'
  | '1r' | '2r' | '3r' | '4r' | '5r'
  | '1v' | '2v' | '3v' | '4v' | '5v';

// 2. Список всех состояний по порядку для меню
export const ALL_RELIC_STATES: RelicState[] = [
  'no', '0',
  '1y', '2y', '3y', '4y', '5y',
  '1r', '2r', '3r', '4r', '5r',
  '1v', '2v', '3v', '4v', '5v'
];

// Простой массив с полными названиями файлов
export const RELIC_NAMES = [
  'DemonClaw',
  'DemonMask',
  'DragonheartShield',
  'DragonbloodBlade',
  'PhilosophersStone',
  'AstralCompass',
  'Soul-DevouringCrucible',
  'SpiritInfusionElixir',
  'BookOfProphecy',
  'StarlightBrooch',
  'OminousMask',
  'InsightMirror',
  'HourglassOfTime',
  'TabletOfTruth',
  'WhisperingWindChime',
  'EternalEmber',
  'FrozenHeart'
];

export class RelicData {
  private _name: string;
  private _state: RelicState;

  constructor(name: string, state: RelicState = '0') {
    this._name = name;
    this._state = state;
  }

  public get name(): string {
    return this._name;
  }

  public get key(): string {
    return this._name;
  }

  public get isAbsent(): boolean {
    return this._state === 'no';
  }

  public get state(): RelicState {
    return this._state;
  }

  public set state(newState: RelicState) {
    this._state = newState;
  }

  // ИСПРАВЛЕНИЕ: Порядок теперь строго равен индексу в массиве (0-10)
  public get order(): number {
    const idx = RELIC_NAMES.indexOf(this.name);
    return idx !== -1 ? idx : 0;
  }

  // ИСПРАВЛЕНИЕ: Путь к картинке формируется напрямую по чистому имени
  public get imageUrl(): string {
    return new URL(`../assets/relics/${this.name + '.png'}`, import.meta.url).href;
  }

  public clone(changes: Partial<RelicData>): RelicData {
    const cloned = new RelicData(this.name, this.state);
    Object.assign(cloned, changes);
    return cloned;
  }
}

// 4. НАЧАЛЬНЫЙ МАССИВ МОДЕЛЕЙ РЕЛИКОВ (С автоматическим получением URL)
export const INITIAL_RELICS: RelicData[] = RELIC_NAMES.map((fileName) => {
  return new RelicData(fileName, '0');
});

// 5. Функция генерации массива звезд
export function getStarImages(state: RelicState): string[] {
  if (state === 'no') return [];
  if (state === '0') return Array(5).fill(starBlack);

  const count = parseInt(state, 10);
  const colorCode = state.charAt(1);

  let activeStarImg = starBlack;
  if (colorCode === 'y') activeStarImg = starYellow;
  if (colorCode === 'r') activeStarImg = starRed;
  if (colorCode === 'v') activeStarImg = starViolet;

  const stars: string[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < count) {
      stars.push(activeStarImg);
    } else {
      stars.push(starBlack);
    }
  }

  return stars;
}
