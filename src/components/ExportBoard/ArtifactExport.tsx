import type { ArtifactData } from '../../models/artifact';
import { getArtifactStarImages } from '../../models/artifact';
import { cx } from '../../utils/classNames';
import { StarRating } from '../ui/StarRating/StarRating';
import { ExportSection } from './ExportSection';
import styles from './ExportBoard.module.css';

interface ArtifactExportProps {
  artifacts: ArtifactData[];
}

export const ArtifactExport: React.FC<ArtifactExportProps> = ({ artifacts }) => (
  <ExportSection last>
    <div className={styles.artifactGrid}>
      {artifacts.map((artifact) => (
        <div key={`export-artifact-${artifact.name}`} className={styles.artifactCard}>
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
      ))}
    </div>
  </ExportSection>
);
