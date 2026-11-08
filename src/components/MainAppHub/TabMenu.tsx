import { useRef, useState } from 'react';
import { cx } from '../../utils/classNames';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';
import { TAB_LABELS, TAB_ORDER, type AppTab } from './tabs';
import styles from './HubHeader.module.css';

interface TabMenuProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const TabMenu: React.FC<TabMenuProps> = ({ activeTab, onTabChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuAnchorRef = useRef<HTMLDivElement>(null);

  const handleSelect = (tab: AppTab) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <div className={styles.tabMenuWrap} ref={menuAnchorRef}>
      <button
        type="button"
        className={cx(styles.tabBtn, styles.dropdownToggle)}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {TAB_LABELS[activeTab]}
        <span className={cx(styles.arrow, isMenuOpen && styles.arrowUp)} />
      </button>

      <PopupMenu
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        anchorRef={menuAnchorRef}
        placement="dropdown"
        className={styles.tabMenu}
      >
        {TAB_ORDER.map((tab) => (
          <MenuOption
            key={tab}
            selected={activeTab === tab}
            align="start"
            className={cx(styles.tabOption, activeTab === tab && styles.tabOptionActive)}
            onClick={() => handleSelect(tab)}
          >
            {TAB_LABELS[tab]}
          </MenuOption>
        ))}
      </PopupMenu>
    </div>
  );
};
