import React, { useRef, useState } from 'react';
import { ExportOptionsModal } from '../ExportBoard/ExportOptionsModal';
import { HubContent } from './HubContent';
import { HubExportBoard } from './HubExportBoard';
import { HubHeader } from './HubHeader';
import { HelpModal } from './HelpModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import type { AppTab } from './tabs';
import { useCardProfile } from '../../hooks/useCardProfile';
import { useExportSettings } from '../../hooks/useExportSettings';
import { useShareLayout } from '../../hooks/useShareLayout';
import {
  DEFAULT_DROP_CHANCE,
  type DropChanceSelection,
} from '../../utils/buffDrops';
import { getBuffsProgress } from '../../utils/buffProgress';
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

export const MainAppHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const hub = useHubController();
  const {
    profile,
    exportSettings,
    phaseInfo,
    buffsProgress,
    dropChance,
    setDropChance,
  } = hub;

  return (
    <div className={styles.hubContainer}>
      <ImagePreviewModal image={hub.previewImage} onClose={hub.closePreview} />
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ExportOptionsModal settings={exportSettings} />

      <HubHeader
        activeTab={activeTab}
        profile={profile}
        bgColor={profile.bgColor}
        onTabChange={setActiveTab}
        onBgColorChange={profile.setBgColor}
        onOpenHelp={() => setIsHelpOpen(true)}
        onExportImage={exportSettings.open}
      />

      <main className={styles.mainContent}>
        <HubContent
          activeTab={activeTab}
          profile={profile}
          buffsProgress={buffsProgress}
          dropChance={dropChance}
          onDropChanceChange={setDropChance}
        />
      </main>

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
