import { SlimeCard } from '../SlimeCard/SlimeCard';
import type { SlotLayoutState } from '../grid/layout';
import type { SlimeData } from '../../models/slime';
import { ExportSection } from './ExportSection';
import { ExportSlotGrid } from './ExportSlotGrid';
import styles from './ExportBoard.module.css';

interface SlimeExportProps {
  slimes: SlimeData[];
  layout: SlotLayoutState;
}

export const SlimeExport: React.FC<SlimeExportProps> = ({ slimes, layout }) => (
  <ExportSection>
    <ExportSlotGrid
      items={slimes}
      layout={layout}
      cellWidth={250}
      cellHeight={207}
      cellClassName={styles.slimeCell}
      renderItem={(slime) => (
        <SlimeCard
          slime={slime}
          width={250}
          onChangeState={() => {}}
          onChangeLevel={() => {}}
        />
      )}
    />
  </ExportSection>
);
