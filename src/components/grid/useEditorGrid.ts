import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import type { CardGridVariant } from './CardGrid';
import {
  calculateEditorGrid,
  EDITOR_GRID_CONFIG,
  MOBILE_GRID_QUERY,
  resolveEditorGridConfig,
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

function useIsMobileLayout(): boolean {
  const [isMobile, setIsMobile] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia(MOBILE_GRID_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(MOBILE_GRID_QUERY);
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}

export function useEditorGrid(
  variant: CardGridVariant,
  itemCount: number,
): EditorGridController {
  const gridRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(0);
  const isMobile = useIsMobileLayout();

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
    resolveEditorGridConfig(EDITOR_GRID_CONFIG[variant], isMobile),
    itemCount,
  );

  return { gridRef, ...metrics };
}
