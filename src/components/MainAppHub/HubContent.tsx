import { RelicsModule } from '../RelicsModule/RelicsModule';
import { SlimesModule } from '../SlimesModule/SlimesModule';
import { EquipmentModule } from '../EquipmentModule/EquipmentModule';
import { BuffsModule } from '../BuffsModule/BuffsModule';
import { ArtifactsModule } from '../ArtifactsModule/ArtifactsModule';
import type { CardProfile } from '../../hooks/useCardProfile';
import type { AppTab } from './tabs';

interface HubContentProps {
  activeTab: AppTab;
  profile: CardProfile;
  phaseInfo: { phase: number; percent: number };
  remainingThrows: { min: number; avg: number; max: number };
}

interface TabProps {
  profile: CardProfile;
}

interface BuffsTabProps extends TabProps {
  phaseInfo: { phase: number; percent: number };
  remainingThrows: { min: number; avg: number; max: number };
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
  />
);

const EquipmentTab: React.FC<TabProps> = ({ profile }) => (
  <EquipmentModule
    equipment={profile.equipment}
    setEquipment={profile.setEquipment}
  />
);

const BuffsTab: React.FC<BuffsTabProps> = ({
  profile,
  phaseInfo,
  remainingThrows,
}) => (
  <BuffsModule
    buffs={profile.buffs}
    setBuffs={profile.setBuffs}
    phaseInfo={phaseInfo}
    remainingThrows={remainingThrows}
  />
);

export const HubContent: React.FC<HubContentProps> = ({
  activeTab,
  profile,
  phaseInfo,
  remainingThrows,
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
          phaseInfo={phaseInfo}
          remainingThrows={remainingThrows}
        />
      );
    case 'artifacts':
      return <ArtifactsTab profile={profile} />;
    default:
      return <EquipmentTab profile={profile} />;
  }
};
