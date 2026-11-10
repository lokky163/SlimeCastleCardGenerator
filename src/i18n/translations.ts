import type { LanguageId } from '../services/Language';

export interface TranslationEntry {
  readonly ru: string | readonly string[];
  readonly en?: string | readonly string[];
}

export type TranslationParams = Record<string, string | number>;

export type TranslationTree = {
  readonly [key: string]: TranslationEntry | TranslationTree;
};

/**
 * Дерево переводов.
 *
 * Ключ каждой записи — английский текст, который показывается в интерфейсе.
 * Значение `ru` — перевод на русский. Английский берётся из самого ключа,
 * поэтому новые языки добавляются сюда же отдельным полем.
 */
export const translations: TranslationTree = {
  common: {
    Cancel: { ru: 'Отмена' },
    Close: { ru: 'Закрыть' },
    Delete: { ru: 'Удалить' },
    Reset: { ru: 'Сбросить' },
    Help: { ru: 'Справка' },
    Profiles: { ru: 'Профили' },
    Equipment: { ru: 'Снаряжение' },
    Slimes: { ru: 'Слаймы' },
    Relics: { ru: 'Реликвии' },
    Buffs: { ru: 'Баффы' },
    Artifacts: { ru: 'Артефакты' },
    None: { ru: 'Нет' },
    'Lv.': { ru: 'Ур.' },
    max: { ru: 'макс' },
    Show: { ru: 'Показать' },
    Hide: { ru: 'Скрыть' },
    'Save all': { ru: 'Сохранить все' },
    Load: { ru: 'Загрузить' },
    'Select all': { ru: 'Выбрать всё' },
    'Clear all': { ru: 'Снять всё' },
    'Download PNG': { ru: 'Скачать PNG' },
    'Permanent buffs': { ru: 'Перманентные бафы' },
    Custom: { ru: 'Свой' },
    Auto: { ru: 'Автоматический' },
    Manual: { ru: 'Ручной' },
    'Slot:': { ru: 'Слот:' },
    'Phase 1': { ru: '1 фаза' },
    'Phase 2': { ru: '2 фаза' },
  },
  header: {
    'Open profiles menu': { ru: 'Открыть меню профилей' },
    'Close profiles menu': { ru: 'Закрыть меню профилей' },
    'Player name': { ru: 'Ник игрока' },
    'Expand top panel': { ru: 'Развернуть верхнюю панель' },
    'Collapse top panel': { ru: 'Свернуть верхнюю панель' },
    'Save profile': { ru: 'Сохранить профиль' },
    'Save image': { ru: 'Сохранить изображение' },
    'PNG background:': { ru: 'Фон PNG:' },
    'Choose custom color': { ru: 'Выбрать свой цвет' },
    'Change language': { ru: 'Сменить язык' },
  },
  themes: {
    'Dark theme': { ru: 'Тёмная тема' },
    'Light theme': { ru: 'Светлая тема' },
    'Switch to dark theme': { ru: 'Переключить на тёмную тему' },
    'Switch to light theme': { ru: 'Переключить на светлую тему' },
  },
  profiles: {
    'No name': { ru: 'Без ника' },
    'Profile {index}:': { ru: 'Профиль {index}:' },
    'Profile {index}': { ru: 'Профиль {index}' },
    'Profile {index} ({name})': { ru: 'Профиль {index} ({name})' },
    'Move profile {index} up': { ru: 'Переместить профиль {index} вверх' },
    'Move profile {index} down': { ru: 'Переместить профиль {index} вниз' },
    'Delete profile {index}': { ru: 'Удалить профиль {index}' },
    '+ Add profile': { ru: '+ Добавить профиль' },
    'Delete profile?': { ru: 'Удалить профиль?' },
    '{label} will be deleted permanently.': {
      ru: '{label} будет удалён без возможности восстановления.',
    },
    'Reset all values?': { ru: 'Сбросить все значения?' },
    'All entered values of the current profile will be reset. To keep the current setup, save the profile first.':
      {
        ru: 'Все введённые значения текущего профиля будут сброшены. Чтобы сохранить текущую схему, сначала сохраните профиль.',
      },
    'Added: {count}': { ru: 'Добавлено новых: {count}' },
    'Updated: {count}': { ru: 'Обновлено существующих: {count}' },
    'The active profile was updated from the file.': {
      ru: 'Активный профиль обновлён из файла.',
    },
    'Profile loaded': { ru: 'Профиль загружен' },
    'Profiles loaded': { ru: 'Профили загружены' },
    'Could not load profile': { ru: 'Не удалось загрузить профиль' },
    'The file is damaged or has an unsupported format.': {
      ru: 'Файл повреждён или имеет неподдерживаемый формат.',
    },
    'Could not read file': { ru: 'Не удалось прочитать файл' },
    'Try selecting the file again.': { ru: 'Попробуйте выбрать файл ещё раз.' },
    'Got it': { ru: 'Понятно' },
  },
  imagePreview: {
    'Image is ready!': { ru: 'Изображение готово!' },
    'Press and hold the image below and choose': {
      ru: 'Зажмите палец на картинке ниже и выберите',
    },
    '“Save to Photos”': { ru: '«Сохранить в Фото»' },
    'Image preview': { ru: 'Предпросмотр изображения' },
  },
  export: {
    'Header (name and total bonus)': { ru: 'Шапка (ник и общий бонус)' },
    'What to show in the image': { ru: 'Что показать на изображении' },
    'Total slime bonus:': { ru: 'Общий бонус слайма:' },
    'Phase {phase}: {percent}%': { ru: '{phase} фаза: {percent}%' },
    'Drop multiplier:': { ru: 'Множитель капель:' },
    '— on average, with pity at roll {roll}': {
      ru: '— в среднем, с гарантом на {roll}-м ролле',
    },
    'Permanent buff drop chance:': { ru: 'Шанс выпадения пермача:' },
    'Custom permanent buff drop chance, %': {
      ru: 'Свой шанс выпадения пермача, %',
    },
    'Permanent buffs left: Min / Avg / Max': {
      ru: 'Осталось выбить пермачей: Мин / Средне / Макс',
    },
    'Filled: {percent}%': { ru: 'Заполнено: {percent}%' },
    Drop: { en: ['drop', 'drops'], ru: ['капля', 'капли', 'капель'] },
  },
  grid: {
    'Rows in image': { ru: 'Строк на изображении' },
    'Columns in image': { ru: 'Столбцов на изображении' },
    'Missing:': { ru: 'Отсутствующие:' },
    'Keep in place': { ru: 'На месте' },
    'Move to end': { ru: 'В конец' },
    'Hide missing': { ru: 'Не показывать' },
    'Manual indexes': { ru: 'Ручные индексы' },
    'Grid size': { ru: 'Размер сетки' },
    'Card hiding': { ru: 'Скрытие карточек' },
    'Disable hiding': { ru: 'Убрать скрытие' },
    'Enable hiding': { ru: 'Добавить скрытие' },
    'Until phase 1 is complete:': { ru: 'До закрытия 1 фазы:' },
    'Until phase 2 is complete:': { ru: 'До закрытия 2 фазы:' },
  },
  equipmentGrades: {
    Epic: { ru: 'Эпический' },
    Legendary: { ru: 'Легендарный' },
    Mythic: { ru: 'Мифический' },
    'Mythic 1': { ru: 'Мифический 1' },
    'Mythic 2': { ru: 'Мифический 2' },
    'Mythic 3': { ru: 'Мифический 3' },
    Fantasy: { ru: 'Фэнтези' },
    'Fantasy 1': { ru: 'Фэнтези 1' },
    'Fantasy 2': { ru: 'Фэнтези 2' },
  },
  help: {
    'General:': { ru: 'Общие:' },
    'Clicking the button to the left of “Help” opens the tab menu: “Equipment”, “Slimes”, “Relics”, “Artifacts”, “Buffs”.':
      {
        ru: 'Нажатие на кнопку слева от кнопки “Справка” открывает меню выбора вкладки для настройки, а именно: “Снаряжение”, “Слаймы”, “Реликвии”, “Артефакты”, “Баффы”.',
      },
    'Any change automatically saves the active profile to the browser local storage. All profiles are stored together in the browser.':
      {
        ru: 'При любом изменении происходит автоматическое сохранение активного профиля в локальных файлах браузера. Все профили хранятся в браузере вместе.',
      },
    'The button with three horizontal lines on the left side of the header opens the profiles menu. There you can switch between profiles, add a new empty profile, and delete existing ones. Each profile has its own player name and full set of settings.':
      {
        ru: 'Кнопка с тремя горизонтальными линиями в левой части шапки открывает меню профилей. Там можно переключаться между профилями, добавлять новый пустой профиль и удалять существующие. У каждого профиля свой ник и полный набор настроек.',
      },
    'The “Save all” and “Load” buttons at the bottom of the menu work with profiles. “Save all” downloads a file with all profiles. “Load” accepts both a file with all profiles and a single profile: a profile with an existing uid overwrites the old one, a new profile is appended, and if the file has no uid, one is created automatically.':
      {
        ru: 'Кнопки “Сохранить все” и “Загрузить” в нижней части меню работают с профилями. “Сохранить все” скачивает файл со всеми профилями. “Загрузить” принимает как файл всех профилей, так и одиночный профиль: профиль с уже существующим uid перезаписывает старый, новый профиль добавляется в конец, а если uid в файле нет, он создаётся автоматически.',
      },
    'The “Save profile” button in the header downloads only the active profile together with its uid. You can load this file with the same “Load” button in the profiles menu.':
      {
        ru: 'Кнопка “Сохранить профиль” в шапке скачивает только активный профиль вместе с его uid. Загрузить этот файл можно той же кнопкой “Загрузить” в меню профилей.',
      },
    'The sun or moon button in the header switches between light and dark themes. The selected theme is remembered and applied on the next launch.':
      {
        ru: 'Кнопка с солнцем или луной в шапке переключает светлую и тёмную тему. Выбранная тема запоминается и применяется при следующем запуске.',
      },
    'The flag button in the header changes the interface language. The selected language is remembered and applied on the next launch.':
      {
        ru: 'Кнопка с флагом в шапке меняет язык интерфейса. Выбранный язык запоминается и применяется при следующем запуске.',
      },
    'The “Save image” button downloads the finished player card.': {
      ru: 'Кнопка “Сохранить изображение” скачивает готовую карточку игрока.',
    },
    'Equipment:': { ru: 'Снаряжение:' },
    'Clicking an equipment image opens the rarity menu from epic to fantasy 2.':
      {
        ru: 'Нажатие на картинку со снаряжением открывает меню выбора редкости от эпического до фэнтези 2.',
      },
    'Slimes:': { ru: 'Слаймы:' },
    'Clicking in the level area (top 25%) opens the slime level input. Clicking in the name/stars area (bottom 25%) opens the star count menu. Clicking in the middle changes the slime skin.':
      {
        ru: 'Нажатие в области уровня (верхние 25%) открывает поле ввода уровня слайма. Нажатие в области имени слайма/звёзд (нижние 25%) открывает меню выбора количества звёзд. Нажатие по середине меняет скин слайма.',
      },
    'The “None” option means no slime; 0 means 0 stars on the slime. The total slime bonus is calculated automatically from the level and star count.':
      {
        ru: 'Вариант “Нет” – слайма нет, 0 – 0 звёзд на слайме. Автоматически на основе уровня и количества звёзд высчитывается общий бонус слайма.',
      },
    'Relics:': { ru: 'Реликвии:' },
    'Clicking in the stars area (bottom 20%) opens a star count menu similar to the one for slimes.':
      {
        ru: 'Нажатие в области звёзд (нижние 20%) вызывает меню выбора количества звёзд, аналогичное такому же для слаймов.',
      },
    'Artifacts:': { ru: 'Артефакты:' },
    'Clicking the stars (including “None” and “0 ★”) opens the star count menu.':
      {
        ru: 'Нажатие на звёзды (слово “Нет” и “0 ★” тоже) вызывает меню выбора количества звёзд.',
      },
    'You can set the number of fragments and the artifact level.': {
      ru: 'Можно указать количество осколков и уровень артефакта.',
    },
    'Buffs:': { ru: 'Баффы:' },
    'You can enter permanent buff values. Phase 1 includes all buffs except attack (ATK), health (HP), and critical resistance. The remaining permanent buffs are shown for both phases at once, even if the first phase is not complete.':
      {
        ru: 'Можно вводить значения пермобафов. К 1 фазе относятся все бафы, кроме атаки (ATK), здоровья (HP) и сопротивления криту (Critical Resistance). Остаток пермачей показывается сразу для обеих фаз, даже если первая ещё не закрыта.',
      },
    'Below you can choose the permanent buff drop chance: 4.5%, 9% (with the x2 buff), or enter a custom value. The calculator accounts for pity at roll 30: if a permanent buff drops earlier, the pity counter resets. The average number of drops per permanent buff is calculated as (1 − (1 − p)^30) / p, where p is the drop chance. For 4.5% it is ≈16.64, for 9% it is ≈10.46. The resulting drops are shown separately for phases 1 and 2.':
      {
        ru: 'Ниже можно выбрать шанс выпадения пермача: 4.5%, 9% (с бафом x2) или ввести свой. Калькулятор учитывает гарант на 30-м ролле: если пермач выпал раньше, счётчик гаранта сбрасывается. Среднее число капель на один пермач считается по формуле (1 − (1 − p)^30) / p, где p — шанс выпадения. Для 4.5% это ≈16.64, для 9% — ≈10.46. Итоговые капли показываются отдельно для 1 и 2 фазы.',
      },
    'Grid and card order:': { ru: 'Сетка и порядок на карточке:' },
    'On each tab you can configure the grid of the final card. The grid size can be automatic or manual. Automatic size picks rows and columns based on the number of shown cards: width is filled first (up to 6 columns for slimes, relics, and buffs, and up to 4 for equipment and artifacts), then rows are added. Manual size shows row and column counters. The “Manual indexes” mode always uses manual size.':
      {
        ru: 'На каждой вкладке можно настроить сетку итоговой карточки. Размер сетки бывает автоматическим и ручным. Автоматический размер подбирает строки и столбцы по числу показанных карточек: сначала заполняется ширина (до 6 столбцов для слаймов, реликвий и баффов и до 4 для снаряжения и артефактов), затем добавляются строки. Ручной размер показывает счётчики строк и столбцов. Режим «Ручные индексы» всегда использует ручной размер.',
      },
    'Cards fill the grid from left to right, top to bottom. The “Missing” option controls what happens to missing and manually hidden cards:':
      {
        ru: 'Карточки заполняют сетку слева направо сверху вниз. Параметр «Отсутствующие» отвечает за то, что делать с отсутствующими и вручную скрытыми карточками:',
      },
    'missing cards stay in their cells, while hidden cards are not drawn and leave empty space in their places.':
      {
        ru: 'отсутствующие карточки остаются в своих ячейках, а скрытые не рисуются и оставляют на своих местах пустоту.',
      },
    'moves missing and hidden cards after the filled ones, as happens in the game. Hidden cards are not drawn and do not create gaps.':
      {
        ru: 'переносит отсутствующие и скрытые карточки после заполненных, как это происходит в игре. Скрытые не рисуются и не создают пропусков.',
      },
    'does not draw missing and hidden cards; the remaining cards fill the freed space without gaps.':
      {
        ru: 'не рисует отсутствующие и скрытые карточки; оставшиеся карточки занимают освободившееся место без пропусков.',
      },
    'opens an additional input for each card with its index in the grid. Indexes start at 0 and end at {range}, left to right, top to bottom. You can also set index -1, then the card is not drawn.':
      {
        ru: 'открывает дополнительное поле ввода для каждой карточки с индексом в сетке. Индексы начинаются с 0 и заканчиваются на {range}, слева направо сверху вниз. Дополнительно можно указать индекс -1, тогда карточка рисоваться не будет.',
      },
    'In “Keep in place”, “Move to end”, and “Hide missing” modes you can enable the “Enable hiding” switch — then a “Hide/Show” button appears under each card. A hidden card is dimmed in the editor so it can be restored, but it is not displayed in the final image. If you choose “Disable hiding”, all cards are temporarily shown, and their marks are kept for the next time you enable hiding.':
      {
        ru: 'В режимах «На месте», «В конец» и «Не показывать» можно включить переключатель «Добавить скрытие» — тогда под каждой карточкой появится кнопка «Скрыть/Показать». Скрытая карточка затемняется в редакторе, чтобы её можно было вернуть, но на итоговой картинке она не отображается. Если выбрать «Убрать скрытие», все карточки временно показываются, а их отметки сохраняются для следующего включения.',
      },
    'row count * column count - 1': { ru: 'кол-во строк * кол-во столбцов - 1' },
  },
};

