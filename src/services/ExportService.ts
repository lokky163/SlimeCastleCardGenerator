import { toPng } from 'html-to-image';
import { createProfilesFile, parseProfilesContent } from './ProfilesSerialization';
import type { SccProfile } from './ProfilesSchema';
import {
  SCC_FILE_TYPE,
  SCC_MODULES,
  SCC_VERSION,
  type SccPayload,
} from './SccSchema';

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

  static exportProfile(profile: SccProfile): void {
    const document: SccPayload & { uid: string } = {
      fileType: SCC_FILE_TYPE,
      version: SCC_VERSION,
      uid: profile.uid,
      playerName: profile.playerName,
      exportDate: new Date().toISOString(),
      exportedModules: [...SCC_MODULES],
      settings: profile.settings,
      modules: profile.modules,
    };
    const name = profile.playerName.trim() || 'profile';

    ExportService.downloadJson(
      document,
      `${name}-${ExportService.curFormattedDate()}.json`,
    );
  }

  static exportProfiles(profiles: SccProfile[]): void {
    ExportService.downloadJson(
      createProfilesFile(profiles),
      `slime-profiles-${ExportService.curFormattedDate()}.json`,
    );
  }

  static importProfiles(fileContent: string): SccProfile[] | null {
    return parseProfilesContent(fileContent);
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
