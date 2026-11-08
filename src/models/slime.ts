import starRed from '../assets/slimes/star/red.png';
import starYellow from '../assets/slimes/star/yellow.png';

import BTextBackGround from '../assets/slimes/B/TextBackGround.png';
import BStarBottom from '../assets/slimes/B/StarBottom.png';

import ATextBackGround from '../assets/slimes/A/TextBackGround.png';
import AStarBottom from '../assets/slimes/A/StarBottom.png';

import STextBackGround from '../assets/slimes/S/TextBackGround.png';
import SStarBottom from '../assets/slimes/S/StarBottom.png';

import SSTextBackGround from '../assets/slimes/SS/TextBackGround.png';
import SSStarBottom from '../assets/slimes/SS/StarBottom.png';

import SSSTextBackGround from '../assets/slimes/SSS/TextBackGround.png';
import SSSStarBottom from '../assets/slimes/SSS/StarBottom.png';

export type SlimeState =
  | 'no' | '0'
  | '1y' | '2y' | '3y' | '4y' | '5y'
  | '1r' | '2r' | '3r' | '4r' | '5r';

export type SlimeRarity = 'B' | 'A' | 'S' | 'SS' | 'SSS';

export const ALL_SLIME_STATES: SlimeState[] = [
  'no', '0',
  '1y', '2y', '3y', '4y', '5y',
  '1r', '2r', '3r', '4r', '5r',
];

export const B_SLIME_NAME = [
  'Arp',
  'Veinley',
  'Yulissa',
];

export const A_SLIME_NAME = [
  'Willer',
  'Yana',
];

export const S_SLIME_NAME = [
  'Ysabelle',
  'Yamilet',
  'Chilbert',
  'Sully',
  'Doraks',
];

export const SS_SLIME_NAME = [
  'Yolanda',
  'Wynne',
  'Vinomera',
  'Neprus',
  'Vulcayen',
  'Maggie',
  'Chloris',
  'Haku',
  'Feyria',
  'Solax',
  'Lunax',
  'Silas',
  'Sylvia',
  'Auralis',
  'Agnaros',
  'Monilia',
];

export const SSS_SLIME_NAME = [
  'Panpan',
  'Aelwenya',
  'Taranis',
  'Fenicis',
  "Noxraith",
];

export const SLIME_SKINS = [
  'Arp-1',
  'Yulissa-1',
  'Willer-1',
  'Yana-1',
  'Ysabelle-1',
  'Yamilet-1',
  'Chilbert-1',
  'Sully-1',
  'Yolanda-1',
  'Wynne-1',
  'Vinomera-1',
  'Neprus-1',
  'Neprus-2',
  'Vulcayen-1',
  'Chloris-1',
  'Chloris-2',
  'Haku-1',
  'Haku-2',
  'Feyria-1',
  'Solax-1',
  'Lunax-1',
  'Silas-1',
  'Sylvia-1',
  'Auralis-1',
  'Agnaros-1',
  'Monilia-1',
  'Monilia-1',
  'Panpan-1',
  'Aelwenya-1',
  'Taranis-1',
];

export const SLIME_ASSETS = {
  stars: {
    yellow: starYellow,
    red: starRed,
  },
  B: { bg: BTextBackGround, starBottom: BStarBottom },
  A: { bg: ATextBackGround, starBottom: AStarBottom },
  S: { bg: STextBackGround, starBottom: SStarBottom },
  SS: { bg: SSTextBackGround, starBottom: SSStarBottom },
  SSS: { bg: SSSTextBackGround, starBottom: SSSStarBottom },
};

const STATE_PROGRESS: SlimeState[] = [
  '0', '1y', '2y', '3y', '4y', '5y', '1r', '2r', '3r', '4r', '5r',
];

const RARITY_STAR_STEPS: Record<SlimeRarity, number[]> = {
  B: [1.0, 1.5, 2.0, 2.5, 3.0],
  A: [2.0, 2.5, 3.0, 3.5, 4.0],
  S: [4.0, 5.0, 6.0, 7.0, 8.0],
  SS: [8.0, 10.0, 12.0, 14.0, 16.0],
  SSS: [12.0, 15.0, 18.0, 21.0, 24.0],
};

