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

export const HubContent: React.FC<HubContentProps> = ({
  activeTab,
  profile,
  phaseInfo,
  remainingThrows,
}) => {
  switch (activeTab) {
    case 'relics':
      return (
        <RelicsModule
          relics={profile.relics}
          setRelics={profile.setRelics}
          layout={profile.relicLayout}
        />
      );

    case 'slimes':
      return (
        <SlimesModule
          slimes={profile.slimes}
          totalSlimeBonus={profile.totalSlimeBonus}
          layout={profile.slimeLayout}
          onChangeState={profile.changeSlimeState}
          onChangeLevel={profile.changeSlimeLevel}
          onChangeSkin={profile.changeSkin}
        />
      );

    case 'buffs':
      return (
        <BuffsModule
          buffs={profile.buffs}
          setBuffs={profile.setBuffs}
          phaseInfo={phaseInfo}
          remainingThrows={remainingThrows}
        />
      );

    case 'artifacts':
      return (
        <ArtifactsModule
          artifacts={profile.artifacts}
          setArtifacts={profile.setArtifacts}
        />
      );

    default:
      return (
        <EquipmentModule
          equipment={profile.equipment}
          setEquipment={profile.setEquipment}
        />
      );
  }
};
