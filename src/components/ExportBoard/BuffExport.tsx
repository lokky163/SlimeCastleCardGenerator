import { useI18n } from '../../i18n/I18nProvider';
import { BUFF_CONFIG, splitBuffName, type BuffData } from '../../models/buff';
import type { SlotLayoutState } from '../grid/layout';
import { ExportSection } from './ExportSection';
import { ExportSlotGrid } from './ExportSlotGrid';
import styles from './ExportBoard.module.css';

interface BuffExportProps {
  buffs: BuffData[];
  layout: SlotLayoutState;
  phaseInfo: { phase: number; percent: number };
}

interface BuffExportCardProps {
  buff: BuffData;
}

const BuffExportCard: React.FC<BuffExportCardProps> = ({ buff }) => {
  const { t } = useI18n();
  const nameLines = splitBuffName(t(buff.cleanName));

  return (
    <div className={styles.buffCard}>
      <img
        src={buff.imageUrl}
        alt=""
        style={{
          width: `${BUFF_CONFIG.export.iconSize}px`,
          height: `${BUFF_CONFIG.export.iconSize}px`,
          marginBottom: '6px',
        }}
      />
      <div className={styles.buffText}>
        {nameLines.map((line, index) => (
          <div
            key={index}
            className={styles.buffTitleLine}
            style={{ fontSize: `${BUFF_CONFIG.export.titleFontSize}px` }}
          >
            {line}
          </div>
        ))}
        <div
          className={styles.buffValue}
          style={{ fontSize: `${BUFF_CONFIG.export.valueFontSize}px` }}
        >
          {buff.value}
        </div>
      </div>
    </div>
  );
};

export const BuffExport: React.FC<BuffExportProps> = ({
  buffs,
  layout,
  phaseInfo,
}) => {
  const { t } = useI18n();

  return (
    <ExportSection
      title={
        <>
          {t('Permanent buffs')}{' '}
          <span className={styles.accent}>
            {t('Phase {phase}: {percent}%', {
              phase: phaseInfo.phase,
              percent: phaseInfo.percent.toFixed(0),
            })}
          </span>
        </>
      }
    >
      <ExportSlotGrid
        items={buffs}
        layout={layout}
        cellWidth={BUFF_CONFIG.export.cardWidth}
        cellHeight={BUFF_CONFIG.export.cardHeight}
        cellClassName={styles.buffCell}
        renderItem={(buff) => <BuffExportCard buff={buff} />}
      />
    </ExportSection>
  );
};
