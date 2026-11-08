import { getStarImages, type RelicState } from '../../models/relic';
import { loadImage } from '../../services/ImageComposer';

const WIDTH = 228;
const HEIGHT = 349;

export function relicImageKey(name: string, state: RelicState): string {
  return `relic:${name}:${state}`;
}

function drawGrayscale(ctx: CanvasRenderingContext2D, image: HTMLImageElement): void {
  ctx.save();
  ctx.filter = 'grayscale(100%)';
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
  ctx.restore();
}

function drawColorIsland(ctx: CanvasRenderingContext2D, image: HTMLImageElement): void {
  const points: Array<[number, number]> = [
    [50.877, 0],
    [60.526, 6.877],
    [50.877, 13.754],
    [41.228, 6.877],
  ];

  ctx.save();
  ctx.beginPath();
  points.forEach(([x, y], index) => {
    const px = (x / 100) * WIDTH;
    const py = (y / 100) * HEIGHT;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
  ctx.restore();
}

async function drawRelicStars(ctx: CanvasRenderingContext2D, state: RelicState): Promise<void> {
  const stars = getStarImages(state);
  if (stars.length === 0) return;

  const containerX = WIDTH * 0.14474;
  const containerY = HEIGHT * 0.84527;
  const containerWidth = WIDTH * 0.71052;
  const starSize = containerWidth * 0.18518;
  const gap = containerWidth * 0.01315;
  const totalWidth = stars.length * starSize + (stars.length - 1) * gap;
  const startX = containerX + (containerWidth - totalWidth) / 2;

  for (let index = 0; index < stars.length; index++) {
    const image = await loadImage(stars[index]);
    ctx.drawImage(image, startX + index * (starSize + gap), containerY, starSize, starSize);
  }
}

export async function drawRelicImage(
  ctx: CanvasRenderingContext2D,
  imageUrl: string,
  state: RelicState,
): Promise<void> {
  const image = await loadImage(imageUrl);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (state === 'no') {
    drawGrayscale(ctx, image);
    drawColorIsland(ctx, image);
  } else {
    ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
  }

  await drawRelicStars(ctx, state);
}
