import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styles from './EquipmentCard.module.css';
import { EquipmentData, type EquipmentGrade, ALL_EQUIPMENT_GRADES } from '../../models/equipment';

interface EquipmentCardProps {
  equipment: EquipmentData;
  width?: number;
  onChangeGrade: (newGrade: EquipmentGrade) => void;
}

// Карта цветов для текста в меню выбора грейдов снаряжения
const GRADE_COLORS: Record<EquipmentGrade, string> = {
  no: '#a0a0b0',
  epic: '#BB79C0',
  legendary: '#E3B74A',
  mythic: '#C46F6A',
  mythic1: '#C46F6A',
  mythic2: '#C46F6A',
  mythic3: '#C46F6A',
  fantasy: '#D56CA5',
  fantasy1: '#D56CA5',
  fantasy2: '#D56CA5'
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  equipment,
  width = 195,
  onChangeGrade
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>('');

  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const menuOverlayRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  const BASE_WIDTH = 195;
  const BASE_HEIGHT = 209;

  // Закрытие меню по клику вне карточки
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Автоскролл к текущему грейду при открытии меню
  useLayoutEffect(() => {
    if (isMenuOpen && activeItemRef.current && menuOverlayRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [isMenuOpen]);

  // Асинхронная отрисовка 5 слоев на Canvas со слепком в DataURL
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
        img.onerror = () => reject(new Error(`Ошибка: ${src}`));
      });
    };

    const renderCanvas = async () => {
      try {
        ctx.clearRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

        // Слой 1: Фон (195x209)
        const bgImg = await loadImage(equipment.bgUrl);
        ctx.drawImage(bgImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

        // Слой 2: Сама шмотка (195x209)
        const itemImg = await loadImage(equipment.itemUrl);
        ctx.drawImage(itemImg, 0, 0, BASE_WIDTH, BASE_HEIGHT);

        // Если состояние не "no", накладываем дополнительные знаки отличия
        // if (equipment.grade !== 'no') {
        // Слой 3: Знак SS (62x40, top left: 0, 151)
        const ssImg = await loadImage(equipment.ssSignUrl);
        ctx.drawImage(ssImg, 0, 151, 62, 40);

        // Слой 4: Значок типа предмета (53x53, top left: 0, 0)
        const typeImg = await loadImage(equipment.typeSignUrl);
        ctx.drawImage(typeImg, 0, 0, 53, 53);

        // Слой 5: Цифровой знак уровня грейда (54x54, top left: 75, 155)
        if (equipment.levelSignUrl) {
        const lvlImg = await loadImage(equipment.levelSignUrl);
        ctx.drawImage(lvlImg, 75, 155, 54, 54);
        }
        // }

        // Делаем снимок Canvas для безопасного экспорта в PNG
        const urlStr = canvas.toDataURL('image/png');
        setDataUrl(urlStr);
      } catch (err) {
        console.error('Ошибка рендеринга снаряжения:', err);
      }
    };

    renderCanvas();
    return () => { isAssetLoaded = false; };
  }, [equipment.grade, equipment.set, equipment.type]);

  const handleCardClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSelectGrade = (e: React.MouseEvent, newGrade: EquipmentGrade) => {
    e.stopPropagation();
    onChangeGrade(newGrade);
    setIsMenuOpen(false);
  };

  return (
    <div 
      ref={cardRef} 
      className={styles.cardContainer} 
      onClick={handleCardClick}
      style={{ width: `${width}px` }}
    >
      {/* Скрытый Canvas для генерации слоев */}
      <canvas
        ref={canvasRef}
        width={BASE_WIDTH}
        height={BASE_HEIGHT}
        style={{ display: 'none' }}
      />

      {/* Вывод слепка-картинки с поддержкой ЧБ фильтра для состояния no */}
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={equipment.name}
          className={`${styles.equipmentCanvas} ${equipment.isBlackAndWhite ? styles.grayedOut : ''}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      ) : (
        <div style={{ width: '100%', aspectRatio: `${BASE_WIDTH}/${BASE_HEIGHT}`, background: '#1a1a3a', borderRadius: '6px' }} />
      )}

      {/* Выпадающее контекстное меню с ЦВЕТНЫМ текстом */}
      {isMenuOpen && (
        <div 
          ref={menuOverlayRef}
          className={styles.menuOverlay}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.menuList}>
            {ALL_EQUIPMENT_GRADES.map((gradeOption) => {
              const isSelected = gradeOption === equipment.grade;
              // Достаем цвет из нашей карты GRADE_COLORS
              const textColor = GRADE_COLORS[gradeOption];

              return (
                <button
                  key={gradeOption}
                  ref={isSelected ? activeItemRef : null}
                  className={`${styles.menuItem} ${isSelected ? styles.selectedItem : ''}`}
                  onClick={(e) => handleSelectGrade(e, gradeOption)}
                  style={isSelected ? {} : { color: textColor }} // Красим текст опции
                >
                  {gradeOption}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
