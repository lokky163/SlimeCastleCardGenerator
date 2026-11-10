import { SLIME_ASSETS, type SlimeData, type SlimeState } from '../../models/slime';
import { loadCardFont, loadImage } from '../../services/ImageComposer';

export const SLIME_IMAGE_WIDTH = 333;
export const SLIME_IMAGE_HEIGHT = 276;

const WIDTH = SLIME_IMAGE_WIDTH;
const HEIGHT = SLIME_IMAGE_HEIGHT;

export function slimeImageKey(
  slime: SlimeData,
  displayName: string,
  hideLevel: boolean,
): string {
  return [
    'slime',
    slime.imageUrl,
    slime.rarity,
    slime.state,
    slime.level,
    displayName,
    hideLevel ? 'edit' : 'view',
  ].join(':');
}

function drawText(ctx: CanvasRenderingContext2D, text: string, y: number): void {
  ctx.save();
  ctx.font = '600 32px "Nunito"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#63402C';
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeText(text, WIDTH / 2, y);
  ctx.fillText(text, WIDTH / 2, y);
  ctx.restore();
}

function drawStars(ctx: CanvasRenderingContext2D, state: SlimeState) {
  const { type, count } = getStarInfo(state);
  if (!type || count <= 0) return Promise.resolve();

  return loadImage(SLIME_ASSETS.stars[type]).then((star) => {
    const size = 36;
    const startX = (WIDTH - count * size) / 2;

    for (let index = 0; index < count; index++) {
      ctx.drawImage(star, startX + index * size, 222, size, size);
    }
  });
}

function getStarInfo(state: SlimeState): { type: 'yellow' | 'red' | null; count: number } {
  if (state === 'no' || state === '0') return { type: null, count: 0 };

  return {
    type: state.endsWith('y') ? 'yellow' : 'red',
    count: parseInt(state, 10) || 0,
  };
}

export async function drawSlimeImage(
  ctx: CanvasRenderingContext2D,
  slime: SlimeData,
  displayName: string,
  hideLevel: boolean,
): Promise<void> {
  await loadCardFont();

  const assets = SLIME_ASSETS[slime.rarity];
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(await loadImage(assets.bg), 0, 0, WIDTH, HEIGHT);
  ctx.drawImage(await loadImage(slime.imageUrl), 0, 0, WIDTH, HEIGHT);

  if (!hideLevel) drawText(ctx, `Lv.${slime.level}`, 27);

  if (!slime.hasStars) {
    drawText(ctx, displayName, 216);
    return;
  }

  ctx.drawImage(await loadImage(assets.starBottom), 0, 0, WIDTH, HEIGHT);
  await drawStars(ctx, slime.state);
}
