import React from 'react';
import styles from './CounterLabel.module.css';
import { type CounterLabelProps } from './CounterLabel.types';

export const CounterLabel: React.FC<CounterLabelProps> = ({
  label,
  min,
  max,
  value,
  onChange,
}) => {
  
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className={styles.container}>
      {/* Выводим переданный текст, двоеточие и значение */}
      <span className={styles.labelText}>
        {label}: <span className={styles.valueText}>{value}</span>
      </span>

      <div className={styles.controls}>
        {/* Кнопка минус (блокируется, если достигнут минимум) */}
        <button 
          className={styles.btn} 
          onClick={handleDecrement}
          disabled={value <= min}
        >
          -
        </button>

        {/* Кнопка плюс (блокируется, если достигнут максимум) */}
        <button 
          className={styles.btn} 
          onClick={handleIncrement}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  );
};
