import { Typography } from '@alfalab/core-components/typography';
import { PencilSIcon } from '@alfalab/icons-glyph/PencilSIcon';
import type { AnalyticsTaskComplexity } from '../../../types/analytics';
import styles from '../AnalyticsTasksTable.module.css';

const COMPLEXITY_LABELS: Record<AnalyticsTaskComplexity, string> = {
  easy: 'Лёгкая',
  hard: 'Сложная',
};

type ComplexityCellProps = {
  complexity: AnalyticsTaskComplexity;
};

export function ComplexityCell({ complexity }: ComplexityCellProps) {
  return (
    <div className={styles.complexity}>
      <Typography.Text tag="span" view="primary-small">
        {COMPLEXITY_LABELS[complexity]}
      </Typography.Text>
      <PencilSIcon className={styles.complexityIcon} />
    </div>
  );
}
