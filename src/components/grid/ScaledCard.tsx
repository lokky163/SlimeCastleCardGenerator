import { useLayoutEffect, useRef, useState } from 'react';
import styles from './ScaledCard.module.css';

interface ScaledCardProps {
  width: number;
  baseWidth: number;
  children: React.ReactNode;
}

export const ScaledCard: React.FC<ScaledCardProps> = ({
  width,
  baseWidth,
  children,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [baseHeight, setBaseHeight] = useState(0);
  const scale = baseWidth > 0 ? width / baseWidth : 1;

  useLayoutEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    const updateHeight = () => setBaseHeight(element.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={styles.frame}
      style={{
        width: `${width}px`,
        height: baseHeight > 0 ? `${baseHeight * scale}px` : undefined,
      }}
    >
      <div
        ref={contentRef}
        className={styles.content}
        style={{ width: `${baseWidth}px`, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};
