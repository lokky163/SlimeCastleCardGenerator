import { useRef, useState } from 'react';
import type { SlimeData, SlimeState } from '../../models/slime';
import { useComposedImage } from '../../hooks/useComposedImage';
import { ComposedImage } from '../ui/ComposedImage/ComposedImage';
import { drawSlimeImage, SLIME_IMAGE_HEIGHT, SLIME_IMAGE_WIDTH, slimeImageKey } from './drawSlimeImage';
import { SlimeLevelEditor } from './SlimeLevelEditor';
import { SlimeStateMenu } from './SlimeStateMenu';
import styles from './SlimeCard.module.css';

interface SlimeCardProps {
  slime: SlimeData;
  width?: number;
  onChangeState: (newState: SlimeState) => void;
  onChangeLevel: (newLevel: number) => void;
  onChangeSkin?: (newSkin: number) => void;
}

export const SlimeCard: React.FC<SlimeCardProps> = ({
  slime,
  width = 333,
  onChangeState,
  onChangeLevel,
  onChangeSkin = () => {},
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const imageSrc = useComposedImage(
    slimeImageKey(slime, isEditingLevel),
    SLIME_IMAGE_WIDTH,
    SLIME_IMAGE_HEIGHT,
    (ctx) => drawSlimeImage(ctx, slime, isEditingLevel),
  );

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isEditingLevel) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickRatio = (event.clientY - rect.top) / rect.height;

    if (clickRatio <= 60 / SLIME_IMAGE_HEIGHT) {
      if (slime.state === 'no') return;
      setIsMenuOpen(false);
      setIsEditingLevel(true);
      return;
    }

    if (clickRatio >= 200 / SLIME_IMAGE_HEIGHT) {
      setIsMenuOpen((open) => !open);
      return;
    }

    setIsMenuOpen(false);
    if (slime.state !== 'no') onChangeSkin(slime.skin);
  };

  const handleStateChange = (nextState: SlimeState) => {
    onChangeState(nextState);
    setIsMenuOpen(false);
  };

  const handleLevelCommit = (nextLevel: number) => {
    onChangeLevel(nextLevel);
    setIsEditingLevel(false);
  };

  return (
    <div
      ref={cardRef}
      className={styles.cardContainer}
      onClick={handleCardClick}
      style={{ width: `${width}px` }}
    >
      <ComposedImage
        src={imageSrc}
        alt={slime.cleanName}
        aspectRatio={`${SLIME_IMAGE_WIDTH} / ${SLIME_IMAGE_HEIGHT}`}
        grayscale={slime.isBlackAndWhite}
        className={styles.artwork}
      />

      {isEditingLevel && (
        <SlimeLevelEditor
          level={slime.level}
          onCommit={handleLevelCommit}
          onCancel={() => setIsEditingLevel(false)}
        />
      )}

      <SlimeStateMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={cardRef}
        state={slime.state}
        cardWidth={width}
        onChange={handleStateChange}
      />
    </div>
  );
};
