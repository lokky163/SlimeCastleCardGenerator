import { useRef, useState } from 'react';
import { cx } from '../../utils/classNames';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';
import { TAB_LABELS, TAB_ORDER, type AppTab } from './tabs';
import styles from './HubHeader.module.css';

const BG_PRESETS = ['#9A6E3F', '#16213e', '#1a1a2e'];

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
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabSelect = (tab: AppTab) => {
    onTabChange(tab);
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.leftGroup}>
        <div className={styles.tabContainer}>
          <div className={styles.tabMenuWrap} ref={tabsRef}>
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
              anchorRef={tabsRef}
              placement="dropdown"
              className={styles.tabMenu}
            >
              {TAB_ORDER.map((tab) => (
                <MenuOption
                  key={tab}
                  selected={activeTab === tab}
                  align="start"
                  className={cx(styles.tabOption, activeTab === tab && styles.tabOptionActive)}
                  onClick={() => handleTabSelect(tab)}
                >
                  {TAB_LABELS[tab]}
                </MenuOption>
              ))}
            </PopupMenu>
          </div>

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

      <div className={styles.toolsContainer}>
        <div className={styles.pickerBlock}>
          <span className={styles.pickerLabel}>Фон PNG:</span>
          <div className={styles.swatches}>
            {BG_PRESETS.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                className={cx(styles.swatch, bgColor === color && styles.swatchActive)}
                style={{ backgroundColor: color }}
                onClick={() => onBgColorChange(color)}
              />
            ))}
          </div>
          <input
            type="color"
            value={bgColor}
            onChange={(event) => onBgColorChange(event.target.value)}
            className={styles.colorInput}
            title="Выбрать свой цвет"
          />
        </div>

        <button
          type="button"
          className={cx(styles.actionBtn, styles.btnImport)}
          onClick={() => fileInputRef.current?.click()}
        >
          Загрузить схему
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(event) => {
            onImportFile(event);
            event.target.value = '';
          }}
          accept=".json"
          className={styles.fileInput}
        />
        <button
          type="button"
          className={cx(styles.actionBtn, styles.btnExport)}
          onClick={onExportConfig}
        >
          Сохранить схему
        </button>
        <button
          type="button"
          className={cx(styles.actionBtn, styles.btnPng)}
          onClick={onExportImage}
        >
          Сохранить изображение
        </button>
      </div>
    </header>
  );
};
