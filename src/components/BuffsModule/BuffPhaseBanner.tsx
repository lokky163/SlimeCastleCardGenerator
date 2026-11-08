import styles from './BuffsModule.module.css';

interface BuffPhaseBannerProps {
  phase: number;
  percent: number;
  remainingThrows: { min: number; avg: number; max: number };
}

export const BuffPhaseBanner: React.FC<BuffPhaseBannerProps> = ({
  phase,
  percent,
  remainingThrows,
}) => (
  <div className={styles.phase}>
    <div>
      Перманентные бафы{' '}
      <span className={styles.accent}>
        {phase} фаза: {percent.toFixed(2)}%
      </span>
    </div>

    {percent < 100 && (
      <div className={styles.remaining}>
        Осталось выбить пермачей для закрытия фазы — Мин:{' '}
        <span className={styles.accent}>{remainingThrows.min}</span> | Средне:{' '}
        <span className={styles.accent}>{remainingThrows.avg}</span> | Макс:{' '}
        <span className={styles.accent}>{remainingThrows.max}</span>
      </div>
    )}
  </div>
);
