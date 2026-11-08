import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styles from './SlimeCard.module.css';
import { SlimeData, type SlimeState, ALL_SLIME_STATES, SLIME_ASSETS } from '../../models/slime';

interface SlimeCardProps {
  slime: SlimeData;
  width?: number;
  onChangeState: (newState: SlimeState) => void;
  onChangeLevel: (newLevel: number) => void;
  onChangeSkin?: (newSkin: number) => void;
}

export const SlimeCard: React.FC<SlimeCardProps> = ({
  slime,
  width = 333,
  onChangeState,
  onChangeLevel,
  onChangeSkin = () => {},
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [tempLevel, setTempLevel] = useState(slime.level.toString());
  const [dataUrl, setDataUrl] = useState<string>('');

  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Рефы для точечного фокуса внутри выпадающего списка
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const BASE_WIDTH = 333;
  const BASE_HEIGHT = 276;

  // Закрытие меню звезд по клику вне карточки
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setTempLevel(slime.level.toString());
  }, [slime.level]);

  useEffect(() => {
    if (isEditingLevel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLevel]);

  // Мгновенный скролл к текущему состоянию ДО отрисовки кадра на экране
  useLayoutEffect(() => {
    if (isMenuOpen && activeItemRef.current && menuOverlayRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'auto', // Только мгновенный режим, чтобы не было видно анимации мотания
        block: 'center',
      });
    }
  }, [isMenuOpen]);

  // Отрисовка слоев на Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isAssetLoaded = true;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        img.onload = () => { if (isAssetLoaded) resolve(img); };
        img.onerror = () => reject(new Error(`Ошибка загрузки: ${src}`));
      });
    };

    const renderCanvas = async () => {
      try {
        ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        const currentRarityAssets = SLIME_ASSETS[slime.rarity];
        const bgImg = await loadImage(currentRarityAssets.bg);
        ctx.drawImage(bgImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

        
        const slimeImg = await loadImage(slime.imageUrl);
        ctx.drawImage(slimeImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);


        // НАЙДИТЕ ЭТИ СТРОЧКИ ВНУТРИ renderCanvas():
        // Было: ctx.font = '25px Arial';
        
        // ЗАМЕНИТЬ НА ЭТОТ БЛОК:
        ctx.font = '600 32px "Nunito"'; // Установили ваш шрифт и размер 26
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Настройки окантовки (коричневый контур)
        ctx.strokeStyle = '#63402C'; // Цвет окантовки по ТЗ
        ctx.lineWidth = 5;           // Толщина окантовки в пикселях
        ctx.lineJoin = 'round';      // Скругление углов букв контура для красоты

        if (!isEditingLevel) {
          ctx.fillStyle = '#FFFFFF'; // Сам текст остается белым
          
          const textX = BASE_WIDTH / 2;
          
          /* 
            ИСПРАВЛЕНИЕ ВЫСОТЫ (Lv.): 
            Вместо 27 меняйте число ниже (например, 25, 30), чтобы отрегулировать высоту текста Lv.
          */
          const textY_Level = 27; 

          // Сначала рисуем контур, затем поверх него заливаем белый текст
          ctx.strokeText(`Lv.${slime.level}`, textX, textY_Level);
          ctx.fillText(`Lv.${slime.level}`, textX, textY_Level);
        }


        if (!slime.hasStars) {
          // ИСПРАВЛЕНИЕ: Принудительно дублируем настройки шрифта и окантовки для имени
          ctx.font = '600 32px "Nunito"'; 
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          ctx.strokeStyle = '#63402C'; // Коричневый контур
          ctx.lineWidth = 5;           // Толщина 3 пикселя
          ctx.lineJoin = 'round';

          ctx.fillStyle = '#FFFFFF';   // Сам текст белый
          
          /* 
            Высота имени слайма без звезд. 
            Если нужно поднять или опустить — меняйте число 216
          */
          const textY_Name = 216; 

          // Сначала рисуем контур имени, затем заливаем белым цветом
          ctx.strokeText(slime.cleanName, BASE_WIDTH / 2, textY_Name);
          ctx.fillText(slime.cleanName, BASE_WIDTH / 2, textY_Name);
        } else {
          const starBottomImg = await loadImage(currentRarityAssets.starBottom);
          ctx.drawImage(starBottomImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

          const { type, count } = slime.starInfo;
          if (type && count > 0) {
            const starImgSrc = SLIME_ASSETS.stars[type];
            const starImg = await loadImage(starImgSrc);

            const STAR_SIZE = 36;
            const STAR_Y = 222;
            const totalStarsWidth = count * STAR_SIZE;
            const startX = (BASE_WIDTH - totalStarsWidth) / 2;

            for (let i = 0; i < count; i++) {
              const starX = startX + i * STAR_SIZE;
              ctx.drawImage(starImg, starX, STAR_Y, STAR_SIZE, STAR_SIZE);
            }
          }
        }

        const dataUrlStr = canvas.toDataURL('image/png');
        setDataUrl(dataUrlStr);
      } catch (err) {
        console.error('Ошибка Canvas:', err);
      }
    };

    /* 
      ИСПРАВЛЕНИЕ: Жестко запрашиваем загрузку конкретного SemiBold начертания.
      Только после того, как браузер подтвердит успех, мы запускаем рендер.
    */
    document.fonts.load('600 32px "Nunito"').then(() => {
      if (isAssetLoaded) {
        // Дополнительная перестраховка: если вдруг проверка вернула true, перерисовываем
        renderCanvas();
      }
    }).catch((err) => {
      console.error("Критическая ошибка загрузки шрифта Nunito:", err);
      // Если шрифт сломался, всё равно рисуем базовым, чтобы карточка не осталась пустой
      if (isAssetLoaded) renderCanvas();
    });

    return () => { isAssetLoaded = false; };
  }, [slime.level, slime.state, slime.skin, slime.rarity, slime.imageUrl, isEditingLevel]);

  const submitLevel = () => {
    setIsEditingLevel(false);
    const parsedLevel = parseInt(tempLevel, 10);
    if (!isNaN(parsedLevel)) {
      onChangeLevel(parsedLevel);
    } else {
      setTempLevel(slime.level.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitLevel();
    if (e.key === 'Escape') {
      setIsEditingLevel(false);
      setTempLevel(slime.level.toString());
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditingLevel) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scaleY = BASE_HEIGHT / rect.height;
    const clickY = (e.clientY - rect.top) * scaleY;

    if (clickY <= 60) {
      if (slime.state === 'no') return;
      setIsMenuOpen(false);
      setIsEditingLevel(true);
    } else if (clickY >= 200) {
      setIsMenuOpen(!isMenuOpen);
    } else {
      setIsMenuOpen(false);
      
      // Если слайм еще не получен (состояние no), полностью блокируем смену скинов
      if (slime.state === 'no') return;

      // ИСПРАВЛЕНИЕ: Просто триггерим колбэк. Значение инкремента модуль посчитает сам!
      onChangeSkin(slime.skin); 
    }
  };

  const handleSelectState = (e: React.MouseEvent, newState: SlimeState) => {
    e.stopPropagation();
    onChangeState(newState);
    setIsMenuOpen(false);
  };

  return (
    <div 
      ref={cardRef} 
      className={styles.cardContainer} 
      onClick={handleCardClick}
      style={{ width: `${width}px` }}
    >
      {/* ЛАЙФХАК: Принудительный HTML-прогрев вариативного шрифта для Canvas */}
      <span style={{ 
        fontFamily: "'Nunito'", 
        fontWeight: 600, 
        position: 'absolute', 
        opacity: 0, 
        pointerEvents: 'none' 
      }}>
        Lv.123
      </span>

      {/* 
        Скрытый холст: он продолжает работать в фоне, 
        генерировать пиксели и обновлять наш dataUrl
      */}
      <canvas
        ref={canvasRef}
        width={BASE_WIDTH}
        height={BASE_HEIGHT}
        style={{ display: 'none' }} 
      />

      {/* 
        ИСПРАВЛЕНИЕ: Вместо холста выводим стабильную картинку-слепок.
        Библиотека html-to-image сфотографирует её со 100% точностью!
      */}
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={slime.cleanName}
          className={`${styles.slimeCanvas} ${slime.isBlackAndWhite ? styles.grayedOut : ''}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      ) : (
        /* Временный плейсхолдер, пока Canvas загружает ассеты */
        <div style={{ width: '100%', aspectRatio: `${BASE_WIDTH}/${BASE_HEIGHT}`, background: '#1a1a2e' }} />
      )}

      {isEditingLevel && (
        <div className={styles.levelInputWrapper}>
          <span className={styles.levelPrefix}>Lv.</span>
          <input
            ref={inputRef}
            type="text"
            className={styles.levelInput}
            value={tempLevel}
            onChange={(e) => setTempLevel(e.target.value.replace(/\D/g, ''))}
            onBlur={submitLevel}
            onKeyDown={handleKeyDown}
            maxLength={3}
          />
        </div>
      )}

      {isMenuOpen && (
        <div 
          ref={menuOverlayRef} // Привязываем реф к оверлею списка
          className={styles.menuOverlay} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.menuList}>
            {ALL_SLIME_STATES.map((option) => {
              const isSelected = option === slime.state;
              const count = parseInt(option) || 0;
              const type = option.endsWith('y') ? 'yellow' : 'red';
              const starImgSrc = option !== 'no' && option !== '0' ? SLIME_ASSETS.stars[type] : null;

              return (
                <button
                  key={option}
                  // Привязываем реф ТОЛЬКО к активной кнопке текущего стейта
                  ref={isSelected ? activeItemRef : null}
                  className={`${styles.menuItem} ${isSelected ? styles.selectedItem : ''}`}
                  onClick={(e) => handleSelectState(e, option)}
                >
                  {option === 'no' || option === '0' ? (
                    <span className={styles.noText}>{option}</span>
                  ) : (
                    <div className={styles.menuStars}>
                      {Array.from({ length: count }).map((_, idx) => (
                        <img
                          key={idx}
                          src={starImgSrc!}
                          alt="star-preview"
                          className={styles.menuStarItem}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
