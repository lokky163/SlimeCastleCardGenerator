import { useEffect, useState } from 'react';
import { RelicData, RELIC_NAMES } from '../models/relic';
import { SlimeData, createInitialSlimes } from '../models/slime';
import { EquipmentData, createInitialEquipment } from '../models/equipment';
import { BuffData, BUFFS } from '../models/buff';
import { ArtifactData, ARTIFACT_NAMES } from '../models/artifact';
import { ExportService, type IImportedSccData } from '../services/ExportService';
import { useSlotLayout } from '../components/grid/useSlotLayout';

const LOCAL_STORAGE_KEY = 'slime_card_profile_autosave';

const createRelics = () => RELIC_NAMES.map((name) => new RelicData(name, '0'));

const createBuffs = () => BUFFS.map((type) => new BuffData(type, 0));

const createArtifacts = () =>
  ARTIFACT_NAMES.map((name) => new ArtifactData(name, 'no', 1, 0));

export function useCardProfile() {
  const [playerName, setPlayerName] = useState('');
  const [relics, setRelics] = useState<RelicData[]>(createRelics);
  const relicLayout = useSlotLayout(relics, { rows: 3, cols: 6, mode: 'to-end' });

  const [slimes, setSlimes] = useState<SlimeData[]>(createInitialSlimes);
  const slimeLayout = useSlotLayout(slimes, { rows: 5, cols: 6, mode: 'to-end' });

  const [equipment, setEquipment] = useState<EquipmentData[]>(createInitialEquipment);
  const [buffs, setBuffs] = useState<BuffData[]>(createBuffs);
  const [artifacts, setArtifacts] = useState<ArtifactData[]>(createArtifacts);

  const totalSlimeBonus = slimes.reduce(
    (sum, slime) => sum + slime.calculateBonus(),
    0,
  );

  const changeSkin = (targetName: string, nextSkin: number) => {
    setSlimes((previous) =>
      previous.map((slime) =>
        slime.name === targetName ? slime.clone({ _skin: nextSkin }) : slime,
      ),
    );
  };

  const applyImportedData = (imported: IImportedSccData) => {
    setPlayerName(imported.playerName);

    if (imported.relics) {
      const { rows, cols, layoutMode, relicsList, entries } = imported.relics;
      setRelics(relicsList);
      relicLayout.applyLayout({ rows, cols, mode: layoutMode, entries });
    }

    if (imported.slimes) {
      const { rows, cols, layoutMode, slimesList, entries } = imported.slimes;
      setSlimes(slimesList);
      slimeLayout.applyLayout({ rows, cols, mode: layoutMode, entries });
    }

    if (imported.equipment) {
      const defaults = createInitialEquipment();
      setEquipment(defaults.map((defaultItem) => {
        const saved = imported.equipment!.find((item) => item.name === defaultItem.name);
        return saved ? defaultItem.clone({ grade: saved.grade }) : defaultItem;
      }));
    }

    if (imported.buffs) setBuffs(imported.buffs);
    if (imported.artifacts) setArtifacts(imported.artifacts);
  };

  const buildModules = () => ({
    relics: ExportService.serializeRelics(
      relics,
      relicLayout.entries,
      relicLayout.rows,
      relicLayout.cols,
      relicLayout.mode,
    ),
    slimes: ExportService.serializeSlimes(
      slimes,
      slimeLayout.entries,
      slimeLayout.rows,
      slimeLayout.cols,
      slimeLayout.mode,
    ),
    equipment: ExportService.serializeEquipment(equipment),
    buffs: ExportService.serializeBuffs(buffs),
    artifacts: ExportService.serializeArtifacts(artifacts),
  });

  const exportConfig = () => {
    const modules = buildModules();
    ExportService.exportToScc(
      playerName,
      ['relics', 'slimes', 'equipment', 'buffs', 'artifacts'],
      modules.relics,
      modules.slimes,
      modules.equipment,
      modules.buffs,
      modules.artifacts,
    );
  };

  const importConfigFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const content = loadEvent.target?.result as string;
      if (!content) return;

      try {
        const imported = ExportService.importFromScc(content);
        if (imported) {
          applyImportedData(imported);
        } else {
          alert('Ошибка при чтении файла');
        }
      } catch (error) {
        console.error('Ошибка парсинга файла:', error);
        alert('Ошибка при чтении файла');
      }
    };

    reader.readAsText(file);
  };

  const resetProfile = () => {
    const confirmReset = window.confirm(
      "Вы уверены, что хотите полностью сбросить все введённые значения? Если нет, то рекомендуется сначала 'Сохранить схему'",
    );
    if (!confirmReset) return;

    setPlayerName('');
    relicLayout.resetLayout();
    slimeLayout.resetLayout();
    setRelics(createRelics());
    setSlimes(createInitialSlimes());
    setEquipment(createInitialEquipment());
    setBuffs(createBuffs());
    setArtifacts(createArtifacts());
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  useEffect(() => {
    const isPristine =
      !playerName &&
      relics.every((relic) => relic.state === '0') &&
      slimes.every((slime) => slime.state === '0') &&
      buffs.every((buff) => buff.value === 0);
    if (isPristine) return;

    try {
      const payload = {
        fileType: 'slime-card-config',
        version: '1.0.0',
        playerName: playerName.trim(),
        modules: buildModules(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error(error);
    }
  }, [
    playerName,
    relics,
    relicLayout.entries,
    relicLayout.rows,
    relicLayout.cols,
    relicLayout.mode,
    slimes,
    slimeLayout.entries,
    slimeLayout.rows,
    slimeLayout.cols,
    slimeLayout.mode,
    equipment,
    buffs,
    artifacts,
  ]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return;

      const imported = ExportService.importFromScc(saved);
      if (imported) applyImportedData(imported);
    } catch (error) {
      console.error('Не удалось прочитать автосохранение:', error);
    }
  }, []);

  return {
    playerName,
    setPlayerName,
    relics,
    setRelics,
    relicLayout,
    slimes,
    setSlimes,
    slimeLayout,
    equipment,
    setEquipment,
    buffs,
    setBuffs,
    artifacts,
    setArtifacts,
    totalSlimeBonus,
    changeSkin,
    exportConfig,
    importConfigFile,
    resetProfile,
  };
}
