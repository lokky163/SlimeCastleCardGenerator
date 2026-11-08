import type { ReactNode } from 'react';
import { cx } from '../../utils/classNames';
import styles from './ExportBoard.module.css';

interface ExportSectionProps {
  title?: ReactNode;
  last?: boolean;
  children: ReactNode;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  title,
  last = false,
  children,
}) => (
  <section className={cx(styles.section, last && styles.lastSection)}>
    {title && <div className={styles.sectionTitle}>{title}</div>}
    {children}
  </section>
);
