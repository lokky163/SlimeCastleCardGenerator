import { useI18n } from '../../i18n/I18nProvider';
import type { PhaseProgress } from '../../utils/buffProgress';
import styles from './BuffsModule.module.css';

interface BuffPhaseBannerProps {
  phaseOne: PhaseProgress;
  phaseTwo: PhaseProgress;
}

interface PhaseRowProps {
  title: string;
  progress: PhaseProgress;
}

const PhaseRow: React.FC<PhaseRowProps> = ({ title, progress }) => (
  <div className={styles.phaseRow}>
    <span className={styles.phaseLabel}>
      {title}:{' '}
      <span className={styles.accent}>{progress.percent.toFixed(2)}%</span>
    </span>

    <span className={styles.remaining}>
      — {progress.remaining.min} / {progress.remaining.avg} /{' '}
      {progress.remaining.max}
    </span>
  </div>
);

export const BuffPhaseBanner: React.FC<BuffPhaseBannerProps> = ({
  phaseOne,
  phaseTwo,
}) => {
  const { t } = useI18n();

  return (
    <div className={styles.phase}>
      <div className={styles.phaseHeader}>
        <span className={styles.phaseLegend}>
          {t('Permanent buffs left: Min / Avg / Max')}
        </span>
      </div>

      <PhaseRow title={t('Phase 1')} progress={phaseOne} />
      <PhaseRow title={t('Phase 2')} progress={phaseTwo} />
    </div>
  );
};
