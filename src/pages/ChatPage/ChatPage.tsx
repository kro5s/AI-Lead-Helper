import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@alfalab/core-components/button';
import { IconButton } from '@alfalab/core-components/icon-button';
import { Popover } from '@alfalab/core-components/popover';
import { ChevronDownMIcon } from '@alfalab/icons-glyph/ChevronDownMIcon';
import { DotsThreeVerticalSIcon } from '@alfalab/icons-glyph/DotsThreeVerticalSIcon';
import { PencilSIcon } from '@alfalab/icons-glyph/PencilSIcon';
import { PlusCircleMIcon } from '@alfalab/icons-glyph/PlusCircleMIcon';
import { PushpinMIcon } from '@alfalab/icons-glyph/PushpinMIcon';
import { SendMIcon } from '@alfalab/icons-glyph/SendMIcon';
import { TrashCanSIcon } from '@alfalab/icons-glyph/TrashCanSIcon';
import clsx from 'clsx';
import styles from './ChatPage.module.css';

type ChatRole = 'user' | 'assistant';
type ThreadPeriod = 'today' | 'week' | 'month';

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type ChatThread = {
  id: string;
  title: string;
  period: ThreadPeriod;
  pinned?: boolean;
  messages: ChatMessage[];
};

const EMPTY_THREAD_TITLE = 'Новый чат';

const ROLE_OPTIONS = ['Руководитель', 'Аналитик', 'Разработчик'] as const;

const SUGGESTIONS = ['Дайджест за неделю', 'Саммари встречи', 'Создать задачу', 'Найти в confluence / jira'];

const THREAD_GROUPS: { id: ThreadPeriod; label: string }[] = [
  { id: 'today', label: 'Сегодня' },
  { id: 'week', label: '7 дней' },
  { id: 'month', label: '30 дней' },
];

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'weekly-digest',
    title: 'Дайджест за неделю (Команда Платинума)',
    period: 'today',
    messages: [],
  },
  {
    id: 'meeting-protocol',
    title: 'Протокол встречи: Альфа-Ассистент',
    period: 'week',
    messages: [
      {
        id: 'meeting-protocol-user',
        role: 'user',
        text: 'Собери короткий протокол встречи по Альфа-Ассистенту.',
      },
      {
        id: 'meeting-protocol-assistant',
        role: 'assistant',
        text: 'Ключевые решения: уточнить сценарии доступа, обновить backlog и вынести интеграционные риски в отдельную задачу.',
      },
    ],
  },
  {
    id: 'team-analytics',
    title: 'Аналитика по команде Платинума',
    period: 'month',
    messages: [
      {
        id: 'team-analytics-user',
        role: 'user',
        text: 'Покажи, где команда Платинума теряет больше всего времени.',
      },
      {
        id: 'team-analytics-assistant',
        role: 'assistant',
        text: 'Самая заметная зона потерь сейчас на согласованиях требований и ожидании ревью. Предлагаю начать с WIP-лимитов и ежедневного списка блокеров.',
      },
    ],
  },
  {
    id: 'create-doc-task',
    title: 'Создать задачу: обновить документацию',
    period: 'month',
    messages: [
      {
        id: 'create-doc-task-user',
        role: 'user',
        text: 'Создай задачу на обновление документации по onboarding.',
      },
      {
        id: 'create-doc-task-assistant',
        role: 'assistant',
        text: 'Черновик задачи готов: обновить onboarding-раздел, добавить список ответственных и сверить ссылки на Confluence/Jira.',
      },
    ],
  },
];

const createId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const createEmptyThread = (): ChatThread => ({
  id: createId('chat'),
  title: EMPTY_THREAD_TITLE,
  period: 'today',
  messages: [],
});

const createThreadTitle = (prompt: string) => {
  const normalizedPrompt = prompt.replace(/\s+/g, ' ').trim();

  if (normalizedPrompt.length <= 42) {
    return normalizedPrompt;
  }

  return `${normalizedPrompt.slice(0, 39)}...`;
};

const createAssistantResponse = (prompt: string) => {
  const lowerPrompt = prompt.toLowerCase();

  if (lowerPrompt.includes('дайджест') || lowerPrompt.includes('отчёт') || lowerPrompt.includes('отчет')) {
    return 'Готовлю еженедельный дайджест: выделю завершённые задачи, риски по срокам, блокеры и предложения для следующего планирования.';
  }

  if (lowerPrompt.includes('саммари') || lowerPrompt.includes('встреч')) {
    return 'Соберу саммари встречи в формате: решения, открытые вопросы, ответственные и следующие шаги.';
  }

  if (lowerPrompt.includes('задач')) {
    return 'Могу оформить задачу: добавлю цель, контекст, критерии готовности, исполнителей и ссылку на источник.';
  }

  if (lowerPrompt.includes('confluence') || lowerPrompt.includes('jira')) {
    return 'Поищу связанные материалы в Confluence и Jira, затем сгруппирую найденное по проектам и степени актуальности.';
  }

  return 'Принял запрос. Я разложу его на понятные шаги, отмечу риски и предложу следующий лучший action для команды.';
};

