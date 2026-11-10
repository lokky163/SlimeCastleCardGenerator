import { useRef, useState } from 'react';
import type { RelicState } from '../../models/relic';
import { useI18n } from '../../i18n/I18nProvider';
import { useComposedImage } from '../../hooks/useComposedImage';
import { ComposedImage } from '../ui/ComposedImage/ComposedImage';
import { drawRelicImage, relicImageKey, RELIC_IMAGE_HEIGHT, RELIC_IMAGE_WIDTH } from './drawRelicImage';
import { RelicStateMenu } from './RelicStateMenu';
import styles from './RelicCard.module.css';

interface RelicCardProps {
  name: string;
  imageUrl: string;
  state: RelicState;
  onChangeState: (newState: RelicState) => void;
}

export const RelicCard: React.FC<RelicCardProps> = ({
  name,
  imageUrl,
  state,
  onChangeState,
}) => {
  const { t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const displayName = t(name);

  const imageSrc = useComposedImage(
    relicImageKey(imageUrl, state, displayName),
    RELIC_IMAGE_WIDTH,
    RELIC_IMAGE_HEIGHT,
    (ctx) => drawRelicImage(ctx, imageUrl, state, displayName),
  );

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickY = event.clientY - rect.top;

    if (clickY >= rect.height * 0.8) {
      setIsMenuOpen((open) => !open);
    }
  };

  const handleSelectState = (nextState: RelicState) => {
    onChangeState(nextState);
    setIsMenuOpen(false);
  };

  return (
    <div ref={cardRef} className={styles.cardContainer} onClick={handleCardClick}>
      <ComposedImage
        src={imageSrc}
        alt={displayName}
        aspectRatio={`${RELIC_IMAGE_WIDTH} / ${RELIC_IMAGE_HEIGHT}`}
        className={styles.artwork}
      />

      <RelicStateMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={cardRef}
        state={state}
        onChange={handleSelectState}
      />
    </div>
  );
};
