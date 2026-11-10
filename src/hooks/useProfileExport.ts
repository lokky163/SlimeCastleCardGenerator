import { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';
import { downloadFile, shareFile } from '../utils/fileShare';
import type { ProfilesController } from './useProfiles';

export type ProfileExportKind = 'active' | 'all';

interface ProfileExportState {
  kind: ProfileExportKind;
  file: File;
}

export interface ProfileExportController {
  kind: ProfileExportKind | null;
  shareNotice: string | null;
  openActive: () => void;
  openAll: () => void;
  close: () => void;
  download: () => void;
  share: () => Promise<void>;
}

export function useProfileExport(
  profile: ProfilesController,
): ProfileExportController {
  const { t } = useI18n();
  const [state, setState] = useState<ProfileExportState | null>(null);
  const [shareNotice, setShareNotice] = useState<string | null>(null);

  const open = (kind: ProfileExportKind) => {
    const file =
      kind === 'active'
        ? profile.createProfileFile()
        : profile.createAllProfilesFile();
    if (!file) return;

    setShareNotice(null);
    setState({ kind, file });
  };

  const close = () => {
    setState(null);
    setShareNotice(null);
  };

  const download = () => {
    if (!state) return;
    downloadFile(state.file);
  };

  const share = async () => {
    if (!state) return;
    setShareNotice(null);

    const result = await shareFile(state.file, state.file.name);
    if (result === 'shared' || result === 'cancelled') return;

    // Sharing is unavailable (insecure context, in-app browser, old browser)
    // or failed, so the file is saved instead of leaving the user stuck.
    downloadFile(state.file);
    setShareNotice(
      t('Direct sharing is not available in this browser. The file has been downloaded — you can send it manually.'),
    );
  };

  return {
    kind: state?.kind ?? null,
    shareNotice,
    openActive: () => open('active'),
    openAll: () => open('all'),
    close,
    download,
    share,
  };
}
