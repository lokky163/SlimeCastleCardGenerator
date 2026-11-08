import { useState, type RefObject } from 'react';
import { saveAs } from 'file-saver';
import { ExportService } from '../services/ExportService';

export function useShareLayout(
  boardRef: RefObject<HTMLDivElement | null>,
  playerName: string,
) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const shareLayout = async () => {
    const dataUrl = await ExportService.exportToPng(boardRef.current);
    if (!dataUrl) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
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
