import { useRef, useState, type RefObject } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { ExportService } from '../services/ExportService';
import {
  downloadFile,
  sanitizeFileName,
  shareFile,
} from '../utils/fileShare';

export interface ShareLayoutController {
  previewImage: string | null;
  shareNotice: string | null;
  closePreview: () => void;
  downloadImage: () => Promise<void>;
  shareImage: () => Promise<void>;
  exportImage: () => Promise<void>;
}

function imageFileName(playerName: string): string {
  const name = sanitizeFileName(playerName) || 'card';
  const stamp = ExportService.curFormattedDate().replace(/:/g, '-');
  return `${name}-${stamp}.png`;
}

/**
 * Synchronous data URL decoding. The File must be ready before the click
 * handler returns: Android Chrome rejects `navigator.share()` when it is
 * called after an `await` and no longer sees the user gesture.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) throw new Error('Invalid data URL');

  const meta = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  const mime = /data:([^;,]+)/.exec(meta)?.[1] ?? 'image/png';
  const binary = meta.includes(';base64')
    ? atob(payload)
    : decodeURIComponent(payload);

  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

export function useShareLayout(
  boardRef: RefObject<HTMLDivElement | null>,
  playerName: string,
) {
  const { t } = useI18n();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const buildFile = (dataUrl: string): File | null => {
    try {
      const blob = dataUrlToBlob(dataUrl);
      return new File([blob], imageFileName(playerName), { type: 'image/png' });
    } catch (error) {
      console.error('Не удалось подготовить файл изображения:', error);
      return null;
    }
  };

  const exportImage = async () => {
    const dataUrl = await ExportService.exportToPng(boardRef.current);
    if (!dataUrl) return;

    fileRef.current = buildFile(dataUrl);
    setShareNotice(null);
    setPreviewImage(dataUrl);
  };

  const closePreview = () => {
    setPreviewImage(null);
    setShareNotice(null);
    fileRef.current = null;
  };

  const downloadImage = async () => {
    if (!previewImage) return;

    const file = fileRef.current ?? buildFile(previewImage);
    if (file) downloadFile(file);
  };

  const shareImage = async () => {
    if (!previewImage) return;
    setShareNotice(null);

    const file = fileRef.current ?? buildFile(previewImage);
    if (file) {
      const result = await shareFile(
        file,
        playerName.trim() || 'Slime Castle',
      );
      if (result !== 'unavailable') return;
    }

    // Sharing is unavailable (insecure context, in-app browser, old browser)
    // or failed, so the image is saved instead of leaving the user stuck.
    await downloadImage();
    setShareNotice(
      t('Direct sharing is not available in this browser. The image has been downloaded — you can send it manually.'),
    );
  };

  return {
    previewImage,
    shareNotice,
    closePreview,
    downloadImage,
    shareImage,
    exportImage,
  };
}
