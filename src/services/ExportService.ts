import { toPng } from 'html-to-image';
import { importScc, type IImportedSccData } from './SccImport';
import { SCC_MODULES, type SccPayload } from './SccSchema';

export class ExportService {
  static curFormattedDate() {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${year}.${month}.${day}-${hours}.${minutes}.${seconds}`;
  }

  static exportToScc(payload: SccPayload): void {
    const document: SccPayload = {
      ...payload,
      exportDate: new Date().toISOString(),
      exportedModules: [...SCC_MODULES],
    };

    const jsonString = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${payload.playerName}-${ExportService.curFormattedDate()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  static importFromScc(fileContent: string): IImportedSccData | null {
    return importScc(fileContent);
  }

  static async exportToPng(element: HTMLDivElement | null): Promise<string | null> {
    if (!element) return null;
    try {
      return await toPng(element, {
        cacheBust: true,
        pixelRatio: 1,
        style: { left: '0', top: '0', transform: 'translate(0, 0)' },
      });
    } catch (error) {
      console.error('Ошибка при генерации PNG:', error);
      return null;
    }
  }
}
