import { toPng } from 'html-to-image';
import { sanitizeFileName } from '../utils/fileShare';
import {
  createProfilesFile as buildProfilesFile,
  parseProfilesContent,
} from './ProfilesSerialization';
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

  private static fileStamp(): string {
    return ExportService.curFormattedDate().replace(/:/g, '-');
  }

  private static createJsonFile(payload: unknown, fileName: string): File {
    const json = JSON.stringify(payload, null, 2);
    return new File([json], fileName, { type: 'application/json' });
  }

  static createProfileFile(profile: SccProfile): File {
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
    const name = sanitizeFileName(profile.playerName) || 'profile';

    return ExportService.createJsonFile(
      document,
      `${name}-${ExportService.fileStamp()}.json`,
    );
  }

  static createAllProfilesFile(profiles: SccProfile[]): File {
    return ExportService.createJsonFile(
      buildProfilesFile(profiles),
      `slime-profiles-${ExportService.fileStamp()}.json`,
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
