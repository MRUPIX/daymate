import { useEffect, useRef, useState } from 'react';
import './dashboard.css';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

const PRIORITIES = {
  high: { label: 'زیاد', icon: 'arrow-up' },
  medium: { label: 'متوسط', icon: 'minus' },
  low: { label: 'کم', icon: 'arrow-down' },
};

const INITIAL_TASKS = [
  {
    id: 1,
    title: 'مرور برنامه‌ی هفتگی',
    description: 'اولویت‌های این هفته را مرتب و زمان‌بندی کن.',
    priority: 'medium',
    dueTime: '08:00',
    completed: true,
    overdue: false,
  },
  {
    id: 2,
    title: 'جلسه با تیم طراحی',
    description: 'نسخه‌ی جدید داشبورد و بازخوردهای کاربران را مرور کنیم.',
    priority: 'high',
    dueTime: '09:30',
    completed: false,
    overdue: true,
  },
  {
    id: 3,
    title: 'پاسخ به ایمیل‌های مهم',
    description: 'پیام‌های علامت‌گذاری‌شده‌ی صندوق ورودی را بررسی کن.',
    priority: 'medium',
    dueTime: '11:15',
    completed: true,
    overdue: false,
  },
  {
    id: 4,
    title: 'آماده‌سازی گزارش پیشرفت',
    description: 'خلاصه‌ی دستاوردها و موانع این ماه را ثبت کن.',
    priority: 'high',
    dueTime: '14:00',
    completed: false,
    overdue: false,
  },
  {
    id: 5,
    title: 'سی دقیقه مطالعه',
    description: 'فصل سوم کتاب عادت‌های اتمی را تمام کن.',
    priority: 'low',
    dueTime: '18:00',
    completed: false,
    overdue: false,
  },
  {
    id: 6,
    title: 'پیاده‌روی عصرگاهی',
    description: 'یک مسیر کوتاه و آرام برای پایان روز.',
    priority: 'low',
    dueTime: '19:30',
    completed: false,
    overdue: false,
  },
];

const NAV_ITEMS = [
  { label: 'داشبورد', icon: 'dashboard', href: '#dashboard-overview', active: true },
  { label: 'کارهای من', icon: 'tasks', href: '#today-tasks' },
  { label: 'تقویم', icon: 'calendar', href: '#monthly-productivity' },
  { label: 'آمارها', icon: 'chart', href: '#quick-statistics' },
  { label: 'تنظیمات', icon: 'settings', href: '#dashboard-profile' },
];

const FILTERS = [
  { value: 'all', label: 'همه' },
  { value: 'high', label: 'زیاد' },
  { value: 'medium', label: 'متوسط' },
  { value: 'low', label: 'کم' },
];

const PRODUCTIVITY_PATTERN = [0.62, 0.78, 0.55, 0.88, 0.72, 0.92, 0.68, 0.81, 0.74, 0.96];

const CALENDAR_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US-u-ca-persian', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

const FULL_DATE_FORMATTER = new Intl.DateTimeFormat('fa-IR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const MONTH_FORMATTER = new Intl.DateTimeFormat('fa-IR', {
  month: 'long',
  year: 'numeric',
});

