import React from 'react';
import { type BuffData, type BuffType, BUFF_CONFIG, splitBuffName } from '../../models/buff';

interface BuffsModuleProps {
  buffs: BuffData[];
  setBuffs: React.Dispatch<React.SetStateAction<BuffData[]>>;
  bgColor: string;
  hdRef: React.RefObject<HTMLDivElement | null>;
  phaseInfo: { phase: number; percent: number };
  remainingThrows: { min: number; avg: number; max: number };
}

export const BuffsModule: React.FC<BuffsModuleProps> = ({
  buffs,
  setBuffs,
  bgColor,
  hdRef,
  phaseInfo,
  remainingThrows
}) => {
  // Изменение числового значения конкретного баффа
  const handleValueChange = (targetType: BuffType, rawValue: string) => {
    // Разрешаем вводить только цифры и точку для дробных значений
    const cleaned = rawValue.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    const finalValue = isNaN(parsed) ? 0 : parsed;

    setBuffs(prev =>
      prev.map(b => b.type === targetType ? b.clone({ value: finalValue }) : b)
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      
      {/* КРУПНЫЙ ЗАГОЛОВОК ТЕКУЩЕЙ АКТИВНОЙ ФАЗЫ С РАСЧЕТОМ ОСТАТКА БРОСКОВ */}
      <div style={{ 
        fontSize: '1.15rem', 
        fontWeight: 'bold', 
        color: '#ffffff', 
        background: '#16213e', 
        padding: '12px 20px', 
        borderRadius: '8px',
        border: '1px dashed #0f3460',
        fontFamily: 'Nunito',
        lineHeight: '1.5'
      }}>
        <div>
          Перманентные бафы <span style={{ color: '#e6a817' }}>{phaseInfo.phase} фаза: {phaseInfo.percent.toFixed(2)}%</span>
        </div>
        
        {/* Вывод шагов (показывается только если фаза еще не закрыта на 100%) */}
        {phaseInfo.percent < 100 && (
          <div style={{ fontSize: '0.9rem', color: '#b0b0c0', marginTop: '6px', fontWeight: 'normal' }}>
            Осталось выбить пермачей для закрытия фазы — 
            Мин: <span style={{ color: '#e6a817', fontWeight: 'bold' }}>{remainingThrows.min}</span> | 
            Средне: <span style={{ color: '#e6a817', fontWeight: 'bold' }}>{remainingThrows.avg}</span> | 
            Макс: <span style={{ color: '#e6a817', fontWeight: 'bold' }}>{remainingThrows.max}</span>
          </div>
        )}
      </div>

      {/* СЕТКА РЕДАКТОРА С БАФФАМИ (РЕЗИНОВАЯ ДЛЯ ТЕЛЕФОНОВ) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '16px',
        background: '#1A1A2E',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #2A2A4A',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {buffs.map((buff) => (
          <div 
            key={buff.type}
            style={{
              backgroundColor: '#232342',
              border: '1px solid #E6A817',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box'
            }}
          >
            {/* Иконка баффа */}
            <img 
              src={buff.imageUrl} 
              alt="" 
              style={{ 
                width: `${BUFF_CONFIG.editor.iconSize}px`, 
                height: `${BUFF_CONFIG.editor.iconSize}px`,
                marginBottom: '8px' 
              }} 
            />

            {/* Название баффа */}
            <div style={{ 
              fontSize: BUFF_CONFIG.editor.titleFontSize, 
              color: '#a0a0b0', 
              textAlign: 'center', 
              fontWeight: 600,
              minHeight: '36px',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'Nunito'
            }}>
              {buff.cleanName}
            </div>

            {/* Поле ввода значения баффа */}
            <input 
              type="text"
              value={buff.value === 0 ? '' : buff.value}
              onChange={(e) => handleValueChange(buff.type, e.target.value)}
              placeholder="0"
              style={{
                width: '100%',
                backgroundColor: '#2a2a4a',
                border: '1px solid #4a4a6a',
                color: '#e6a817',
                borderRadius: '4px',
                padding: '5px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: BUFF_CONFIG.editor.valueFontSize,
                outline: 'none',
                boxSizing: 'border-box',
                marginTop: '8px'
              }}
            />

            {/* Справа/снизу от инпута: Текстовый процент заполнения стата */}
            <div style={{ fontSize: '0.8rem', color: '#b0b0c0', marginTop: '6px', fontWeight: 'bold', fontFamily: 'Nunito' }}>
              Заполнено: {buff.percentage.toFixed(1)}%
            </div>

            {/* Полоска-прогрессбар заполнения */}
            <div style={{ width: '100%', height: '4px', backgroundColor: '#2a2a4a', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${buff.percentage}%`, height: '100%', backgroundColor: '#e6a817', transition: 'width 0.2s' }} />
            </div>

          </div>
        ))}
      </div>

      {/* ====================================================================== */}
      {/* ИЗОЛИРОВАННЫЙ СКРЫТЫЙ HD-СТЕНД ДЛЯ ЭКСПОРТА ТОЛЬКО ВКЛАДКИ БАФФОВ       */}
      {/* ====================================================================== */}
      <div 
        ref={hdRef} 
        style={{
          position: 'fixed', left: 0, top: 0, transform: 'translateY(100%)',
          width: 'max-content', height: 'max-content', backgroundColor: bgColor,
          display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px',
          boxSizing: 'border-box', pointerEvents: 'none', zIndex: -9999
        }}
      >
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Nunito', color: '#ffffff' }}>
          Перманентные бафы <span style={{ color: '#e6a817' }}>{phaseInfo.phase} фаза: {phaseInfo.percent.toFixed(0)}%</span>
        </div>
        
        <div style={{ display: 'grid', gap: '8px', gridTemplateColumns: `repeat(${BUFF_CONFIG.export.cols}, ${BUFF_CONFIG.export.cardWidth}px)` }}>
          {buffs.map((buff) => {
            const nameLines = splitBuffName(buff.cleanName);
            return (
              <div 
                key={`hd-sole-b-${buff.type}`}
                style={{ 
                  width: `${BUFF_CONFIG.export.cardWidth}px`, height: `${BUFF_CONFIG.export.cardHeight}px`,
                  backgroundColor: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: '8px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', boxSizing: 'border-box'
                }}
              >
                <img src={buff.imageUrl} alt="" style={{ width: `${BUFF_CONFIG.export.iconSize}px`, height: `${BUFF_CONFIG.export.iconSize}px`, marginBottom: '6px' }} />
                <div style={{ maxWidth: `${BUFF_CONFIG.textMaxLineWidth}px`, textAlign: 'center', fontFamily: 'Nunito' }}>
                  {nameLines.map((line, idx) => (
                    <div key={idx} style={{ fontSize: `${BUFF_CONFIG.export.titleFontSize}px`, color: '#e0e0e0', lineHeight: '1.2', fontWeight: 600 }}>{line}</div>
                  ))}
                  <div style={{ fontSize: `${BUFF_CONFIG.export.valueFontSize}px`, color: '#e6a817', fontWeight: 'bold', marginTop: '4px' }}>{buff.value}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};
