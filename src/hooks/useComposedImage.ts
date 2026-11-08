import { useEffect, useRef, useState } from 'react';
import { composeImage, getCachedImage, type DrawImage } from '../services/ImageComposer';

export function useComposedImage(
  key: string,
  width: number,
  height: number,
  draw: DrawImage,
): string {
  const [src, setSrc] = useState(() => getCachedImage(key) ?? '');
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const cached = getCachedImage(key);
    if (cached) {
      setSrc(cached);
      return;
    }

    let active = true;
    setSrc('');

    composeImage(key, width, height, (ctx) => drawRef.current(ctx))
      .then((dataUrl) => {
        if (active) setSrc(dataUrl);
      })
      .catch((error) => {
        console.error('Ошибка сборки изображения:', error);
      });

    return () => {
      active = false;
    };
  }, [key, width, height]);

  return src;
}
