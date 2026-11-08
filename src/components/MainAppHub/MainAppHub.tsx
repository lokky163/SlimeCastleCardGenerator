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
import { calculateRemainingThrows, getActivePhaseInfo } from '../../utils/buffProgress';
import styles from './MainAppHub.module.css';

function useHubController() {
  const profile = useCardProfile();
  const boardRef = useRef<HTMLDivElement>(null);
  const { previewImage, closePreview, shareLayout } = useShareLayout(
    boardRef,
    profile.playerName,
  );
  const exportSettings = useExportSettings(
    profile.exportSelection,
    profile.setExportSelection,
    shareLayout,
  );

  return {
    profile,
    boardRef,
    previewImage,
    closePreview,
    exportSettings,
    phaseInfo: getActivePhaseInfo(profile.buffs),
    remainingThrows: calculateRemainingThrows(profile.buffs),
  };
}

export const MainAppHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const hub = useHubController();
  const { profile, exportSettings, phaseInfo, remainingThrows } = hub;

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
          phaseInfo={phaseInfo}
          remainingThrows={remainingThrows}
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
