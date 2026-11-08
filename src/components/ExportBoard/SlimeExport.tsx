import { SlimeCard } from '../SlimeCard/SlimeCard';
import { fillSlots, type SlotLayoutState } from '../grid/layout';
import type { SlimeData } from '../../models/slime';
import { cx } from '../../utils/classNames';
import { ExportSection } from './ExportSection';
import styles from './ExportBoard.module.css';

interface SlimeExportProps {
  slimes: SlimeData[];
  layout: SlotLayoutState;
}

export const SlimeExport: React.FC<SlimeExportProps> = ({ slimes, layout }) => {
  const rows = Math.max(1, layout.rows);
  const cols = Math.max(1, layout.cols);
  const slots = fillSlots(slimes, layout.entries, rows * cols);

  return (
    <ExportSection>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${cols}, 250px)`,
          gridTemplateRows: `repeat(${rows}, 207px)`,
        }}
      >
        {slots.map((slime, index) =>
          slime ? (
            <div key={`export-slime-${slime.name}`} className={styles.slimeCell}>
              <SlimeCard
                slime={slime}
                width={250}
                onChangeState={() => {}}
                onChangeLevel={() => {}}
              />
            </div>
          ) : (
            <div
              key={`export-slime-empty-${index}`}
              className={cx(styles.slimeCell, styles.emptyCell)}
            />
          ),
        )}
      </div>
    </ExportSection>
  );
};
