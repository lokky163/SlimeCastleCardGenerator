import styles from './ModulePanel.module.css';

interface ModulePanelProps {
  children: React.ReactNode;
}

export const ModulePanel: React.FC<ModulePanelProps> = ({ children }) => (
  <div className={styles.panel}>{children}</div>
);
