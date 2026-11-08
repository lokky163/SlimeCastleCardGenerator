import { toPng } from 'html-to-image';
import { RelicData, type RelicState, RELIC_NAMES } from '../models/relic';
import { SlimeData, type SlimeState, slimeLists } from '../models/slime';
import { EquipmentData, type EquipmentGrade } from '../models/equipment';
import { BuffData, type BuffType, BUFFS } from '../models/buff';
import { type LayoutMode } from '../utils/relicPresets';
import { ArtifactData, type ArtifactState, ARTIFACT_NAMES } from '../models/artifact';
import { saveAs } from 'file-saver';

export interface IRelicsJsonModule {
  relicsGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  relicsList: Array<{ name: string; state: string; slotIndex?: number }>;
}

export interface ISlimesJsonModule {
  slimesGrid: { rows: number; cols: number };
  layoutMode: LayoutMode;
  slimesList: Array<{ name: string; state: string; level: number; skin: number; slotIndex?: number }>;
}

// Новая структура JSON-модуля Снаряжения
export interface IEquipmentJsonModule {
  equipmentList: Array<{
    name: string;
    grade: string;
  }>;
}

export interface IBuffsJsonModule {
  buffsList: Array<{ name: string; value: number }>;
}

export interface IArtifactsJsonModule {
  artifactsList: Array<{ 
    name: string; 
    state: string; 
    level: number; 
    fragments: number 
  }>;
}

export interface IImportedSccData {
  playerName: string;
  relics: { rows: number; cols: number; layoutMode: LayoutMode; relicsList: RelicData[]; slotIndices: number[] } | null;
  slimes: { rows: number; cols: number; layoutMode: LayoutMode; slimesList: SlimeData[]; slotIndices: number[] } | null;
  equipment: EquipmentData[] | null; // Возвращаем плоский массив снаряжения
  buffs: BuffData[] | null; // Возвращаем плоский проверенный массив баффов
  artifacts: ArtifactData[] | null; // Новый массив в структуре импорта
}

export class ExportService {
  
  static serializeRelics(allRelics: RelicData[], slotIndices: number[], rows: number, cols: number, layoutMode: LayoutMode): IRelicsJsonModule {
    const relicsList = allRelics.map((relic, idx) => ({
      name: relic.name, state: relic.state, ...(layoutMode === 'manual' ? { slotIndex: slotIndices[idx] ?? -1 } : {})
    }));
    return { relicsGrid: { rows, cols }, layoutMode, relicsList };
  }

  static serializeSlimes(allSlimes: SlimeData[], slotIndices: number[], rows: number, cols: number, layoutMode: LayoutMode): ISlimesJsonModule {
    const slimesList = allSlimes.map((slime, idx) => ({
      name: slime.name, state: slime.state, level: slime.level, skin: slime.skin, ...(layoutMode === 'manual' ? { slotIndex: slotIndices[idx] ?? -1 } : {})
    }));
    return { slimesGrid: { rows, cols }, layoutMode, slimesList };
  }
  
  static serializeEquipment(allEquipment: EquipmentData[]): IEquipmentJsonModule {
    return {
      equipmentList: allEquipment.map(item => ({
        name: item.name,
        grade: item.grade
      }))
    };
  }

  static serializeBuffs(allBuffs: BuffData[]): IBuffsJsonModule {
    return { buffsList: allBuffs.map(b => ({ name: b.type, value: b.value })) };
  }

  static serializeArtifacts(allArtifacts: ArtifactData[]): IArtifactsJsonModule {
    return {
      artifactsList: allArtifacts.map(art => ({
        name: art.name, state: art.state, level: art.level, fragments: art.fragments
      }))
    };
  }

