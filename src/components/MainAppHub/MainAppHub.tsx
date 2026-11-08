import React, { useState, useRef, useEffect } from 'react';
import { RelicsModule } from '../RelicsModule/RelicsModule';
import { RelicCard } from '../RelicCard';
import { SlimesModule } from '../SlimesModule/SlimesModule';
import { RelicData, RELIC_NAMES } from '../../models/relic';
import { SlimeData, createInitialSlimes } from '../../models/slime';
import { SlimeCard } from '../SlimeCard/SlimeCard';
import { EquipmentModule } from '../EquipmentModule/EquipmentModule';
import { EquipmentCard } from '../EquipmentCard/EquipmentCard';
import { EquipmentData, createInitialEquipment } from '../../models/equipment';
import { ExportService } from '../../services/ExportService';
import { calculateRelicIndices, type LayoutMode } from '../../utils/relicPresets';
import { BuffData, BUFFS, BUFF_CONFIG, splitBuffName, BUFF_STATS } from '../../models/buff';
import { BuffsModule } from '../BuffsModule/BuffsModule'; // (Сам модуль создадим на следующем шаге)
import { ArtifactData, ARTIFACT_NAMES } from '../../models/artifact';
import { ArtifactsModule } from '../ArtifactsModule/ArtifactsModule'; // (Создадим на следующем шаге)
import starYellow from '../../assets/artifacts/yellow.png'; 
import { saveAs } from 'file-saver';
import styles from './MainAppHub.module.css';

type AppTab = 'relics' | 'slimes' | 'equipment' | 'buffs' | 'artifacts';

