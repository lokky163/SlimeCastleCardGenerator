import React, { useRef, useState } from 'react';
import { ExportOptionsModal } from '../ExportBoard/ExportOptionsModal';
import { HubContent } from './HubContent';
import { HubExportBoard } from './HubExportBoard';
import { HubHeader } from './HubHeader';
import { HelpModal } from './HelpModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import { DeleteProfileModal } from './DeleteProfileModal';
import { ProfilesDrawer } from './ProfilesDrawer';
import { ResetProfileModal } from './ResetProfileModal';
import { NoticeModal } from '../ui/NoticeModal/NoticeModal';
import type { AppTab } from './tabs';
import { PlayerNotFound } from './PlayerNotFound';
import { useCardProfile, type CardProfile } from '../../hooks/useCardProfile';
import { useAppRoute, type AppRouteController } from '../../hooks/useAppRoute';
import { useExportSettings } from '../../hooks/useExportSettings';
import { useShareLayout } from '../../hooks/useShareLayout';
import {
  DEFAULT_DROP_CHANCE,
  type DropChanceSelection,
} from '../../utils/buffDrops';
import {
  getBuffsProgress,
  type BuffsProgress,
} from '../../utils/buffProgress';
import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../utils/classNames';
import styles from './MainAppHub.module.css';

function useHubController() {
  const profile = useCardProfile();
  const boardRef = useRef<HTMLDivElement>(null);
  const [dropChance, setDropChance] =
    useState<DropChanceSelection>(DEFAULT_DROP_CHANCE);
  const { previewImage, closePreview, shareLayout } = useShareLayout(
    boardRef,
    profile.playerName,
  );
  const exportSettings = useExportSettings(
    profile.exportSelection,
    profile.setExportSelection,
    shareLayout,
  );
  const buffsProgress = getBuffsProgress(profile.buffs);

  return {
    profile,
    boardRef,
    previewImage,
    closePreview,
    exportSettings,
    phaseInfo: buffsProgress.active,
    buffsProgress,
    dropChance,
    setDropChance,
  };
}

function profileLabel(
  profile: CardProfile,
  index: number,
  t: ReturnType<typeof useI18n>['t'],
): string {
  const name = profile.profiles[index]?.playerName.trim();
  const params = { index: index + 1, name: name ?? '' };

  return name
    ? t('Profile {index} ({name})', params)
    : t('Profile {index}', params);
}

function useProfileMenu(profile: CardProfile, route: AppRouteController) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const closeOnMobile = () => {
    if (window.matchMedia('(max-width: 768px)').matches) setIsOpen(false);
  };

  const selectProfile = (index: number) => {
    route.selectProfile(index);
    closeOnMobile();
  };

  const addProfile = () => {
    route.recoverRoute();
    profile.addProfile();
    closeOnMobile();
  };

  const confirmDelete = () => {
    if (deleteTarget !== null) {
      route.recoverRoute();
      profile.deleteProfile(deleteTarget);
    }
    setDeleteTarget(null);
  };

  return {
    isOpen,
    toggle: () => setIsOpen((open) => !open),
    deleteTarget,
    requestDelete: setDeleteTarget,
    cancelDelete: () => setDeleteTarget(null),
    confirmDelete,
    selectProfile,
    addProfile,
    deleteLabel:
      deleteTarget === null ? '' : profileLabel(profile, deleteTarget, t),
  };
}

function useProfileReset(profile: CardProfile) {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    request: () => setIsOpen(true),
    cancel: () => setIsOpen(false),
    confirm: () => {
      profile.resetProfile();
      setIsOpen(false);
    },
  };
}

interface ProfileModalsProps {
  menu: ReturnType<typeof useProfileMenu>;
  reset: ReturnType<typeof useProfileReset>;
}

const ProfileModals: React.FC<ProfileModalsProps> = ({ menu, reset }) => (
  <>
    <DeleteProfileModal
      open={menu.deleteTarget !== null}
      label={menu.deleteLabel}
      onCancel={menu.cancelDelete}
      onConfirm={menu.confirmDelete}
    />
    <ResetProfileModal
      open={reset.isOpen}
      onCancel={reset.cancel}
      onConfirm={reset.confirm}
    />
  </>
);

interface HubWorkspaceProps {
  activeTab: AppTab;
  profile: CardProfile;
  buffsProgress: BuffsProgress;
  dropChance: DropChanceSelection;
  onDropChanceChange: (chance: DropChanceSelection) => void;
  menu: ReturnType<typeof useProfileMenu>;
  isNotFound: boolean;
}

const HubWorkspace: React.FC<HubWorkspaceProps> = ({
  activeTab,
  profile,
  buffsProgress,
  dropChance,
  onDropChanceChange,
  menu,
  isNotFound,
}) => (
  <div
    className={cx(
      styles.workspace,
      menu.isOpen && styles.workspaceProfilesOpen,
    )}
  >
    <ProfilesDrawer
      open={menu.isOpen}
      profiles={profile.profiles}
      activeProfileIndex={profile.activeProfileIndex}
      onSelect={menu.selectProfile}
      onAdd={menu.addProfile}
      onRequestDelete={menu.requestDelete}
      onReorderProfile={profile.reorderProfile}
      onExportAll={profile.exportAllProfiles}
      onImportFile={profile.importProfilesFile}
    />

    <main className={styles.mainContent}>
      {isNotFound ? (
        <PlayerNotFound />
      ) : (
        <HubContent
          activeTab={activeTab}
          profile={profile}
          buffsProgress={buffsProgress}
          dropChance={dropChance}
          onDropChanceChange={onDropChanceChange}
        />
      )}
    </main>
  </div>
);

const AppNotices: React.FC<{ profile: CardProfile }> = ({ profile }) => (
  <NoticeModal
    notice={profile.profilesNotice}
    onClose={profile.clearProfilesNotice}
  />
);

export const MainAppHub: React.FC = () => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const hub = useHubController();
  const { profile, exportSettings, phaseInfo, buffsProgress, dropChance, setDropChance } = hub;
  const route = useAppRoute(profile);
  const menu = useProfileMenu(profile, route);
  const reset = useProfileReset(profile);

  return (
    <div className={styles.hubContainer}>
      <ImagePreviewModal image={hub.previewImage} onClose={hub.closePreview} />
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ExportOptionsModal settings={exportSettings} />
      <ProfileModals menu={menu} reset={reset} />
      <AppNotices profile={profile} />
      <HubHeader
        activeTab={route.activeTab}
        profile={profile}
        bgColor={profile.bgColor}
        isProfilesOpen={menu.isOpen}
        onTabChange={route.selectTab}
        onBgColorChange={profile.setBgColor}
        onToggleProfiles={menu.toggle}
        onOpenHelp={() => setIsHelpOpen(true)}
        onRequestReset={reset.request}
        onExportImage={exportSettings.open}
      />
      <HubWorkspace
        activeTab={route.activeTab}
        profile={profile}
        buffsProgress={buffsProgress}
        dropChance={dropChance}
        onDropChanceChange={setDropChance}
        menu={menu}
        isNotFound={route.isNotFound}
      />
      <HubExportBoard
        profile={profile}
        boardRef={hub.boardRef}
        bgColor={profile.bgColor}
        phaseInfo={phaseInfo}
        selection={exportSettings.selection}
      />
    </div>
  );
};
