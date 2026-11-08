import type { RefObject } from 'react';
import type { CardProfile } from '../../hooks/useCardProfile';
import type { ExportSelection } from '../../models/exportSelection';
import { ExportBoard } from '../ExportBoard/ExportBoard';

interface HubExportBoardProps {
  profile: CardProfile;
  boardRef: RefObject<HTMLDivElement | null>;
  bgColor: string;
  phaseInfo: { phase: number; percent: number };
  selection: ExportSelection;
}

export const HubExportBoard: React.FC<HubExportBoardProps> = ({
  profile,
  boardRef,
  bgColor,
  phaseInfo,
  selection,
}) => (
  <ExportBoard
    boardRef={boardRef}
    playerName={profile.playerName}
    bgColor={bgColor}
    totalSlimeBonus={profile.totalSlimeBonus}
    equipment={profile.equipment}
    equipmentLayout={profile.equipmentLayout}
    relics={profile.relics}
    relicLayout={profile.relicLayout}
    slimes={profile.slimes}
    slimeLayout={profile.slimeLayout}
    buffs={profile.buffs}
    buffLayout={profile.buffLayout}
    artifacts={profile.artifacts}
    artifactLayout={profile.artifactLayout}
    phaseInfo={phaseInfo}
    selection={selection}
  />
);
