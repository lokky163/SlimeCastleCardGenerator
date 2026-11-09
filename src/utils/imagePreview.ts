export type ImagePreviewMode = 'auto' | 'always' | 'never';

// Режим диалога с готовым изображением:
// 'auto' — показывать только на iPhone/iPad;
// 'always' — показывать на любой платформе;
// 'never' — никогда не показывать, всегда скачивать файл.
export const IMAGE_PREVIEW_MODE: ImagePreviewMode = 'auto';

export function shouldShowImagePreview(
  userAgent: string,
  mode: ImagePreviewMode = IMAGE_PREVIEW_MODE,
): boolean {
  if (mode === 'always') return true;
  if (mode === 'never') return false;
  return /iPhone|iPad|iPod/i.test(userAgent);
}
