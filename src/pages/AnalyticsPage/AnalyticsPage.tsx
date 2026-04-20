import { useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import confluenceIconUrl from '../../assets/icons/confluence.svg';
import jiraIconUrl from '../../assets/icons/jira.svg';
import { AnalyticsBarChart } from '../../components/AnalyticsBarChart/AnalyticsBarChart';
import { AnalyticsFilters } from '../../components/AnalyticsFilters/AnalyticsFilters';
import type { AnalyticsFiltersValue } from '../../components/AnalyticsFilters/types';
import { AnalyticsTasksTable } from '../../components/AnalyticsTasksTable/AnalyticsTasksTable';
import { AnalyticsTimeline } from '../../components/AnalyticsTimeline/AnalyticsTimeline';
import { TaskComparison } from '../../components/TaskComparison/TaskComparison';
import type {
  AnalyticsTask,
  AnalyticsTimelineMonth,
  AnalyticsTimelineRow,
  AnalyticsTimelineWeek,
  PersonTasksMetric,
  TaskComparisonMetric,
} from '../../types/analytics';
import styles from './AnalyticsPage.module.css';

const ANALYTICS_TASKS: AnalyticsTask[] = [
  {
    id: 'mobile-auth-refactor',
    initiator: { role: 'Руководитель', name: 'Максимова Ольга' },
    title: 'Рефакторинг модуля авторизации по биометрии',
    complexity: 'hard',
    period: '22.03 - 17.04',
    periodCritical: true,
    performers: ['Александровская Елена', 'Константинопольский Максим'],
    sourceUrl: 'https://jira.alfabank.ru/browse/VPIKE-102',
    status: 'open',
  },
  {
    id: 'growth-showcase',
    initiator: { role: 'Фронтенд-разработчик', name: 'Константинопольский Виктор' },
    title: 'Интеграция экрана лояльности с кешбэк-сервисом',
    complexity: 'easy',
    period: '14.03 - 29.04',
    performers: ['Лебедев Игорь', 'Смирнова Анна'],
    sourceUrl: 'https://jira.alfabank.ru/browse/VPIKE-118',
    status: 'open',
  },
  {
    id: 'credit-rating-service',
    initiator: { role: 'Аналитик', name: 'Васильева Елена' },
    title: 'Интеграция с сервисом проверки кредитного рейтинга',
    complexity: 'hard',
    period: '01.03 - 10.03',
    performers: ['Иванова Ольга', 'Лебедев Антон'],
    sourceUrl: 'https://jira.alfabank.ru/browse/VPIKE-126',
    status: 'closed',
  },
  {
    id: 'cashback-business-test',
    initiator: { role: 'Бэкенд-разработчик', name: 'Лебедев Игорь' },
    title: 'API: Перевод между своими счетами',
    complexity: 'hard',
    period: '08.02 - 19.03',
    performers: ['Соколов Сергей', 'Морозов Виктор'],
    sourceUrl: 'https://github.com/alfabank/core-api/pull/324',
    status: 'closed',
  },
];

const TASK_COMPARISON_METRICS: TaskComparisonMetric[] = [
  { id: 'active', label: 'В работе', value: 15, deltaLabel: 'больше на', deltaValue: 3, tone: 'neutral' },
  { id: 'backlog', label: 'В бэклоге', value: 23, deltaLabel: 'меньше на', deltaValue: 1, tone: 'info' },
  { id: 'done', label: 'Завершённых', value: 5, deltaLabel: 'столько же', deltaValue: 5, tone: 'accent' },
];

const COMPLETED_TASKS_BY_PERSON: PersonTasksMetric[] = [
  { id: 'vasilieva', name: 'Васильева Елена', easy: 6, hard: 0 },
  { id: 'volkova', name: 'Волкова Татьяна', easy: 5, hard: 1 },
  { id: 'kuznetsov', name: 'Кузнец Дмитрий', easy: 3, hard: 0 },
  { id: 'lebedev', name: 'Лебедев Игорь', easy: 5, hard: 2 },
  { id: 'maksimova', name: 'Максимова Ольга', easy: 1, hard: 1 },
];

const ACTIVE_TASKS_BY_PERSON: PersonTasksMetric[] = [
  { id: 'vasilieva', name: 'Васильева Елена', easy: 5, hard: 1 },
  { id: 'volkova', name: 'Волкова Татьяна', easy: 1, hard: 1 },
  { id: 'kuznetsov', name: 'Кузнец Дмитрий', easy: 5, hard: 2 },
  { id: 'lebedev', name: 'Лебедев Игорь', easy: 3, hard: 0 },
  { id: 'maksimova', name: 'Максимова Ольга', easy: 0, hard: 3 },
];

const TIMELINE_MONTHS: AnalyticsTimelineMonth[] = [
  { id: 'march', label: 'Март', startWeek: 0, span: 4 },
  { id: 'april', label: 'Апрель', startWeek: 4, span: 4 },
];

const TIMELINE_WEEKS: AnalyticsTimelineWeek[] = [
  { id: 'march-1', label: 'Неделя 1', dates: '02.03 - 08.03', startDate: '2026-03-02', endDate: '2026-03-08' },
  { id: 'march-2', label: 'Неделя 2', dates: '09.03 - 15.03', startDate: '2026-03-09', endDate: '2026-03-15' },
  { id: 'march-3', label: 'Неделя 3', dates: '16.03 - 22.03', startDate: '2026-03-16', endDate: '2026-03-22' },
  { id: 'march-4', label: 'Неделя 4', dates: '23.03 - 29.03', startDate: '2026-03-23', endDate: '2026-03-29' },
  { id: 'april-1', label: 'Неделя 1', dates: '30.03 - 05.04', startDate: '2026-03-30', endDate: '2026-04-05' },
  { id: 'april-2', label: 'Неделя 2', dates: '06.04 - 12.04', startDate: '2026-04-06', endDate: '2026-04-12' },
  { id: 'april-3', label: 'Неделя 3', dates: '13.04 - 19.04', startDate: '2026-04-13', endDate: '2026-04-19' },
  { id: 'april-4', label: 'Неделя 4', dates: '20.04 - 26.04', startDate: '2026-04-20', endDate: '2026-04-26' },
];

const TIMELINE_ROWS: AnalyticsTimelineRow[] = [
  {
    id: 'loyalty-cashback',
    title: 'Интеграция экрана лояльности с кешбэк-сервисом',
    tone: 'info',
    stages: [
      { id: 'loyalty-analytics', title: 'Аналитика', assignee: 'Михайлова Ольга', startWeek: 0, span: 2 },
      { id: 'loyalty-dev-1', title: 'Разработка 1', assignee: 'Петров Максим', startWeek: 2, span: 1 },
      { id: 'loyalty-dev-2', title: 'Разработка 2', assignee: 'Семенов Антон', startWeek: 2, span: 1, lane: 2 },
      { id: 'loyalty-test', title: 'Тест', startWeek: 3, span: 2 },
      { id: 'loyalty-integration', title: 'Интеграция', startWeek: 6, span: 1 },
      { id: 'loyalty-business-test', title: 'Бизнес тест', startWeek: 6, span: 1, lane: 2 },
      { id: 'loyalty-release', title: 'Внедрение', startWeek: 7, span: 1, isCritical: true },
    ],
  },
  {
    id: 'biometry-auth',
    title: 'Рефакторинг модуля авторизации по биометрии',
    tone: 'negative',
    stages: [
      { id: 'biometry-analytics', title: 'Аналитика', assignee: 'Александровская Елена', startWeek: 0, span: 2 },
      { id: 'biometry-dev', title: 'Разработка', assignee: 'Константинопольский Максим', startWeek: 2, span: 1 },
      { id: 'biometry-test', title: 'Тест', startWeek: 3, span: 2 },
      { id: 'biometry-integration', title: 'Интеграция', startWeek: 5, span: 1 },
      { id: 'biometry-release', title: 'Внедрение', startWeek: 6, span: 1, isCritical: true },
    ],
  },
  {
    id: 'credit-rating',
    title: 'Интеграция с сервисом проверки кредитного рейтинга',
    tone: 'positive',
    stages: [
      { id: 'credit-analytics', title: 'Аналитика', assignee: 'Волкова Татьяна', startWeek: 0, span: 2 },
      { id: 'credit-dev', title: 'Разработка', assignee: 'Соколов Сергей', startWeek: 2, span: 1 },
      { id: 'credit-test', title: 'Тест', startWeek: 3, span: 2 },
      { id: 'credit-integration', title: 'Интеграция', startWeek: 5, span: 1 },
      { id: 'credit-release', title: 'Внедрение', startWeek: 6, span: 1, isCritical: true },
    ],
  },
];

export function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFiltersValue>({ team: 'team-1', period: 'week' });

  return (
    <div className={styles.page}>
      <div className={styles.topSection}>
        <header className={styles.header}>
          <AnalyticsFilters value={filters} onChange={setFilters} />
          <div className={styles.externalLinks}>
            <Button
              className={styles.linkButton}
              href="https://jira.alfabank.ru"
              leftAddons={<img alt="" className={styles.serviceIcon} src={jiraIconUrl} />}
              size={32}
              target="_blank"
              view="transparent"
            >
              Jira
            </Button>
            <Button
              className={styles.linkButton}
              href="https://confluence.alfabank.ru"
              leftAddons={<img alt="" className={styles.serviceIcon} src={confluenceIconUrl} />}
              size={32}
              target="_blank"
              view="transparent"
            >
              Confluence
            </Button>
          </div>
        </header>
        <AnalyticsTasksTable tasks={ANALYTICS_TASKS} />
      </div>
      <TaskComparison metrics={TASK_COMPARISON_METRICS} />
      <div className={styles.chartsGrid}>
        <AnalyticsBarChart data={COMPLETED_TASKS_BY_PERSON} title="Количество выполненных задач на человека" />
        <AnalyticsBarChart data={ACTIVE_TASKS_BY_PERSON} title="Количество активных задач на человека" />
      </div>
      <AnalyticsTimeline months={TIMELINE_MONTHS} rows={TIMELINE_ROWS} weeks={TIMELINE_WEEKS} />
    </div>
  );
}
