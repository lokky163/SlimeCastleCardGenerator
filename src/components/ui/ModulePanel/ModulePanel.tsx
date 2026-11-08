import { cx } from '../../../utils/classNames';
import styles from './ModulePanel.module.css';

interface ModulePanelProps {
  className?: string;
  children: React.ReactNode;
}

export const ModulePanel: React.FC<ModulePanelProps> = ({ className, children }) => (
  <div className={cx(styles.panel, className)}>{children}</div>
);
