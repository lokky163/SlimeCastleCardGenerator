import { RelicCard } from '../RelicCard';
import type { SlotLayoutState } from '../grid/layout';
import type { RelicData } from '../../models/relic';
import { ExportSection } from './ExportSection';
import { ExportSlotGrid } from './ExportSlotGrid';
import styles from './ExportBoard.module.css';

interface RelicExportProps {
  relics: RelicData[];
  layout: SlotLayoutState;
}

export const RelicExport: React.FC<RelicExportProps> = ({ relics, layout }) => (
  <ExportSection>
    <ExportSlotGrid
      items={relics}
      layout={layout}
      cellWidth={228}
      cellHeight={349}
      cellClassName={styles.relicCell}
      renderItem={(relic) => (
        <RelicCard
          name={relic.name}
          imageUrl={relic.imageUrl}
          state={relic.state}
          onChangeState={() => {}}
        />
      )}
    />
  </ExportSection>
);
