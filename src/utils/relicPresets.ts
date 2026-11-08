import { type RelicData } from '../models/relic';

export type LayoutMode = 'default' | 'to-end' | 'hidden' | 'manual';

/**
 * Рассчитывает индексы для реликов на основе выбранного режима автоматической сортировки
 */
export function calculateRelicIndices(relics: RelicData[], mode: LayoutMode, currentIndices: number[]): number[] {
  // Сначала всегда сортируем исходные релики по их порядку order, чтобы базовая последовательность была стабильной
  const sortedByOrder = [...relics].sort((a, b) => a.order - b.order);
  
  // Создаем массив под итоговые индексы, сопоставленный с оригинальным (неотсортированным) массивом relics
  const resultIndices = new Array(relics.length).fill(-1);

  if (mode === 'manual') {
    return currentIndices; // В ручном режиме ничего не трогаем, возвращаем как есть
  }

  if (mode === 'default') {
    // Режим "На месте": индексы идут строго по порядку order от 0 до 10
    sortedByOrder.forEach((relic, gridIdx) => {
      const originalIdx = relics.findIndex(r => r.name === relic.name);
      resultIndices[originalIdx] = gridIdx;
    });
    return resultIndices;
  }

  if (mode === 'hidden') {
    // Режим "Не показывать": видимые релики получают индексы по очереди, скрытые (no) получают -1
    let visibleCounter = 0;
    sortedByOrder.forEach((relic) => {
      const originalIdx = relics.findIndex(r => r.name === relic.name);
      if (relic.state === 'no') {
        resultIndices[originalIdx] = -1;
      } else {
        resultIndices[originalIdx] = visibleCounter;
        visibleCounter++;
      }
    });
    return resultIndices;
  }

  if (mode === 'to-end') {
    // Режим "В конец": сначала выстраиваем видимые, затем в конец дописываем те, у которых state === 'no'
    const visibleRelics = sortedByOrder.filter(r => r.state !== 'no');
    const noRelics = sortedByOrder.filter(r => r.state === 'no');
    const finalOrderedList = [...visibleRelics, ...noRelics];

    finalOrderedList.forEach((relic, gridIdx) => {
      const originalIdx = relics.findIndex(r => r.name === relic.name);
      resultIndices[originalIdx] = gridIdx;
    });
    return resultIndices;
  }

  return resultIndices;
}
