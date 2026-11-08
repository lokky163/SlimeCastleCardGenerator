import { useRef, useState } from 'react';
import {
  getArtifactStarImages,
  type ArtifactData,
  type ArtifactState,
} from '../../models/artifact';
import { cx } from '../../utils/classNames';
import { StarRating } from '../ui/StarRating/StarRating';
import { ArtifactStateMenu } from './ArtifactStateMenu';
import styles from './ArtifactCard.module.css';

interface ArtifactCardProps {
  artifact: ArtifactData;
  onChangeState: (state: ArtifactState) => void;
  onChangeFragments: (fragments: number) => void;
  onChangeLevel: (level: number) => void;
}

const parseNumber = (raw: string, fallback: number) => {
  const parsed = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onChangeState,
  onChangeFragments,
  onChangeLevel,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLDivElement>(null);

  const handleStateChange = (state: ArtifactState) => {
    onChangeState(state);
    setIsMenuOpen(false);
  };

  const stars = getArtifactStarImages(artifact.state);

  return (
    <div className={styles.card}>
      <img
        src={artifact.imageUrl}
        alt={artifact.cleanName}
        className={cx(styles.image, artifact.isBlackAndWhite && styles.grayedOut)}
      />

      <div className={styles.name}>{artifact.cleanName}</div>

      <div ref={menuAnchorRef} className={styles.starsArea}>
        <button
          type="button"
          className={styles.starsButton}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {artifact.state === 'no' && <span className={styles.noStars}>Нет</span>}
          {artifact.state === '0' && <span className={styles.zeroStars}>0 ★</span>}
          {stars.length > 0 && <StarRating stars={stars} size={16} />}
        </button>

        <ArtifactStateMenu
          open={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          anchorRef={menuAnchorRef}
          state={artifact.state}
          onChange={handleStateChange}
        />
      </div>

      <div className={styles.fragmentsRow}>
        {artifact.state !== '5y' && (
          <>
            <input
              type="text"
              className={cx(styles.input, styles.fragmentsValue)}
              value={artifact.fragments === 0 ? '' : artifact.fragments}
              onChange={(event) => onChangeFragments(parseNumber(event.target.value, 0))}
              placeholder="0"
            />
            <span className={styles.separator}>/</span>
          </>
        )}
        <div className={cx(styles.input, styles.limit)}>
          {artifact.state === '5y' ? 'max' : artifact.maxFragments}
        </div>
      </div>

      <div className={styles.levelRow}>
        <span
          className={cx(
            styles.levelLabel,
            artifact.isBlackAndWhite && styles.levelLabelDisabled,
          )}
        >
          Lv.
        </span>
        <input
          type="text"
          className={cx(styles.input, artifact.isBlackAndWhite && styles.disabled)}
          value={artifact.level}
          onChange={(event) => onChangeLevel(parseNumber(event.target.value, 1))}
          disabled={artifact.isBlackAndWhite}
        />
      </div>
    </div>
  );
};
