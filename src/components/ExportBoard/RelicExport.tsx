import { RelicCard } from '../RelicCard';
import { fillSlots, type SlotLayoutState } from '../grid/layout';
import type { RelicData } from '../../models/relic';
import { cx } from '../../utils/classNames';
import { ExportSection } from './ExportSection';
import styles from './ExportBoard.module.css';

interface RelicExportProps {
  relics: RelicData[];
  layout: SlotLayoutState;
}

export const RelicExport: React.FC<RelicExportProps> = ({ relics, layout }) => {
  const rows = Math.max(1, layout.rows);
  const cols = Math.max(1, layout.cols);
  const slots = fillSlots(relics, layout.entries, rows * cols);

  return (
    <ExportSection>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${cols}, 228px)`,
          gridTemplateRows: `repeat(${rows}, 349px)`,
        }}
      >
        {slots.map((relic, index) =>
          relic ? (
            <div key={`export-relic-${relic.name}`} className={styles.relicCell}>
              <RelicCard
                imageUrl={relic.imageUrl}
                state={relic.state}
                onChangeState={() => {}}
              />
            </div>
          ) : (
            <div
              key={`export-relic-empty-${index}`}
              className={cx(styles.relicCell, styles.emptyCell)}
            />
          ),
        )}
      </div>
    </ExportSection>
  );
};
