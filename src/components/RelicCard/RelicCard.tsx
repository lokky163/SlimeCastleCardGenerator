import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import styles from './RelicCard.module.css';
import { type RelicState, getStarImages, ALL_RELIC_STATES } from '../../models/relic';

interface RelicCardProps {
  imageUrl: string;
  state: RelicState;
  onChangeState: (newState: RelicState) => void;
}

export const RelicCard: React.FC<RelicCardProps> = ({ imageUrl, state, onChangeState = () => {} }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Достаем картинку и текущее состояние из объекта модели
  // const { imageUrl: relicImageUrl, state } = relic;
  const currentStars = getStarImages(state);

  // Закрытие по клику вне карточки
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Мгновенный скролл к текущему уровню при открытии меню
  useLayoutEffect(() => {
    if (isMenuOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'auto',
        block: 'center',
      });
    }
  }, [isMenuOpen]);

  // Открытие меню только при клике в нижние 20% карточки
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const triggerZoneY = rect.height * 0.8;

    if (clickY >= triggerZoneY) {
      setIsMenuOpen(!isMenuOpen);
    }
  };

  const handleSelectState = (e: React.MouseEvent, newState: RelicState) => {
    e.stopPropagation();
    onChangeState(newState);
    setIsMenuOpen(false);
  };

  return (
    <div ref={cardRef} className={styles.cardContainer} onClick={handleCardClick}>
      
      {/* 1. Базовый слой изображения релика */}
      <img
        src={imageUrl}
        alt="Relic Base"
        className={`${styles.relicImage} ${state === 'no' ? styles.grayedOut : ''}`}
      />

      {/* 2. Цветной ромбик-островок поверх серого (только для состояния 'no') */}
      {state === 'no' && (
        <img
          src={imageUrl}
          alt="Relic Island"
          className={`${styles.relicImage} ${styles.coloredIsland}`}
        />
      )}

      {/* Звезды на карточке */}
      {currentStars.length > 0 && (
        <div className={styles.starsContainer}>
          {currentStars.map((starUrl, index) => (
            <img
              key={index}
              src={starUrl}
              alt="star"
              className={styles.starItem}
            />
          ))}
        </div>
      )}

      {/* Внутреннее адаптивное меню выбора */}
      {isMenuOpen && (
        <div className={styles.menuOverlay} onClick={(e) => e.stopPropagation()}>
          <div className={styles.menuList}>
            {ALL_RELIC_STATES.map((option) => {
              const optionStars = getStarImages(option);
              const isSelected = option === state;

              return (
                <button
                  key={option}
                  ref={isSelected ? activeItemRef : null}
                  className={styles.menuItem}
                  onClick={(e) => handleSelectState(e, option)}
                >
                  {option === 'no' ? (
                    <span className={styles.noText}>no</span>
                  ) : (
                    <div className={styles.menuStars}>
                      {optionStars.map((sUrl, idx) => (
                        <img
                          key={idx}
                          src={sUrl}
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
