import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  displayIndex: number;
  position: number;
  total: number;
  active: boolean;
  dragging: boolean;
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
  /** Original profile indexes in the order they are shown while dragging. */
  order: number[];
  /** Position of the dragged profile inside `order`. */
  position: number;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  startLeft: number;
  startTop: number;
}

const LONG_PRESS_MS = 180;
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
  displayIndex,
  position,
  total,
  active,
  dragging,
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
  const deleteLabel = t('Delete profile {index}', { index: displayIndex + 1 });

  return (
    <div
      className={cx(
        styles.profileRow,
        active && styles.profileRowActive,
        dragging && styles.profileRowDragging,
      )}
      data-profile-uid={profile.uid}
      data-profile-position={position}
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
          {t('Profile {index}:', { index: displayIndex + 1 })}
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
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const listRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const pressRef = useRef<{ x: number; y: number; index: number } | null>(null);
  const timerRef = useRef<number | null>(null);
  const justDraggedRef = useRef(false);
  const prevTopsRef = useRef(new Map<string, number>());

  const clearPressTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearPressTimer(), []);

  /**
   * FLIP animation: after the visible order changes, every row is moved back
   * to its previous position and then released, so the other rows slide to
   * their new places instead of jumping.
   */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const nextTops = new Map<string, number>();
    const rows = list.querySelectorAll<HTMLElement>('[data-profile-uid]');

    rows.forEach((row) => {
      const uid = row.dataset.profileUid;
      if (!uid) return;

      // offsetTop ignores the animation transform applied below.
      const top = row.offsetTop;
      nextTops.set(uid, top);

      const previous = prevTopsRef.current.get(uid);
      if (!dragRef.current || previous === undefined) return;

      const deltaY = previous - top;
      if (Math.abs(deltaY) < 1) return;

      row.style.transition = 'none';
      row.style.transform = `translateY(${deltaY}px)`;
      void row.offsetHeight;
      row.style.transition = '';
      row.style.transform = '';
    });

    prevTopsRef.current = nextTops;
  });

  const beginPress = (
    event: React.PointerEvent<HTMLDivElement>,
    index: number,
  ) => {
    if (event.button !== 0) return;
    if ((event.target as HTMLElement).closest('[data-no-drag]')) return;

    const row = event.currentTarget;
    justDraggedRef.current = false;
    pressRef.current = { x: event.clientX, y: event.clientY, index };
    clearPressTimer();

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const press = pressRef.current;
      if (!press) return;

      const rect = row.getBoundingClientRect();
      const order = profilesRef.current.map((_, orderIndex) => orderIndex);
      const next: DragState = {
        order,
        position: press.index,
        width: rect.width,
        height: rect.height,
        offsetX: press.x - rect.left,
        offsetY: press.y - rect.top,
        startLeft: rect.left,
        startTop: rect.top,
      };

      justDraggedRef.current = true;
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

  const isDragging = drag !== null;

  // The ghost position is updated imperatively on pointer move, so it must be
  // placed once on mount instead of being reset by every re-render.
  useLayoutEffect(() => {
    if (!isDragging) return;

    const ghost = ghostRef.current;
    const current = dragRef.current;
    if (!ghost || !current) return;

    ghost.style.transform = `translate3d(${current.startLeft}px, ${
      current.startTop
    }px, 0) scale(1.03)`;
  }, [isDragging]);

  useEffect(() => {
    if (!drag) return;

    /**
     * The target position is the first row whose middle the pointer has
     * crossed, measured with `offsetTop` so the running FLIP transform does
     * not affect the calculation.
     */
    const findTarget = (y: number): number | null => {
      const list = listRef.current;
      if (!list) return null;

      const rows = list.querySelectorAll<HTMLElement>('[data-profile-position]');
      if (rows.length === 0) return null;

      const pointer = y - list.getBoundingClientRect().top + list.scrollTop;
      let target = rows.length - 1;

      for (let position = 0; position < rows.length; position += 1) {
        const row = rows[position];
        const middle = row.offsetTop + row.offsetHeight / 2;
        if (pointer < middle) {
          target = position;
          break;
        }
      }

      return target;
    };

    const moveGhost = (x: number, y: number) => {
      const current = dragRef.current;
      const ghost = ghostRef.current;
      if (!current || !ghost) return;

      ghost.style.transform = `translate3d(${x - current.offsetX}px, ${
        y - current.offsetY
      }px, 0) scale(1.03)`;
    };

    /** Keeps the list scrolling when the pointer is held near its edges. */
    const autoScroll = (y: number) => {
      const list = listRef.current;
      if (!list) return;

      const rect = list.getBoundingClientRect();
      const edge = 40;

      if (y < rect.top + edge) {
        list.scrollTop -= Math.ceil((rect.top + edge - y) / 4);
      } else if (y > rect.bottom - edge) {
        list.scrollTop += Math.ceil((y - (rect.bottom - edge)) / 4);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      moveGhost(event.clientX, event.clientY);
      autoScroll(event.clientY);

      const current = dragRef.current;
      if (!current) return;

      const target = findTarget(event.clientY);
      if (target === null || target === current.position) return;

      const order = [...current.order];
      const [moved] = order.splice(current.position, 1);
      order.splice(target, 0, moved);

      const next: DragState = { ...current, order, position: target };
      dragRef.current = next;
      setDrag(next);
    };

    const finish = (commit: boolean) => {
      const current = dragRef.current;
      dragRef.current = null;
      pressRef.current = null;
      setDrag(null);

      if (commit && current) {
        const from = current.order[current.position];
        const to = current.position;
        if (from !== to) onReorderProfile(from, to);
      }
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

  const order = drag ? drag.order : profiles.map((_, index) => index);
  const ghostProfile = drag ? profiles[drag.order[drag.position]] : null;

  return (
    <aside
      id="profiles-drawer"
      className={cx(styles.drawer, isDragging && styles.drawerDragging)}
      aria-label={t('Profiles')}
      onPointerDownCapture={() => {
        justDraggedRef.current = false;
      }}
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
      <div className={styles.list} ref={listRef}>
        {order.map((profileIndex, position) => {
          const profile = profiles[profileIndex];
          if (!profile) return null;

          return (
            <ProfileRow
              key={profile.uid}
              profile={profile}
              index={profileIndex}
              displayIndex={position}
              position={position}
              total={profiles.length}
              active={profileIndex === activeProfileIndex}
              dragging={drag !== null && drag.position === position}
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
          );
        })}

        <button type="button" className={styles.addBtn} onClick={onAdd}>
          {t('+ Add profile')}
        </button>
      </div>

      <ProfilesFooter
        onExportAll={onExportAll}
        onImportFile={onImportFile}
      />

      {drag && ghostProfile && (
        <div
          ref={ghostRef}
          className={styles.dragGhost}
          aria-hidden="true"
          style={{
            width: drag.width,
            height: drag.height,
          }}
        >
          <span className={styles.profileTitle}>
            {t('Profile {index}:', { index: drag.position + 1 })}
          </span>
          <span className={styles.profileName}>
            {profileName(ghostProfile, t('No name'))}
          </span>
        </div>
      )}
    </aside>
  );
};
