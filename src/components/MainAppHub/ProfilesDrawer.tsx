import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import type { SccProfile } from '../../services/ProfilesSchema';
import { cx } from '../../utils/classNames';
import { Tooltip } from '../ui/Tooltip/Tooltip';
import styles from './ProfilesDrawer.module.css';

interface ProfilesDrawerProps {
  open: boolean;
  profiles: SccProfile[];
  activeProfileIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRequestDelete: (index: number) => void;
  onReorderProfile: (from: number, to: number) => void;
  onExportAll: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ProfileRowProps {
  profile: SccProfile;
  index: number;
  total: number;
  active: boolean;
  dragging: boolean;
  dropTarget: boolean;
  onSelect: (index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (from: number, to: number) => void;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>, index: number) => void;
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
  onPointerCancel: () => void;
  onPointerLeave: () => void;
}

interface ProfilesFooterProps {
  onExportAll: () => void;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface DragState {
  from: number;
  over: number;
}

const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE_PX = 10;

const TrashIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v5" />
    <path d="M14 11v5" />
  </svg>
);

function profileName(profile: SccProfile, emptyLabel: string): string {
  return profile.playerName.trim() || emptyLabel;
}

const ProfileRow: React.FC<ProfileRowProps> = ({
  profile,
  index,
  total,
  active,
  dragging,
  dropTarget,
  onSelect,
  onDelete,
  onReorder,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
}) => {
  const { t } = useI18n();
  const deleteLabel = t('Delete profile {index}', { index: index + 1 });

  return (
    <div
      className={cx(
        styles.profileRow,
        active && styles.profileRowActive,
        dragging && styles.profileRowDragging,
        dropTarget && styles.profileRowDropTarget,
      )}
      data-profile-index={index}
      onPointerDown={(event) => onPointerDown(event, index)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        className={styles.profileSelect}
        aria-current={active ? 'true' : undefined}
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
        onClick={() => onSelect(index)}
        onKeyDown={(event) => {
          if (!event.altKey) return;
          if (event.key === 'ArrowUp' && index > 0) {
            event.preventDefault();
            onReorder(index, index - 1);
          } else if (event.key === 'ArrowDown' && index < total - 1) {
            event.preventDefault();
            onReorder(index, index + 1);
          }
        }}
      >
        <span className={styles.profileTitle}>
          {t('Profile {index}:', { index: index + 1 })}
        </span>
        <span className={styles.profileName}>
          {profileName(profile, t('No name'))}
        </span>
      </button>

      <Tooltip label={deleteLabel} placement="bottom" align="end">
        <button
          type="button"
          className={styles.deleteBtn}
          aria-label={deleteLabel}
          data-no-drag="true"
          onClick={() => onDelete(index)}
        >
          <TrashIcon />
        </button>
      </Tooltip>
    </div>
  );
};

const ProfilesFooter: React.FC<ProfilesFooterProps> = ({
  onExportAll,
  onImportFile,
}) => {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.footer}>
      <button
        type="button"
        className={cx(styles.footerBtn, styles.saveAllBtn)}
        onClick={onExportAll}
      >
        {t('Save all')}
      </button>

      <button
        type="button"
        className={cx(styles.footerBtn, styles.loadAllBtn)}
        onClick={() => fileInputRef.current?.click()}
      >
        {t('Load')}
      </button>

      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        className={styles.fileInput}
        onChange={onImportFile}
      />
    </div>
  );
};

export const ProfilesDrawer: React.FC<ProfilesDrawerProps> = ({
  open,
  profiles,
  activeProfileIndex,
  onSelect,
  onAdd,
  onRequestDelete,
  onReorderProfile,
  onExportAll,
  onImportFile,
}) => {
  const { t } = useI18n();
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const pressRef = useRef<{ x: number; y: number; index: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const justDraggedRef = useRef(false);

  const clearPressTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearPressTimer(), []);

  const beginPress = (
    event: React.PointerEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest('[data-no-drag]')) return;

    justDraggedRef.current = false;
    pressRef.current = { x: event.clientX, y: event.clientY, index };
    clearPressTimer();

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const press = pressRef.current;
      if (!press) return;

      justDraggedRef.current = true;
      const next = { from: press.index, over: press.index };
      dragRef.current = next;
      setDrag(next);
    }, LONG_PRESS_MS);
  };

  const trackPress = (event: React.PointerEvent<HTMLDivElement>) => {
    const press = pressRef.current;
    if (!press || dragRef.current) return;

    const dx = event.clientX - press.x;
    const dy = event.clientY - press.y;
    if (Math.hypot(dx, dy) > MOVE_TOLERANCE_PX) {
      clearPressTimer();
      pressRef.current = null;
    }
  };

  const endPress = () => {
    clearPressTimer();
    pressRef.current = null;
  };

  useEffect(() => {
    if (!drag) return;

    const updateTarget = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y);
      const row = element?.closest<HTMLElement>('[data-profile-index]');
      if (!row) return;

      const over = Number(row.dataset.profileIndex);
      const current = dragRef.current;
      if (!current || !Number.isFinite(over) || over === current.over) return;

      const next = { ...current, over };
      dragRef.current = next;
      setDrag(next);
    };

    const finish = (apply: boolean) => {
      const current = dragRef.current;
      dragRef.current = null;
      pressRef.current = null;
      setDrag(null);

      if (apply && current && current.from !== current.over) {
        onReorderProfile(current.from, current.over);
      }

      window.setTimeout(() => {
        justDraggedRef.current = false;
      }, 0);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateTarget(event.clientX, event.clientY);
    };
    const handlePointerUp = () => finish(true);
    const handlePointerCancel = () => finish(false);
    const handleTouchMove = (event: TouchEvent) => {
      event.preventDefault();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerCancel);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [drag, onReorderProfile]);

  if (!open) return null;

  return (
    <aside
      id="profiles-drawer"
      className={styles.drawer}
      aria-label={t('Profiles')}
      onClickCapture={(event) => {
        if (!justDraggedRef.current) return;
        event.preventDefault();
        event.stopPropagation();
        justDraggedRef.current = false;
      }}
      onContextMenu={(event) => {
        if (dragRef.current) event.preventDefault();
      }}
    >
      <div className={styles.list}>
        {profiles.map((profile, index) => (
          <ProfileRow
            key={profile.uid}
            profile={profile}
            index={index}
            total={profiles.length}
            active={index === activeProfileIndex}
            dragging={drag?.from === index}
            dropTarget={drag !== null && drag.over === index && drag.from !== index}
            onSelect={onSelect}
            onDelete={onRequestDelete}
            onReorder={onReorderProfile}
            onPointerDown={beginPress}
            onPointerMove={trackPress}
            onPointerUp={endPress}
            onPointerCancel={endPress}
            onPointerLeave={() => {
              if (!dragRef.current) endPress();
            }}
          />
        ))}

        <button type="button" className={styles.addBtn} onClick={onAdd}>
          {t('+ Add profile')}
        </button>
      </div>

      <ProfilesFooter
        onExportAll={onExportAll}
        onImportFile={onImportFile}
      />
    </aside>
  );
};
