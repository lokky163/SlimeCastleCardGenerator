import type { RefObject } from 'react';
import type { ArtifactData } from '../../models/artifact';
import type { BuffData } from '../../models/buff';
import type { EquipmentData } from '../../models/equipment';
import type { RelicData } from '../../models/relic';
import type { SlimeData } from '../../models/slime';
import type { ExportSelection } from '../../models/exportSelection';
import { useI18n } from '../../i18n/I18nProvider';
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
  equipmentLayout: SlotLayoutState;
  relics: RelicData[];
  relicLayout: SlotLayoutState;
  slimes: SlimeData[];
  slimeLayout: SlotLayoutState;
  buffs: BuffData[];
  buffLayout: SlotLayoutState;
  artifacts: ArtifactData[];
  artifactLayout: SlotLayoutState;
  phaseInfo: { phase: number; percent: number };
  selection: ExportSelection;
}

export const ExportBoard: React.FC<ExportBoardProps> = ({
  boardRef,
  playerName,
  bgColor,
  totalSlimeBonus,
  equipment,
  equipmentLayout,
  relics,
  relicLayout,
  slimes,
  slimeLayout,
  buffs,
  buffLayout,
  artifacts,
  artifactLayout,
  phaseInfo,
  selection,
}) => {
  const { t } = useI18n();

  return (
    <div ref={boardRef} className={styles.board} style={{ backgroundColor: bgColor }}>
      {selection.header && (
        <div className={styles.header}>
          <div className={styles.playerName}>
            {playerName.trim() || t('Player name')}
          </div>
          <div className={styles.bonus}>
            {t('Total slime bonus:')}{' '}
            <span className={styles.accent}>{totalSlimeBonus.toFixed(2)}</span>
          </div>
        </div>
      )}

      {selection.equipment && (
        <EquipmentExport equipment={equipment} layout={equipmentLayout} />
      )}
      {selection.relics && <RelicExport relics={relics} layout={relicLayout} />}
      {selection.slimes && <SlimeExport slimes={slimes} layout={slimeLayout} />}
      {selection.buffs && (
        <BuffExport buffs={buffs} layout={buffLayout} phaseInfo={phaseInfo} />
      )}
      {selection.artifacts && (
        <ArtifactExport artifacts={artifacts} layout={artifactLayout} />
      )}
    </div>
  );
};