  static curFormattedDate() {
    const now = new Date();
    
    // Функция для добавления ведущего нуля (например: 9 -> "09")
    const pad = (num: number) => String(num).padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // Месяцы начинаются с 0
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    // Формат: "19_15-18.07.2026" — полностью безопасен для файловых систем
    return `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
  }
    
static exportToScc(
    playerName: string,
    activeModules: ('relics' | 'slimes' | 'equipment' | 'buffs' | 'artifacts')[],
    relicsData: IRelicsJsonModule | null,
    slimesData: ISlimesJsonModule | null,
    equipmentData: IEquipmentJsonModule | null,
    buffsData: IBuffsJsonModule | null,
    artifactsData: IArtifactsJsonModule | null
  ): void {
    const sccPayload = {
      fileType: "slime-card-config",
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      playerName: playerName.trim(),
      exportedModules: activeModules,
      modules: {
        relics: activeModules.includes('relics') ? relicsData : null,
        slimes: activeModules.includes('slimes') ? slimesData : null,
        equipment: activeModules.includes('equipment') ? equipmentData : null,
        buffs: activeModules.includes('buffs') ? buffsData : null,
        artifacts: activeModules.includes('artifacts') ? artifactsData : null
      }
    };

    const jsonString = JSON.stringify(sccPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${playerName.trim()}-${ExportService.curFormattedDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  static importFromScc(fileContent: string): IImportedSccData | null {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.fileType !== "slime-card-config") return null;

      const playerName = parsed.playerName ?? '';
      const result: IImportedSccData = { playerName, relics: null, slimes: null, equipment: null, buffs: null, artifacts: null };

      // Релики
      // 1. ИСПРАВЛЕНИЕ: Разбор модуля РЕЛИКВИЙ слиянием с дефолтным списком
      const relicsModule = parsed.modules?.relics as IRelicsJsonModule | null;
      if (relicsModule) {
        const { rows, cols } = relicsModule.relicsGrid;
        const layoutMode = relicsModule.layoutMode ?? 'default';
        
        const restoredRelics: RelicData[] = [];
        const restoredIndices: number[] = [];

        // Идём строго по нашему эталонному массиву RELIC_NAMES, чтобы ничего не потерять
        RELIC_NAMES.forEach((defaultName, defaultIdx) => {
          // Ищем, есть ли данный релик в загруженном файле JSON
          const foundItem = relicsModule.relicsList.find(item => item.name === defaultName);

          if (foundItem) {
            // Если релик найден в файле — восстанавливаем его сохранённое состояние
            restoredRelics.push(new RelicData(foundItem.name, foundItem.state as RelicState));
            restoredIndices.push(layoutMode === 'manual' ? (foundItem.slotIndex ?? -1) : defaultIdx);
          } else {
            // Если релика в файле нет — создаём его в состоянии по умолчанию ('0')
            restoredRelics.push(new RelicData(defaultName, 'no'));
            // В автоматических режимах индекс равен его дефолтной позиции, в ручном убираем в скрытые (-1)
            restoredIndices.push(layoutMode === 'manual' ? -1 : defaultIdx);
          }
        });

        result.relics = { 
          rows, 
          cols, 
          layoutMode, 
          relicsList: restoredRelics, 
          slotIndices: restoredIndices 
        };
      }


      // Слаймы
      // 2. ИСПРАВЛЕНИЕ: Разбор модуля СЛАЙМОВ слиянием через списки slimeLists
      const slimesModule = parsed.modules?.slimes as ISlimesJsonModule | null;
      if (slimesModule) {
        const { rows, cols } = slimesModule.slimesGrid;
        const layoutMode = slimesModule.layoutMode ?? 'default';
        
        const restoredSlimes: SlimeData[] = [];
        const restoredIndices: number[] = [];

        // Сквозной счетчик для автоматической расстановки дефолтных slotIndex
        let globalCounter = 0;

        // Идём строго по эталонной структуре списков редкостей
        slimeLists.forEach((list) => {
          list.names.forEach((defaultName) => {
            // Ищем, есть ли данный слайм в загруженном файле JSON
            const foundItem = slimesModule.slimesList.find(item => item.name === defaultName);

            if (foundItem) {
              // Если слайм найден — берем его состояние, уровень и скин из файла
              restoredSlimes.push(
                new SlimeData(foundItem.name, foundItem.state as SlimeState, foundItem.level, foundItem.skin)
              );
              restoredIndices.push(layoutMode === 'manual' ? (foundItem.slotIndex ?? -1) : globalCounter);
            } else {
              // Если слайма нет в файле — создаем дефолтного (состояние '0', 250 уровень, 0 скин)
              restoredSlimes.push(
                new SlimeData(defaultName, 'no', 1, 0)
              );
              restoredIndices.push(layoutMode === 'manual' ? -1 : globalCounter);
            }

            globalCounter++; // Переходим к следующему сквозному индексу
          });
        });

        result.slimes = { 
          rows, 
          cols, 
          layoutMode, 
          slimesList: restoredSlimes, 
          slotIndices: restoredIndices 
        };
      }

      // Снаряжение
      const equipModule = parsed.modules?.equipment as IEquipmentJsonModule | null;
      if (equipModule) {
        result.equipment = equipModule.equipmentList.map(item => {
          const name = item.name;
          let type: any = 'sword';
          if (name.toLowerCase().includes('helmet')) type = 'helmet';
          if (name.toLowerCase().includes('chestplate')) type = 'chestplate';
          if (name.toLowerCase().includes('ring')) type = 'ring';
          
          let set: any = name.toLowerCase().includes('astral') ? 'astral' : 'egida';
          return new EquipmentData(item.name, type, set, item.grade as EquipmentGrade);
        });
      }

      // УМНОЕ СЛИЯНИЕ ДЛЯ БАФФОВ
      const buffsModule = parsed.modules?.buffs as IBuffsJsonModule | null;
      if (buffsModule) {
        result.buffs = BUFFS.map(defaultType => {
          const found = buffsModule.buffsList.find(b => b.name === defaultType);
          return new BuffData(defaultType, found ? found.value : 0);
        });
      }

      const artifactsModule = parsed.modules?.artifacts as IArtifactsJsonModule | null;
      if (artifactsModule) {
        result.artifacts = ARTIFACT_NAMES.map(defaultName => {
          const found = artifactsModule.artifactsList.find(art => art.name === defaultName);
          if (found) {
            return new ArtifactData(found.name, found.state as ArtifactState, found.level, found.fragments);
          }
          return new ArtifactData(defaultName, 'no', 1, 0); // По умолчанию нет артефакта, 1 лвл, 0 осколков
        });
      }

      return result;
    } catch (e) {
      return null;
    }
  }

  // private static dataURLtoBlob(dataUrl: string): Blob {
  //   const arr = dataUrl.split(',');
  //   // const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  //   const bstr = atob(arr[1]);
  //   let n = bstr.length;
  //   const u8arr = new Uint8Array(n);
  //   while (n--) {
  //     u8arr[n] = bstr.charCodeAt(n);
  //   }
  //   // Используем 'application/octet-stream' для iOS/Telegram, чтобы принудительно вызвать скачивание
  //   return new Blob([u8arr], { type: 'application/octet-stream' });
  // }

  // static async exportToPng(element: HTMLDivElement | null, fileNamePrefix: string = 'layout'): Promise<void> {
  //   if (!element) return;
  //   try {
  //     const dataUrl = await toPng(element, {
  //       cacheBust: true,
  //       pixelRatio: 1, 
  //       style: {
  //         left: '0',
  //         top: '0',
  //         transform: 'translate(0, 0)',
  //       }
  //     });

  //     // 1. Конвертируем Data URL в бинарный Blob
  //     const blob = this.dataURLtoBlob(dataUrl);
  //     const fileName = `${fileNamePrefix}-${ExportService.curFormattedDate()}.png`;

  //     // 2. Скачиваем через file-saver, который внутри Telegram WebView сработает корректно
  //     saveAs(blob, fileName);
  //   } catch (error) {
  //     console.error('Ошибка при экспорте в PNG:', error);
  //   }
  // }

  static async exportToPng(element: HTMLDivElement | null): Promise<string | null> {
    if (!element) return null;
    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 1, // 2 сделает картинку четкой на Retina-экранах айфонов
        style: { left: '0', top: '0', transform: 'translate(0, 0)' }
      });
      
      return dataUrl; // Возвращаем dataUrl (base64) для отображения в React
    } catch (error) {
      console.error('Ошибка при генерации PNG:', error);
      return null;
    }
  }
}
