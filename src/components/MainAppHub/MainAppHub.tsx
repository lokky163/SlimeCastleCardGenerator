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
import type { AppTab } from './tabs';
import { useCardProfile, type CardProfile } from '../../hooks/useCardProfile';
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

function profileLabel(profile: CardProfile, index: number): string {
  const name = profile.profiles[index]?.playerName.trim();
  return name ? `Профиль ${index + 1} (${name})` : `Профиль ${index + 1}`;
}

function useProfileMenu(profile: CardProfile) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const closeOnMobile = () => {
    if (window.matchMedia('(max-width: 768px)').matches) setIsOpen(false);
  };

  const selectProfile = (index: number) => {
    profile.selectProfile(index);
    closeOnMobile();
  };

  const addProfile = () => {
    profile.addProfile();
    closeOnMobile();
  };

  const confirmDelete = () => {
    if (deleteTarget !== null) profile.deleteProfile(deleteTarget);
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
      deleteTarget === null ? '' : profileLabel(profile, deleteTarget),
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
}

const HubWorkspace: React.FC<HubWorkspaceProps> = ({
  activeTab,
  profile,
  buffsProgress,
  dropChance,
  onDropChanceChange,
  menu,
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
      notice={profile.profilesNotice}
      onSelect={menu.selectProfile}
      onAdd={menu.addProfile}
      onRequestDelete={menu.requestDelete}
      onExportAll={profile.exportAllProfiles}
      onImportAllFile={profile.importAllProfilesFile}
    />

    <main className={styles.mainContent}>
      <HubContent
        activeTab={activeTab}
        profile={profile}
        buffsProgress={buffsProgress}
        dropChance={dropChance}
        onDropChanceChange={onDropChanceChange}
      />
    </main>
  </div>
);

export const MainAppHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const hub = useHubController();
  const { profile, exportSettings, phaseInfo, buffsProgress, dropChance, setDropChance } = hub;
  const menu = useProfileMenu(profile);
  const reset = useProfileReset(profile);

  return (
    <div className={styles.hubContainer}>
      <ImagePreviewModal image={hub.previewImage} onClose={hub.closePreview} />
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ExportOptionsModal settings={exportSettings} />
      <ProfileModals menu={menu} reset={reset} />
      <HubHeader
        activeTab={activeTab}
        profile={profile}
        bgColor={profile.bgColor}
        isProfilesOpen={menu.isOpen}
        onTabChange={setActiveTab}
        onBgColorChange={profile.setBgColor}
        onToggleProfiles={menu.toggle}
        onOpenHelp={() => setIsHelpOpen(true)}
        onRequestReset={reset.request}
        onExportImage={exportSettings.open}
      />
      <HubWorkspace
        activeTab={activeTab}
        profile={profile}
        buffsProgress={buffsProgress}
        dropChance={dropChance}
        onDropChanceChange={setDropChance}
        menu={menu}
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
