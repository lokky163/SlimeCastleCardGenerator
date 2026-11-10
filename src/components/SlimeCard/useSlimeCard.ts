import { useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { SlimeData, SlimeState } from '../../models/slime';
import { useComposedImage } from '../../hooks/useComposedImage';
import {
  drawSlimeImage,
  SLIME_IMAGE_HEIGHT,
  SLIME_IMAGE_WIDTH,
  slimeImageKey,
} from './drawSlimeImage';

export interface SlimeCardHandlers {
  onChangeState: (state: SlimeState) => void;
  onChangeLevel: (level: number) => void;
  onChangeSkin?: (skin: number) => void;
}

type ClickZone = 'level' | 'menu' | 'skin' | null;

const LEVEL_ZONE_HEIGHT = 60;
const MENU_ZONE_TOP = 200;

function getClickZone(
  event: React.MouseEvent<HTMLElement>,
  isEditingLevel: boolean,
): ClickZone {
  if (isEditingLevel) return null;

  const rect = event.currentTarget.getBoundingClientRect();
  const clickRatio = (event.clientY - rect.top) / rect.height;

  if (clickRatio <= LEVEL_ZONE_HEIGHT / SLIME_IMAGE_HEIGHT) return 'level';
  if (clickRatio >= MENU_ZONE_TOP / SLIME_IMAGE_HEIGHT) return 'menu';
  return 'skin';
}

function applyClickZone(
  zone: ClickZone,
  slime: SlimeData,
  handlers: SlimeCardHandlers,
  setMenuOpen: Dispatch<SetStateAction<boolean>>,
  setEditingLevel: Dispatch<SetStateAction<boolean>>,
): void {
  if (zone === 'level') {
    if (slime.state === 'no') return;
    setMenuOpen(false);
    setEditingLevel(true);
    return;
  }

  if (zone === 'menu') {
    setMenuOpen((open) => !open);
    return;
  }

  if (zone === 'skin') {
    setMenuOpen(false);
    if (slime.state !== 'no') handlers.onChangeSkin?.(slime.skin);
  }
}

export function useSlimeImage(
  slime: SlimeData,
  displayName: string,
  isEditingLevel: boolean,
): string {
  return useComposedImage(
    slimeImageKey(slime, displayName, isEditingLevel),
    SLIME_IMAGE_WIDTH,
    SLIME_IMAGE_HEIGHT,
    (ctx) => drawSlimeImage(ctx, slime, displayName, isEditingLevel),
  );
}

export function useSlimeInteractions(
  slime: SlimeData,
  handlers: SlimeCardHandlers,
) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const zone = getClickZone(event, isEditingLevel);
    applyClickZone(zone, slime, handlers, setIsMenuOpen, setIsEditingLevel);
  };

  const handleStateChange = (nextState: SlimeState) => {
    handlers.onChangeState(nextState);
    setIsMenuOpen(false);
  };

  const handleLevelCommit = (nextLevel: number) => {
    handlers.onChangeLevel(nextLevel);
    setIsEditingLevel(false);
  };

  return {
    cardRef,
    isMenuOpen,
    isEditingLevel,
    handleCardClick,
    handleStateChange,
    handleLevelCommit,
    closeMenu: () => setIsMenuOpen(false),
    cancelLevelEdit: () => setIsEditingLevel(false),
  };
}
