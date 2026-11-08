export type EquipmentGrade =
  | 'no' | 'epic' | 'legendary' | 'mythic' 
  | 'mythic1' | 'mythic2' | 'mythic3' 
  | 'fantasy' | 'fantasy1' | 'fantasy2';

export type EquipmentType = 'sword' | 'helmet' | 'chestplate' | 'ring';
export type EquipmentSet = 'astral' | 'egida';

export class EquipmentData {
  public name: string;        // Уникальный ID, например "1-AstralSword"
  public type: EquipmentType;  // Тип предмета
  public set: EquipmentSet;    // Сет предмета
  public grade: EquipmentGrade;// Текущий грейд (no, epic, ...)

  constructor(name: string, type: EquipmentType, set: EquipmentSet, grade: EquipmentGrade = 'no') {
    this.name = name;
    this.type = type;
    this.set = set;
    this.grade = grade;
  }

  // 1. Слои: Путь к картинке ФОНА (195x209)
  public get bgUrl(): string {
    // Если состояние 'no', берем фон от 'epic' (или базовый), так как на него наложится ЧБ фильтр
    let folder = this.grade === 'no' ? 'epic' : this.grade;
    if (folder.startsWith('mythic')) folder = 'mythic';
    if (folder.startsWith('fantasy')) folder = 'fantasy';
    return new URL(`../assets/equipment/background/${folder}.png`, import.meta.url).href;
  }

  // 2. Слои: Путь к картинке САМОГО ПРЕДМЕТА (195x209)
  public get itemUrl(): string {
    return new URL(`../assets/equipment/${this.set}/${this.type}.png`, import.meta.url).href;
  }

  // 3. Слои: Путь к картинке SS-знака (62x40, top left: 0, 151)
  public get ssSignUrl(): string {
    return new URL(`../assets/equipment/sign/ss.png`, import.meta.url).href;
  }

  // 4. Слои: Путь к значку ТИПА снаряжения (53x53, top left: 0, 0)
  public get typeSignUrl(): string {
    return new URL(`../assets/equipment/sign/${this.type}.png`, import.meta.url).href;
  }

  // 5. Слои: Путь к значку УРОВНЯ грейда (54x54, top left: 75, 155)
  public get levelSignUrl(): string | null {
    if (this.grade === 'mythic1') return new URL(`../assets/equipment/sign/myth1.png`, import.meta.url).href;
    if (this.grade === 'mythic2') return new URL(`../assets/equipment/sign/myth2.png`, import.meta.url).href;
    if (this.grade === 'mythic3') return new URL(`../assets/equipment/sign/myth3.png`, import.meta.url).href;
    if (this.grade === 'fantasy1') return new URL(`../assets/equipment/sign/fan1.png`, import.meta.url).href;
    if (this.grade === 'fantasy2') return new URL(`../assets/equipment/sign/fan2.png`, import.meta.url).href;
    return null; // Для epic, legendary, mythic, fantasy и no доп. знака уровня нет
  }

  public get isBlackAndWhite(): boolean {
    return this.grade === 'no';
  }

  public clone(changes: Partial<EquipmentData>): EquipmentData {
    const cloned = new EquipmentData(this.name, this.type, this.set, this.grade);
    Object.assign(cloned, changes);
    return cloned;
  }
}

// Перечень всех 10 возможных состояний для контекстного выпадающего меню
export const ALL_EQUIPMENT_GRADES: EquipmentGrade[] = [
  'no', 'epic', 'legendary', 'mythic', 'mythic1', 'mythic2', 'mythic3', 'fantasy', 'fantasy1', 'fantasy2'
];

// Функция сборки начального статичного списка предметов (8 штук — по 4 предмета на 2 сета)
export function createInitialEquipment(): EquipmentData[] {
  const items: EquipmentData[] = [];
  const types: EquipmentType[] = ['sword', 'helmet', 'chestplate', 'ring'];
  
  // Сет Astral (номера 1-4)
  types.forEach((type) => {
    const formatName = `Astral${type.charAt(0).toUpperCase() + type.slice(1)}`;
    items.push(new EquipmentData(formatName, type, 'astral', 'no'));
  });

  // Сет Egida (номера 5-8)
  types.forEach((type) => {
    const formatName = `Egida${type.charAt(0).toUpperCase() + type.slice(1)}`;
    items.push(new EquipmentData(formatName, type, 'egida', 'no'));
  });

  return items;
}
