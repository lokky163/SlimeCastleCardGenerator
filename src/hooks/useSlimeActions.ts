import type { Dispatch, SetStateAction } from 'react';
import type { SlimeData, SlimeState } from '../models/slime';

function applyChanges(
  slimes: SlimeData[],
  targetName: string,
  changes: Partial<SlimeData>,
): SlimeData[] {
  return slimes.map((slime) =>
    slime.name === targetName ? slime.clone(changes) : slime,
  );
}

export function useSlimeActions(
  setSlimes: Dispatch<SetStateAction<SlimeData[]>>,
) {
  const update = (targetName: string, changes: Partial<SlimeData>) => {
    setSlimes((previous) => applyChanges(previous, targetName, changes));
  };

  return {
    changeSkin: (targetName: string, nextSkin: number) =>
      update(targetName, { _skin: nextSkin }),
    changeSlimeState: (targetName: string, nextState: SlimeState) =>
      update(targetName, { _state: nextState }),
    changeSlimeLevel: (targetName: string, nextLevel: number) =>
      update(targetName, { level: nextLevel }),
  };
}