export function ChatPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const responseTimerRef = useRef<number | null>(null);
  const [threads, setThreads] = useState(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState(INITIAL_THREADS[0].id);
  const [draft, setDraft] = useState('Напиши мне еженедельный отчёт');
  const [selectedRole, setSelectedRole] = useState<(typeof ROLE_OPTIONS)[number]>(ROLE_OPTIONS[0]);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [openMenuThreadId, setOpenMenuThreadId] = useState<string | null>(null);
  const [menuAnchorElement, setMenuAnchorElement] = useState<HTMLElement | null>(null);
  const [threadIdPendingDelete, setThreadIdPendingDelete] = useState<string | null>(null);
  const [renamingThreadId, setRenamingThreadId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [respondingThreadId, setRespondingThreadId] = useState<string | null>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [activeThreadId, threads],
  );

  const groupedThreads = useMemo(
    () =>
      THREAD_GROUPS.map((group) => ({
        ...group,
        threads: threads
          .filter((thread) => thread.period === group.id)
          .toSorted((firstThread, secondThread) => Number(secondThread.pinned) - Number(firstThread.pinned)),
      })).filter((group) => group.threads.length > 0),
    [threads],
  );

  const activeThreadResponding = respondingThreadId === activeThread?.id;
  const hasMessages = Boolean(activeThread?.messages.length);
  const menuThread = threads.find((thread) => thread.id === openMenuThreadId);

  useEffect(
    () => () => {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!openMenuThreadId) {
      return undefined;
    }

    const handleDocumentMouseDown = (event: MouseEvent) => {
      const target = event.target;

      if (target instanceof Element && target.closest('[data-chat-actions-menu]')) {
        return;
      }

      setOpenMenuThreadId(null);
      setMenuAnchorElement(null);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [openMenuThreadId]);

  const handleNewChat = () => {
    const newThread = createEmptyThread();

    setThreads((currentThreads) => [newThread, ...currentThreads]);
    setActiveThreadId(newThread.id);
    setDraft('');
    setOpenMenuThreadId(null);
    setMenuAnchorElement(null);
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSendPrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim();

    if (!activeThread || !trimmedPrompt || respondingThreadId) {
      return;
    }

    const targetThreadId = activeThread.id;
    const userMessage: ChatMessage = {
      id: createId('user-message'),
      role: 'user',
      text: trimmedPrompt,
    };

    setThreads((currentThreads) =>
      currentThreads.map((thread) => {
        if (thread.id !== targetThreadId) {
          return thread;
        }

        return {
          ...thread,
          title: thread.messages.length === 0 ? createThreadTitle(trimmedPrompt) : thread.title,
          messages: [...thread.messages, userMessage],
        };
      }),
    );
    setDraft('');
    setRespondingThreadId(targetThreadId);

    if (responseTimerRef.current) {
      window.clearTimeout(responseTimerRef.current);
    }

    responseTimerRef.current = window.setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: createId('assistant-message'),
        role: 'assistant',
        text: createAssistantResponse(trimmedPrompt),
      };

      setThreads((currentThreads) =>
        currentThreads.map((thread) =>
          thread.id === targetThreadId ? { ...thread, messages: [...thread.messages, assistantMessage] } : thread,
        ),
      );
      setRespondingThreadId(null);
      responseTimerRef.current = null;
    }, 700);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendPrompt(draft);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setDraft(suggestion);
    inputRef.current?.focus();
  };

  const handleStartRename = (thread: ChatThread) => {
    setRenameValue(thread.title);
    setRenamingThreadId(thread.id);
    setOpenMenuThreadId(null);
    setMenuAnchorElement(null);
  };

  const handleFinishRename = () => {
    const nextTitle = renameValue.trim();

    if (!renamingThreadId || !nextTitle) {
      setRenamingThreadId(null);
      return;
    }

    setThreads((currentThreads) =>
      currentThreads.map((thread) => (thread.id === renamingThreadId ? { ...thread, title: nextTitle } : thread)),
    );
    setRenamingThreadId(null);
  };

  const handleRenameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleFinishRename();
    }

    if (event.key === 'Escape') {
      setRenamingThreadId(null);
    }
  };

  const handleTogglePinned = (threadId: string) => {
    setThreads((currentThreads) =>
      currentThreads.map((thread) => (thread.id === threadId ? { ...thread, pinned: !thread.pinned } : thread)),
    );
    setOpenMenuThreadId(null);
    setMenuAnchorElement(null);
  };

  const handleRequestDelete = (threadId: string) => {
    setThreadIdPendingDelete(threadId);
    setOpenMenuThreadId(null);
    setMenuAnchorElement(null);
  };

  const handleConfirmDelete = () => {
    if (!threadIdPendingDelete) {
      return;
    }

    if (responseTimerRef.current && respondingThreadId === threadIdPendingDelete) {
      window.clearTimeout(responseTimerRef.current);
      responseTimerRef.current = null;
      setRespondingThreadId(null);
    }

    setThreads((currentThreads) => {
      const nextThreads = currentThreads.filter((thread) => thread.id !== threadIdPendingDelete);

      if (nextThreads.length === 0) {
        const fallbackThread = createEmptyThread();
        setActiveThreadId(fallbackThread.id);
        return [fallbackThread];
      }

      if (activeThreadId === threadIdPendingDelete) {
        setActiveThreadId(nextThreads[0].id);
      }

      return nextThreads;
    });
    setThreadIdPendingDelete(null);
  };

  const threadPendingDelete = threads.find((thread) => thread.id === threadIdPendingDelete);

  return (
    <section className={styles.page} aria-label="Чат с ИИ">
      <div className={styles.workspace}>
        <div className={styles.roleSwitcher}>
          <button
            aria-expanded={roleMenuOpen}
            aria-haspopup="listbox"
            className={styles.roleButton}
            type="button"
            onClick={() => setRoleMenuOpen((currentValue) => !currentValue)}
          >
            <span>{selectedRole}</span>
            <ChevronDownMIcon className={clsx(styles.roleIcon, roleMenuOpen && styles.roleIconOpen)} />
          </button>

          {roleMenuOpen && (
            <div className={styles.roleMenu} role="listbox">
              {ROLE_OPTIONS.map((role) => (
                <button
                  key={role}
                  aria-selected={role === selectedRole}
                  className={clsx(styles.roleOption, role === selectedRole && styles.roleOptionActive)}
                  role="option"
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setRoleMenuOpen(false);
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasMessages ? (
          <div className={styles.conversation}>
            <div className={styles.messages} aria-live="polite">
              {activeThread?.messages.map((message) => (
                <article
                  key={message.id}
                  className={clsx(styles.message, message.role === 'user' ? styles.userMessage : styles.aiMessage)}
                >
                  <span className={styles.messageAuthor}>{message.role === 'user' ? 'Вы' : 'VPIKe AI'}</span>
                  <p className={styles.messageText}>{message.text}</p>
                </article>
              ))}

              {activeThreadResponding && (
                <article className={clsx(styles.message, styles.aiMessage)}>
                  <span className={styles.messageAuthor}>VPIKe AI</span>
                  <p className={styles.messageText}>Печатает ответ...</p>
                </article>
              )}
            </div>

            <ChatComposer
              draft={draft}
              inputRef={inputRef}
              responding={Boolean(respondingThreadId)}
              onDraftChange={setDraft}
              onSubmit={handleSubmit}
            />
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <h1 className={styles.greeting}>
                <span>Привет!</span>
                <span>Чем помочь сегодня?</span>
              </h1>

              <ChatComposer
                draft={draft}
                inputRef={inputRef}
                responding={Boolean(respondingThreadId)}
                onDraftChange={setDraft}
                onSubmit={handleSubmit}
              />

              <div className={styles.suggestions} aria-label="Быстрые запросы">
                {SUGGESTIONS.map((suggestion) => (
                  <Button
                    key={suggestion}
                    className={styles.suggestionButton}
                    size={40}
                    view="secondary"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <aside className={styles.historyPanel} aria-label="История чатов">
        <Button
          className={styles.newChatButton}
          leftAddons={<PlusCircleMIcon className={styles.newChatIcon} />}
          size={40}
          view="secondary"
          onClick={handleNewChat}
        >
          Новый чат
        </Button>

        <div className={styles.historyGroups}>
          {groupedThreads.map((group) => (
            <section key={group.id} className={styles.historyGroup} aria-labelledby={`chat-group-${group.id}`}>
              <h2 id={`chat-group-${group.id}`} className={styles.historyGroupTitle}>
                {group.label}
              </h2>

              <div className={styles.threadList}>
                {group.threads.map((thread) => {
                  const active = thread.id === activeThread?.id;
                  const menuOpen = openMenuThreadId === thread.id;
                  const renaming = renamingThreadId === thread.id;

                  return (
                    <div key={thread.id} className={clsx(styles.threadRow, active && styles.threadRowActive)}>
                      <button
                        className={clsx(styles.threadButton, active && styles.threadButtonActive)}
                        type="button"
                        onClick={() => setActiveThreadId(thread.id)}
                      >
                        {renaming ? (
                          <input
                            autoFocus
                            className={styles.renameInput}
                            value={renameValue}
                            onBlur={handleFinishRename}
                            onChange={(event) => setRenameValue(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            onKeyDown={handleRenameKeyDown}
                          />
                        ) : (
                          <span className={styles.threadTitle}>{thread.title}</span>
                        )}
                      </button>

                      <div
                        data-chat-actions-menu
                        className={clsx(styles.threadActions, menuOpen && styles.threadActionsOpen)}
                        onMouseEnter={() => setOpenMenuThreadId(thread.id)}
                      >
                        <button
                          aria-expanded={menuOpen}
                          aria-label={`Действия с чатом ${thread.title}`}
                          className={styles.threadMenuButton}
                          type="button"
                          onClick={(event) => {
                            const nextThreadId = menuOpen ? null : thread.id;

                            setOpenMenuThreadId(nextThreadId);
                            setMenuAnchorElement(nextThreadId ? event.currentTarget : null);
                          }}
                          onFocus={(event) => {
                            setMenuAnchorElement(event.currentTarget);
                          }}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') {
                              return;
                            }

                            event.preventDefault();
                            event.stopPropagation();

                            const nextThreadId = menuOpen ? null : thread.id;

                            setOpenMenuThreadId(nextThreadId);
                            setMenuAnchorElement(nextThreadId ? event.currentTarget : null);
                          }}
                          onMouseEnter={(event) => {
                            setOpenMenuThreadId(thread.id);
                            setMenuAnchorElement(event.currentTarget);
                          }}
                        >
                          <DotsThreeVerticalSIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>

      <Popover
        anchorElement={menuAnchorElement}
        fallbackPlacements={['top-end', 'left-end', 'left-start']}
        getPortalContainer={() => document.body}
        offset={[0, 8]}
        open={Boolean(menuThread && menuAnchorElement && !threadPendingDelete)}
        popperClassName={styles.threadMenuPopover}
        position="bottom-end"
        withTransition={false}
        zIndex={40}
      >
        {menuThread && (
          <div className={styles.threadMenu} data-chat-actions-menu role="menu">
            <button
              className={styles.threadMenuItem}
              role="menuitem"
              type="button"
              onClick={() => handleStartRename(menuThread)}
            >
              <PencilSIcon className={styles.threadMenuIcon} />
              Переименовать
            </button>
            <button
              className={styles.threadMenuItem}
              role="menuitem"
              type="button"
              onClick={() => handleTogglePinned(menuThread.id)}
            >
              <PushpinMIcon className={styles.threadMenuIcon} />
              {menuThread.pinned ? 'Открепить' : 'Закрепить'}
            </button>
            <button
              className={clsx(styles.threadMenuItem, styles.threadMenuItemDanger)}
              role="menuitem"
              type="button"
              onClick={() => handleRequestDelete(menuThread.id)}
            >
              <TrashCanSIcon className={styles.threadMenuIcon} />
              Удалить
            </button>
          </div>
        )}
      </Popover>

      {threadPendingDelete && (
        <div className={styles.modalOverlay} role="presentation">
          <div
            aria-describedby="delete-chat-description"
            aria-labelledby="delete-chat-title"
            aria-modal="true"
            className={styles.deleteDialog}
            role="dialog"
          >
            <div className={styles.dialogText}>
              <h2 id="delete-chat-title" className={styles.dialogTitle}>
                Удалить чат?
              </h2>
              <p id="delete-chat-description" className={styles.dialogDescription}>
                После удаления чат невозможно будет восстановить
              </p>
            </div>
            <div className={styles.dialogActions}>
              <Button className={styles.cancelButton} size={40} view="secondary" onClick={() => setThreadIdPendingDelete(null)}>
                Отмена
              </Button>
              <Button className={styles.deleteButton} size={40} view="primary" onClick={handleConfirmDelete}>
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type ChatComposerProps = {
  draft: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  responding: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

function ChatComposer({ draft, inputRef, responding, onDraftChange, onSubmit }: ChatComposerProps) {
  return (
    <form className={styles.composer} onSubmit={onSubmit}>
      <input
        ref={inputRef}
        aria-label="Сообщение для VPIKe AI"
        className={styles.composerInput}
        disabled={responding}
        placeholder="Спросите что-нибудь"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
      />
      <IconButton
        aria-label="Отправить сообщение"
        className={styles.sendButton}
        disabled={!draft.trim() || responding}
        icon={SendMIcon}
        size={32}
        type="submit"
        view="primary"
      />
    </form>
  );
}
