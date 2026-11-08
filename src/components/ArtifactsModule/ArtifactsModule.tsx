import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ArtifactData, type ArtifactState, ALL_ARTIFACT_STATES } from '../../models/artifact';
import starYellow from '../../assets/artifacts/yellow.png'; 
import styles from './ArtifactsModule.module.css';

interface ArtifactsModuleProps {
  artifacts: ArtifactData[];
  setArtifacts: React.Dispatch<React.SetStateAction<ArtifactData[]>>;
  bgColor: string;
  hdRef: React.RefObject<HTMLDivElement | null>;
}

export const ArtifactsModule: React.FC<ArtifactsModuleProps> = ({
  artifacts,
  setArtifacts,
  bgColor,
  hdRef
}) => {
  // Состояние для открытия меню звезд конкретного артефакта
  const [activeMenuArt, setActiveMenuArt] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // ИСПРАВЛЕНИЕ: Мгновенный скролл до отрисовки меню на экране
  useLayoutEffect(() => {
    if (activeMenuArt && menuRef.current && activeItemRef.current) {
      const container = menuRef.current;
      const activeItem = activeItemRef.current;

      const containerHeight = container.clientHeight;
      const itemTop = activeItem.offsetTop;
      const itemHeight = activeItem.clientHeight;

      // Принудительно выставляем scrollTop, центрируя активный элемент
      container.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
    }
  }, [activeMenuArt]); // Срабатывает ровно в момент открытия меню для конкретного артефакта

  // Закрытие меню звезд при клике в любое другое место экрана
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuArt(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Переключение состояния звезд
  const handleStateChange = (targetName: string, nextState: ArtifactState) => {
    setArtifacts(prev =>
      prev.map(art => art.name === targetName ? art.clone({ state: nextState }) : art)
    );
    setActiveMenuArt(null);
  };

  // Изменение текущих осколков
  const handleFragmentsChange = (targetName: string, rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, '');
    const parsed = parseInt(cleaned, 10);
    const finalVal = isNaN(parsed) ? 0 : parsed;

    setArtifacts(prev =>
      prev.map(art => art.name === targetName ? art.clone({ fragments: finalVal }) : art)
    );
  };

  // Изменение уровня
  const handleLevelChange = (targetName: string, rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, '');
    const parsed = parseInt(cleaned, 10);
    const finalVal = isNaN(parsed) ? 1 : parsed;

    setArtifacts(prev =>
      prev.map(art => art.name === targetName ? art.clone({ level: finalVal }) : art)
    );
  };

  // Вспомогательная функция для отображения звезд символами в меню
  // Функция для отрисовки графических звезд на карточке
  // Функция для отрисовки только полученных золотых звезд по центру
  const renderStarsGraphics = (state: ArtifactState) => {
    if (state === 'no' || state === '0') {
      // Если артефакта нет или у него 0 звезд, оставляем пустой контейнер фиксированной высоты
      return <div style={{ height: '20px', margin: '4px 0' }} />;
    }
    
    // Получаем точное количество звезд из первой цифры состояния ('1y' -> 1, '2y' -> 2)
    const activeCount = parseInt(state, 10);
    
    return (
      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center', height: '20px', margin: '4px 0' }}>
        {Array(activeCount).fill(null).map((_, idx) => (
          <img
            key={idx}
            src={starYellow}
            alt="star"
            style={{ width: '16px', height: '16px', display: 'block' }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div style={{ width: '100%' }}>
        {/* СЕТКА РЕДАКТОРА НА САЙТЕ */}
        <div className={styles.screenGrid}>
          {artifacts.map((art) => {
            const isMenuOpen = activeMenuArt === art.name;
            
            return (
              <div key={art.name} className={styles.artCard}>
                
                {/* Картинка артефакта (становится ЧБ, если состояния no) */}
                <img 
                  src={art.imageUrl} 
                  alt={art.cleanName} 
                  className={`${styles.artImage} ${art.isBlackAndWhite ? styles.grayedOut : ''}`}
                />
                {/* Название артефакта */}
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold', marginBottom: '4px', minHeight: '20px', fontFamily: 'Nunito' }}>
                  {art.cleanName}
                </div>

                {/* УПРАВЛЕНИЕ ЗВЕЗДАМИ (Кнопка + Контекстное меню) */}
                <div style={{ position: 'relative', marginBottom: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setActiveMenuArt(isMenuOpen ? null : art.name)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      padding: 0,
                      cursor: 'pointer', 
                      width: '100%',
                      minHeight: '24px', // Фиксированная высота, чтобы карточки не прыгали
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none'
                    }}
                  >
                    {/* Если артефакта нет, пишем серый текст "Нет" */}
                    {art.state === 'no' && (
                      <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'bold', fontFamily: 'Nunito' }}>Нет</span>
                    )}

                    {/* Если 0 звёзд, пишем аккуратное "0 ★" */}
                    {art.state === '0' && (
                      <span style={{ fontSize: '0.85rem', color: '#e6a817', fontWeight: 'bold', fontFamily: 'Nunito' }}>0 ★</span>
                    )}
                    
                    {/* Если звезд от 1 до 5, рисуем их картинками по центру без серой рамки кнопки */}
                    {art.state !== 'no' && art.state !== '0' && (
                      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center' }}>
                        {Array(parseInt(art.state, 10)).fill(null).map((_, idx) => (
                          <img
                            key={idx}
                            src={starYellow}
                            alt="star"
                            style={{ width: '16px', height: '16px', display: 'block' }}
                          />
                        ))}
                      </div>
                    )}
                  </button>

                  {/* Само выпадающее контекстное меню с золотыми звёздами */}
                  {isMenuOpen && (
                    <div 
                      ref={menuRef}
                      style={{
                        position: 'absolute', 
                        bottom: '32px', 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(22, 33, 96, 0.95)', 
                        border: '1px solid #4a4a6a',
                        borderRadius: '6px', 
                        padding: '6px', 
                        zIndex: 110, 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '5px', 
                        width: 'max-content', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        maxHeight: '80px',       
                        overflowY: 'auto',        
                        scrollbarWidth: 'none',

                        /* ====================================================================== */
                        /* ИСПРАВЛЕНИЕ: Прячем меню от глаз, пока useLayoutEffect делает скролл */
                        /* ====================================================================== */
                        visibility: activeMenuArt === art.name ? 'visible' : 'hidden'
                        /* ====================================================================== */
                      }}
                    >
                      {ALL_ARTIFACT_STATES.map((stateOption) => {
                        const isSelected = art.state === stateOption;
                        const starCount = stateOption === 'no' || stateOption === '0' ? 0 : parseInt(stateOption, 10);
                        
                        return (
                          <button
                            key={stateOption}
                            type="button"
                            /* 
                              ИСПРАВЛЕНИЕ: Вешаем созданный реф 
                              строго на ТЕКУЩИЙ ВЫБРАННЫЙ элемент 
                            */
                            ref={isSelected ? activeItemRef : null}
                            style={{
                              backgroundColor: isSelected ? '#e6a817' : '#2a2a4a',
                              color: isSelected ? '#1a1a2e' : '#e0e0e0',
                              border: '1px solid #4a4a6a', padding: '4px 12px', borderRadius: '4px', 
                              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                              display: 'flex', alignItems: 'center', gap: '6px', minWidth: '95px', justifyContent: 'center'
                            }}
                            onClick={() => handleStateChange(art.name, stateOption)}
                          >
                            {stateOption === 'no' && 'Нет'}
                            {stateOption === '0' && '0 ★'}
                            
                            {starCount > 0 && (
                              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', alignItems: 'center' }}>
                                {Array(starCount).fill(null).map((_, sIdx) => (
                                  <img key={sIdx} src={starYellow} alt="" style={{ width: '12px', height: '12px', display: 'block' }} />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}


                </div>

                {/* РЕДАКТИРОВАНИЕ ОСКОЛКОВ */}
                <div style={{ width: '100%', marginBottom: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '4px' }}>
                    {art.state !== '5y' && (
                    <input 
                      type="text"
                      className={styles.inputField}
                      value={art.fragments === 0 ? '' : art.fragments}
                      onChange={(e) => handleFragmentsChange(art.name, e.target.value)}
                      placeholder="0"
                      style={{ color: '#e6a817' }}
                    />
                    )}
                    { art.state !== '5y' && (
                    <span style={{ color: '#888', fontWeight: 'bold' }}>/</span>
                    )}
                    <div className={styles.inputField} style={{ backgroundColor: '#111122', border: '1px solid #222233', color: '#888999', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '27px' }}>
                      {art.state === '5y' ? 'max' : art.maxFragments}
                    </div>
                  </div>
                </div>

                {/* РЕДАКТИРОВАНИЕ УРОВНЯ (Блокируется при 'no') */}
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '6px' }}>
                    <span style={{ fontSize: '0.85rem', color: art.isBlackAndWhite ? '#555' : '#aaa', fontWeight: 'bold', fontFamily: 'Nunito' }}>Lv.</span>
                    <input 
                      type="text"
                      className={`${styles.inputField} ${art.isBlackAndWhite ? styles.inputDisabled : ''}`}
                      value={art.level}
                      onChange={(e) => handleLevelChange(art.name, e.target.value)}
                      disabled={art.isBlackAndWhite}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* ИЗОЛИРОВАННЫЙ СКРЫТЫЙ HD-СТЕНД ДЛЯ ЭКСПОРТА ТОЛЬКО ВКЛАДКИ АРТЕФАКТОВ   */}
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
        <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Nunito', color: '#ffffff' }}>🏺 АРТЕФАКТЫ</div>
        
        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(4, 150px)', justifyContent: 'center' }}>
          {artifacts.map((art) => (
            <div 
              key={`hd-sole-a-${art.name}`}
              style={{ 
                width: '150px', backgroundColor: '#1a1a2e', border: '1px solid #4a4a6a', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px', boxSizing: 'border-box', textAlign: 'center'
              }}
            >
              <img src={art.imageUrl} alt="" style={{ width: '80px', height: '80px', objectFit: 'contain', filter: art.isBlackAndWhite ? 'grayscale(100%) brightness(55%)' : 'none' }} />
              <div style={{ color: '#e6a817', fontSize: '1.1rem', margin: '4px 0', fontFamily: 'Nunito', height: '20px' }}>
                {renderStarsGraphics(art.state)}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#b0b0c0', fontWeight: 'bold', fontFamily: 'Nunito' }}>{art.fragmentsText}</div>
              <div style={{ fontSize: '1rem', color: art.isBlackAndWhite ? '#666' : '#ffffff', fontWeight: 'bold', marginTop: '4px', fontFamily: 'Nunito' }}>Lv.{art.level}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
