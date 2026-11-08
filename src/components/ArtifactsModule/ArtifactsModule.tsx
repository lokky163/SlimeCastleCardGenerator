import React from 'react';
import {
  type ArtifactData,
  type ArtifactState,
} from '../../models/artifact';
import { CardGrid, CardGridItem } from '../grid/CardGrid';
import { ModulePanel } from '../ui/ModulePanel/ModulePanel';
import { ArtifactCard } from './ArtifactCard';

interface ArtifactsModuleProps {
  artifacts: ArtifactData[];
  setArtifacts: React.Dispatch<React.SetStateAction<ArtifactData[]>>;
}

export const ArtifactsModule: React.FC<ArtifactsModuleProps> = ({
  artifacts,
  setArtifacts,
}) => {
  const updateArtifact = (targetName: string, changes: Partial<ArtifactData>) => {
    setArtifacts((previous) =>
      previous.map((artifact) =>
        artifact.name === targetName ? artifact.clone(changes) : artifact,
      ),
    );
  };

  const handleStateChange = (targetName: string, state: ArtifactState) => {
    updateArtifact(targetName, { state });
  };

  const handleFragmentsChange = (targetName: string, fragments: number) => {
    updateArtifact(targetName, { fragments });
  };

  const handleLevelChange = (targetName: string, level: number) => {
    updateArtifact(targetName, { level });
  };

  return (
    <ModulePanel>
      <CardGrid variant="artifact">
        {artifacts.map((artifact) => (
          <CardGridItem key={artifact.name}>
            <ArtifactCard
              artifact={artifact}
              onChangeState={(state) => handleStateChange(artifact.name, state)}
              onChangeFragments={(fragments) =>
                handleFragmentsChange(artifact.name, fragments)
              }
              onChangeLevel={(level) => handleLevelChange(artifact.name, level)}
            />
          </CardGridItem>
        ))}
      </CardGrid>
    </ModulePanel>
  );
};
