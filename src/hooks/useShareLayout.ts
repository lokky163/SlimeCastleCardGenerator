import { useRef, useState, type RefObject } from 'react';
import { saveAs } from 'file-saver';
import { ExportService } from '../services/ExportService';

export interface ShareLayoutController {
  previewImage: string | null;
  canShare: boolean;
  closePreview: () => void;
  downloadImage: () => Promise<void>;
  shareImage: () => Promise<void>;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

function imageFileName(playerName: string): string {
  const name = playerName.trim() || 'card';
  return `${name}-${ExportService.curFormattedDate()}.png`;
}

function canShareFiles(file: File): boolean {
  if (typeof navigator.share !== 'function') return false;
  if (typeof navigator.canShare !== 'function') return false;
  return navigator.canShare({ files: [file] });
}

export function useShareLayout(
  boardRef: RefObject<HTMLDivElement | null>,
  playerName: string,
) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const fileRef = useRef<File | null>(null);

  const exportImage = async () => {
    const dataUrl = await ExportService.exportToPng(boardRef.current);
    if (!dataUrl) return;

    try {
      const blob = await dataUrlToBlob(dataUrl);
      const file = new File([blob], imageFileName(playerName), {
        type: 'image/png',
      });
      fileRef.current = file;
      setCanShare(canShareFiles(file));
    } catch {
      fileRef.current = null;
      setCanShare(false);
    }

    setPreviewImage(dataUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
    fileRef.current = null;
  };

  const downloadImage = async () => {
    if (!previewImage) return;

    const blob = await dataUrlToBlob(previewImage);
    saveAs(blob, imageFileName(playerName));
  };

  const shareImage = async () => {
    if (!previewImage) return;

    const file =
      fileRef.current ??
      new File([await dataUrlToBlob(previewImage)], imageFileName(playerName), {
        type: 'image/png',
      });

    if (!canShareFiles(file)) {
      await downloadImage();
      return;
    }

    try {
      await navigator.share({
        files: [file],
        title: playerName.trim() || 'Slime Castle',
      });
    } catch (error) {
      // Closing the system share sheet is not an error worth reporting.
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Не удалось поделиться изображением:', error);
    }
  };

  return {
    previewImage,
    canShare,
    closePreview,
    downloadImage,
    shareImage,
    exportImage,
  };
}
