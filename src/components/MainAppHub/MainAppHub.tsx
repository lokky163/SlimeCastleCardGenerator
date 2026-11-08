import React, { useRef, useState } from 'react';
import { HubContent } from './HubContent';
import { HubExportBoard } from './HubExportBoard';
import { HubHeader } from './HubHeader';
import { HelpModal } from './HelpModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import type { AppTab } from './tabs';
import { useCardProfile } from '../../hooks/useCardProfile';
import { useShareLayout } from '../../hooks/useShareLayout';
import { calculateRemainingThrows, getActivePhaseInfo } from '../../utils/buffProgress';
import styles from './MainAppHub.module.css';

export const MainAppHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [bgColor, setBgColor] = useState('#9A6E3F');
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const profile = useCardProfile();
  const allModulesHdRef = useRef<HTMLDivElement>(null);
  const { previewImage, closePreview, shareLayout } = useShareLayout(
    allModulesHdRef,
    profile.playerName,
  );

  const phaseInfo = getActivePhaseInfo(profile.buffs);
  const remainingThrows = calculateRemainingThrows(profile.buffs);

  return (
    <div className={styles.hubContainer}>
      <ImagePreviewModal image={previewImage} onClose={closePreview} />
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <HubHeader
        activeTab={activeTab}
        profile={profile}
        bgColor={bgColor}
        onTabChange={setActiveTab}
        onBgColorChange={setBgColor}
        onOpenHelp={() => setIsHelpOpen(true)}
        onExportImage={shareLayout}
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
        boardRef={allModulesHdRef}
        bgColor={bgColor}
        phaseInfo={phaseInfo}
      />
    </div>
  );
};
