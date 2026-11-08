import { cx } from '../../../utils/classNames';
import styles from './ComposedImage.module.css';

interface ComposedImageProps {
  src: string;
  alt: string;
  aspectRatio: string;
  grayscale?: boolean;
  className?: string;
}

export const ComposedImage: React.FC<ComposedImageProps> = ({
  src,
  alt,
  aspectRatio,
  grayscale = false,
  className,
}) => {
  if (!src) {
    return (
      <div className={cx(styles.placeholder, className)} style={{ aspectRatio }} />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cx(styles.image, grayscale && styles.grayedOut, className)}
    />
  );
};
