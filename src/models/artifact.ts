// Ограничение всех возможных состояний звёзд артефакта
import starYellow from '../assets/artifacts/yellow.png';

export type ArtifactState = 'no' | '0' | '1y' | '2y' | '3y' | '4y' | '5y';

export const ALL_ARTIFACT_STATES: ArtifactState[] = ['no', '0', '1y', '2y', '3y', '4y', '5y'];

export function getArtifactStarImages(state: ArtifactState): string[] {
  if (state === 'no' || state === '0') return [];
  return Array<string>(parseInt(state, 10)).fill(starYellow);
}

// ЭТАЛОННЫЙ МАССИВ НАЗВАНИЙ АРТЕФАКТОВ (Сюда добавляйте новые файлы картинок .png без пробелов)
export const ARTIFACT_NAMES = [
  'Fenicis',
  'Agnaros',
  'Panpan',
  'Solax',
  'Vulcayen',
  'Wynne',
  'Special',
  'Fire',
  'Water',
  'Earth',
  'Wind',
  'EpicWater',
];

export class ArtifactData {
  public name: string;
  public state: ArtifactState;
  public level: number;
  public fragments: number; // Текущие осколки

  constructor(name: string, state: ArtifactState = 'no', level: number = 1, fragments: number = 0) {
    this.name = name;
    this.state = state;
    this.level = level;
    this.fragments = fragments;
  }

  // Порядковый номер артефакта на основе его позиции в эталонном массиве
  public get order(): number {
    const idx = ARTIFACT_NAMES.indexOf(this.name);
    return idx !== -1 ? idx : 0;
  }

  // Очищенное имя для интерфейса (если в будущем будут префиксы, пока отдаем как есть)
  public get cleanName(): string {
    return this.name;
  }

  // Флаг для применения CSS-фильтра ЧБ (оттенки серого), если артефакта нет
  public get isBlackAndWhite(): boolean {
    return this.state === 'no';
  }

  // ДИНАМИЧЕСКИЙ МАКСИМУМ ОСКОЛКОВ до следующей звезды
  public get maxFragments(): number {
    switch (this.state) {
      case 'no': return 50;  // Артефакта нет, нужно 50 до получения (0 звезд)
      case '0': return 50;   // До 1 звезды нужно 50
      case '1y': return 100; // До 2 звезд нужно 100
      case '2y': return 150; // До 3 звезд нужно 150
      case '3y': return 200; // До 4 звезд нужно 200
      case '4y': return 250; // До 5 звезд нужно 250
      case '5y': return 0;   // На 5 звездах пишем max
      default: return 50;
    }
  }

  // Форматированная строка для вывода осколков (например, "124/150" или "max")
  public get fragmentsText(): string {
    if (this.state === '5y') return 'max';
    return `${this.fragments}/${this.maxFragments}`;
  }

  public get imageUrl(): string {
    return new URL(`../assets/artifacts/${this.name}.png`, import.meta.url).href;
  }

  // ДИНАМИЧЕСКИЙ МАКСИМАЛЬНЫЙ УРОВЕНЬ в зависимости от звезд
  public get maxLevel(): number {
    switch (this.state) {
      case 'no': return 1;
      case '0': return 20;   // При 0 звезд максимум 20 уровень
      case '1y': return 40;  // При 1 звезде максимум 40 уровень
      case '2y': return 80;  // При 2 звездах максимум 80 уровень
      case '3y': return 120; // При 3 звездах максимум 120 уровень
      case '4y': return 160; // При 4 звездах максимум 160 уровень
      case '5y': return 200; // При 5 звездах максимум 200 уровень
      default: return 200;
    }
  }

  /**
   * Клонирование инстанса артефакта с соблюдением динамических лимитов
   */
  public clone(changes: Partial<ArtifactData>): ArtifactData {
    const cloned = new ArtifactData(this.name, this.state, this.level, this.fragments);
    
    // 1. Сброс уровня при полной деактивации
    if (this.state !== 'no' && changes.state === 'no') {
      cloned.level = 1;
    }

    // Применяем пришедшие изменения звезд/уровня/осколков
    Object.assign(cloned, changes);

    // 2. ВАЛИДАЦИЯ ОСКОЛКОВ: Не больше текущего максимума до следующей звезды
    if (cloned.fragments < 0) cloned.fragments = 0;
    // На 5 звездах fragmentsText возвращает "max", зафиксируем лимит на 0
    const maxFrag = cloned.state === '5y' ? 0 : cloned.maxFragments;
    if (cloned.fragments > maxFrag) {
      cloned.fragments = maxFrag;
    }
    
    // 3. ВАЛИДАЦИЯ УРОВНЯ: Ограничиваем уровень на основе динамического maxLevel
    if (cloned.level < 1) cloned.level = 1;
    if (cloned.level > cloned.maxLevel) {
      cloned.level = cloned.maxLevel;
    }

    return cloned;
  }
}
