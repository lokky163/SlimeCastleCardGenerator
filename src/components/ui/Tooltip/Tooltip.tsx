import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../../utils/classNames';
import styles from './Tooltip.module.css';

type TooltipPlacement = 'top' | 'bottom';
type TooltipAlign = 'center' | 'start' | 'end';

interface TooltipProps {
  label: string;
  children: ReactNode;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
  className?: string;
}

const ALIGN_CLASS: Record<TooltipAlign, string> = {
  center: styles.alignCenter,
  start: styles.alignStart,
  end: styles.alignEnd,
};

const VIEWPORT_MARGIN_PX = 8;
const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE_PX = 10;

/**
 * Стилизованная подсказка вместо нативного `title`.
 * На устройствах с курсором показывается при наведении и фокусе,
 * а на сенсорных экранах — только при долгом нажатии.
 *
 * Подсказка сдвигается по горизонтали, если упирается в край экрана:
 * на узких экранах это не даёт ей обрезаться.
 */
export const Tooltip: React.FC<TooltipProps> = ({
  label,
  children,
  placement = 'top',
  align = 'center',
  className,
}) => {
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const pressTimerRef = useRef<number | null>(null);
  const pressStartRef = useRef<{ x: number; y: number } | null>(null);
  const longPressRef = useRef(false);
  const [isLongPressVisible, setIsLongPressVisible] = useState(false);

  const clearPressTimer = () => {
    if (pressTimerRef.current !== null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (pressTimerRef.current !== null) {
        window.clearTimeout(pressTimerRef.current);
      }
    },
    [],
  );

  useLayoutEffect(() => {
    const bubble = bubbleRef.current;
    if (!bubble) return;

    const keepInViewport = () => {
      // Measure without the animated transform, otherwise a repeated
      // measurement would read the previous nudge instead of the base position.
      const previousTransition = bubble.style.transition;
      bubble.style.transition = 'none';
      bubble.style.setProperty('--tooltip-nudge', '0px');

      const rect = bubble.getBoundingClientRect();
      const viewportWidth = document.documentElement.clientWidth;
      let nudge = 0;

      if (rect.left < VIEWPORT_MARGIN_PX) {
        nudge = VIEWPORT_MARGIN_PX - rect.left;
      } else if (rect.right > viewportWidth - VIEWPORT_MARGIN_PX) {
        nudge = viewportWidth - VIEWPORT_MARGIN_PX - rect.right;
      }

      bubble.style.setProperty('--tooltip-nudge', `${nudge}px`);
      void bubble.offsetWidth;
      bubble.style.transition = previousTransition;
    };

    keepInViewport();

    const observer = new ResizeObserver(keepInViewport);
    observer.observe(bubble);
    window.addEventListener('resize', keepInViewport);
    window.addEventListener('scroll', keepInViewport, true);
    document.fonts?.ready.then(keepInViewport).catch(() => {});

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', keepInViewport);
      window.removeEventListener('scroll', keepInViewport, true);
    };
  }, [label]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'touch') return;

    longPressRef.current = false;
    pressStartRef.current = { x: event.clientX, y: event.clientY };
    clearPressTimer();

    pressTimerRef.current = window.setTimeout(() => {
      pressTimerRef.current = null;
      longPressRef.current = true;
      setIsLongPressVisible(true);
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'touch' || !pressStartRef.current) return;

    const dx = event.clientX - pressStartRef.current.x;
    const dy = event.clientY - pressStartRef.current.y;
    if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_TOLERANCE_PX) {
      clearPressTimer();
      setIsLongPressVisible(false);
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'touch') return;

    clearPressTimer();
    pressStartRef.current = null;
    setIsLongPressVisible(false);

    // Let the click that follows the release run through the capture handler
    // first, then clear the flag even if no click was produced.
    if (longPressRef.current) {
      window.setTimeout(() => {
        longPressRef.current = false;
      }, 0);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (event.pointerType !== 'touch') return;

    clearPressTimer();
    pressStartRef.current = null;
    longPressRef.current = false;
    setIsLongPressVisible(false);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLSpanElement>) => {
    if (!longPressRef.current) return;

    // A long press is used only to read the hint; do not trigger the control.
    event.preventDefault();
    event.stopPropagation();
    longPressRef.current = false;
  };

  const handleContextMenu = (event: ReactMouseEvent<HTMLSpanElement>) => {
    if (longPressRef.current) event.preventDefault();
  };

  return (
    <span
      className={cx(
        styles.wrap,
        styles[placement],
        ALIGN_CLASS[align],
        isLongPressVisible && styles.wrapLongPress,
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerEnd}
      onClickCapture={handleClickCapture}
      onContextMenu={handleContextMenu}
    >
      {children}
      <span ref={bubbleRef} className={styles.bubble} role="tooltip">
        {label}
      </span>
    </span>
  );
};
