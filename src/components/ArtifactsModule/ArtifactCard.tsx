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

interface ArtifactStarsProps {
  state: ArtifactState;
  onChangeState: (state: ArtifactState) => void;
}

interface ArtifactFieldProps {
  artifact: ArtifactData;
  onChange: (value: number) => void;
}

const parseNumber = (raw: string, fallback: number) => {
  const parsed = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const ArtifactStars: React.FC<ArtifactStarsProps> = ({ state, onChangeState }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLDivElement>(null);
  const stars = getArtifactStarImages(state);

  const handleStateChange = (nextState: ArtifactState) => {
    onChangeState(nextState);
    setIsMenuOpen(false);
  };

  return (
    <div ref={menuAnchorRef} className={styles.starsArea}>
      <button
        type="button"
        className={styles.starsButton}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {state === 'no' && <span className={styles.noStars}>Нет</span>}
        {state === '0' && <span className={styles.zeroStars}>0 ★</span>}
        {stars.length > 0 && <StarRating stars={stars} size={16} />}
      </button>

      <ArtifactStateMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={menuAnchorRef}
        state={state}
        onChange={handleStateChange}
      />
    </div>
  );
};

const ArtifactFragmentsRow: React.FC<ArtifactFieldProps> = ({ artifact, onChange }) => (
  <div className={styles.fragmentsRow}>
    {artifact.state !== '5y' && (
      <>
        <input
          type="text"
          className={cx(styles.input, styles.fragmentsValue)}
          value={artifact.fragments === 0 ? '' : artifact.fragments}
          onChange={(event) => onChange(parseNumber(event.target.value, 0))}
          placeholder="0"
        />
        <span className={styles.separator}>/</span>
      </>
    )}
    <div className={cx(styles.input, styles.limit)}>
      {artifact.state === '5y' ? 'max' : artifact.maxFragments}
    </div>
  </div>
);

const ArtifactLevelRow: React.FC<ArtifactFieldProps> = ({ artifact, onChange }) => (
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
      onChange={(event) => onChange(parseNumber(event.target.value, 1))}
      disabled={artifact.isBlackAndWhite}
    />
  </div>
);

export const ArtifactCard: React.FC<ArtifactCardProps> = ({
  artifact,
  onChangeState,
  onChangeFragments,
  onChangeLevel,
}) => (
  <div className={styles.card}>
    <img
      src={artifact.imageUrl}
      alt={artifact.cleanName}
      className={cx(styles.image, artifact.isBlackAndWhite && styles.grayedOut)}
    />

    <div className={styles.name}>{artifact.cleanName}</div>

    <ArtifactStars state={artifact.state} onChangeState={onChangeState} />
    <ArtifactFragmentsRow artifact={artifact} onChange={onChangeFragments} />
    <ArtifactLevelRow artifact={artifact} onChange={onChangeLevel} />
  </div>
);
