import type { ArtifactData } from '../../models/artifact';
import { getArtifactStarImages } from '../../models/artifact';
import type { SlotLayoutState } from '../grid/layout';
import { cx } from '../../utils/classNames';
import { StarRating } from '../ui/StarRating/StarRating';
import { ExportSection } from './ExportSection';
import { ExportSlotGrid } from './ExportSlotGrid';
import styles from './ExportBoard.module.css';

interface ArtifactExportProps {
  artifacts: ArtifactData[];
  layout: SlotLayoutState;
}

const ArtifactExportCard: React.FC<{ artifact: ArtifactData }> = ({ artifact }) => (
  <div className={styles.artifactCard}>
    <img
      src={artifact.imageUrl}
      alt=""
      className={cx(styles.artifactImage, artifact.isBlackAndWhite && styles.grayedOut)}
    />
    <div className={styles.artifactStars}>
      <StarRating stars={getArtifactStarImages(artifact.state)} size={48} />
    </div>
    <div className={styles.artifactFragments}>{artifact.fragmentsText}</div>
    <div className={cx(styles.artifactLevel, artifact.isBlackAndWhite && styles.muted)}>
      Lv.{artifact.level}
    </div>
  </div>
);

export const ArtifactExport: React.FC<ArtifactExportProps> = ({
  artifacts,
  layout,
}) => (
  <ExportSection last>
    <ExportSlotGrid
      items={artifacts}
      layout={layout}
      cellWidth={350}
      cellHeight={450}
      cellClassName={styles.artifactCell}
      renderItem={(artifact) => <ArtifactExportCard artifact={artifact} />}
    />
  </ExportSection>
);
