import React from 'react';
import { SlimeCard } from '../SlimeCard/SlimeCard';
import { type SlimeData, type SlimeState } from '../../models/slime';
import styles from './SlimesModule.module.css';
import { CounterLabel } from '../CounterLabel';
import { type LayoutMode } from '../../utils/relicPresets';

interface SlimesModuleProps {
  slimes: SlimeData[];
  setSlimes: React.Dispatch<React.SetStateAction<SlimeData[]>>;
  slimeIndices: number[];
  setSlimeIndices: React.Dispatch<React.SetStateAction<number[]>>;
  gridSettings: { rows: number; cols: number };
  setGridSettings: React.Dispatch<React.SetStateAction<{ rows: number; cols: number }>>;
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  onChangeSkin: (targetName: string, nextSkin: number) => void;
}

export const SlimesModule: React.FC<SlimesModuleProps> = ({
  slimes,
  setSlimes,
  slimeIndices,
  setSlimeIndices,
  gridSettings,
  setGridSettings,
  layoutMode,
  setLayoutMode,
  onChangeSkin
}) => {
  const { rows, cols } = gridSettings;

  // Вычисляем суммарный бонус всех слаймов в реальном времени
  const totalSlimeBonus = slimes.reduce((sum, slime) => sum + slime.calculateBonus(), 0);

  // Изменение звезд слайма
  const handleStateChange = (targetName: string, nextState: SlimeState) => {
    setSlimes(prev =>
      prev.map(slime => slime.name === targetName ? slime.clone({ _state: nextState }) : slime)
    );
  };

  // Изменение уровня слайма
  const handleLevelChange = (targetName: string, nextLevel: number) => {
    setSlimes(prev =>
      prev.map(slime => {
        if (slime.name === targetName) {
          const updated = slime.clone({});
          updated.level = nextLevel; // Сеттер внутри модели сделает валидацию уровня (1-250)
          return updated;
        }
        return slime;
      })
    );
  };

  // Ручное изменение slotIndex под карточкой
  const handleIndexChange = (targetIdx: number, rawValue: string) => {
    const parsed = parseInt(rawValue, 10);
    const finalIndex = isNaN(parsed) ? -1 : parsed;

    setSlimeIndices(prev =>
      prev.map((val, currentIdx) => currentIdx === targetIdx ? finalIndex : val)
    );
  };

  // Построение оригинальной HD-сетки для скачивания PNG по индексам slotIndex
  const maxHdSlots = rows * cols;
  const hdGridTable: Array<SlimeData | null> = Array(maxHdSlots).fill(null);
  
  slimes.forEach((slime, idx) => {
    const sIndex = slimeIndices[idx];
    if (sIndex >= 0 && sIndex < maxHdSlots) {
      hdGridTable[sIndex] = slime;
    }
  });

  return (
    <div className={styles.container}>
      {/* Экранная превью-таблица: РАСТЯГИВАЕТСЯ НА ВСЮ ШИРИНУ ЭКРАНА */}
      <div style={{ width: '100%' }}>
        <div className={styles.controlRow || ''} style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
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

          {/* ИСПРАВЛЕНИЕ: Выводим общий бонус слаймов на экране превью */}
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            background: '#2a2a4a', 
            border: '1px solid #4a4a6a', 
            padding: '6px 14px', 
            borderRadius: '6px', 
            height: '22px',
            fontSize: '0.95rem',
            fontWeight: 'bold',
            color: '#e6a817',
            fontFamily: 'sans-serif'
          }}>
            Общий бонус слайма: {totalSlimeBonus.toFixed(2)}
          </div>
        </div>

        <div className={styles.screenGrid}>
          {slimes.map((slime, idx) => {
            const currentSlotIndex = slimeIndices[idx];
            const isVisibleOnImage = currentSlotIndex !== -1;

            return (
              <div 
                key={slime.name} 
                className={`${styles.slimeCardWrapper} ${isVisibleOnImage ? styles.slimeCardActive : ''}`}
              >
                {/* Карточка адаптивно ужимается под размер резиновой ячейки */}
                <div className={styles.cardContainerSize}>
                  <SlimeCard 
                    slime={slime}
                    width={130} // Передаем уменьшенную ширину для экранной сетки
                    onChangeState={(s) => handleStateChange(slime.name, s)}
                    onChangeLevel={(l) => handleLevelChange(slime.name, l)}
                    onChangeSkin={(s) => onChangeSkin(slime.name, slime.nextSkin())}
                  />
                </div>

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
      {/* СКРЫТЫЙ HD-СТЕНД ДЛЯ СНИМКА PNG (Оригинальные 333x276 с gap 5px)          */}
      {/* ====================================================================== */}
      {/* <div ref={hdRef} className={styles.hdHiddenContainer} style={{ backgroundColor: bgColor }}>
        <div 
          className={styles.hdSlimesGrid} 
          style={{ 
            transform: 'translate(100%, 100%)',
            gridTemplateColumns: `repeat(${cols}, 250px)`, 
            gridTemplateRows: `repeat(${rows}, 207px)` 
          }}
        >
          {hdGridTable.map((slimeInCell, cellIdx) => {
            if (slimeInCell === null) {
              return <div key={`empty-hd-slime-${cellIdx}`} className={styles.hdSlimeCellEmpty} />;
            }
            return (
              <div key={slimeInCell.name} className={styles.hdSlimeCell}>
                <SlimeCard 
                  slime={slimeInCell}
                  width={333} // В итоговом изображении рендерим строго в оригинальном качестве 1:1
                  onChangeState={() => {}}
                  onChangeLevel={() => {}}
                />
              </div>
            );
          })}
        </div>
      </div> */}

    </div>
  );
};
