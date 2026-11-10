import { useLayoutEffect, useRef, type ReactNode } from 'react';
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

/**
 * Стилизованная подсказка вместо нативного `title`.
 * Показывается при наведении и при фокусе на вложенном элементе.
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

  return (
    <span className={cx(styles.wrap, styles[placement], ALIGN_CLASS[align], className)}>
      {children}
      <span ref={bubbleRef} className={styles.bubble} role="tooltip">
        {label}
      </span>
    </span>
  );
};
