import { ComposedImage } from '../ui/ComposedImage/ComposedImage';
import type { SlimeData } from '../../models/slime';
import {
  useSlimeImage,
  useSlimeInteractions,
  type SlimeCardHandlers,
} from './useSlimeCard';
import { SLIME_IMAGE_HEIGHT, SLIME_IMAGE_WIDTH } from './drawSlimeImage';
import { SlimeLevelEditor } from './SlimeLevelEditor';
import { SlimeStateMenu } from './SlimeStateMenu';
import styles from './SlimeCard.module.css';

interface SlimeCardProps extends SlimeCardHandlers {
  slime: SlimeData;
  width?: number;
}

interface SlimeCardViewProps extends SlimeCardHandlers {
  slime: SlimeData;
  width: number;
  imageSrc: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  isMenuOpen: boolean;
  isEditingLevel: boolean;
  onCardClick: React.MouseEventHandler<HTMLDivElement>;
  onCloseMenu: () => void;
  onCancelLevelEdit: () => void;
}

const SlimeCardView: React.FC<SlimeCardViewProps> = ({
  slime,
  width,
  imageSrc,
  cardRef,
  isMenuOpen,
  isEditingLevel,
  onCardClick,
  onChangeState,
  onChangeLevel,
  onCloseMenu,
  onCancelLevelEdit,
}) => (
  <div
    ref={cardRef}
    className={styles.cardContainer}
    onClick={onCardClick}
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
        onCommit={onChangeLevel}
        onCancel={onCancelLevelEdit}
      />
    )}

    <SlimeStateMenu
      open={isMenuOpen}
      onClose={onCloseMenu}
      anchorRef={cardRef}
      state={slime.state}
      cardWidth={width}
      onChange={onChangeState}
    />
  </div>
);

export const SlimeCard: React.FC<SlimeCardProps> = ({
  slime,
  width = 333,
  onChangeState,
  onChangeLevel,
  onChangeSkin = () => {},
}) => {
  const interactions = useSlimeInteractions(slime, {
    onChangeState,
    onChangeLevel,
    onChangeSkin,
  });
  const imageSrc = useSlimeImage(slime, interactions.isEditingLevel);

  return (
    <SlimeCardView
      slime={slime}
      width={width}
      imageSrc={imageSrc}
      cardRef={interactions.cardRef}
      isMenuOpen={interactions.isMenuOpen}
      isEditingLevel={interactions.isEditingLevel}
      onCardClick={interactions.handleCardClick}
      onChangeState={interactions.handleStateChange}
      onChangeLevel={interactions.handleLevelCommit}
      onCloseMenu={interactions.closeMenu}
      onCancelLevelEdit={interactions.cancelLevelEdit}
    />
  );
};
