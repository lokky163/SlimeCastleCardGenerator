import { useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import {
  LANGUAGES,
  getLanguage,
  type LanguageFlag,
} from '../../services/Language';
import { MenuOption } from '../ui/MenuOption/MenuOption';
import { PopupMenu } from '../ui/PopupMenu/PopupMenu';
import styles from './LanguageToggle.module.css';

const RussianFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 16"
    role="img"
    aria-hidden="true"
  >
    <rect width="24" height="16" fill="#ffffff" />
    <rect width="24" height="5.34" y="5.33" fill="#0039a6" />
    <rect width="24" height="5.34" y="10.66" fill="#d52b1e" />
  </svg>
);

const BritishFlag: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 60 30"
    role="img"
    aria-hidden="true"
  >
    <rect width="60" height="30" fill="#012169" />
    <path d="M0 0 L60 30 M60 0 L0 30" stroke="#ffffff" strokeWidth="6" />
    <path d="M0 0 L60 30 M60 0 L0 30" stroke="#c8102e" strokeWidth="3" />
    <path d="M30 0 V30 M0 15 H60" stroke="#ffffff" strokeWidth="10" />
    <path d="M30 0 V30 M0 15 H60" stroke="#c8102e" strokeWidth="6" />
  </svg>
);

const Flag: React.FC<{ flag: LanguageFlag; className?: string }> = ({
  flag,
  className,
}) =>
  flag === 'ru' ? (
    <RussianFlag className={className} />
  ) : (
    <BritishFlag className={className} />
  );

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const current = getLanguage(language);

  const handleSelect = (next: (typeof LANGUAGES)[number]) => {
    setLanguage(next.id);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrap} ref={anchorRef}>
      <button
        type="button"
        className={styles.toggle}
        aria-label={t('Change language')}
        title={t('Change language')}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Flag flag={current.flag} className={styles.flag} />
      </button>

      <PopupMenu
        open={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={anchorRef}
        placement="dropdown"
        className={styles.menu}
      >
        {LANGUAGES.map((item) => (
          <MenuOption
            key={item.id}
            selected={item.id === language}
            align="start"
            className={styles.option}
            aria-pressed={item.id === language}
            onClick={() => handleSelect(item)}
          >
            <Flag flag={item.flag} className={styles.optionFlag} />
            <span>{item.nativeName}</span>
          </MenuOption>
        ))}
      </PopupMenu>
    </div>
  );
};
