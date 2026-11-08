import React, { useState, useRef, useEffect } from 'react';
import { RelicsModule } from '../RelicsModule/RelicsModule';
import { SlimesModule } from '../SlimesModule/SlimesModule';
import { RelicData, RELIC_NAMES } from '../../models/relic';
import { SlimeData, createInitialSlimes } from '../../models/slime';
import { EquipmentModule } from '../EquipmentModule/EquipmentModule';
import { EquipmentData, createInitialEquipment } from '../../models/equipment';
import { ExportService, type IImportedSccData } from '../../services/ExportService';
import { useSlotLayout } from '../grid/useSlotLayout';
import { BuffData, BUFFS, BUFF_STATS } from '../../models/buff';
import { BuffsModule } from '../BuffsModule/BuffsModule';
import { ArtifactData, ARTIFACT_NAMES } from '../../models/artifact';
import { ArtifactsModule } from '../ArtifactsModule/ArtifactsModule';
import { ExportBoard } from '../ExportBoard/ExportBoard';
import { HubHeader } from './HubHeader';
import { HelpModal } from './HelpModal';
import { ImagePreviewModal } from './ImagePreviewModal';
import type { AppTab } from './tabs';
import { saveAs } from 'file-saver';
import styles from './MainAppHub.module.css';

export const MainAppHub: React.FC = () => {
  // --- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ХАБА ---
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [playerName, setPlayerName] = useState('');
  const [bgColor, setBgColor] = useState('#9A6E3F');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // --- СОСТОЯНИЯ МОДУЛЯ СНАРЯЖЕНИЯ ---
  const [equipment, setEquipment] = useState<EquipmentData[]>(() => createInitialEquipment());
  const equipmentHdRef = useRef<HTMLDivElement>(null);

  // --- СОСТОЯНИЯ МОДУЛЯ РЕЛИКВИЙ ---
  const [relics, setRelics] = useState<RelicData[]>(() =>RELIC_NAMES.map(name => new RelicData(name, '0')));
  const relicLayout = useSlotLayout(relics, { rows: 3, cols: 6, mode: 'to-end' });

  // --- СОСТОЯНИЯ МОДУЛЯ СЛАЙМОВ ---
  const [slimes, setSlimes] = useState<SlimeData[]>(() => createInitialSlimes());
  const slimeLayout = useSlotLayout(slimes, { rows: 5, cols: 6, mode: 'to-end' });

  const [buffs, setBuffs] = useState<BuffData[]>(() => 
    BUFFS.map(type => new BuffData(type, 0))
  );
  const buffsHdRef = useRef<HTMLDivElement>(null);

  // --- СОСТОЯНИЯ МОДУЛЯ АРТЕФАКТОВ ---
  const [artifacts, setArtifacts] = useState<ArtifactData[]>(() =>
    ARTIFACT_NAMES.map(name => new ArtifactData(name, 'no', 1, 0))
  );
  const artifactsHdRef = useRef<HTMLDivElement>(null);

    // Вычисляем общий бонус слаймов на самом верхнем уровне в Хабе
  const totalSlimeBonus = slimes.reduce((sum, s) => sum + s.calculateBonus(), 0);

  const getActivePhaseInfo = () => {
    // 14 баффов 1-й фазы (все, кроме ATK, HP, CritRes)
    const phase1Buffs = buffs.filter(b => b.type !== 'ATK' && b.type !== 'HP' && b.type !== 'CritRes');
    const isPhase1Complete = phase1Buffs.every(b => b.percentage >= 100);

    if (!isPhase1Complete) {
      // Считаем среднее арифметическое для 1 фазы
      const avg1 = phase1Buffs.reduce((sum, b) => sum + b.percentage, 0) / phase1Buffs.length;
      return { phase: 1, percent: avg1 };
    } else {
      // Считаем среднее арифметическое для оставшихся 3 баффов 2 фазы
      const phase2Buffs = buffs.filter(b => b.type === 'ATK' || b.type === 'HP' || b.type === 'CritRes');
      const avg2 = phase2Buffs.reduce((sum, b) => sum + b.percentage, 0) / phase2Buffs.length;
      return { phase: 2, percent: avg2 };
    }
  };

  const phaseInfo = getActivePhaseInfo();

    // Функция математического расчета остатка бросков для закрытия фазы
  const calculateRemainingThrows = () => {
    // Разделяем баффы на две группы
    const groupMain = buffs.filter(b => b.type === 'ATK' || b.type === 'HP' || b.type === 'CritRes');
    const groupPhase1 = buffs.filter(b => b.type !== 'ATK' && b.type !== 'HP' && b.type !== 'CritRes');

    const isPhase1Complete = groupPhase1.every(b => b.percentage >= 100);

    // Определяем, какие баффы сейчас целевые, а какие сопутствующие
    const targetBuffs = isPhase1Complete ? groupMain : groupPhase1;
    const companionBuffs = isPhase1Complete ? [] : groupMain; // В Фазе 2 баффы Фазы 1 уже на 100% и выбыли

    // Фильтруем только те баффы, которые ЕЩЕ НЕ ДОСТИГЛИ максимума
    const activeTargets = targetBuffs.filter(b => b.percentage < 100);
    const activeCompanions = companionBuffs.filter(b => b.percentage < 100);

    if (activeTargets.length === 0) {
      return { min: 0, avg: 0, max: 0 };
    }

    let sumMin = 0;
    let sumMax = 0;
    let sumAvg = 0;

    // Считаем чистые шаги по каждому целевому баффу
    activeTargets.forEach(b => {
      const stats = BUFF_STATS[b.type];
      const remaining = Math.max(0, stats.maxObtainable - b.value);

      const stepMin = remaining / stats.max; // Минут шагов — если падает максимум
      const stepMax = remaining / stats.min; // Макс шагов — если падает минимум
      const stepAvg = remaining / ((stats.min + stats.max) / 2);

      sumMin += stepMin;
      sumMax += stepMax;
      sumAvg += stepAvg;
    });

    // Коэффициент расширения пула: (Целевые + Сопутствующие) / Целевые
    const poolModifier = (activeTargets.length + activeCompanions.length) / activeTargets.length;

    return {
      min: Math.ceil(sumMin * poolModifier),
      avg: Math.ceil(sumAvg * poolModifier),
      max: Math.ceil(sumMax * poolModifier)
    };
  };

  const remainingThrows = calculateRemainingThrows();

  // Рефы скрытых HD-контейнеров для генерации PNG
  const allModulesHdRef = useRef<HTMLDivElement>(null);

  const LOCAL_STORAGE_KEY = 'slime_card_profile_autosave';

  // АВТОСОХРАНЕНИЕ С БАФФАМИ
  useEffect(() => {
    if (!playerName && relics.every(r => r.state === '0') && slimes.every(s => s.state === '0') && buffs.every(b => b.value === 0)) {
      return; 
    }

    try {
      const relicsJson = ExportService.serializeRelics(
        relics,
        relicLayout.entries,
        relicLayout.rows,
        relicLayout.cols,
        relicLayout.mode,
      );
      const slimesJson = ExportService.serializeSlimes(
        slimes,
        slimeLayout.entries,
        slimeLayout.rows,
        slimeLayout.cols,
        slimeLayout.mode,
      );
      const equipmentJson = ExportService.serializeEquipment(equipment);
      const buffsJson = ExportService.serializeBuffs(buffs);
      const artifactsJson = ExportService.serializeArtifacts(artifacts); // Новое

      const sccPayload = {
        fileType: "slime-card-config",
        version: "1.0.0",
        playerName: playerName.trim(),
        modules: {
          relics: relicsJson, slimes: slimesJson, equipment: equipmentJson, buffs: buffsJson,
          artifacts: artifactsJson // Новое
        }
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sccPayload));
    } catch (e) { console.error(e); }
  }, [playerName, relics,
    relicLayout.entries, relicLayout.rows, relicLayout.cols, relicLayout.mode, slimes,
    slimeLayout.entries, slimeLayout.rows, slimeLayout.cols, slimeLayout.mode,
    equipment, buffs, artifacts]); // Добавили artifacts

  // Применение импортированной схемы: общая логика для автозагрузки и файла
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
      const defaultEquipment = createInitialEquipment();
      setEquipment(defaultEquipment.map((defaultItem) => {
        const savedItem = imported.equipment!.find((item) => item.name === defaultItem.name);
        return savedItem ? defaultItem.clone({ grade: savedItem.grade }) : defaultItem;
      }));
    }

    if (imported.buffs) {
      setBuffs(imported.buffs);
    }

    if (imported.artifacts) {
      setArtifacts(imported.artifacts);
    }
  };

  // 2. АВТОЗАГРУЗКА: Срабатывает ОДИН РАЗ при монтировании (запуске) приложения
  useEffect(() => {
    try {
      const savedRawData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!savedRawData) return;

      const imported = ExportService.importFromScc(savedRawData);
      if (imported) {
        applyImportedData(imported);
        console.log("Профиль игрока успешно и безопасно восстановлен из автосохранения!");
      }
    } catch (e) {
      console.error("Не удалось безопасно прочитать состояние из localStorage:", e);
    }
  }, []);

  // Колбэк циклического изменения скина слайма
  const handleSkinChange = (targetName: string, nextSkin: number) => {
    setSlimes(prev =>
      prev.map(slime => {
        if (slime.name === targetName) {
          return slime.clone({ _skin: nextSkin }); // Обновляем приватное поле скина
        }
        return slime;
      })
    );
  };

  // Экспорт схемы конфигурации (.scc)
  // Обновленный экспорт схемы .scc с учетом баффов
  const handleExportConfig = () => {
    const relicsJson = ExportService.serializeRelics(
      relics,
      relicLayout.entries,
      relicLayout.rows,
      relicLayout.cols,
      relicLayout.mode,
    );
    const slimesJson = ExportService.serializeSlimes(
      slimes,
      slimeLayout.entries,
      slimeLayout.rows,
      slimeLayout.cols,
      slimeLayout.mode,
    );
    const equipmentJson = ExportService.serializeEquipment(equipment);
    // Добавляем баффы
    const buffsJson = ExportService.serializeBuffs(buffs);
    const artifactsJson = ExportService.serializeArtifacts(artifacts); // Новое

    ExportService.exportToScc(
      playerName, 
      ['relics', 'slimes', 'equipment', 'buffs', 'artifacts'], 
      relicsJson, slimesJson, equipmentJson, buffsJson, artifactsJson
    );
  };


  // Обновленный импорт схемы
  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      // Безопасное извлечение строки
      const content = event.target?.result as string;
      if (!content) return;

      try {
        const imported = ExportService.importFromScc(content);
        
        if (imported) {
          applyImportedData(imported);
        } else {
          alert("Ошибка при чтении файла");
        }
      } catch (error) {
        // iOS/Telegram любят «тихо» падать, если JSON поврежден, лучше подстраховаться
        console.error("Ошибка парсинга файла:", error);
        alert("Ошибка при чтении файла");
      }
    };

    reader.readAsText(file);
  };
  
  const handleShareLayout = async () => {
    const dataUrl = await ExportService.exportToPng(allModulesHdRef.current);
    if (!dataUrl) return;

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    // const isIOS = true;

    if (isIOS) {
      // На айфоне открываем модалку с превью
      setPreviewImage(dataUrl);
    } else {
      // На Android и ПК скачиваем файл как обычно
      const blob = await (await fetch(dataUrl)).blob();
      saveAs(blob, `${playerName}-${ExportService.curFormattedDate()}.png`);
    }
  };

  // Функция полного сброса всех данных приложения до дефолтных значений
  const handleResetAllData = () => {
    const confirmReset = window.confirm("Вы уверены, что хотите полностью сбросить все введённые значения? Если нет, то рекомендуется сначала 'Сохранить схему'");
    if (!confirmReset) return;

    // 1. Сбрасываем общие данные
    setPlayerName('');
    setBgColor('#9A6E3F');

    // 2. Сбрасываем реликвии и слаймов вместе с их сетками
    relicLayout.resetLayout();
    slimeLayout.resetLayout();
    setRelics(RELIC_NAMES.map(name => new RelicData(name, '0')));
    setSlimes(createInitialSlimes());

    // 3. Сбрасываем снаряжение, баффы и артефакты
    setEquipment(createInitialEquipment());
    setBuffs(BUFFS.map(type => new BuffData(type, 0)));
    setArtifacts(ARTIFACT_NAMES.map(name => new ArtifactData(name, 'no', 1, 0)));

    // 4. Очищаем автосохранение браузера, чтобы вернуть чистый лист
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <div className={styles.hubContainer}>

      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <HubHeader
        activeTab={activeTab}
        playerName={playerName}
        bgColor={bgColor}
        onTabChange={setActiveTab}
        onPlayerNameChange={setPlayerName}
        onBgColorChange={setBgColor}
        onOpenHelp={() => setIsHelpOpen(true)}
        onReset={handleResetAllData}
        onImportFile={handleImportConfig}
        onExportConfig={handleExportConfig}
        onExportImage={handleShareLayout}
      />
      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className={styles.mainContent}>

        {activeTab === 'relics' && (
          <RelicsModule 
            relics={relics}
            setRelics={setRelics}
            layout={relicLayout}
          />
        )}

        {activeTab === 'slimes' && (
          <SlimesModule 
            slimes={slimes}
            setSlimes={setSlimes}
            layout={slimeLayout}
            onChangeSkin={handleSkinChange}
          />
        )}

        {activeTab === 'equipment' && (
          <EquipmentModule 
            equipment={equipment}
            setEquipment={setEquipment}
            bgColor={bgColor}
            hdRef={equipmentHdRef}
          />
        )}

        {/* Модуль Перманентных Баффов */}
        {activeTab === 'buffs' && (
          <BuffsModule 
            buffs={buffs}
            setBuffs={setBuffs}
            bgColor={bgColor}
            hdRef={buffsHdRef}
            phaseInfo={phaseInfo} // Передаем объект с номером фазы и процентом
            remainingThrows={remainingThrows}
          />
        )}

        {activeTab === 'artifacts' && (
          <ArtifactsModule 
            artifacts={artifacts}
            setArtifacts={setArtifacts}
            bgColor={bgColor}
            hdRef={artifactsHdRef}
          />
        )}
      </main>

      <ExportBoard
        boardRef={allModulesHdRef}
        playerName={playerName}
        bgColor={bgColor}
        totalSlimeBonus={totalSlimeBonus}
        equipment={equipment}
        relics={relics}
        relicLayout={relicLayout}
        slimes={slimes}
        slimeLayout={slimeLayout}
        buffs={buffs}
        artifacts={artifacts}
        phaseInfo={phaseInfo}
      />
    </div>
  );
};
