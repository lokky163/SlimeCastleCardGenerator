import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import type { CardGridVariant } from './CardGrid';
import {
  calculateEditorGrid,
  EDITOR_GRID_CONFIG,
  type EditorGridMetrics,
} from './editorGridConfig';

export interface EditorGridController extends EditorGridMetrics {
  gridRef: RefObject<HTMLDivElement | null>;
}

function getContentWidth(element: HTMLElement): number {
  const computed = getComputedStyle(element);
  const horizontalPadding =
    parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
  return Math.max(0, element.clientWidth - horizontalPadding);
}

export function useEditorGrid(
  variant: CardGridVariant,
  itemCount: number,
): EditorGridController {
  const gridRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);

  useLayoutEffect(() => {
    const element = gridRef.current;
    if (!element) return;

    const updateWidth = () => setAvailableWidth(getContentWidth(element));
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const metrics = calculateEditorGrid(
    availableWidth,
    EDITOR_GRID_CONFIG[variant],
    itemCount,
  );

  return { gridRef, ...metrics };
}