const dictionary = new Map<string, TranslationEntry>();

function collectEntries(node: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(node)) {
    if (value && typeof value === 'object' && 'ru' in value) {
      dictionary.set(key, value as TranslationEntry);
    } else if (value && typeof value === 'object') {
      collectEntries(value as Record<string, unknown>);
    }
  }
}

collectEntries(translations as unknown as Record<string, unknown>);

export function interpolate(
  value: string,
  params?: TranslationParams,
): string {
  if (!params) return value;

  return value.replace(/\{(\w+)\}/g, (match, name: string) => {
    const replacement = params[name];
    return replacement === undefined ? match : String(replacement);
  });
}

export function translate(
  language: LanguageId,
  key: string,
  params?: TranslationParams,
): string {
  if (language === 'en') return interpolate(key, params);

  const entry = dictionary.get(key);
  const value = typeof entry?.ru === 'string' ? entry.ru : key;
  return interpolate(value, params);
}

function russianPluralIndex(count: number): 0 | 1 | 2 {
  const mod10 = Math.abs(count) % 10;
  const mod100 = Math.abs(count) % 100;

  if (mod10 === 1 && mod100 !== 11) return 0;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
  return 2;
}

export function translatePlural(
  language: LanguageId,
  key: string,
  count: number,
): string {
  const entry = dictionary.get(key);

  if (language === 'en') {
    const forms = entry?.en;
    if (Array.isArray(forms)) return forms[count === 1 ? 0 : 1] ?? key;
    return key;
  }

  const forms = entry?.ru;
  if (!Array.isArray(forms)) return key;

  const index = russianPluralIndex(count);
  return forms[index] ?? forms[forms.length - 1] ?? key;
}
