import type { CSSProperties } from 'react';
import { cx } from '../../../utils/classNames';
import styles from './StarRating.module.css';

interface StarRatingProps {
  stars: string[];
  size?: number;
  gap?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  stars,
  size = 16,
  gap = 3,
  className,
}) => {
  const style = {
    '--star-size': `${size}px`,
    '--star-gap': `${gap}px`,
  } as CSSProperties;

  return (
    <span className={cx(styles.row, className)} style={style}>
      {stars.map((src, index) => (
        <img key={`${src}-${index}`} src={src} alt="" className={styles.star} />
      ))}
    </span>
  );
};
