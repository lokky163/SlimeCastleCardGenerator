import starYellow from '../../assets/artifacts/yellow.png';
import type { ArtifactData } from '../../models/artifact';
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
      {artifacts.map((artifact) => {
        const activeStars =
          artifact.state === 'no' || artifact.state === '0'
            ? []
            : Array(parseInt(artifact.state, 10)).fill(starYellow);

        return (
          <div key={`export-artifact-${artifact.name}`} className={styles.artifactCard}>
            <img
              src={artifact.imageUrl}
              alt=""
              className={cx(styles.artifactImage, artifact.isBlackAndWhite && styles.grayedOut)}
            />
            <div className={styles.artifactStars}>
              <StarRating stars={activeStars} size={48} />
            </div>
            <div className={styles.artifactFragments}>{artifact.fragmentsText}</div>
            <div className={cx(styles.artifactLevel, artifact.isBlackAndWhite && styles.muted)}>
              Lv.{artifact.level}
            </div>
          </div>
        );
      })}
    </div>
  </ExportSection>
);