export const MainAppHub: React.FC = () => {
  // --- ГЛОБАЛЬНЫЕ НАСТРОЙКИ ХАБА ---
  const [activeTab, setActiveTab] = useState<AppTab>('equipment');
  const [playerName, setPlayerName] = useState('');
  const [bgColor, setBgColor] = useState('#9A6E3F');

  // Настройки выпадающего меню экспорта с чекбоксами
  const [isPngMenuOpen, setIsPngMenuOpen] = useState(false);
  const [exportRelics, setExportRelics] = useState(true);
  const [exportSlimes, setExportSlimes] = useState(true);
  const [exportEquipment, setExportEquipment] = useState(true);


  const pngMenuRef = useRef<HTMLDivElement>(null);

  // --- СОСТОЯНИЯ МОДУЛЯ СНАРЯЖЕНИЯ ---
  const [equipment, setEquipment] = useState<EquipmentData[]>(() => createInitialEquipment());
  const equipmentHdRef = useRef<HTMLDivElement>(null);

  // --- СОСТОЯНИЯ МОДУЛЯ РЕЛИКВИЙ ---
  const [relics, setRelics] = useState<RelicData[]>(() =>RELIC_NAMES.map(name => new RelicData(name, '0')));
  const [relicIndices, setRelicIndices] = useState<number[]>(() =>RELIC_NAMES.map((_, idx) => idx));
  const [relicGrid, setRelicGrid] = useState({ rows: 3, cols: 6 });
  const [relicMode, setRelicMode] = useState<LayoutMode>('to-end');

  // --- СОСТОЯНИЯ МОДУЛЯ СЛАЙМОВ ---
  const [slimes, setSlimes] = useState<SlimeData[]>(() => createInitialSlimes());
  const [slimeIndices, setSlimeIndices] = useState<number[]>(() => createInitialSlimes().map((_, idx) => idx));
  const [slimeGrid, setSlimeGrid] = useState({ rows: 5, cols: 6 });
  const [slimeMode, setSlimeMode] = useState<LayoutMode>('to-end');

  const [buffs, setBuffs] = useState<BuffData[]>(() => 
    BUFFS.map(type => new BuffData(type, 0))
  );
  const [exportBuffs, setExportBuffs] = useState(true);
  const buffsHdRef = useRef<HTMLDivElement>(null);

    // --- СОСТОЯНИЯ МОДУЛЯ АРТЕФАКТОВ ---
  const [artifacts, setArtifacts] = useState<ArtifactData[]>(() =>
    ARTIFACT_NAMES.map(name => new ArtifactData(name, 'no', 1, 0))
  );
  const [exportArtifacts, setExportArtifacts] = useState(true);
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
  const relicsHdRef = useRef<HTMLDivElement>(null);
  const slimesHdRef = useRef<HTMLDivElement>(null);
  const allModulesHdRef = useRef<HTMLDivElement>(null);

  // Ссылка на инпут выбора файла
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Слушатель клика вне меню для его авто-закрытия
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pngMenuRef.current && !pngMenuRef.current.contains(event.target as Node)) {
        setIsPngMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setRelicIndices(calculateRelicIndices(relics, relicMode, relicIndices));
  }, [relicMode]);

  // Авто-пересчет индексов при изменении локального режима СЛАЙМОВ
  useEffect(() => {
    setSlimeIndices(calculateRelicIndices(slimes as any, slimeMode, slimeIndices));
  }, [slimeMode]);

  const LOCAL_STORAGE_KEY = 'slime_card_profile_autosave';

  // АВТОСОХРАНЕНИЕ С БАФФАМИ
  useEffect(() => {
    if (!playerName && relics.every(r => r.state === '0') && slimes.every(s => s.state === '0') && buffs.every(b => b.value === 0)) {
      return; 
    }

    try {
      const relicsJson = ExportService.serializeRelics(relics, relicIndices, relicGrid.rows, relicGrid.cols, relicMode);
      const slimesJson = ExportService.serializeSlimes(slimes, slimeIndices, slimeGrid.rows, slimeGrid.cols, slimeMode);
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
  }, [playerName, relics, relicIndices, 
    relicGrid, relicMode, slimes, 
    slimeIndices, slimeGrid, slimeMode, 
    equipment, buffs, artifacts]); // Добавили artifacts

  // 2. АВТОЗАГРУЗКА: Срабатывает ОДИН РАЗ при монтировании (запуске) приложения
  // 2. ИСПРАВЛЕНИЕ: Автозагрузка с защитой от потери новых реликов и слаймов
  useEffect(() => {
    try {
      const savedRawData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!savedRawData) return;

      const imported = ExportService.importFromScc(savedRawData);
      
      if (imported) {
        setPlayerName(imported.playerName);
        
        // Восстанавливаем Релики
        if (imported.relics) {
          setRelicGrid({ rows: imported.relics.rows, cols: imported.relics.cols });
          setRelics(imported.relics.relicsList);
          
          /* 
            ЗАЩИТА ИНДЕКСОВ РЕЛИКОВ:
            Если в коде появились новые релики, их длина больше, чем сохраненный массив индексов.
            Дописываем для новых реликов их дефолтные порядковые индексы.
          */
          let rIndices = [...imported.relics.slotIndices];
          if (rIndices.length < imported.relics.relicsList.length) {
            for (let i = rIndices.length; i < imported.relics.relicsList.length; i++) {
              rIndices.push(imported.relics.layoutMode === 'manual' ? -1 : i);
            }
          }
          setRelicIndices(rIndices);
          setRelicMode(imported.relics.layoutMode);
        }
        
        // Восстанавливаем Слаймов
        if (imported.slimes) {
          setSlimeGrid({ rows: imported.slimes.rows, cols: imported.slimes.cols });
          setSlimes(imported.slimes.slimesList);
          
          /* 
            ЗАЩИТА ИНДЕКСОВ СЛАЙМОВ:
            Точно так же дополняем массив индексов слаймов, если в игру добавились новые сущности.
          */
          let sIndices = [...imported.slimes.slotIndices];
          if (sIndices.length < imported.slimes.slimesList.length) {
            for (let i = sIndices.length; i < imported.slimes.slimesList.length; i++) {
              sIndices.push(imported.slimes.layoutMode === 'manual' ? -1 : i);
            }
          }
          setSlimeIndices(sIndices);
          setSlimeMode(imported.slimes.layoutMode);
        }
        
        // Восстанавливаем Снаряжение
        if (imported.equipment) {
          /*
            ЗАЩИТА СНАРЯЖЕНИЯ:
            Снаряжение у нас статичное. Если в коде добавились новые шмотки, 
            мы берем старые грейды из памяти, а новые шмотки оставляем в состоянии 'no'.
          */
          const defaultEquip = createInitialEquipment();
          const mergedEquip = defaultEquip.map(defaultItem => {
            const savedItem = imported.equipment!.find(item => item.name === defaultItem.name);
            return savedItem ? defaultItem.clone({ grade: savedItem.grade }) : defaultItem;
          });
          setEquipment(mergedEquip);
        }
        if (imported.buffs) {
          setBuffs(imported.buffs);
        }

        if (imported.artifacts) {
          const defaultArts = ARTIFACT_NAMES.map(name => new ArtifactData(name, 'no', 1, 0));
          const mergedArts = defaultArts.map(defArt => {
            const savedArt = imported.artifacts!.find(art => art.name === defArt.name);
            return savedArt ? defArt.clone({ state: savedArt.state, level: savedArt.level, fragments: savedArt.fragments }) : defArt;
          });
          setArtifacts(mergedArts);
        }

        console.log("Профиль игрока успешно и безопасно восстановлен из автосохранения!");
      }
    } catch (e) {
      console.error("Не удалось безопасно прочитать состояние из localStorage:", e);
    }
  }, []);

  // Колбэк изменения реликов из подмодуля
  // Обновленный колбэк изменения реликов: использует relicMode
  const handleSetRelics = (updater: React.SetStateAction<RelicData[]>) => {
    setRelics(prev => {
      const nextRelics = typeof updater === 'function' ? updater(prev) : updater;
      const nextIndices = calculateRelicIndices(nextRelics, relicMode, relicIndices);
      setRelicIndices(nextIndices);
      return nextRelics;
    });
  };

  // Обновленный колбэк изменения слаймов: использует slimeMode
  const handleSetSlimes = (updater: React.SetStateAction<SlimeData[]>) => {
    setSlimes(prev => {
      const nextSlimes = typeof updater === 'function' ? updater(prev) : updater;
      const nextIndices = calculateRelicIndices(nextSlimes as any, slimeMode, slimeIndices);
      setSlimeIndices(nextIndices);
      return nextSlimes;
    });
  };

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

  // Обработчик изменения режима сетки в шапке
  // const handleModeChange = (newMode: LayoutMode) => {
  //   setLayoutMode(newMode);
  //   setRelicIndices(calculateRelicIndices(relics, newMode, relicIndices));
  //   setSlimeIndices(calculateRelicIndices(slimes as any, newMode, slimeIndices));
  // };

  // Экспорт схемы конфигурации (.scc)
  // Обновленный экспорт схемы .scc с учетом баффов
  const handleExportConfig = () => {
    const relicsJson = ExportService.serializeRelics(relics, relicIndices, relicGrid.rows, relicGrid.cols, relicMode);
    const slimesJson = ExportService.serializeSlimes(slimes, slimeIndices, slimeGrid.rows, slimeGrid.cols, slimeMode);
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
          setPlayerName(imported.playerName);
          
          // Восстанавливаем индивидуальный режим и сетку РЕЛИКВИЙ
          if (imported.relics) {
            setRelicGrid({ rows: imported.relics.rows, cols: imported.relics.cols });
            setRelics(imported.relics.relicsList);
            setRelicIndices(imported.relics.slotIndices);
            setRelicMode(imported.relics.layoutMode);
          }
          
          // Восстанавливаем индивидуальный режим и сетку СЛАЙМОВ
          if (imported.slimes) {
            setSlimeGrid({ rows: imported.slimes.rows, cols: imported.slimes.cols });
            setSlimes(imported.slimes.slimesList);
            setSlimeIndices(imported.slimes.slotIndices);
            setSlimeMode(imported.slimes.layoutMode);
          }
          
          if (imported.equipment) {
            setEquipment(imported.equipment);
          }

          if (imported.buffs) {
            setBuffs(imported.buffs);
          }

          if (imported.artifacts) {
            setArtifacts(imported.artifacts);
          }

        } else {
          alert("Ошибка при чтении файла");
        }
      } catch (error) {
        // iOS/Telegram любят «тихо» падать, если JSON поврежден, лучше подстраховаться
        console.error("Ошибка парсинга файла:", error);
        alert("Ошибка при чтении файла");
      } finally {
        // Очищаем инпут через ref, гарантируя, что iOS сбросит состояние элемента
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsText(file);
  };
  
  // Функция запуска экспорта PNG на основе выбранных чекбоксов
  // const handleExecuteImageExport = async () => {
  //   setIsPngMenuOpen(false);

  //   const selectedCount = [exportRelics, exportSlimes, exportEquipment].filter(Boolean).length;

  //   if (selectedCount === 0) {
  //     alert("Выберите хотя бы один модуль для экспорта изображения!");
  //     return;
  //   }

  //   if (selectedCount === 1) {
  //     if (exportRelics) await ExportService.exportToPng(relicsHdRef.current, 'relics-board');
  //     if (exportSlimes) await ExportService.exportToPng(slimesHdRef.current, 'slimes-board');
  //     if (exportEquipment) await ExportService.exportToPng(equipmentHdRef.current, 'equipment-board');
  //   } else {
  //     await ExportService.exportToPng(allModulesHdRef.current, playerName);
  //   }
  // };

  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  // Вспомогательные массивы для рендеринга скрытых HD-сеток «все вместе»
  const hdRelicSlots = Array(relicGrid.rows * relicGrid.cols).fill(null);
  relics.forEach((r, i) => { 
    const idx = relicIndices[i]; 
    if (idx >= 0 && idx < hdRelicSlots.length) hdRelicSlots[idx] = r; 
  });

  const hdSlimeSlots = Array(slimeGrid.rows * slimeGrid.cols).fill(null);
  slimes.forEach((s, i) => { 
    const idx = slimeIndices[i]; 
    if (idx >= 0 && idx < hdSlimeSlots.length) hdSlimeSlots[idx] = s; 
  });

    // Функция полного сброса всех данных приложения до дефолтных значений
  const handleResetAllData = () => {
    const confirmReset = window.confirm("Вы уверены, что хотите полностью сбросить все введённые значения? Если нет, то рекомендуется сначала 'Сохранить схему'");
    if (!confirmReset) return;

    // 1. Сбрасываем общие данные
    setPlayerName('');
    setBgColor('#9A6E3F');
    setRelicMode('to-end');
    setSlimeMode('to-end');

    // 2. Сбрасываем реликвии
    setRelics(RELIC_NAMES.map(name => new RelicData(name, '0')));
    setRelicIndices(RELIC_NAMES.map((_, idx) => idx));
    setRelicGrid({ rows: 3, cols: 6 });

    // 3. Сбрасываем слаймов
    setSlimes(createInitialSlimes());
    setSlimeIndices(createInitialSlimes().map((_, idx) => idx));
    setSlimeGrid({ rows: 5, cols: 6 });

    // 4. Сбрасываем снаряжение
    setEquipment(createInitialEquipment());

    // 5. Очищаем автосохранение браузера, чтобы вернуть чистый лист
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const dropdownRef = useRef<HTMLDivElement>(null);

  // Карта названий вкладок для отображения на кнопке
  const tabLabels = {
    equipment: 'Снаряжение',
    slimes: 'Слаймы',
    relics: 'Реликвии',
    buffs: 'Баффы',
    artifacts: 'Артефакты'
  };

  const handleTabSelect = (tabName) => {
    setActiveTab(tabName);
    setIsDropdownOpen(false); // Закрываем меню после выбора
  };

  // Эффект для обработки клика вне меню и нажатия Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Если клик был вне контейнера меню — закрываем его
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      // Если нажат Escape — закрываем меню
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsHelpOpen(false);
      }
    };

    // Навешиваем слушатели событий
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Очищаем слушатели при размонтировании компонента
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className={styles.hubContainer}>

      {previewImage && (
        <div className={styles.imageModalOverlay} onClick={() => setPreviewImage(null)}>
          <div className={styles.imageModalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.imageModalText}>
              <h3>Изображение готово!</h3>
              <p>Зажмите палец на картинке ниже и выберите <strong>«Сохранить в Фото»</strong></p>
            </div>
            
            <div className={styles.imageModalWrapper}>
              <img src={previewImage} alt="Layout Preview" />
            </div>
            
            <button className={styles.imageModalCloseBtn} onClick={() => setPreviewImage(null)}>
              Закрыть
            </button>

          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО СПРАВКИ */}
      {isHelpOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsHelpOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <h3>Справка</h3>
            </div>
            
            {/* Единый текстовый блок со встроенным скроллом */}
            <div className={styles.modalBody}>
              <div className={styles.helpContentBlock}>
                <p><strong>Общие:</strong></p>
                <p>Нажатие на кнопку слева от кнопки “Справка” открывает меню выбора вкладки для настройки, а именно: “Снаряжение”, “Слаймы”, “Реликвии”, “Артефакты”, “Баффы”.</p>
                <p>При любом изменении происходит автоматическое сохранение в локальных файлах браузера.</p>
                <p>Дополнительно итоговую схему можно скачать с помощью нажатия на кнопку “Сохранить схему” и считать ранее скачанную схему с помощью кнопки “Загрузить схему”.</p>
                <p>Кнопка “Сохранить изображение” скачивает готовую карточку игрока.</p>
                
                <hr className={styles.helpDivider} />
                
                <p><strong>Снаряжение:</strong></p>
                <p>Нажатие на картинку со снаряжением открывает меню выбора редкости от эпического до фентези2.</p>
                
                <hr className={styles.helpDivider} />
                
                <p><strong>Слаймы:</strong></p>
                <p>Нажатие в области уровня (верхние 25%) открывает поле ввода уровня слайма. Нажатие в области имени слайма/звёзд (нижние 25%) открывает меню выбора количества звёзд. Нажатие по середине меняет скин слайма</p>
                <p>Вариант “no” – слайма нет, 0 – 0 звезд на слайме. Автоматически на основе уровня и количества звёзд высчитывается общий бонус слайма.</p>
                
                <hr className={styles.helpDivider} />
                
                <p><strong>Реликвии:</strong></p>
                <p>Нажатие в области звёзд (нижние 20%) вызывает меню выбора количества звёзд аналогичное такому же для слаймов.</p>
                
                <hr className={styles.helpDivider} />
                <p><strong>Артефакты:</strong></p>
                <p>Нажатие на звёзды (Слово Нет, <span style={{ fontSize: '0.85rem', color: '#e6a817', fontWeight: 'bold', fontFamily: 'Nunito' }}>0 ★</span> тоже) вызывает меню выбора количества звёзд</p>
                <p>Можно указать количество осколков и уровень артефакта</p>

                <hr className={styles.helpDivider} />
                <p><strong>Бафы:</strong></p>
                <p>Можно вводить значения пермобафов. <strong>1 фазой</strong> считаются все бафы кроме атаки (ATK), здоровья (HP), сопротивлениею криту (Critical Resistance)</p>
                <p>Дополнтельно показывается сколько ещё раз нужно получить пермобафы, чтобы закрыть фазу. Чтобы перевести это значение в капли достаточно умножить его на <strong>16.6</strong>, либо на <strong>10.8</strong> если активен баф на <strong>x2</strong> шанс выпадения пермобафа</p>

                <hr className={styles.helpDivider} />
                
                <p><strong>Сетка и порядок на карточке:</strong></p>
                <p>Для слаймов и реликов можно настроить сетку на итоговой карточке, а именно указать количество строк и столбцов, а также режим. Со строками и столбцами понятно, что, можно менять в разумных пределах, по умолчанию стоят значения, при которых всё точно влезет. Слаймы и релики заполняют эту сетку слева направо сверху вниз.</p>
                <p>Режим сетки отвечает за то, что делать со слаймами и реликами которых нет:</p>
                <ul>
                  <li><strong>По умолчанию (В конец):</strong> переносит всех слаймов и реликов, которых у вас нет в конец сетки, как это сейчас происходит в игре.</li>
                  <li><strong>На месте:</strong> оставляет слаймов на том месте, в котором они находятся в сетке при настройке.</li>
                  <li><strong>Не показывать:</strong> не рисует изображения слаймов и реликов в сетке, пустоты не образуются, оставшиеся слаймы и релики занимают освободившееся место.</li>
                  <li><strong>Ручные индексы:</strong> открывает дополнительное поле ввода для каждого слайма и релика с индексом в сетке. Индексы начинаются с 1 и заканчиваются на <code>кол-во строк * кол-во столбцов</code>, слева направо сверху вниз. Дополнительно можно указать индекс -1, тогда слайм или релик рисоваться не будет.</li>
                </ul>
              </div>
            </div>
            
            <button className={styles.modalCloseBtn} onClick={() => setIsHelpOpen(false)}>
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* ОБЩАЯ ШАПКА */}
      <header className={styles.header}>
        {/* 
          ИСПРАВЛЕНИЕ: Объединяем вкладки и никнейм в одну общую ЛЕВУЮ группу.
          Благодаря этому инпут встанет вплотную к кнопкам переключения!
        */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className={styles.tabContainer}>
            
            {/* Обернули в контейнер с рефом ref={dropdownRef} */}
            <div className={styles.dropdownContainer} ref={dropdownRef}>
              <button 
                className={`${styles.tabBtn} ${styles.dropdownToggle}`} 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {tabLabels[activeTab] || 'Выбрать'}
                <span className={`${styles.arrow} ${isDropdownOpen ? styles.arrowUp : styles.arrowDown}`} />
              </button>

              {isDropdownOpen && (
                <div className={styles.dropdownMenu}>
                  <button 
                    className={`${styles.dropdownItem} ${activeTab === 'equipment' ? styles.itemActive : ''}`} 
                    onClick={() => handleTabSelect('equipment')}
                  >
                    Снаряжение
                  </button>
                  <button 
                    className={`${styles.dropdownItem} ${activeTab === 'slimes' ? styles.itemActive : ''}`} 
                    onClick={() => handleTabSelect('slimes')}
                  >
                    Слаймы
                  </button>
                  <button 
                    className={`${styles.dropdownItem} ${activeTab === 'relics' ? styles.itemActive : ''}`} 
                    onClick={() => handleTabSelect('relics')}
                  >
                    Реликвии
                  </button>
                  <button 
                    className={`${styles.dropdownItem} ${activeTab === 'artifacts' ? styles.itemActive : ''}`} 
                    onClick={() => handleTabSelect('artifacts')}
                  >
                    Артефакты
                  </button>
                  <button 
                    className={`${styles.dropdownItem} ${activeTab === 'buffs' ? styles.itemActive : ''}`} 
                    onClick={() => handleTabSelect('buffs')}
                  >
                    Баффы
                  </button>
                </div>
              )}
            </div>

            <button 
              className={`${styles.tabBtn} ${styles.btnHelp}`} 
              onClick={() => setIsHelpOpen(true)}
            >Справка</button>

            <input 
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ник игрока"
              className={styles.selectInput}
            />
            <button 
              className={`${styles.tabBtn} ${styles.btnReset}`} 
              onClick={handleResetAllData}
            >
              Сбросить
            </button>
          </div>
        </div>

        <div className={styles.toolsContainer}>
          {/* {(activeTab === 'relics' || activeTab === 'slimes') && (
            <div className={styles.pickerBlock}>
              <span className={styles.pickerLabel}>Режим сетки:</span>
              <select value={layoutMode} onChange={(e) => handleModeChange(e.target.value as LayoutMode)} className={styles.selectInput}>
                <option value="default">На месте</option>
                <option value="to-end">В конец</option>
                <option value="hidden">Не показывать</option>
                <option value="manual">Ручные индексы</option>
              </select>
            </div>
          )} */}

          {/* <div className={styles.pickerBlock}>
            <span className={styles.pickerLabel}>Фон PNG:</span>
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className={styles.colorInput} />
          </div> */}
                    {/* ОБНОВЛЕННЫЙ БЛОК: Выбор цвета фона с пресетами по умолчанию */}
          <div className={styles.pickerBlock}>
            <span className={styles.pickerLabel}>Фон PNG:</span>
            
            {/* Ряд готовых цветных кружочков-пресетов */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '4px' }}>
              <button 
                type="button"
                onClick={() => setBgColor('#9A6E3F')}
                style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#9A6E3F', border: bgColor === '#9A6E3F' ? '2px solid #e6a817' : '1px solid #4a4a6a', cursor: 'pointer', padding: 0 }}
              />
              {/* <button 
                type="button"
                onClick={() => setBgColor('#492F22')} 
                style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#492F22', border: bgColor === '#492F22' ? '2px solid #e6a817' : '1px solid #4a4a6a', cursor: 'pointer', padding: 0 }}
              /> */}
              <button 
                type="button"
                onClick={() => setBgColor('#16213e')}
                style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#16213e', border: bgColor === '#16213e' ? '2px solid #e6a817' : '1px solid #4a4a6a', cursor: 'pointer', padding: 0 }}
              />
              <button 
                type="button"
                onClick={() => setBgColor('#1a1a2e')}
                style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#1a1a2e', border: bgColor === '#1a1a2e' ? '2px solid #e6a817' : '1px solid #4a4a6a', cursor: 'pointer', padding: 0 }}
              />
            </div>

            {/* Оставляем инпут-палитру для выбора абсолютно любого кастомного цвета */}
            <input 
              type="color" 
              value={bgColor} 
              onChange={(e) => setBgColor(e.target.value)} 
              className={styles.colorInput} 
              title="Выбрать свой цвет"
            />
          </div>

          <button className={`${styles.actionBtn} ${styles.btnImport}`} onClick={() => fileInputRef.current?.click()}>Загрузить схему</button>
          {/* <input type="file" ref={fileInputRef} onChange={handleImportConfig} accept=".scc" style={{ display: 'none' }} /> */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportConfig} 
            accept=".json" // <-- Исправлено для iOS
            style={{ display: 'none' }} 
          />
          <button className={`${styles.actionBtn} ${styles.btnExport}`} onClick={handleExportConfig}>Сохранить схему</button>

          {/* МЕНЮ ЭКСПОРТА ИЗОБРАЖЕНИЯ С ЧЕКБОКСАМИ */}
          <div ref={pngMenuRef} className={styles.pngMenuWrapper}>
            <button className={`${styles.actionBtn} ${styles.btnPng}`} 
            // onClick={() => setIsPngMenuOpen(!isPngMenuOpen)}
            onClick = {handleShareLayout}
            >Сохранить изображение</button>
          </div>
          {/* То, что ниже было в диве сверху */}
            {/* {isPngMenuOpen && (
              <div className={styles.dropdownMenu} style={{ padding: '12px', width: '230px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={exportRelics} onChange={(e) => setExportRelics(e.target.checked)} style={{ cursor: 'pointer' }} />
                    Реликвии
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={exportSlimes} onChange={(e) => setExportSlimes(e.target.checked)} style={{ cursor: 'pointer' }} />
                    Слаймы
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={exportEquipment} onChange={(e) => setExportEquipment(e.target.checked)} style={{ cursor: 'pointer' }} />
                    Снаряжение
                  </label>
                </div>
                <button 
                  onClick={handleExecuteImageExport}
                  style={{
                    width: '100%',
                    backgroundColor: '#e6a817',
                    color: '#1a1a2e',
                    border: 'none',
                    padding: '8px',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    cursor: 'pointer'
                  }}
                >
                  Сохранить
                </button>
              </div>
            )} */}
        </div>
      </header>
      {/* ОСНОВНОЙ КОНТЕНТ */}
      <main className={styles.mainContent}>

        {activeTab === 'relics' && (
          <RelicsModule 
            relics={relics}
            setRelics={handleSetRelics}
            relicIndices={relicIndices}
            setRelicIndices={setRelicIndices}
            gridSettings={relicGrid}
            setGridSettings={setRelicGrid}
            layoutMode={relicMode}
            setLayoutMode={setRelicMode}
          />
        )}

        {activeTab === 'slimes' && (
          <SlimesModule 
            slimes={slimes}
            setSlimes={handleSetSlimes}
            slimeIndices={slimeIndices}
            setSlimeIndices={setSlimeIndices}
            gridSettings={slimeGrid}
            setGridSettings={setSlimeGrid}
            layoutMode={slimeMode}
            setLayoutMode={setSlimeMode}
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

      {/* ====================================================================== */}
      {/* ОБЩИЙ СКРЫТЫЙ СТЕНД ДЛЯ ВЕРТИКАЛЬНОЙ СКЛЕЙКИ ВСЕХ МОДУЛЕЙ ВМЕСТЕ        */}
      {/* ====================================================================== */}
        <div 
          ref={allModulesHdRef} 
          style={{
            position: 'fixed', 
            left: 0, 
            top: 0, 
            transform: 'translate(-110%, 0%)',

            width: 'max-content', height: 'max-content', backgroundColor: bgColor,
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '20px', 
            padding: '15px',
          }}
        >

        {/* НОВОЕ: Глобальная текстовая визитка игрока на итоговом PNG */}
        <div style={{ 
          fontFamily: "'Nunito'", 
          color: '#ffffff',
          borderBottom: '5px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '25px',
          marginBottom: '5px',
          textAlign: 'center',
          width: '100%',
        }}>
          <div style={{ fontSize: '60px', fontWeight: 'bold', color: '#e6a817', letterSpacing: '1px' }}>
            {playerName.trim() || 'Ник игрока'}
          </div>
          <div style={{ fontSize: '40px', color: '#e0e0e0', marginTop: '6px', fontWeight: '500' }}>
            Общий бонус слайма:{" "}
            <span style={{ color: '#e6a817', fontWeight: 'bold' }}>
              {totalSlimeBonus.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Блок снаряжения на общем снимке */}
        {/* ИСПРАВЛЕНИЕ: Вызываем полноценный компонент EquipmentCard вместо тегов img */}
        {/* Блок снаряжения на общем снимке */}
        {exportEquipment && (
          /* 
            ИСПРАВЛЕНИЕ: Переносим рамку и отступы на внешний контейнер-обертку,
            чтобы линия разделителя легла ровно на 100% ширины всей картинки
          */
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%', // Растягиваем обертку на всю ширину подложки
            borderBottom: '5px solid rgba(255, 255, 255, 0.2)', // Линия разделителя на всю ширину
            paddingBottom: '25px',
            marginBottom: '25px',
            boxSizing: 'border-box'
          }}>
            <div 
              style={{ 
                display: 'grid', 
                gap: '5px', 
                gridTemplateColumns: 'repeat(8, 195px)', 
                gridTemplateRows: 'repeat(1, 209px)'
              }}
            >
              {equipment.map((item) => (
                <div key={`all-eq-${item.name}`} style={{ width: '195px', height: '209px', position: 'relative' }}>
                  <EquipmentCard 
                    equipment={item}
                    width={195} 
                    onChangeGrade={() => {}} 
                  />
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Блок реликвий на общем снимке */}
        {exportRelics && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%', // Растягиваем обертку на всю ширину подложки картинки
            borderBottom: '5px solid rgba(255, 255, 255, 0.2)', // Линия переехала сюда
            paddingBottom: '25px',
            marginBottom: '25px', // Увеличили отступ до следующего текстового заголовка
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              display: 'grid', 
              gap: '5px', 
              gridTemplateColumns: `repeat(${relicGrid.cols}, 228px)`, 
              gridTemplateRows: `repeat(${relicGrid.rows}, 349px)`
            }}>
              {hdRelicSlots.map((slot, idx) => slot ? (
                <div key={`all-r-${slot.name}`} style={{ width: '228px', height: '349px', position: 'relative' }}>
                  <RelicCard imageUrl={slot.imageUrl} state={slot.state} onChangeState={() => {}} />
                </div>
              ) : <div key={`all-r-emp-${idx}`} style={{ width: '228px', height: '349px', background: 'transparent' }} />)}
            </div>
          </div>
        )}


        {/* Блок слаймов на общем снимке */}
        {exportSlimes && (
          <div>
            <div style={{ 
              display: 'grid', 
              gap: '5px', 
              gridTemplateColumns: `repeat(${slimeGrid.cols}, 250px)`, 
              gridTemplateRows: `repeat(${slimeGrid.rows}, 207px)`,
              borderBottom: '5px solid rgba(255, 255, 255, 0.2)',
              paddingBottom: '25px',
              marginBottom: '5px',
              alignItems: 'center'
            }}>
              {hdSlimeSlots.map((slot, idx) => slot ? (
                /* ИСПРАВЛЕНИЕ: Вызываем полноценный компонент SlimeCard вместо тега img */
                <div key={`all-s-${slot.name}`} style={{ width: '250px', height: '207px', position: 'relative' }}>
                  <SlimeCard 
                    slime={slot}
                    width={250}
                    onChangeState={() => {}}
                    onChangeLevel={() => {}}
                  />
                </div>
              ) : <div key={`all-s-emp-${idx}`} style={{ width: '250px', height: '207px', background: 'transparent' }} />)}
            </div>
          </div>
        )}

        {/* Блок перманентных баффов на общем снимке */}
        {exportBuffs && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            borderBottom: '5px solid rgba(255, 255, 255, 0.2)',
            paddingBottom: '25px',
            marginBottom: '25px',
            boxSizing: 'border-box'
          }}>
            {/* Текстовая двухцветная HD-шапка фазы баффов */}
            <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '15px', fontFamily: 'Nunito', color: '#ffffff' }}>
              Перманентные бафы <span style={{ color: '#e6a817' }}>{phaseInfo.phase} фаза: {phaseInfo.percent.toFixed(0)}%</span>
            </div>
            
            {/* Сетка баффов на основе заданного числа колонок и размеров из BUFF_CONFIG */}
            <div 
              style={{ 
                display: 'grid', 
                gap: '8px', 
                gridTemplateColumns: `repeat(${BUFF_CONFIG.export.cols}, ${BUFF_CONFIG.export.cardWidth}px)`,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {buffs.map((buff) => {
                // Разбиваем название на строки, если слов 3 и более
                const nameLines = splitBuffName(buff.cleanName);
                
                return (
                  <div 
                    key={`hd-all-b-${buff.type}`} 
                    style={{ 
                      width: `${BUFF_CONFIG.export.cardWidth}px`, 
                      height: `${BUFF_CONFIG.export.cardHeight}px`,
                      backgroundColor: '#4E2E19',
                      border: '1px solid #271700',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Иконка баффа */}
                    <img 
                      src={buff.imageUrl} 
                      alt="" 
                      style={{ 
                        width: `${BUFF_CONFIG.export.iconSize}px`, 
                        height: `${BUFF_CONFIG.export.iconSize}px`,
                        marginBottom: '6px'
                      }} 
                    />
                    
                    {/* Контейнер для текста с фиксированной максимальной шириной */}
                    <div style={{ 
                      maxWidth: `${BUFF_CONFIG.textMaxLineWidth}px`, 
                      textAlign: 'center',
                      fontFamily: 'Nunito'
                    }}>
                      {/* Отрисовка названия (1 или 2 строки) */}
                      {nameLines.map((line, lIdx) => (
                        <div 
                          key={lIdx} 
                          style={{ 
                            fontSize: `${BUFF_CONFIG.export.titleFontSize}px`, 
                            color: '#e0e0e0', 
                            lineHeight: '1.2',
                            fontWeight: 600
                          }}
                        >
                          {line}
                        </div>
                      ))}
                      
                      {/* Отрисовка числового значения на 2-й (или 3-й) строке */}
                      <div style={{ 
                        fontSize: `${BUFF_CONFIG.export.valueFontSize}px`, 
                        color: '#e6a817', 
                        fontWeight: 'bold',
                        marginTop: '4px'
                      }}>
                        {buff.value}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Блок артефактов на общем снимке */}
        {exportArtifacts && (
          <div style={{ 
            fontFamily: "'Nunito'", 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%',
            // borderBottom: '5px solid rgba(255, 255, 255, 0.2)',
            // paddingBottom: '25px',
            // marginBottom: '25px',
            boxSizing: 'border-box'
          }}>
            {/* На картинке выстраиваем их по 4 штуки в ряд (размер 150x230px под все элементы) */}
            <div style={{ 
              display: 'grid', 
              gap: '12px', 
              gridTemplateColumns: 'repeat(4, 350px)',
              justifyContent: 'center',
              fontFamily: 'Nunito',
            }}>
              {artifacts.map((art) => (
                <div 
                  key={`hd-all-a-${art.name}`} 
                  style={{ 
                    height: '450px', 
                    width: '350px', 
                    backgroundColor: '#4E2E19',
                    border: '1px solid #271700',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '12px',
                    boxSizing: 'border-box',
                    textAlign: 'center',
                    justifyContent: 'space-between', 
                  }}
                >
                  {/* Картинка артефакта с ЧБ фильтром для состояния no */}
                  <img 
                    src={art.imageUrl} 
                    alt="" 
                    style={{ 
                      width: '250px', 
                      height: '250px', 
                      objectFit: 'contain',
                      filter: art.isBlackAndWhite ? 'grayscale(100%) brightness(55%)' : 'none'
                    }} 
                  />
                  
                  {/* Текстовые звезды (вывод символами) */}
                  {/* ИСПРАВЛЕНИЕ: На общей картинке теперь тоже будут только чистые центрированные золотые звезды */}
                  {art.state !== 'no' && art.state !== '0' ? (
                    <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center', height: '50px', margin: '4px 0' }}>
                      {Array(parseInt(art.state, 10)).fill(null).map((_, idx) => (
                        <img key={idx} src={starYellow} alt="" style={{ width: '48px', height: '48px', display: 'block' }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ height: '20px', margin: '4px 0' }} />
                  )}


                  {/* Текстовое значение осколков */}
                  <div style={{ fontSize: '2.5em', color: '#b0b0c0', fontWeight: 'bold', marginTop: '2px', fontFamily: 'Nunito',  }}>
                    {art.fragmentsText}
                  </div>

                  {/* Текстовое значение уровня */}
                  <div style={{ fontSize: '2.5rem', color: art.isBlackAndWhite ? '#666' : '#ffffff', fontWeight: 'bold', marginTop: '2px', fontFamily: 'Nunito' }}>
                    Lv.{art.level}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


      </div>
    </div>
  );
};
