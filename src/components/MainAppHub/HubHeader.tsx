import { cx } from '../../utils/classNames';
import type { CardProfile } from '../../hooks/useCardProfile';
import { HeaderActions } from './HeaderActions';
import { TabMenu } from './TabMenu';
import type { AppTab } from './tabs';
import styles from './HubHeader.module.css';

interface HubHeaderProps {
  activeTab: AppTab;
  profile: CardProfile;
  bgColor: string;
  onTabChange: (tab: AppTab) => void;
  onBgColorChange: (color: string) => void;
  onOpenHelp: () => void;
  onExportImage: () => void;
}

export const HubHeader: React.FC<HubHeaderProps> = ({
  activeTab,
  profile,
  bgColor,
  onTabChange,
  onBgColorChange,
  onOpenHelp,
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
          value={profile.playerName}
          onChange={(event) => profile.setPlayerName(event.target.value)}
          placeholder="Ник игрока"
          className={styles.nameInput}
        />

        <button type="button" className={cx(styles.tabBtn, styles.btnReset)} onClick={profile.resetProfile}>
          Сбросить
        </button>
      </div>
    </div>

    <HeaderActions
      bgColor={bgColor}
      onBgColorChange={onBgColorChange}
      onImportFile={profile.importConfigFile}
      onExportConfig={profile.exportConfig}
      onExportImage={onExportImage}
    />
  </header>
);
