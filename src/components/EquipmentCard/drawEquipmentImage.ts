import type { EquipmentData } from '../../models/equipment';
import { loadImage } from '../../services/ImageComposer';

const WIDTH = 195;
const HEIGHT = 209;

export function equipmentImageKey(equipment: EquipmentData): string {
  return ['equipment', equipment.name, equipment.grade, equipment.set, equipment.type].join(':');
}

export async function drawEquipmentImage(
  ctx: CanvasRenderingContext2D,
  equipment: EquipmentData,
): Promise<void> {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.drawImage(await loadImage(equipment.bgUrl), 0, 0, WIDTH, HEIGHT);
  ctx.drawImage(await loadImage(equipment.itemUrl), 0, 0, WIDTH, HEIGHT);
  ctx.drawImage(await loadImage(equipment.ssSignUrl), 0, 151, 62, 40);
  ctx.drawImage(await loadImage(equipment.typeSignUrl), 0, 0, 53, 53);

  if (!equipment.levelSignUrl) return;

  ctx.drawImage(await loadImage(equipment.levelSignUrl), 75, 155, 54, 54);
}
