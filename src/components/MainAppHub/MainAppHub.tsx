import React, { useRef, useState } from 'react';
import { RelicsModule } from '../RelicsModule/RelicsModule';
import { SlimesModule } from '../SlimesModule/SlimesModule';
import { EquipmentModule } from '../EquipmentModule/EquipmentModule';
import { BuffsModule } from '../BuffsModule/BuffsModule';
import { ArtifactsModule } from '../ArtifactsModule/ArtifactsModule';
import { ExportBoard } from '../ExportBoard/ExportBoard';
import { HubHeader } from './HubHeader';
import { HelpModal } from './HelpModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import type { AppTab } from './tabs';
import { useCardProfile } from '../../hooks/useCardProfile';
import { ExportService } from '../../services/ExportService';
import { calculateRemainingThrows, getActivePhaseInfo } from '../../utils/buffProgress';
import { saveAs } from 'file-saver';
import styles from './MainAppHub.module.css';

export const MainAppHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [bgColor, setBgColor] = useState('#9A6E3F');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const profile = useCardProfile();
  const allModulesHdRef = useRef<HTMLDivElement>(null);

  const phaseInfo = getActivePhaseInfo(profile.buffs);
  const remainingThrows = calculateRemainingThrows(profile.buffs);

  const handleShareLayout = async () => {
    const dataUrl = await ExportService.exportToPng(allModulesHdRef.current);
    if (!dataUrl) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIOS) {
      setPreviewImage(dataUrl);
      return;
    }

    const blob = await (await fetch(dataUrl)).blob();
    saveAs(blob, `${profile.playerName}-${ExportService.curFormattedDate()}.png`);
  };

  return (
    <div className={styles.hubContainer}>
      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <HubHeader
        activeTab={activeTab}
        playerName={profile.playerName}
        bgColor={bgColor}
        onTabChange={setActiveTab}
        onPlayerNameChange={profile.setPlayerName}
        onBgColorChange={setBgColor}
        onOpenHelp={() => setIsHelpOpen(true)}
        onReset={profile.resetProfile}
        onImportFile={profile.importConfigFile}
        onExportConfig={profile.exportConfig}
        onExportImage={handleShareLayout}
      />

      <main className={styles.mainContent}>
        {activeTab === 'relics' && (
          <RelicsModule
            relics={profile.relics}
            setRelics={profile.setRelics}
            layout={profile.relicLayout}
          />
        )}

        {activeTab === 'slimes' && (
          <SlimesModule
            slimes={profile.slimes}
            setSlimes={profile.setSlimes}
            layout={profile.slimeLayout}
            onChangeSkin={profile.changeSkin}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentModule
            equipment={profile.equipment}
            setEquipment={profile.setEquipment}
          />
        )}

        {activeTab === 'buffs' && (
          <BuffsModule
            buffs={profile.buffs}
            setBuffs={profile.setBuffs}
            phaseInfo={phaseInfo}
            remainingThrows={remainingThrows}
          />
        )}

        {activeTab === 'artifacts' && (
          <ArtifactsModule
            artifacts={profile.artifacts}
            setArtifacts={profile.setArtifacts}
          />
        )}
      </main>

      <ExportBoard
        boardRef={allModulesHdRef}
        playerName={profile.playerName}
        bgColor={bgColor}
        totalSlimeBonus={profile.totalSlimeBonus}
        equipment={profile.equipment}
        relics={profile.relics}
        relicLayout={profile.relicLayout}
        slimes={profile.slimes}
        slimeLayout={profile.slimeLayout}
        buffs={profile.buffs}
        artifacts={profile.artifacts}
        phaseInfo={phaseInfo}
      />
    </div>
  );
};
