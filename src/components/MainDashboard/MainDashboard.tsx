import React, { useState, useRef, useEffect } from 'react';
import { CounterLabel } from '../CounterLabel';
import styles from './MainDashboard.module.css';

interface DashboardCard {
  id: number;
  location: 'top' | 'bottom';
  index: number;
}

interface MainDashboardProps {
  initialCardIds?: number[]; // Нам передают массив номеров карточек (например, [1, 2, 3...11])
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ 
  initialCardIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] 
}) => {
  // Настройки сетки (Часть 1)
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  // Состояние всех карточек
  const [cards, setCards] = useState<DashboardCard[]>(() =>
    initialCardIds.map((id, idx) => ({ id, location: 'bottom', index: idx }))
  );

  // Состояния для кастомного Drag-and-Drop
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Ссылки на элементы для расчета геометрии на лету
  const topGridRef = useRef<HTMLDivElement>(null);
  const bottomGridRef = useRef<HTMLDivElement>(null);

  const maxTopSlots = rows * cols;

  // Логика расталкивания элементов по цепочке (Выталкивание вправо)
  const pushElementsChain = (startIndex: number, currentCards: DashboardCard[]): DashboardCard[] => {
    let updated = [...currentCards];
    let checkIndex = startIndex;

    // Массив индексов, которые нужно последовательно сдвинуть
    const chainToShift: number[] = [];

    // Ищем непрерывную цепочку занятых ячеек вправо
    while (checkIndex < maxTopSlots) {
      const occupant = updated.find(c => c.location === 'top' && c.index === checkIndex && c.id !== draggingCardId);
      if (occupant) {
        chainToShift.push(checkIndex);
        checkIndex++; // Идем к следующей ячейке вправо
      } else {
        break; // Нашли пустое место, цепочка прерывается
      }
    }

    // Сдвигаем цепочку с конца, чтобы не перезаписать данные
    for (let i = chainToShift.length - 1; i >= 0; i--) {
      const targetCard = updated.find(c => c.location === 'top' && c.index === chainToShift[i] && c.id !== draggingCardId);
      if (targetCard) {
        const nextIndex = targetCard.index + 1;
        if (nextIndex < maxTopSlots) {
          targetCard.index = nextIndex; // Двигаем вправо внутри верхней таблицы
        } else {
          // Если карточку вытолкнули за пределы таблицы — отправляем в нижнюю
          targetCard.location = 'bottom';
          targetCard.index = 999; // Временный индекс, пересчитается ниже
        }
      }
    }

    return updated;
  };

  // Постоянное обновление позиций в нижней таблице (чтобы они всегда были отсортированы по умолчанию)
  const refreshBottomIndexes = (currentCards: DashboardCard[]): DashboardCard[] => {
    const bottomCards = currentCards
      .filter(c => c.location === 'bottom' && c.id !== draggingCardId)
      .sort((a, b) => a.id - b.id); // Сортировка по ID по умолчанию

    return currentCards.map(c => {
      if (c.location === 'bottom' && c.id !== draggingCardId) {
        const sortedIdx = bottomCards.findIndex(bc => bc.id === c.id);
        return { ...c, index: sortedIdx };
      }
      return c;
    });
  };

  // Старт перетаскивания (MouseDown)
  const handleMouseDown = (e: React.MouseEvent, card: DashboardCard) => {
    if (e.button !== 0) return; // Только ЛКМ
    setDraggingCardId(card.id);
    
    // Вычисляем, в каком месте карточки зажали мышь, чтобы она не прыгала центром к курсору
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // Движение мыши (MouseMove)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingCardId === null) return;
      setMousePos({ x: e.clientX, y: e.clientY });

      // Нам нужно определить, над какой ячейкой верхней таблицы сейчас летит мышь
      if (topGridRef.current) {
        const gridRect = topGridRef.current.getBoundingClientRect();
        
        // Проверяем, вошел ли курсор в границы верхней таблицы
        if (
          e.clientX >= gridRect.left && e.clientX <= gridRect.right &&
          e.clientY >= gridRect.top && e.clientY <= gridRect.bottom
        ) {
          // Считаем относительные координаты курсора внутри грида
          const relX = e.clientX - gridRect.left;
          const relY = e.clientY - gridRect.top;

          // Примерный размер ячейки с учетом gap (70px + 12px)
          const cellW = gridRect.width / cols;
          const cellH = gridRect.height / rows;

          const colIdx = Math.floor(relX / cellW);
          const rowIdx = Math.floor(relY / cellH);

          if (colIdx >= 0 && colIdx < cols && rowIdx >= 0 && rowIdx < rows) {
            const targetIndex = rowIdx * cols + colIdx;

            setCards(prev => {
              // Проверяем, не занято ли место
              const hasOccupant = prev.some(c => c.location === 'top' && c.index === targetIndex && c.id !== draggingCardId);
              
              let nextCards = prev.map(c => c.id === draggingCardId ? { ...c, location: 'top' as const, index: targetIndex } : c);
              
              if (hasOccupant) {
                // Включаем расталкивание соседей на лету!
                nextCards = pushElementsChain(targetIndex, nextCards);
              }
              return refreshBottomIndexes(nextCards);
            });
          }
        }
      }

      // Проверяем, навелись ли на нижнюю таблицу
      if (bottomGridRef.current) {
        const bottomRect = bottomGridRef.current.getBoundingClientRect();
        if (
          e.clientX >= bottomRect.left && e.clientX <= bottomRect.right &&
          e.clientY >= bottomRect.top && e.clientY <= bottomRect.bottom
        ) {
          setCards(prev => {
            const nextCards = prev.map(c => c.id === draggingCardId ? { ...c, location: 'bottom' as const, index: 999 } : c);
            return refreshBottomIndexes(nextCards);
          });
        }
      }
    };

    const handleMouseUp = () => {
      setDraggingCardId(null);
    };

    if (draggingCardId !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingCardId, cols, rows, maxTopSlots]);

  // Кнопка: Сбросить всё
  const handleReset = () => {
    setCards(initialCardIds.map((id, idx) => ({ id, location: 'bottom', index: idx })));
  };

  // Кнопка: Отсортировать по умолчанию верхнюю таблицу (с убиранием пропусков)
  const handleSortTop = () => {
    setCards(prev => {
      const topCardsSorted = prev
        .filter(c => c.location === 'top')
        .sort((a, b) => a.id - b.id); // Сортируем по ID

      return prev.map(c => {
        if (c.location === 'top') {
          const sortedIdx = topCardsSorted.findIndex(tc => tc.id === c.id);
          return { ...c, index: sortedIdx };
        }
        return c;
      });
    });
  };

  // Отрезаем лишние карточки, если пользователь уменьшил сетку, а там стояли элементы
  useEffect(() => {
    setCards(prev => {
      const nextCards = prev.map(c => {
        if (c.location === 'top' && c.index >= maxTopSlots) {
          return { ...c, location: 'bottom' as const, index: 999 };
        }
        return c;
      });
      return refreshBottomIndexes(nextCards);
    });
  }, [rows, cols, maxTopSlots]);

  const draggingCard = cards.find(c => c.id === draggingCardId);

  return (
    <div className={styles.dashboard}>
      {/* ЧАСТЬ 1: ПАНЕЛЬ УПРАВЛЕНИЯ */}
      <div className={styles.toolbar}>
        <CounterLabel label="Строки" min={1} max={6} value={rows} onChange={setRows} />
        <CounterLabel label="Столбцы" min={1} max={10} value={cols} onChange={setCols} />
        <button className={styles.btn} onClick={handleSortTop}>Отсортировать по умолчанию</button>
        <button className={styles.btn} onClick={handleReset}>Сбросить</button>
      </div>

      {/* ЧАСТЬ 2: НАСТРАИВАЕМАЯ ВЕРХНЯЯ ТАБЛИЦА */}
      <div>
        <div className={styles.tableTitle}>Верхняя таблица (Стенд игрока)</div>
        <div 
          ref={topGridRef} 
          className={styles.tableContainer}
          style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 70px)`, gridTemplateRows: `repeat(${rows}, 90px)` }}
        >
          {Array.from({ length: maxTopSlots }).map((_, slotIdx) => {
            const cardInSlot = cards.find(c => c.location === 'top' && c.index === slotIdx && c.id !== draggingCardId);
            return (
              <div key={slotIdx} className={styles.cellSlot}>
                {cardInSlot && (
                  <div className={styles.cardItem} onMouseDown={(e) => handleMouseDown(e, cardInSlot)}>
                    {cardInSlot.id}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ЧАСТЬ 3: НИЖНЯЯ ТАБЛИЦА */}
      <div>
        <div className={styles.tableTitle}>Нижняя таблица (Доступные карточки)</div>
        <div ref={bottomGridRef} className={`${styles.tableContainer} ${styles.bottomGrid}`}>
          {cards
            .filter(c => c.location === 'bottom' && c.id !== draggingCardId)
            .sort((a, b) => a.index - b.index)
            .map(card => (
              <div key={card.id} className={styles.cellSlot}>
                <div className={styles.cardItem} onMouseDown={(e) => handleMouseDown(e, card)}>
                  {card.id}
                </div>
              </div>
            ))}
          
          {cards.filter(c => c.location === 'bottom' && c.id !== draggingCardId).length === 0 && (
            <div style={{ color: '#555', fontStyle: 'italic' }}>
              Пусто. Все карточки на стенде
            </div>
          )}
        </div>
      </div>
      
      {/* ЛЕТЯЩИЙ ЭЛЕМЕНТ (Рендерится поверх всего во время перетаскивания) */}
      {draggingCardId !== null && draggingCard && (
        <div 
          className={`${styles.cardItem} ${styles.dragging}`}
          style={{
            left: `${mousePos.x - dragOffset.x}px`,
            top: `${mousePos.y - dragOffset.y}px`
          }}
        >
          {draggingCard.id}
        </div>
      )}
    </div>
  );
};
