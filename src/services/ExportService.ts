import { toPng } from 'html-to-image';
import { importScc, type IImportedSccData } from './SccImport';
import { createProfilesFile, parseProfilesFile } from './ProfilesSerialization';
import type { SccProfile } from './ProfilesSchema';
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

  private static downloadJson(payload: unknown, filename: string): void {
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  static exportToScc(payload: SccPayload): void {
    const document: SccPayload = {
      ...payload,
      exportDate: new Date().toISOString(),
      exportedModules: [...SCC_MODULES],
    };

    ExportService.downloadJson(
      document,
      `${payload.playerName}-${ExportService.curFormattedDate()}.json`,
    );
  }

  static exportProfiles(profiles: SccProfile[]): void {
    ExportService.downloadJson(
      createProfilesFile(profiles),
      `slime-profiles-${ExportService.curFormattedDate()}.json`,
    );
  }

  static importFromScc(fileContent: string): IImportedSccData | null {
    return importScc(fileContent);
  }

  static importProfiles(fileContent: string): SccProfile[] | null {
    return parseProfilesFile(fileContent);
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
