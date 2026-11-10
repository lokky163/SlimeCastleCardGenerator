import { saveAs } from 'file-saver';

export type ShareFileResult = 'shared' | 'cancelled' | 'unavailable';

/**
 * Android rejects file names with characters that are legal on desktop but
 * forbidden by its storage layer, so the name is reduced to a safe subset.
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\p{Cc}/gu, '-')
    .trim();
}

export function canShareFile(file: File): boolean {
  if (typeof navigator === 'undefined') return false;
  if (typeof navigator.share !== 'function') return false;
  if (typeof navigator.canShare !== 'function') return false;

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/**
 * Must be called directly from a click handler: Android Chrome rejects
 * `navigator.share()` when it no longer sees the user gesture.
 */
export async function shareFile(
  file: File,
  title: string,
): Promise<ShareFileResult> {
  if (!canShareFile(file)) return 'unavailable';

  try {
    await navigator.share({ files: [file], title });
    return 'shared';
  } catch (error) {
    // Closing the system share sheet is not an error worth reporting.
    if (error instanceof DOMException && error.name === 'AbortError') {
      return 'cancelled';
    }

    console.error('Не удалось поделиться файлом:', error);
    return 'unavailable';
  }
}

export function downloadFile(file: File): void {
  saveAs(file, file.name);
}
