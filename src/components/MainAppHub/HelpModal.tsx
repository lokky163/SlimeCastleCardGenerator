import { useI18n } from '../../i18n/I18nProvider';
import { cx } from '../../utils/classNames';
import { Modal } from '../ui/Modal/Modal';
import modalStyles from '../ui/Modal/Modal.module.css';
import styles from './HelpModal.module.css';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const Divider: React.FC = () => <hr className={styles.divider} />;

const GeneralHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p><strong>{t('General:')}</strong></p>
      <p>
        {t('Clicking the button to the left of “Help” opens the tab menu: “Equipment”, “Slimes”, “Relics”, “Artifacts”, “Buffs”.')}
      </p>
      <p>
        {t('Any change automatically saves the active profile to the browser local storage. All profiles are stored together in the browser.')}
      </p>
      <p>
        {t('The button with three horizontal lines on the left side of the header opens the profiles menu. There you can switch between profiles, add a new empty profile, and delete existing ones. Each profile has its own player name and full set of settings.')}
      </p>
      <p>
        {t('The “Save all” and “Load” buttons at the bottom of the menu work with profiles. “Save all” downloads a file with all profiles. “Load” accepts both a file with all profiles and a single profile: a profile with an existing uid overwrites the old one, a new profile is appended, and if the file has no uid, one is created automatically.')}
      </p>
      <p>
        {t('The “Save profile” button in the header downloads only the active profile together with its uid. You can load this file with the same “Load” button in the profiles menu.')}
      </p>
    </>
  );
};

const PreferencesHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p>
        {t('The sun or moon button in the header switches between light and dark themes. The selected theme is remembered and applied on the next launch.')}
      </p>
      <p>
        {t('The flag button in the header changes the interface language. The selected language is remembered and applied on the next launch.')}
      </p>
      <p>{t('The “Save image” button downloads the finished player card.')}</p>
    </>
  );
};

const EquipmentHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p><strong>{t('Equipment:')}</strong></p>
      <p>
        {t('Clicking an equipment image opens the rarity menu from epic to fantasy 2.')}
      </p>
    </>
  );
};

const SlimesHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p><strong>{t('Slimes:')}</strong></p>
      <p>
        {t('Clicking in the level area (top 25%) opens the slime level input. Clicking in the name/stars area (bottom 25%) opens the star count menu. Clicking in the middle changes the slime skin.')}
      </p>
      <p>
        {t('The “None” option means no slime; 0 means 0 stars on the slime. The total slime bonus is calculated automatically from the level and star count.')}
      </p>
    </>
  );
};

const RelicsHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p><strong>{t('Relics:')}</strong></p>
      <p>
        {t('Clicking in the stars area (bottom 20%) opens a star count menu similar to the one for slimes.')}
      </p>
    </>
  );
};

const ArtifactsHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p><strong>{t('Artifacts:')}</strong></p>
      <p>
        {t('Clicking the stars (including “None” and “0 ★”) opens the star count menu.')}
      </p>
      <p>{t('You can set the number of fragments and the artifact level.')}</p>
    </>
  );
};

const BuffsHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p><strong>{t('Buffs:')}</strong></p>
      <p>
        {t('You can enter permanent buff values. Phase 1 includes all buffs except attack (ATK), health (HP), and critical resistance. The remaining permanent buffs are shown for both phases at once, even if the first phase is not complete.')}
      </p>
      <p>
        {t('Below you can choose the permanent buff drop chance: 4.5%, 9% (with the x2 buff), or enter a custom value. The calculator accounts for pity at roll 30: if a permanent buff drops earlier, the pity counter resets. The average number of drops per permanent buff is calculated as (1 − (1 − p)^30) / p, where p is the drop chance. For 4.5% it is ≈16.64, for 9% it is ≈10.46. The resulting drops are shown separately for phases 1 and 2.')}
      </p>
    </>
  );
};

const MissingModesHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <ul>
      <li>
        <strong>{t('Keep in place')}:</strong>{' '}
        {t('missing cards stay in their cells, while hidden cards are not drawn and leave empty space in their places.')}
      </li>
      <li>
        <strong>{t('Move to end')}:</strong>{' '}
        {t('moves missing and hidden cards after the filled ones, as happens in the game. Hidden cards are not drawn and do not create gaps.')}
      </li>
      <li>
        <strong>{t('Hide missing')}:</strong>{' '}
        {t('does not draw missing and hidden cards; the remaining cards fill the freed space without gaps.')}
      </li>
      <li>
        <strong>{t('Manual indexes')}:</strong>{' '}
        {t('opens an additional input for each card with its index in the grid. Indexes start at 0 and end at {range}, left to right, top to bottom. You can also set index -1, then the card is not drawn.', {
          range: t('row count * column count - 1'),
        })}
      </li>
    </ul>
  );
};

const GridHelp: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <p><strong>{t('Grid and card order:')}</strong></p>
      <p>
        {t('On each tab you can configure the grid of the final card. The grid size can be automatic or manual. Automatic size picks rows and columns based on the number of shown cards: width is filled first (up to 6 columns for slimes, relics, and buffs, and up to 4 for equipment and artifacts), then rows are added. Manual size shows row and column counters. The “Manual indexes” mode always uses manual size.')}
      </p>
      <p>
        {t('Cards fill the grid from left to right, top to bottom. The “Missing” option controls what happens to missing and manually hidden cards:')}
      </p>
      <MissingModesHelp />
      <p>
        {t('In “Keep in place”, “Move to end”, and “Hide missing” modes you can enable the “Enable hiding” switch — then a “Hide/Show” button appears under each card. A hidden card is dimmed in the editor so it can be restored, but it is not displayed in the final image. If you choose “Disable hiding”, all cards are temporarily shown, and their marks are kept for the next time you enable hiding.')}
      </p>
    </>
  );
};

const HelpContent: React.FC = () => (
  <>
    <GeneralHelp />
    <PreferencesHelp />
    <Divider />
    <EquipmentHelp />
    <Divider />
    <SlimesHelp />
    <Divider />
    <RelicsHelp />
    <Divider />
    <ArtifactsHelp />
    <Divider />
    <BuffsHelp />
    <Divider />
    <GridHelp />
  </>
);

export const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const { t } = useI18n();

  return (
    <Modal open={open} onClose={onClose} className={styles.dialog}>
      <div className={styles.header}>
        <h3>{t('Help')}</h3>
      </div>

      <div className={styles.body}>
        <HelpContent />
      </div>

      <button
        type="button"
        className={cx(modalStyles.actionBtn, modalStyles.primaryBtn, styles.closeBtn)}
        onClick={onClose}
      >
        {t('Close')}
      </button>
    </Modal>
  );
};
