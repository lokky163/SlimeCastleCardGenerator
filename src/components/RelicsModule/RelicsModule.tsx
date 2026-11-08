import React from 'react';
import { CounterLabel } from '../CounterLabel';
import { RelicCard } from '../RelicCard';
import { type RelicData } from '../../models/relic';
import { type RelicState } from '../../models/relic';
import styles from './RelicsModule.module.css';
import { type LayoutMode } from '../../utils/relicPresets';

interface RelicsModuleProps {
  relics: RelicData[];
  setRelics: (updater: React.SetStateAction<RelicData[]>) => void;
  relicIndices: number[];
  setRelicIndices: React.Dispatch<React.SetStateAction<number[]>>;
  gridSettings: { rows: number; cols: number };
  setGridSettings: React.Dispatch<React.SetStateAction<{ rows: number; cols: number }>>;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
}

export const RelicsModule: React.FC<RelicsModuleProps> = ({
  relics,
  setRelics,
  relicIndices,
  setRelicIndices,
  gridSettings,
  setGridSettings,
  layoutMode,
  setLayoutMode
}) => {
  const { rows, cols } = gridSettings;

  // Изменение звезд релика
  const handleStateChange = (targetName: string, nextState: RelicState) => {
    setRelics(prev =>
      prev.map(relic => relic.name === targetName ? relic.clone({ state: nextState }) : relic)
    );
  };

  // Ручное изменение slotIndex под карточкой
  const handleIndexChange = (targetIdx: number, rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    const finalIndex = isNaN(parsed) ? -1 : parsed;

    setRelicIndices(prev =>
      prev.map((val, currentIdx) => currentIdx === targetIdx ? finalIndex : val)
    );
  };

  // Построение оригинальной HD-сетки для скачивания PNG по индексам slotIndex
  const maxHdSlots = rows * cols;
  const hdGridTable: Array<RelicData | null> = Array(maxHdSlots).fill(null);
  
  relics.forEach((relic, idx) => {
    const sIndex = relicIndices[idx];
    if (sIndex >= 0 && sIndex < maxHdSlots) {
      hdGridTable[sIndex] = relic;
    }
  });

  return (
    <div className={styles.container}>
      {/* 1. Только два +- лейбла для управления размерами итоговой сетки */}
      <div className={styles.controlRow}>
        <CounterLabel 
          label="Строк на изображении" 
          min={1} 
          max={6} 
          value={rows} 
          onChange={(r) => setGridSettings(prev => ({ ...prev, rows: r }))} 
        />
        <CounterLabel 
          label="Столбцов на изображении" 
          min={1} 
          max={10} 
          value={cols} 
          onChange={(c) => setGridSettings(prev => ({ ...prev, cols: c }))} 
        />

        {/* НОВОЕ: Переключатель режимов сетки ПЕРЕЕХАЛ СЮДА (после +- лейблов) */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#2a2a4a', border: '1px solid #4a4a6a', padding: '5px 12px', borderRadius: '6px', height: '24px' }}>
          <span style={{ fontSize: '0.85rem', color: '#a0a0b0', fontFamily: 'sans-serif' }}>Режим сетки:</span>
          <select 
            value={layoutMode} 
            onChange={(e) => setLayoutMode(e.target.value as any)} 
            style={{ background: '#16213e', border: '1px solid #4a4a6a', color: '#e0e0e0', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem' }}
          >
            <option value="to-end">В конец</option>
            <option value="default">На месте</option>
            <option value="hidden">Не показывать</option>
            <option value="manual">Ручные индексы</option>
          </select>
        </div>
      </div>

      {/* 2. Настраиваемая таблица превью (Растягивается на всю ширину страницы) */}
      <div>
        <div className={styles.screenGrid}>
          {relics.map((relic, idx) => {
            const currentSlotIndex = relicIndices[idx];
            const isVisibleOnImage = currentSlotIndex !== -1;

            return (
              <div 
                key={relic.name} 
                className={`${styles.relicCardWrapper} ${isVisibleOnImage ? styles.relicCardActive : ''}`}
              >
                {/* Карточка подстраивается под ширину ячейки резинового грида */}
                <div className={styles.cardContainerSize}>
                  <RelicCard 
                    imageUrl={relic.imageUrl} 
                    state={relic.state} 
                    onChangeState={(s) => handleStateChange(relic.name, s)} 
                  />
                </div>

                {/* <span className={styles.relicNameText} style={{ color: isVisibleOnImage ? '#4caf50' : '#666' }}>
                  {relic.name.split('-')[1] || relic.name}
                </span> */}

                {/* Поле ввода индекса: появляется только в режиме ручных индексов */}
                {layoutMode === 'manual' && (
                  <div className={styles.manualInputContainer}>
                    <span>Слот:</span>
                    <input
                      type="number"
                      min={-1}
                      max={maxHdSlots - 1}
                      value={currentSlotIndex}
                      onChange={(e) => handleIndexChange(idx, e.target.value)}
                      className={styles.indexInput}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 3. СКРЫТЫЙ HD-СТЕНД ДЛЯ ЭКСПОРТА (Оригинальные 228x349 с gap 5px)          */}
      {/* ====================================================================== */}
      {/* <div ref={hdRef} className={styles.hdHiddenContainer} style={{ backgroundColor: bgColor }}>
        <div 
          className={styles.hdRelicsGrid} 
          style={{ 
            transform: 'translate(100%, 100%)',
            gridTemplateColumns: `repeat(${cols}, 228px)`, 
            gridTemplateRows: `repeat(${rows}, 349px)`,
            // ДОБАВИТЬ ЭТИ ДВЕ СТРОЧКИ ДЛЯ ФИКСАЦИИ РАЗМЕРА СНИМКА:
            width: `${cols * 228 + (cols - 1) * 5}px`,
            height: `${rows * 349 + (rows - 1) * 5}px`
          }}
        >
          {hdGridTable.map((relicInCell, cellIdx) => {
            if (relicInCell === null) {
              return <div key={`empty-hd-relic-${cellIdx}`} className={styles.hdRelicCellEmpty} />;
            }
            return (
              <div key={relicInCell.name} className={styles.hdRelicCell}>
                <RelicCard 
                  imageUrl={relicInCell.imageUrl} 
                  state={relicInCell.state} 
                  onChangeState={() => {}} 
                />
              </div>
            );
          })}
        </div>
      </div> */}

    </div>
  );
};
