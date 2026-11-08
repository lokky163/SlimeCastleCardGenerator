import { cx } from '../../utils/classNames';
import { HeaderActions } from './HeaderActions';
import { TabMenu } from './TabMenu';
import type { AppTab } from './tabs';
import styles from './HubHeader.module.css';

interface HubHeaderProps {
  activeTab: AppTab;
  playerName: string;
  bgColor: string;
  onTabChange: (tab: AppTab) => void;
  onPlayerNameChange: (name: string) => void;
  onBgColorChange: (color: string) => void;
  onOpenHelp: () => void;
  onReset: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportConfig: () => void;
  onExportImage: () => void;
}

export const HubHeader: React.FC<HubHeaderProps> = ({
  activeTab,
  playerName,
  bgColor,
  onTabChange,
  onPlayerNameChange,
  onBgColorChange,
  onOpenHelp,
  onReset,
  onImportFile,
  onExportConfig,
  onExportImage,
}) => (
  <header className={styles.header}>
    <div className={styles.leftGroup}>
      <div className={styles.tabContainer}>
        <TabMenu activeTab={activeTab} onTabChange={onTabChange} />

        <button type="button" className={cx(styles.tabBtn, styles.btnHelp)} onClick={onOpenHelp}>
          Справка
        </button>

        <input
          type="text"
          value={playerName}
          onChange={(event) => onPlayerNameChange(event.target.value)}
          placeholder="Ник игрока"
          className={styles.nameInput}
        />

        <button type="button" className={cx(styles.tabBtn, styles.btnReset)} onClick={onReset}>
          Сбросить
        </button>
      </div>
    </div>

    <HeaderActions
      bgColor={bgColor}
      onBgColorChange={onBgColorChange}
      onImportFile={onImportFile}
      onExportConfig={onExportConfig}
      onExportImage={onExportImage}
    />
  </header>
);
