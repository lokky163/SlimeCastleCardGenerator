import React from 'react';
import { type ArtifactData, type ArtifactState } from '../../models/artifact';
import { GridControls } from '../grid/GridControls';
import { SlotGrid } from '../grid/SlotGrid';
import type { SlotLayoutController } from '../grid/useSlotLayout';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';
import { ArtifactCard } from './ArtifactCard';

interface ArtifactsModuleProps {
  artifacts: ArtifactData[];
  setArtifacts: React.Dispatch<React.SetStateAction<ArtifactData[]>>;
  layout: SlotLayoutController;
}

function useArtifactActions(
  setArtifacts: React.Dispatch<React.SetStateAction<ArtifactData[]>>,
) {
  const update = (targetName: string, changes: Partial<ArtifactData>) => {
    setArtifacts((previous) =>
      previous.map((artifact) =>
        artifact.name === targetName ? artifact.clone(changes) : artifact,
      ),
    );
  };

  return {
    changeState: (name: string, state: ArtifactState) => update(name, { state }),
    changeFragments: (name: string, fragments: number) => update(name, { fragments }),
    changeLevel: (name: string, level: number) => update(name, { level }),
  };
}

export const ArtifactsModule: React.FC<ArtifactsModuleProps> = ({
  artifacts,
  setArtifacts,
  layout,
}) => {
  const actions = useArtifactActions(setArtifacts);

  return (
    <ModulePanel>
      <GridControls layout={layout} />

      <SlotGrid
        items={artifacts}
        layout={layout}
        variant="artifact"
        renderCard={(artifact) => (
          <ArtifactCard
            artifact={artifact}
            onChangeState={(state) => actions.changeState(artifact.name, state)}
            onChangeFragments={(fragments) =>
              actions.changeFragments(artifact.name, fragments)
            }
            onChangeLevel={(level) => actions.changeLevel(artifact.name, level)}
          />
        )}
      />
    </ModulePanel>
  );
};
