import type { RefObject } from 'react';
import type { ArtifactData } from '../../models/artifact';
import type { BuffData } from '../../models/buff';
import type { EquipmentData } from '../../models/equipment';
import type { RelicData } from '../../models/relic';
import type { SlimeData } from '../../models/slime';
import type { SlotLayoutState } from '../grid/layout';
import { ArtifactExport } from './ArtifactExport';
import { BuffExport } from './BuffExport';
import { EquipmentExport } from './EquipmentExport';
import { RelicExport } from './RelicExport';
import { SlimeExport } from './SlimeExport';
import styles from './ExportBoard.module.css';

interface ExportBoardProps {
  boardRef: RefObject<HTMLDivElement | null>;
  playerName: string;
  bgColor: string;
  totalSlimeBonus: number;
  equipment: EquipmentData[];
  relics: RelicData[];
  relicLayout: SlotLayoutState;
  slimes: SlimeData[];
  slimeLayout: SlotLayoutState;
  buffs: BuffData[];
  artifacts: ArtifactData[];
  phaseInfo: { phase: number; percent: number };
}

export const ExportBoard: React.FC<ExportBoardProps> = ({
  boardRef,
  playerName,
  bgColor,
  totalSlimeBonus,
  equipment,
  relics,
  relicLayout,
  slimes,
  slimeLayout,
  buffs,
  artifacts,
  phaseInfo,
}) => (
  <div ref={boardRef} className={styles.board} style={{ backgroundColor: bgColor }}>
    <div className={styles.header}>
      <div className={styles.playerName}>{playerName.trim() || 'Ник игрока'}</div>
      <div className={styles.bonus}>
        Общий бонус слайма:{' '}
        <span className={styles.accent}>{totalSlimeBonus.toFixed(2)}</span>
      </div>
    </div>

    <EquipmentExport equipment={equipment} />
    <RelicExport relics={relics} layout={relicLayout} />
    <SlimeExport slimes={slimes} layout={slimeLayout} />
    <BuffExport buffs={buffs} phaseInfo={phaseInfo} />
    <ArtifactExport artifacts={artifacts} />
  </div>
);