const MAX_LEVEL_BONUSES: Record<SlimeRarity, number> = {
  B: 2.5,
  A: 2.5,
  S: 5.0,
  SS: 10.0,
  SSS: 20.0,
};

function calculateStarBonus(rarity: SlimeRarity, state: SlimeState): number {
  const completedCheckpoints = Math.floor(STATE_PROGRESS.indexOf(state) / 2);
  const steps = RARITY_STAR_STEPS[rarity];
  let bonus = 0;

  for (let index = 0; index < completedCheckpoints; index += 1) {
    bonus += steps[index];
  }

  return bonus;
}

export class SlimeData {
  public _name: string;
  public _rarity: SlimeRarity;
  public _state: SlimeState;
  public _level: number;
  public _skin: number;

  constructor(name: string, rarity: SlimeRarity, state?: SlimeState, level?: number, skin?: number);
  constructor(name: string, state?: SlimeState, level?: number, skin?: number);
  constructor(
    name: string,
    param2?: any,
    param3?: any,
    param4: number = 1,
    param5: number = 0
  ) {
    this._name = name;
    
    // Если второй параметр — это валидная редкость, используем её (для первичной инициализации)
    if (param2 === 'B' || param2 === 'A' || param2 === 'S' || param2 === 'SS' || param2 === 'SSS') {
      this._rarity = param2;
      this._state = param3 ?? 'no';
      this._level = param4;
      this._skin = param5;
    } else {
      // Иначе автоматически определяем редкость по имени (для импорт-сервиса)
      this._rarity = SlimeData.determineRarity(name);
      this._state = param2 ?? 'no';
      this._level = param3 ?? 1;
      this._skin = param4 ?? 0;
    }
  }

  private static determineRarity(name: string): SlimeRarity {
    if (B_SLIME_NAME.includes(name)) return 'B';
    if (A_SLIME_NAME.includes(name)) return 'A';
    if (S_SLIME_NAME.includes(name)) return 'S';
    if (SS_SLIME_NAME.includes(name)) return 'SS';
    return 'SSS';
  }
  
  // Геттеры и сеттеры
  public get name(): string { return this._name; }
  public get key(): string { return this._name; }
  public get isAbsent(): boolean { return this._state === 'no'; }
  public get rarity(): SlimeRarity { return this._rarity; }
  
  public get state(): SlimeState { return this._state; }
  public set state(newState: SlimeState) { 
    this._state = newState; 
    if (newState == 'no')
      this._skin = 0;
  }

  public get level(): number { return this._level; }
  public set level(newLevel: number) {
    // Ограничение уровня от 1 до 250
    this._level = Math.max(1, Math.min(250, newLevel));
  }

  public get skin(): number { return this._skin; }
  public set skin(newSkin: number) { this._skin = newSkin; }

  // Расчет сквозного порядкового номера (order) на основе позиции в массивах
  public get order(): number {
    // 1. Если слайм относится к редкости B, его номер — это просто индекс в массиве B
    if (this.rarity === 'B') {
      return B_SLIME_NAME.indexOf(this.name);
    }

    // 2. Если редкость A: индекс в А + длина массива B
    if (this.rarity === 'A') {
      return B_SLIME_NAME.length + A_SLIME_NAME.indexOf(this.name);
    }

    // 3. Если редкость S: индекс в S + длина (B + A)
    if (this.rarity === 'S') {
      return B_SLIME_NAME.length + A_SLIME_NAME.length + S_SLIME_NAME.indexOf(this.name);
    }

    // 4. Если редкость SS: индекс в SS + длина (B + A + S)
    if (this.rarity === 'SS') {
      return (
        B_SLIME_NAME.length +
        A_SLIME_NAME.length +
        S_SLIME_NAME.length +
        SS_SLIME_NAME.indexOf(this.name)
      );
    }

    // 5. Если редкость SSS: индекс в SSS + длина (B + A + S + SS)
    return (
      B_SLIME_NAME.length +
      A_SLIME_NAME.length +
      S_SLIME_NAME.length +
      SS_SLIME_NAME.length +
      SSS_SLIME_NAME.indexOf(this.name)
    );
  }

