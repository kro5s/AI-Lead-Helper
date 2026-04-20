import { useMemo, useState } from 'react';
import { EventsFilters } from '../../components/EventsFilters/EventsFilters';
import type { EventsFiltersValue } from '../../components/EventsFilters/types';
import { EventsTable } from '../../components/EventsTable/EventsTable';
import type { SignificantEvent } from '../../types/events';
import styles from './SignificantEventsPage.module.css';

const INITIAL_EVENTS: SignificantEvent[] = [
  {
    id: 'credit-rating-github',
    priority: 'high',
    title: 'Интеграция с сервисом проверки кредитного рейтинга',
    performers: ['Волкова Татьяна', 'Соколов Сергей'],
    description: 'Нужно согласовать формат ответа и обработку ошибок внешнего сервиса.',
    sourceUrl: 'https://github.com/alfa-mobile/android-credit-rating',
    selected: true,
  },
  {
    id: 'credit-rating-android',
    priority: 'high',
    title: 'Интеграция с сервисом проверки кредитного рейтинга',
    performers: ['Волкова Татьяна', 'Соколов Сергей'],
    description: 'Подготовить обновление Android-клиента под новый контракт.',
    sourceUrl: 'https://github.com/alfa-mobile/android-application',
  },
  {
    id: 'biometry-auth-jira',
    priority: 'medium',
    title: 'Рефакторинг модуля авторизации по биометрии',
    performers: ['Александровская Елена', 'Константинопольский Максим', 'Команда тестирования'],
    description: 'Риск сдвига сроков из-за зависимости от платформенной команды безопасности.',
    sourceUrl: 'https://jira.alfabank.ru/issues/?jql=team=biometry',
  },
  {
    id: 'biometry-auth-core',
    priority: 'medium',
    title: 'Рефакторинг модуля авторизации по биометрии',
    performers: ['Александровская Елена', 'Константинопольский Максим', 'Команда интеграции'],
    description: 'Проверить сценарии повторной авторизации и восстановление сессии.',
    sourceUrl: 'https://jira.alfabank.ru/issues/?jql=team=auth-core',
  },
  {
    id: 'biometry-auth-release',
    priority: 'medium',
    title: 'Рефакторинг модуля авторизации по биометрии',
    performers: ['Александровская Елена', 'Константинопольский Максим'],
    description: 'Зафиксировать критерии готовности к бизнес-тесту.',
    sourceUrl: 'https://jira.alfabank.ru/issues/?jql=team=release-auth',
  },
  {
    id: 'loyalty-cashback',
    priority: 'low',
    title: 'Интеграция экрана лояльности с кешбэк-сервисом',
    performers: ['Михайлова Ольга', 'Петров Максим'],
    description: 'Ожидается подтверждение параметров кешбэк-витрины.',
    sourceUrl: 'https://jira.alfabank.ru/issues/?jql=project=loyalty',
  },
  {
    id: 'biometry-auth-api',
    priority: 'medium',
    title: 'Рефакторинг модуля авторизации по биометрии',
    performers: ['Константинопольский Максим', 'Платформенная команда'],
    description: 'Нужно синхронизировать изменения в core-api и мобильном клиенте.',
    sourceUrl: 'https://github.com/alfabank/core-api/account-auth',
  },
  {
    id: 'biometry-auth-qa',
    priority: 'medium',
    title: 'Рефакторинг модуля авторизации по биометрии',
    performers: ['Команда тестирования', 'Александровская Елена'],
    description: 'Добавить регрессионные проверки для нестабильных устройств.',
    sourceUrl: 'https://jira.alfabank.ru/issues/?jql=team=qa-auth',
  },
  {
    id: 'loyalty-cashback-release',
    priority: 'low',
    title: 'Интеграция экрана лояльности с кешбэк-сервисом',
    performers: ['Михайлова Ольга', 'Семенов Антон'],
    description: 'Подготовить внедрение после подтверждения бизнес-теста.',
    sourceUrl: 'https://jira.alfabank.ru/issues/?jql=project=loyalty-release',
  },
];

export function SignificantEventsPage() {
  const [filters, setFilters] = useState<EventsFiltersValue>({ team: 'all', period: 'week' });
  const [events, setEvents] = useState(INITIAL_EVENTS);

  const visibleEvents = useMemo(() => {
    if (filters.team === 'all') {
      return events;
    }

    return events.filter((event) => event.sourceUrl.includes(filters.team));
  }, [events, filters.team]);

  const handleToggleEvent = (eventId: string, checked: boolean) => {
    setEvents((currentEvents) =>
      currentEvents.map((event) => (event.id === eventId ? { ...event, selected: checked } : event)),
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.filters}>
        <EventsFilters value={filters} onChange={setFilters} />
      </div>
      <EventsTable events={visibleEvents} onToggleEvent={handleToggleEvent} />
    </div>
  );
}
