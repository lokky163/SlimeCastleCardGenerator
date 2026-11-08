import type { RefObject } from 'react';
import type { CardProfile } from '../../hooks/useCardProfile';
import { ExportBoard } from '../ExportBoard/ExportBoard';

interface HubExportBoardProps {
  profile: CardProfile;
  boardRef: RefObject<HTMLDivElement | null>;
  bgColor: string;
  phaseInfo: { phase: number; percent: number };
}

export const HubExportBoard: React.FC<HubExportBoardProps> = ({
  profile,
  boardRef,
  bgColor,
  phaseInfo,
}) => (
  <ExportBoard
    boardRef={boardRef}
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
);