  public get cleanName(): string {
    return this._name;
  }

  public nextSkin(): number {
    // Считаем, сколько дополнительных скинов есть у этого слайма в массиве
    // Ищем совпадения по маске "ИмяСлайма-" (например, "Arp-1", "Arp-2")
    const additionalSkinsCount = SLIME_SKINS.filter(skinName => 
      skinName.startsWith(`${this.name}-`)
    ).length;

    // Общее количество доступных вариантов (дефолтный 0 + дополнительные)
    const totalOptions = 1 + additionalSkinsCount;

    // Возвращаем следующий индекс по кругу
    return (this.skin + 1) % totalOptions;
  }

  public get imageUrl(): string {
    if (this._skin > 0) {
      // ИСПРАВЛЕНИЕ: Если выбран кастомный скин, берем его из общей папки skins
      const fileName = `${this.name}-${this._skin}.png`;
      return new URL(`../assets/slimes/skins/${fileName}`, import.meta.url).href;
    }
    
    // Дефолтный скин (0) по-прежнему берется из папки своей редкости
    const fileName = `${this.name}.png`;
    return new URL(`../assets/slimes/${this.rarity}/${fileName}`, import.meta.url).href;
  }

  // Парсинг состояния звезд для Canvas
  public get starInfo() {
    if (this._state === 'no' || this._state === '0') {
      return { type: null as 'yellow' | 'red' | null, count: 0 };
    }
    const count = parseInt(this._state) || 0; // Достает цифру 1-5
    const type = this._state.endsWith('y') ? ('yellow' as const) : ('red' as const);
    return { type, count };
  }

  // Проверка: нужно ли рисовать подложку звезд и сами звезды?
  public get hasStars(): boolean {
    return this.starInfo.count > 0;
  }

  // Проверка на ЧБ фильтр
  public get isBlackAndWhite(): boolean {
    return this._state === 'no';
  }

  // Клонирование инстанса
  /**
   * Клонирование инстанса слайма с умным переключением уровней при изменении состояния
   */
  public clone(changes: Partial<SlimeData>): SlimeData {
    // 1. Создаем точную копию текущего слайма со всеми его текущими приватными полями
    const cloned = new SlimeData(this._name, this._rarity, this._state, this._level, this._skin);
    
    // 2. Проверяем триггер активации: старое состояние было 'no', а новое (переданное в изменениях) — ЛЮБОЕ ДРУГОЕ
    if (this._state === 'no' && changes._state && changes._state !== 'no') {
      cloned.level = 250; // Автоматически выставляем максимальный 250 уровень
    }
    
    // 3. Проверяем обратный триггер деактивации: старое состояние было активным, а новое становится 'no'
    if (changes._state === 'no') {
      cloned.level = 1; // Сбрасываем уровень на 1
      cloned.skin = 0;
    }

    // 4. Накатываем все остальные пришедшие изменения (включая новое состояние звезд или скина)
    Object.assign(cloned, changes);
    return cloned;
  }


  public calculateBonus(): number {
    if (this.state === 'no') return 0;

    const starBonus = calculateStarBonus(this.rarity, this.state);
    const levelBonus = (this.level / 250) * MAX_LEVEL_BONUSES[this.rarity];

    return starBonus + levelBonus;
  }

}

export const slimeLists: { rarity: SlimeRarity; names: string[] }[] = [
    { rarity: 'B', names: B_SLIME_NAME },
    { rarity: 'A', names: A_SLIME_NAME },
    { rarity: 'S', names: S_SLIME_NAME },
    { rarity: 'SS', names: SS_SLIME_NAME },
    { rarity: 'SSS', names: SSS_SLIME_NAME },
  ];

/**
 * Функция генерации начального массива всех слаймов.
 */
export function createInitialSlimes(): SlimeData[] {
  const slimes: SlimeData[] = [];

  for (const list of slimeLists) {
    for (const name of list.names) {
      // Изменено: '0' вместо 'no', 250 вместо 1
      slimes.push(new SlimeData(name, list.rarity, '0', 250, 0));
    }
  }

  return slimes.sort((a, b) => a.order - b.order);
}