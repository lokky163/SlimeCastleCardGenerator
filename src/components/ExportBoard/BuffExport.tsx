import { BUFF_CONFIG, splitBuffName, type BuffData } from '../../models/buff';
import { ExportSection } from './ExportSection';
import styles from './ExportBoard.module.css';

interface BuffExportProps {
  buffs: BuffData[];
  phaseInfo: { phase: number; percent: number };
}

interface BuffExportCardProps {
  buff: BuffData;
}

const BuffExportCard: React.FC<BuffExportCardProps> = ({ buff }) => {
  const nameLines = splitBuffName(buff.cleanName);

  return (
    <div
      className={styles.buffCard}
      style={{
        width: `${BUFF_CONFIG.export.cardWidth}px`,
        height: `${BUFF_CONFIG.export.cardHeight}px`,
      }}
    >
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

export const BuffExport: React.FC<BuffExportProps> = ({ buffs, phaseInfo }) => (
  <ExportSection
    title={
      <>
        Перманентные бафы{' '}
        <span className={styles.accent}>
          {phaseInfo.phase} фаза: {phaseInfo.percent.toFixed(0)}%
        </span>
      </>
    }
  >
    <div
      className={styles.buffGrid}
      style={{
        gridTemplateColumns: `repeat(${BUFF_CONFIG.export.cols}, ${BUFF_CONFIG.export.cardWidth}px)`,
      }}
    >
      {buffs.map((buff) => (
        <BuffExportCard key={`export-buff-${buff.type}`} buff={buff} />
      ))}
    </div>
  </ExportSection>
);
