import { useState, type RefObject } from 'react';
import { saveAs } from 'file-saver';
import { ExportService } from '../services/ExportService';
import { shouldShowImagePreview } from '../utils/imagePreview';

export function useShareLayout(
  boardRef: RefObject<HTMLDivElement | null>,
  playerName: string,
) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const shareLayout = async () => {
    const dataUrl = await ExportService.exportToPng(boardRef.current);
    if (!dataUrl) return;

    if (shouldShowImagePreview(navigator.userAgent)) {
      setPreviewImage(dataUrl);
      return;
    }

    const blob = await (await fetch(dataUrl)).blob();
    saveAs(blob, `${playerName}-${ExportService.curFormattedDate()}.png`);
  };

  return {
    previewImage,
    closePreview: () => setPreviewImage(null),
    shareLayout,
  };
}
