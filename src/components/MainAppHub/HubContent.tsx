import { RelicsModule } from '../RelicsModule/RelicsModule';
import { SlimesModule } from '../SlimesModule/SlimesModule';
import { EquipmentModule } from '../EquipmentModule/EquipmentModule';
import { BuffsModule } from '../BuffsModule/BuffsModule';
import { ArtifactsModule } from '../ArtifactsModule/ArtifactsModule';
import type { CardProfile } from '../../hooks/useCardProfile';
import type { DropChanceSelection } from '../../utils/buffDrops';
import type { BuffsProgress } from '../../utils/buffProgress';
import type { AppTab } from './tabs';

interface HubContentProps {
  activeTab: AppTab;
  profile: CardProfile;
  buffsProgress: BuffsProgress;
  dropChance: DropChanceSelection;
  onDropChanceChange: (chance: DropChanceSelection) => void;
}

interface TabProps {
  profile: CardProfile;
}

interface BuffsTabProps extends TabProps {
  progress: BuffsProgress;
  dropChance: DropChanceSelection;
  onDropChanceChange: (chance: DropChanceSelection) => void;
}

const RelicsTab: React.FC<TabProps> = ({ profile }) => (
  <RelicsModule
    relics={profile.relics}
    setRelics={profile.setRelics}
    layout={profile.relicLayout}
  />
);

const SlimesTab: React.FC<TabProps> = ({ profile }) => (
  <SlimesModule
    slimes={profile.slimes}
    totalSlimeBonus={profile.totalSlimeBonus}
    layout={profile.slimeLayout}
    onChangeState={profile.changeSlimeState}
    onChangeLevel={profile.changeSlimeLevel}
    onChangeSkin={profile.changeSkin}
  />
);

const ArtifactsTab: React.FC<TabProps> = ({ profile }) => (
  <ArtifactsModule
    artifacts={profile.artifacts}
    setArtifacts={profile.setArtifacts}
    layout={profile.artifactLayout}
  />
);

const EquipmentTab: React.FC<TabProps> = ({ profile }) => (
  <EquipmentModule
    equipment={profile.equipment}
    setEquipment={profile.setEquipment}
    layout={profile.equipmentLayout}
  />
);

const BuffsTab: React.FC<BuffsTabProps> = ({
  profile,
  progress,
  dropChance,
  onDropChanceChange,
}) => (
  <BuffsModule
    buffs={profile.buffs}
    setBuffs={profile.setBuffs}
    layout={profile.buffLayout}
    progress={progress}
    dropChance={dropChance}
    onDropChanceChange={onDropChanceChange}
  />
);

export const HubContent: React.FC<HubContentProps> = ({
  activeTab,
  profile,
  buffsProgress,
  dropChance,
  onDropChanceChange,
}) => {
  switch (activeTab) {
    case 'relics':
      return <RelicsTab profile={profile} />;
    case 'slimes':
      return <SlimesTab profile={profile} />;
    case 'buffs':
      return (
        <BuffsTab
          profile={profile}
          progress={buffsProgress}
          dropChance={dropChance}
          onDropChanceChange={onDropChanceChange}
        />
      );
    case 'artifacts':
      return <ArtifactsTab profile={profile} />;
    default:
      return <EquipmentTab profile={profile} />;
  }
};
