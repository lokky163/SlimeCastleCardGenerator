import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

interface HeaderControlsProps {
  activeTab: AppTab;
  profile: CardProfile;
  onTabChange: (tab: AppTab) => void;
  onOpenHelp: () => void;
}

const WRAP_TOLERANCE_PX = 8;

/**
 * The header wraps as soon as its height exceeds one row of controls.
 * While collapsed most controls are hidden, so the class is removed for the
 * duration of the measurement to inspect the real expanded layout.
 */
function isHeaderWrapped(header: HTMLElement): boolean {
  const wasCollapsed = header.classList.contains(styles.headerCollapsed);
  if (wasCollapsed) header.classList.remove(styles.headerCollapsed);

  const computed = getComputedStyle(header);
  const verticalPadding =
    Number.parseFloat(computed.paddingTop) +
    Number.parseFloat(computed.paddingBottom);

  let maxControlHeight = 0;
  header.querySelectorAll<HTMLElement>('button, input').forEach((control) => {
    maxControlHeight = Math.max(
      maxControlHeight,
      control.getBoundingClientRect().height,
    );
  });

  const isWrapped =
    maxControlHeight > 0 &&
    header.clientHeight >
      maxControlHeight + verticalPadding + WRAP_TOLERANCE_PX;

  if (wasCollapsed) header.classList.add(styles.headerCollapsed);

  return isWrapped;
}

function useHeaderCollapse() {
  const headerRef = useRef<HTMLElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [canCollapse, setCanCollapse] = useState(false);

  const measure = useCallback(() => {
    const header = headerRef.current;
    if (!header) return;

    const wrapped = isHeaderWrapped(header);
    setCanCollapse(wrapped);
    if (!wrapped) setIsCollapsed(false);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  return {
    headerRef,
    isCollapsed,
    canCollapse,
    toggleCollapsed: () => setIsCollapsed((collapsed) => !collapsed),
  };
}

const HeaderControls: React.FC<HeaderControlsProps> = ({
  activeTab,
  profile,
  onTabChange,
  onOpenHelp,
}) => (
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
);

export const HubHeader: React.FC<HubHeaderProps> = ({
  activeTab,
  profile,
  bgColor,
  onTabChange,
  onBgColorChange,
  onOpenHelp,
  onExportImage,
}) => {
  const { headerRef, isCollapsed, canCollapse, toggleCollapsed } =
    useHeaderCollapse();

  return (
    <header
      ref={headerRef}
      className={cx(styles.header, isCollapsed && styles.headerCollapsed)}
    >
      <HeaderControls
        activeTab={activeTab}
        profile={profile}
        onTabChange={onTabChange}
        onOpenHelp={onOpenHelp}
      />

      <HeaderActions
        bgColor={bgColor}
        onBgColorChange={onBgColorChange}
        onImportFile={profile.importConfigFile}
        onExportConfig={profile.exportConfig}
        onExportImage={onExportImage}
        isCollapsed={isCollapsed}
        showCollapseToggle={canCollapse}
        onToggleCollapsed={toggleCollapsed}
      />
    </header>
  );
};
