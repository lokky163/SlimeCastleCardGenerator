import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import styles from './SlimeLevelEditor.module.css';

interface SlimeLevelEditorProps {
  level: number;
  onCommit: (level: number) => void;
  onCancel: () => void;
}

export const SlimeLevelEditor: React.FC<SlimeLevelEditorProps> = ({
  level,
  onCommit,
  onCancel,
}) => {
  const { t } = useI18n();
  const [tempLevel, setTempLevel] = useState(level.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const commit = () => {
    const parsed = parseInt(tempLevel, 10);
    if (Number.isNaN(parsed)) onCancel();
    else onCommit(parsed);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') commit();
    if (event.key === 'Escape') onCancel();
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.prefix}>{t('Lv.')}</span>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        value={tempLevel}
        onChange={(event) => setTempLevel(event.target.value.replace(/\D/g, ''))}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        maxLength={3}
      />
    </div>
  );
};
