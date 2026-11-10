import { getStarImages, type RelicState } from '../../models/relic';
import { loadCardFont, loadImage } from '../../services/ImageComposer';

export const RELIC_IMAGE_WIDTH = 228;
export const RELIC_IMAGE_HEIGHT = 349;

const WIDTH = RELIC_IMAGE_WIDTH;
const HEIGHT = RELIC_IMAGE_HEIGHT;

/** Область для названия релика на баннере. */
const NAME_WIDTH = 190;
const NAME_HEIGHT = 80;
const NAME_TOP = 200;

export function relicImageKey(
  imageUrl: string,
  state: RelicState,
  displayName: string,
): string {
  return `relic:${imageUrl}:${state}:${displayName}`;
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

function wrapName(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }

  if (line) lines.push(line);
  return lines;
}

interface FittedName {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  lineWidth: number;
}

function fitName(ctx: CanvasRenderingContext2D, text: string): FittedName {
  for (let fontSize = 28; fontSize >= 14; fontSize -= 1) {
    ctx.font = `800 ${fontSize}px "Nunito"`;
    const lineWidth = Math.max(4, fontSize * 0.2);
    const maxTextWidth = NAME_WIDTH - lineWidth;
    const lines = wrapName(ctx, text, maxTextWidth);
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const lineHeight = fontSize * 1.1;

    if (
      widest <= maxTextWidth &&
      lines.length * lineHeight + lineWidth <= NAME_HEIGHT
    ) {
      return { lines, fontSize, lineHeight, lineWidth };
    }
  }

  ctx.font = '800 14px "Nunito"';
  return {
    lines: wrapName(ctx, text, NAME_WIDTH - 4),
    fontSize: 14,
    lineHeight: 15.4,
    lineWidth: 4,
  };
}

function drawName(ctx: CanvasRenderingContext2D, text: string): void {
  if (!text.trim()) return;

  const { lines, fontSize, lineHeight, lineWidth } = fitName(ctx, text);
  const centerX = WIDTH / 2;
  const centerY = NAME_TOP + NAME_HEIGHT / 2;

  ctx.save();
  ctx.font = `800 ${fontSize}px "Nunito"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = '#4A2A12';
  ctx.fillStyle = '#FFF6DE';

  lines.forEach((line, index) => {
    const y = centerY + (index - (lines.length - 1) / 2) * lineHeight;
    ctx.strokeText(line, centerX, y);
    ctx.fillText(line, centerX, y);
  });

  ctx.restore();
}

export async function drawRelicImage(
  ctx: CanvasRenderingContext2D,
  imageUrl: string,
  state: RelicState,
  displayName: string,
): Promise<void> {
  const image = await loadImage(imageUrl);
  await loadCardFont();
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (state === 'no') {
    drawGrayscale(ctx, image);
    drawColorIsland(ctx, image);
  } else {
    ctx.drawImage(image, 0, 0, WIDTH, HEIGHT);
  }

  drawName(ctx, displayName);
  await drawRelicStars(ctx, state);
}
