export const BUFFS: string[] = [
    "ATK",
    "CritMult",
    "DoubleAttack",
    "DeadHit",
    "HP",
    "Shield",
    "Regen",
    "RangeMult",
    "SplashMult",
    "HitRate",
    "DmgRet",
    "Dodge",
    "SkillCh",
    "SkillMult",
    "CritCh",
    "CritRes",
    "Grievous",
];

export interface BuffStats {
    min: number;
    max: number;
    maxObtainable: number;
}

export const BUFF_STATS: Record<string, BuffStats> = {
    ATK: { min: 200, max: 277, maxObtainable: 200000 },
    CritCh: { min: 1, max: 2, maxObtainable: 200 },
    CritMult: { min: 7, max: 20, maxObtainable: 1000 },
    CritRes: { min: 6, max: 9, maxObtainable: 3000 },
    DeadHit: { min: 8, max: 11, maxObtainable: 750 },
    DmgRet: { min: 6, max: 17, maxObtainable: 900 },
    Dodge: { min: 0.8, max: 1.1, maxObtainable: 50 },
    DoubleAttack: { min: 2, max: 7, maxObtainable: 400 },
    Grievous: { min: 4, max: 7, maxObtainable: 600 },
    HitRate: { min: 2, max: 4, maxObtainable: 200 },
    HP: { min: 210, max: 396, maxObtainable: 250000 },
    RangeMult: { min: 3, max: 13, maxObtainable: 800 },
    Regen: { min: 100, max: 199, maxObtainable: 20000 },
    Shield: { min: 800, max: 1199, maxObtainable: 90100 },
    SkillCh: { min: 1, max: 2, maxObtainable: 100 },
    SkillMult: { min: 2, max: 5, maxObtainable: 300 },
    SplashMult: { min: 2, max: 7, maxObtainable: 320 }
};

export const BUFF_NAMES: Record<string, string> = {
    ATK: "ATK",
    CritCh: "Critical Chance",
    CritMult: "Critical Multiplier",
    CritRes: "Critical Resistance",
    DeadHit: "DeadHit",
    DmgRet: "Damage Return Multiplier",
    Dodge: "Dodge Chance",
    DoubleAttack: "Double Attack Damage Percent",
    Grievous: "Grievous Wound",
    HitRate: "Hit Rate",
    HP: "HP",
    RangeMult: "Range Damage Multiplier",
    Regen: "Regeneration",
    Shield: "Shield Hp",
    SkillCh: "Skill Critical Chance",
    SkillMult: "Skill Critical Multiplier",
    SplashMult: "Splash Damage Multiplier"
};

export type BuffType = typeof BUFFS[number];

export class BuffData {
  public type: BuffType;
  public value: number;

  constructor(type: BuffType, value: number = 0) {
    this.type = type;
    this.value = value;
  }

  public get key(): string {
    return this.type;
  }

  public get order(): number {
    return BUFFS.indexOf(this.type);
  }

  public get isAbsent(): boolean {
    return false;
  }

  public get cleanName(): string {
    return BUFF_NAMES[this.type];
  }

  // Расчет индивидуального процента заполнения конкретного баффа (Вариант А)
  public get percentage(): number {
    const maxVal = BUFF_STATS[this.type].maxObtainable;
    if (maxVal <= 0) return 0;
    const pct = (this.value / maxVal) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  public get imageUrl(): string {
    return new URL(`../assets/buffs/${this.type}.png`, import.meta.url).href;
  }

  public clone(changes: Partial<BuffData>): BuffData {
    const cloned = new BuffData(this.type, this.value);
    
    // Применяем пришедшие изменения
    Object.assign(cloned, changes);

    // Достаем лимит из словаря BUFF_STATS для текущего типа баффа
    const maxLimit = BUFF_STATS[cloned.type].maxObtainable;

    /* 
      ИСПРАВЛЕНИЕ: Проверяем строго поле value. 
      Убираем фрагменты, которые ломали валидацию!
    */
    if (cloned.value < 0) cloned.value = 0;
    if (cloned.value > maxLimit) {
      cloned.value = maxLimit; // Жестко срезаем значение до капа
    }

    return cloned;
  }
}

// РУЧНАЯ РЕГУЛИРОВКА РАЗМЕРОВ ШРИФТОВ И КАРТИНОК БАФФОВ
export const BUFF_CONFIG = {
  // Настройки отображения в редакторе на сайте
  editor: {
    iconSize: 50,          // Ширина/высота иконки баффа в пикселях
    titleFontSize: '14px',  // Размер шрифта названия баффа
    valueFontSize: '16px',  // Размер шрифта числового значения
    cardWidth: 160          // Ширина карточки-рамки в редакторе
  },
  // Настройки отрисовки в итоговом HD PNG-изображении
  export: {
    iconSize: 64,          // Размер иконки на картинке
    titleFontSize: 20,     // Размер шрифта названия на Canvas (число для ctx.font)
    valueFontSize: 24,     // Размер шрифта значения на Canvas
    cardWidth: 220,        // Ширина виртуальной ячейки на Canvas под бафф
    cardHeight: 170,       // Высота виртуальной ячейки на Canvas под бафф
    cols: 7                // Количество баффов в один ряд на итоговой картинке (3 или 4)
  },

  textMaxLineWidth: 180 
};

export function splitBuffName(name: string): string[] {
  const words = name.split(' ');
  
  // Если слов меньше 3 — оставляем в одну строку
  if (words.length < 3) {
    return [name];
  }

  // Находим оптимальную точку деления (примерно посередине)
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(' ');
  const line2 = words.slice(mid).join(' ');

  return [line1, line2];
}