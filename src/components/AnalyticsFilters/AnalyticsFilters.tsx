import { Select, type SelectProps } from '@alfalab/core-components/select';
import type { AnalyticsFiltersProps } from './types';
import styles from './AnalyticsFilters.module.css';

type SelectChangeHandler = NonNullable<SelectProps['onChange']>;

const TEAM_OPTIONS: SelectProps['options'] = [
  { key: 'team-1', content: 'Команда 1' },
  { key: 'team-2', content: 'Команда 2' },
  { key: 'team-3', content: 'Команда 3' },
];

const PERIOD_OPTIONS: SelectProps['options'] = [
  { key: 'week', content: 'По неделе' },
  { key: 'month', content: 'По месяцу' },
  { key: 'quarter', content: 'По кварталу' },
];

export function AnalyticsFilters({ value, onChange }: AnalyticsFiltersProps) {
  const handleTeamChange: SelectChangeHandler = ({ selected }) => {
    onChange({ ...value, team: selected?.key ?? 'team-1' });
  };

  const handlePeriodChange: SelectChangeHandler = ({ selected }) => {
    onChange({ ...value, period: selected?.key ?? 'week' });
  };

  return (
    <div className={styles.filters}>
      <Select
        className={styles.select}
        fieldClassName={styles.selectField}
        options={TEAM_OPTIONS}
        selected={value.team}
        size={40}
        optionsSize={40}
        onChange={handleTeamChange}
      />
      <Select
        className={styles.select}
        fieldClassName={styles.selectField}
        options={PERIOD_OPTIONS}
        selected={value.period}
        size={40}
        optionsSize={40}
        onChange={handlePeriodChange}
      />
    </div>
  );
}
