export type DrawImage = (ctx: CanvasRenderingContext2D) => Promise<void>;

const MAX_COMPOSED_IMAGES = 300;

const assetCache = new Map<string, Promise<HTMLImageElement>>();
const composedCache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();
let fontPromise: Promise<void> | null = null;

export function getCachedImage(key: string): string | undefined {
  return composedCache.get(key);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = assetCache.get(src);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => {
      assetCache.delete(src);
      reject(new Error(`Не удалось загрузить изображение: ${src}`));
    };
    image.src = src;
  });

  assetCache.set(src, promise);
  return promise;
}

export function loadCardFont(): Promise<void> {
  fontPromise ??= document.fonts
    .load('600 32px "Nunito"')
    .then(() => undefined)
    .catch(() => undefined);

  return fontPromise;
}

function remember(key: string, dataUrl: string): void {
  composedCache.set(key, dataUrl);

  if (composedCache.size <= MAX_COMPOSED_IMAGES) return;

  const oldestKey = composedCache.keys().next().value;
  if (oldestKey) composedCache.delete(oldestKey);
}

export function composeImage(
  key: string,
  width: number,
  height: number,
  draw: DrawImage,
): Promise<string> {
  const cached = composedCache.get(key);
  if (cached) return Promise.resolve(cached);

  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context is not available');

    await draw(ctx);
    const dataUrl = canvas.toDataURL('image/png');
    remember(key, dataUrl);
    return dataUrl;
  })().finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}