function toPersianDigits(value) {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

function getCalendarParts(date) {
  return Object.fromEntries(
    CALENDAR_PARTS_FORMATTER.formatToParts(date)
      .filter(({ type }) => type === 'year' || type === 'month' || type === 'day')
      .map(({ type, value }) => [type, Number(value)]),
  );
}

function getCurrentCalendar(date) {
  const current = getCalendarParts(date);
  const firstDay = new Date(date);
  firstDay.setHours(12, 0, 0, 0);
  firstDay.setDate(firstDay.getDate() - current.day + 1);

  let daysInMonth = 0;
  const cursor = new Date(firstDay);

  while (daysInMonth < 32) {
    const cursorParts = getCalendarParts(cursor);
    if (cursorParts.month !== current.month || cursorParts.year !== current.year) break;
    daysInMonth += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    ...current,
    daysInMonth,
    label: MONTH_FORMATTER.format(date),
  };
}

function createMonthlyData(calendar) {
  return Array.from({ length: calendar.daysInMonth }, (_, index) => {
    const day = index + 1;
    const future = day > calendar.day;

    if (future) {
      return { day, completed: 0, total: 0, percentage: 0, future: true };
    }

    const total = 5 + ((day * 3) % 5);
    const completionRate = PRODUCTIVITY_PATTERN[(day - 1) % PRODUCTIVITY_PATTERN.length];
    const completed = Math.max(1, Math.round(total * completionRate));

    return {
      day,
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
      future: false,
    };
  });
}

function getGreeting(hour) {
  if (hour < 5) return 'شب بخیر';
  if (hour < 12) return 'صبح بخیر';
  if (hour < 17) return 'ظهر بخیر';
  if (hour < 21) return 'عصر بخیر';
  return 'شب بخیر';
}

const DASHBOARD_ICONS = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    tasks: (
      <>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <path d="m3.5 6 1.2 1.2L7 4.8M3.5 12l1.2 1.2L7 10.8M3.5 18l1.2 1.2L7 16.8" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20V7" />
        <path d="M2 20h22" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    search: <path d="m21 21-4.3-4.3M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" />,
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        <path d="M10 21h4" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    stack: (
      <>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
      </>
    ),
    check: <path d="m5 12 4.2 4.2L19 6.5" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    alert: (
      <>
        <path d="M10.3 4.1 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 4.1a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3 1.3 4.2L17.5 8.5l-4.2 1.3L12 14l-1.3-4.2-4.2-1.3 4.2-1.3L12 3Z" />
        <path d="m19 14 .7 2.3 2.3.7-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    'arrow-up': <path d="m12 19V5m-6 6 6-6 6 6" />,
    'arrow-down': <path d="M12 5v14m6-6-6 6-6-6" />,
    minus: <path d="M5 12h14" />,
    trend: <path d="m3 17 6-6 4 4 8-9M15 6h6v6" />,
    trophy: (
      <>
        <path d="M8 4h8v4a4 4 0 0 1-8 0V4ZM12 12v5M8 21h8M9 17h6" />
        <path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4" />
      </>
    ),
    target: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1" />
      </>
    ),
};

function DashboardIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {DASHBOARD_ICONS[name]}
    </svg>
  );
}

function DashboardLogo() {
  return (
    <span className="dashboard-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 44 44">
        <rect width="44" height="44" rx="14" fill="currentColor" />
        <path
          d="M13.5 22.5 19 28l11.5-12"
          fill="none"
          stroke="white"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.5"
        />
      </svg>
    </span>
  );
}

function Sidebar({ monthlyRate }) {
  return (
    <aside className="dashboard-sidebar" aria-label="ناوبری اصلی">
      <a className="dashboard-brand" href="#dashboard-overview" aria-label="دی‌میت، داشبورد">
        <DashboardLogo />
        <span>
          <strong>دی‌میت</strong>
          <small>همراه روزهای پربار</small>
        </span>
      </a>

      <nav className="dashboard-nav">
        {NAV_ITEMS.map((item) => (
          <a
            className={item.active ? 'dashboard-nav-item dashboard-nav-item-active' : 'dashboard-nav-item'}
            href={item.href}
            key={item.label}
            aria-current={item.active ? 'page' : undefined}
          >
            <span className="dashboard-nav-icon">
              <DashboardIcon name={item.icon} />
            </span>
            <span className="dashboard-nav-label">{item.label}</span>
            {item.active && <i aria-hidden="true" />}
          </a>
        ))}
      </nav>

      <div className="sidebar-insight">
        <span className="sidebar-insight-icon">
          <DashboardIcon name="spark" />
        </span>
        <p>
          <strong>ماه پرباری دارید!</strong>
          <span>میانگین بهره‌وری شما</span>
        </p>
        <b>{toPersianDigits(monthlyRate)}٪</b>
      </div>
    </aside>
  );
}

