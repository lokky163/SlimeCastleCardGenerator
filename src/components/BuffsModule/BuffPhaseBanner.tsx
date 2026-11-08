import type { PhaseProgress } from '../../utils/buffProgress';
import styles from './BuffsModule.module.css';

interface BuffPhaseBannerProps {
  phaseOne: PhaseProgress;
  phaseTwo: PhaseProgress;
}

interface PhaseRowProps {
  title: string;
  closeLabel: string;
  progress: PhaseProgress;
}

const PhaseRow: React.FC<PhaseRowProps> = ({ title, closeLabel, progress }) => (
  <div className={styles.phaseRow}>
    <span className={styles.phaseLabel}>
      {title}:{' '}
      <span className={styles.accent}>{progress.percent.toFixed(2)}%</span>
    </span>

    <span className={styles.remaining}>
      Осталось пермачей до закрытия {closeLabel} — Мин:{' '}
      <span className={styles.accent}>{progress.remaining.min}</span> | Средне:{' '}
      <span className={styles.accent}>{progress.remaining.avg}</span> | Макс:{' '}
      <span className={styles.accent}>{progress.remaining.max}</span>
    </span>
  </div>
);

export const BuffPhaseBanner: React.FC<BuffPhaseBannerProps> = ({
  phaseOne,
  phaseTwo,
}) => (
  <div className={styles.phase}>
    <div className={styles.phaseTitle}>Перманентные бафы</div>

    <PhaseRow title="1 фаза" closeLabel="1 фазы" progress={phaseOne} />
    <PhaseRow title="2 фаза" closeLabel="2 фазы" progress={phaseTwo} />
  </div>
);