function TopBar({ searchTerm, onSearch, notificationsOpen, onToggleNotifications }) {
  const searchInputRef = useRef(null);

  useEffect(() => {
    function focusSearch(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  return (
    <header className="dashboard-topbar">
      <div className="dashboard-search">
        <DashboardIcon name="search" />
        <label className="sr-only" htmlFor="dashboard-search-input">جست‌وجوی کارها</label>
        <input
          id="dashboard-search-input"
          ref={searchInputRef}
          type="search"
          value={searchTerm}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="جست‌وجو در کارهای امروز..."
        />
        <kbd>Ctrl K</kbd>
      </div>

      <div className="dashboard-user-actions" id="dashboard-profile">
        <div className="notification-wrap">
          <button
            className="topbar-icon-button"
            type="button"
            aria-label="نمایش اعلان‌ها"
            aria-expanded={notificationsOpen}
            aria-controls="notification-panel"
            onClick={onToggleNotifications}
          >
            <DashboardIcon name="bell" />
            <span className="notification-dot" />
          </button>
          {notificationsOpen && (
            <div className="notification-panel" id="notification-panel">
              <div className="notification-header">
                <strong>اعلان‌ها</strong>
                <span>۲ تازه</span>
              </div>
              <div className="notification-item">
                <span className="notification-symbol notification-symbol-coral">
                  <DashboardIcon name="clock" />
                </span>
                <p>
                  جلسه‌ی تیم طراحی نزدیک است.
                  <small>۱۵ دقیقه پیش</small>
                </p>
              </div>
              <div className="notification-item">
                <span className="notification-symbol notification-symbol-lime">
                  <DashboardIcon name="trend" />
                </span>
                <p>
                  بهره‌وری هفتگی شما ۸٪ بهتر شده است.
                  <small>امروز</small>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-profile" aria-label="پروفایل سارا احمدی">
          <span className="profile-avatar">س‌ا</span>
          <span className="profile-copy">
            <strong>سارا احمدی</strong>
            <small>حساب شخصی</small>
          </span>
          <span className="profile-chevron">⌄</span>
        </div>
      </div>
    </header>
  );
}

function SummaryCard({ label, value, detail, icon, tone }) {
  return (
    <article className={`summary-card summary-card-${tone}`}>
      <span className="summary-icon">
        <DashboardIcon name={icon} />
      </span>
      <div>
        <span>{label}</span>
        <strong>{toPersianDigits(value)}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function DailyProgress({ completed, total, percentage }) {
  return (
    <section className="dashboard-card daily-progress-card" aria-labelledby="daily-progress-title">
      <div className="card-heading">
        <div>
          <span className="section-kicker">تمرکز امروز</span>
          <h2 id="daily-progress-title">پیشرفت روزانه</h2>
        </div>
        <span className="live-pill">
          <i /> زنده
        </span>
      </div>

      <div
        className="daily-progress-visual"
        aria-label={`پیشرفت روزانه ${percentage} درصد`}
        aria-live="polite"
      >
        <svg viewBox="0 0 140 140" role="img">
          <circle className="progress-circle-track" cx="70" cy="70" r="56" pathLength="100" />
          <circle
            className="progress-circle-value"
            cx="70"
            cy="70"
            r="56"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - percentage}
          />
        </svg>
        <div className="daily-progress-number">
          <strong>{toPersianDigits(percentage)}٪</strong>
          <span>انجام شده</span>
        </div>
      </div>

      <p className="daily-progress-copy">
        <strong>{toPersianDigits(completed)}</strong> از <strong>{toPersianDigits(total)}</strong> کار امروز
        انجام شده است.
      </p>

      <div className="progress-celebration">
        <span><DashboardIcon name="spark" /></span>
        <p>
          {percentage >= 75 ? 'عالی پیش می‌روید!' : 'با چند قدم کوچک ادامه بدهید.'}
          <small>{percentage >= 75 ? 'تقریباً به خط پایان رسیده‌اید.' : 'هر کار انجام‌شده، روز را سبک‌تر می‌کند.'}</small>
        </p>
      </div>
    </section>
  );
}

function TaskItem({ task, onToggle }) {
  const priority = PRIORITIES[task.priority];
  const isOverdue = task.overdue && !task.completed;

  return (
    <li className={`dashboard-task-item ${task.completed ? 'dashboard-task-completed' : ''}`}>
      <label className="dashboard-task-checkbox">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`${task.completed ? 'بازگرداندن' : 'انجام'} کار ${task.title}`}
        />
        <span aria-hidden="true">
          <DashboardIcon name="check" />
        </span>
      </label>

      <div className="dashboard-task-copy">
        <strong>{task.title}</strong>
        {task.description && <p>{task.description}</p>}
      </div>

      <div className="dashboard-task-meta">
        <span className={`priority-badge priority-${task.priority}`}>
          <DashboardIcon name={priority.icon} />
          {priority.label}
        </span>
        {isOverdue && <span className="overdue-badge">عقب‌افتاده</span>}
        <time dateTime={task.dueTime}>
          <DashboardIcon name="clock" />
          {toPersianDigits(task.dueTime)}
        </time>
      </div>
    </li>
  );
}

function TodayTasks({ tasks, filter, onFilter, onToggle, onAddTask, searchTerm }) {
  return (
    <section className="dashboard-card today-tasks-card" id="today-tasks" aria-labelledby="today-tasks-title">
      <div className="tasks-card-header">
        <div>
          <span className="section-kicker">برنامه‌ی روز</span>
          <h2 id="today-tasks-title">کارهای امروز</h2>
        </div>
        <button className="add-task-button" type="button" onClick={onAddTask}>
          <DashboardIcon name="plus" />
          کار جدید
        </button>
      </div>

      <div className="task-filters" aria-label="فیلتر کارها بر اساس اولویت">
        <span>اولویت:</span>
        {FILTERS.map((item) => (
          <button
            className={filter === item.value ? 'task-filter-active' : ''}
            type="button"
            key={item.value}
            aria-pressed={filter === item.value}
            onClick={() => onFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tasks.length > 0 ? (
        <ul className="dashboard-task-list">
          {tasks.map((task) => (
            <TaskItem task={task} onToggle={onToggle} key={task.id} />
          ))}
        </ul>
      ) : (
        <div className="tasks-empty-state">
          <span><DashboardIcon name="search" /></span>
          <strong>کاری پیدا نشد</strong>
          <p>
            {searchTerm
              ? 'عبارت دیگری را جست‌وجو کنید یا فیلتر را تغییر دهید.'
              : 'در این اولویت کاری برای امروز ندارید.'}
          </p>
        </div>
      )}
    </section>
  );
}

function ProductivityChart({ data, monthLabel, currentDay }) {
  const [activeDay, setActiveDay] = useState(null);
  const width = 900;
  const height = 280;
  const padding = { top: 22, right: 28, bottom: 42, left: 48 };
  const chartWidth = width - padding.right - padding.left;
  const chartHeight = height - padding.top - padding.bottom;
  const gridValues = [100, 75, 50, 25, 0];

  function getX(index) {
    return padding.left + (index / (data.length - 1)) * chartWidth;
  }

  function getY(percentage) {
    return padding.top + ((100 - percentage) / 100) * chartHeight;
  }

  const recordedData = data.filter((item) => !item.future);
  const linePath = recordedData
    .map((item, index) => {
      const x = getX(item.day - 1);
      const y = getY(item.percentage);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  const firstPoint = recordedData[0];
  const lastPoint = recordedData[recordedData.length - 1];
  const areaPath = firstPoint && lastPoint
    ? `M ${getX(firstPoint.day - 1)} ${getY(0)} ${linePath.replace(/^M/, 'L')} L ${getX(lastPoint.day - 1)} ${getY(0)} Z`
    : '';
  const activeItem = data.find((item) => item.day === activeDay);
  const activeX = activeItem ? getX(activeItem.day - 1) : 0;
  const activeY = activeItem ? getY(activeItem.future ? 0 : activeItem.percentage) : 0;
  const tooltipWidth = 154;
  const tooltipX = activeX > width - tooltipWidth - 28
    ? activeX - tooltipWidth - 10
    : activeX + 10;
  const tooltipY = Math.max(8, activeY - 68);

  return (
    <section
      className="dashboard-card productivity-card"
      id="monthly-productivity"
      aria-labelledby="productivity-title"
    >
      <div className="card-heading productivity-heading">
        <div>
          <span className="section-kicker">نمای ماهانه</span>
          <h2 id="productivity-title">روند بهره‌وری</h2>
        </div>
        <span className="month-selector">
          <DashboardIcon name="calendar" />
          {monthLabel}
        </span>
      </div>

      <div className="chart-legend">
        <span><i /> درصد کارهای انجام‌شده</span>
        <small>برای مشاهده‌ی جزئیات، روی هر نقطه بروید.</small>
      </div>

      <div className="productivity-chart-scroll">
        <svg
          className="productivity-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`نمودار بهره‌وری روزانه در ${monthLabel}`}
        >
          <defs>
            <linearGradient id="productivity-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8e72" stopOpacity="0.26" />
              <stop offset="100%" stopColor="#ff8e72" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridValues.map((value) => {
            const y = getY(value);
            return (
              <g className="chart-grid-line" key={value}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
                <text x={padding.left - 10} y={y + 4}>{toPersianDigits(value)}٪</text>
              </g>
            );
          })}

          {areaPath && <path className="chart-area" d={areaPath} />}
          {linePath && <path className="chart-line" d={linePath} />}

          {data.map((item) => {
            const x = getX(item.day - 1);
            const y = getY(item.future ? 0 : item.percentage);
            const isActive = item.day === activeDay;
            return (
              <g key={item.day}>
                <text
                  className={item.day === currentDay ? 'chart-day-label chart-day-current' : 'chart-day-label'}
                  x={x}
                  y={height - 14}
                >
                  {toPersianDigits(item.day)}
                </text>
                <g
                  className={`chart-point ${item.future ? 'chart-point-future' : ''} ${isActive ? 'chart-point-active' : ''}`}
                  role="button"
                  tabIndex="0"
                  aria-label={item.future
                    ? `روز ${item.day}، هنوز داده‌ای ثبت نشده است`
                    : `روز ${item.day}، ${item.percentage} درصد، ${item.completed} از ${item.total} کار`}
                  onMouseEnter={() => setActiveDay(item.day)}
                  onMouseLeave={() => setActiveDay(null)}
                  onFocus={() => setActiveDay(item.day)}
                  onBlur={() => setActiveDay(null)}
                >
                  <circle className="chart-point-hit" cx={x} cy={y} r="11" />
                  <circle className="chart-point-dot" cx={x} cy={y} r={isActive ? 5 : 3.5} />
                </g>
              </g>
            );
          })}

          {activeItem && (
            <g className="chart-tooltip" transform={`translate(${tooltipX} ${tooltipY})`}>
              <rect width={tooltipWidth} height="56" rx="10" />
              <text className="chart-tooltip-title" x={tooltipWidth - 12} y="21">
                روز {toPersianDigits(activeItem.day)}
              </text>
              <text className="chart-tooltip-value" x={tooltipWidth - 12} y="41">
                {activeItem.future
                  ? 'هنوز داده‌ای ثبت نشده'
                  : `${toPersianDigits(activeItem.percentage)}٪ · ${toPersianDigits(activeItem.completed)} از ${toPersianDigits(activeItem.total)} کار`}
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}

function QuickStatistics({ completed, average, bestDay, overall, monthLabel }) {
  const statistics = [
    {
      label: 'کار انجام‌شده',
      value: toPersianDigits(completed),
      detail: `در ${monthLabel}`,
      icon: 'check',
      tone: 'green',
    },
    {
      label: 'میانگین روزانه',
      value: `${toPersianDigits(average)}٪`,
      detail: 'بر اساس روزهای ثبت‌شده',
      icon: 'trend',
      tone: 'coral',
    },
    {
      label: 'بهترین روز ماه',
      value: `روز ${toPersianDigits(bestDay.day)}`,
      detail: `${toPersianDigits(bestDay.percentage)}٪ تکمیل کارها`,
      icon: 'trophy',
      tone: 'yellow',
    },
    {
      label: 'نرخ تکمیل ماه',
      value: `${toPersianDigits(overall)}٪`,
      detail: 'از مجموع کارهای برنامه‌ریزی‌شده',
      icon: 'target',
      tone: 'blue',
    },
  ];

  return (
    <section className="quick-statistics" id="quick-statistics" aria-labelledby="quick-statistics-title">
      <div className="quick-statistics-heading">
        <span className="section-kicker">خلاصه‌ی عملکرد</span>
        <h2 id="quick-statistics-title">آمارهای سریع</h2>
      </div>
      <div className="quick-statistics-list">
        {statistics.map((statistic) => (
          <article className="quick-stat-card" key={statistic.label}>
            <span className={`quick-stat-icon quick-stat-${statistic.tone}`}>
              <DashboardIcon name={statistic.icon} />
            </span>
            <div>
              <span>{statistic.label}</span>
              <strong>{statistic.value}</strong>
              <small>{statistic.detail}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AddTaskModal({ onClose, onAdd }) {
  const [titleError, setTitleError] = useState('');
  const [dueTimeError, setDueTimeError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const title = values.title.trim();

    if (!title) {
      setTitleError('عنوان کار را وارد کنید.');
      event.currentTarget.elements.title.focus();
      return;
    }

    if (!values.dueTime) {
      setDueTimeError('زمان انجام کار را وارد کنید.');
      event.currentTarget.elements.dueTime.focus();
      return;
    }

    const [hours, minutes] = values.dueTime.split(':').map(Number);
    const now = new Date();
    const overdue = hours * 60 + minutes < now.getHours() * 60 + now.getMinutes();

    onAdd({
      id: Date.now(),
      title,
      description: values.description.trim(),
      priority: values.priority,
      dueTime: values.dueTime,
      completed: false,
      overdue,
    });
  }

  return (
    <div
      className="task-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <section
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
      >
        <div className="task-modal-header">
          <div>
            <span className="section-kicker">برنامه‌ریزی سریع</span>
            <h2 id="add-task-title">افزودن کار جدید</h2>
          </div>
          <button className="modal-close-button" type="button" onClick={onClose} aria-label="بستن پنجره">
            <DashboardIcon name="close" />
          </button>
        </div>

        <form className="task-modal-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="new-task-title">
            عنوان کار
            <span>*</span>
          </label>
          <input
            id="new-task-title"
            name="title"
            type="text"
            placeholder="برای نمونه: تکمیل گزارش هفتگی"
            autoFocus
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? 'new-task-title-error' : undefined}
            onChange={() => setTitleError('')}
          />
          {titleError && <span className="modal-field-error" id="new-task-title-error" role="alert">{titleError}</span>}

          <label htmlFor="new-task-description">توضیح کوتاه <small>(اختیاری)</small></label>
          <textarea
            id="new-task-description"
            name="description"
            rows="3"
            placeholder="جزئیات یا یادداشت کوتاهی برای این کار..."
          />

          <div className="modal-fields-row">
            <div>
              <label htmlFor="new-task-priority">اولویت</label>
              <select id="new-task-priority" name="priority" defaultValue="medium">
                <option value="high">زیاد</option>
                <option value="medium">متوسط</option>
                <option value="low">کم</option>
              </select>
            </div>
            <div>
              <label htmlFor="new-task-time">زمان انجام</label>
              <input
                id="new-task-time"
                name="dueTime"
                type="time"
                defaultValue="17:00"
                aria-invalid={Boolean(dueTimeError)}
                aria-describedby={dueTimeError ? 'new-task-time-error' : undefined}
                onChange={() => setDueTimeError('')}
              />
              {dueTimeError && (
                <span className="modal-field-error" id="new-task-time-error" role="alert">
                  {dueTimeError}
                </span>
              )}
            </div>
          </div>

          <div className="task-modal-actions">
            <button className="modal-cancel-button" type="button" onClick={onClose}>انصراف</button>
            <button className="modal-submit-button" type="submit">
              <DashboardIcon name="plus" />
              افزودن به امروز
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const calendar = getCurrentCalendar(now);
  const initialMonthlyData = createMonthlyData(calendar);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter((task) => task.overdue && !task.completed).length;
  const dailyPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fa');
  const visibleTasks = tasks.filter((task) => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = !normalizedSearch
      || `${task.title} ${task.description}`.toLocaleLowerCase('fa').includes(normalizedSearch);
    return matchesPriority && matchesSearch;
  });

  const monthlyData = initialMonthlyData.map((item) => (
    item.day === calendar.day
      ? {
          ...item,
          completed: completedTasks,
          total: totalTasks,
          percentage: dailyPercentage,
          future: false,
        }
      : item
  ));
  const recordedDays = monthlyData.filter((item) => !item.future && item.total > 0);
  const monthlyCompleted = recordedDays.reduce((sum, item) => sum + item.completed, 0);
  const monthlyTotal = recordedDays.reduce((sum, item) => sum + item.total, 0);
  const averageProductivity = recordedDays.length === 0
    ? 0
    : Math.round(recordedDays.reduce((sum, item) => sum + item.percentage, 0) / recordedDays.length);
  const overallCompletion = monthlyTotal === 0 ? 0 : Math.round((monthlyCompleted / monthlyTotal) * 100);
  const bestDay = recordedDays.reduce(
    (best, item) => (item.percentage > best.percentage ? item : best),
    recordedDays[0] ?? { day: calendar.day, percentage: 0 },
  );

  function toggleTask(taskId) {
    setTasks((current) => current.map((task) => (
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )));
  }

  function addTask(task) {
    setTasks((current) => [...current, task]);
    setPriorityFilter('all');
    setSearchTerm('');
    setAddTaskOpen(false);
  }

  return (
    <div className="dashboard-page" dir="rtl">
      <Sidebar monthlyRate={overallCompletion} />

      <main className="dashboard-workspace">
        <TopBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((current) => !current)}
        />

        <div className="dashboard-content">
          <header className="dashboard-welcome" id="dashboard-overview">
            <div>
              <span className="welcome-overline">
                <i /> روزتان را آگاهانه بسازید
              </span>
              <h1>{getGreeting(now.getHours())}، سارا</h1>
              <p>امروز فرصت خوبی برای پیش‌رفتن است. بیایید از مهم‌ترین کار شروع کنیم.</p>
            </div>
            <time dateTime={now.toISOString().slice(0, 10)}>
              <span><DashboardIcon name="calendar" /></span>
              <div>
                <small>امروز</small>
                <strong>{FULL_DATE_FORMATTER.format(now)}</strong>
              </div>
            </time>
          </header>

          <section className="summary-section" aria-labelledby="today-overview-title">
            <div className="section-heading-row">
              <div>
                <span className="section-kicker">وضعیت برنامه</span>
                <h2 id="today-overview-title">امروز در یک نگاه</h2>
              </div>
              <span className="summary-date-label">به‌روزرسانی لحظه‌ای</span>
            </div>
            <div className="summary-grid">
              <SummaryCard
                label="همه‌ی کارها"
                value={totalTasks}
                detail="برنامه‌ریزی‌شده برای امروز"
                icon="stack"
                tone="total"
              />
              <SummaryCard
                label="انجام‌شده"
                value={completedTasks}
                detail={`${toPersianDigits(dailyPercentage)}٪ از برنامه‌ی امروز`}
                icon="check"
                tone="completed"
              />
              <SummaryCard
                label="در انتظار"
                value={pendingTasks}
                detail="کار باقی‌مانده"
                icon="clock"
                tone="pending"
              />
              <SummaryCard
                label="عقب‌افتاده"
                value={overdueTasks}
                detail={overdueTasks ? 'نیازمند توجه شما' : 'همه چیز مرتب است'}
                icon="alert"
                tone="overdue"
              />
            </div>
          </section>

          <div className="dashboard-primary-grid">
            <TodayTasks
              tasks={visibleTasks}
              filter={priorityFilter}
              onFilter={setPriorityFilter}
              onToggle={toggleTask}
              onAddTask={() => setAddTaskOpen(true)}
              searchTerm={searchTerm}
            />
            <DailyProgress
              completed={completedTasks}
              total={totalTasks}
              percentage={dailyPercentage}
            />
          </div>

          <div className="dashboard-analytics-grid">
            <ProductivityChart
              data={monthlyData}
              monthLabel={calendar.label}
              currentDay={calendar.day}
            />
            <QuickStatistics
              completed={monthlyCompleted}
              average={averageProductivity}
              bestDay={bestDay}
              overall={overallCompletion}
              monthLabel={calendar.label}
            />
          </div>
        </div>
      </main>

      {addTaskOpen && <AddTaskModal onClose={() => setAddTaskOpen(false)} onAdd={addTask} />}
    </div>
  );
}
