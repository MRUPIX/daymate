import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
    schedule: 'today',
    category: 'work',
  },
  {
    id: 2,
    title: 'جلسه با تیم طراحی',
    description: 'نسخه‌ی جدید داشبورد و بازخوردهای کاربران را مرور کنیم.',
    priority: 'high',
    dueTime: '09:30',
    completed: false,
    overdue: true,
    schedule: 'today',
    category: 'work',
  },
  {
    id: 3,
    title: 'پاسخ به ایمیل‌های مهم',
    description: 'پیام‌های علامت‌گذاری‌شده‌ی صندوق ورودی را بررسی کن.',
    priority: 'medium',
    dueTime: '11:15',
    completed: true,
    overdue: false,
    schedule: 'today',
    category: 'work',
  },
  {
    id: 4,
    title: 'آماده‌سازی گزارش پیشرفت',
    description: 'خلاصه‌ی دستاوردها و موانع این ماه را ثبت کن.',
    priority: 'high',
    dueTime: '14:00',
    completed: false,
    overdue: false,
    schedule: 'today',
    category: 'work',
  },
  {
    id: 5,
    title: 'سی دقیقه مطالعه',
    description: 'فصل سوم کتاب عادت‌های اتمی را تمام کن.',
    priority: 'low',
    dueTime: '18:00',
    completed: false,
    overdue: false,
    schedule: 'today',
    category: 'personal',
  },
  {
    id: 6,
    title: 'پیاده‌روی عصرگاهی',
    description: 'یک مسیر کوتاه و آرام برای پایان روز.',
    priority: 'low',
    dueTime: '19:30',
    completed: false,
    overdue: false,
    schedule: 'today',
    category: 'health',
  },
  {
    id: 7,
    title: 'تکمیل طرح ارائه',
    description: 'اسلایدهای جمع‌بندی و زمان‌بندی اجرا را آماده کن.',
    priority: 'high',
    dueTime: '10:00',
    completed: false,
    overdue: false,
    schedule: 'tomorrow',
    category: 'work',
  },
  {
    id: 8,
    title: 'خرید هفتگی خانه',
    description: 'فهرست خرید را پیش از رفتن به فروشگاه مرور کن.',
    priority: 'medium',
    dueTime: '17:30',
    completed: false,
    overdue: false,
    schedule: 'tomorrow',
    category: 'personal',
  },
  {
    id: 9,
    title: 'رزرو وقت دندان‌پزشک',
    description: 'برای معاینه‌ی دوره‌ای یک زمان مناسب پیدا کن.',
    priority: 'low',
    dueTime: '12:00',
    completed: false,
    overdue: false,
    schedule: 'week',
    category: 'health',
  },
  {
    id: 10,
    title: 'مرتب‌کردن پرونده‌های شخصی',
    description: 'مدارک قدیمی را دسته‌بندی و بایگانی کن.',
    priority: 'low',
    dueTime: '16:00',
    completed: true,
    overdue: false,
    schedule: 'week',
    category: 'personal',
  },
];

const NAV_ITEMS = [
  { label: 'داشبورد', icon: 'dashboard', to: '/dashboard', page: 'dashboard' },
  { label: 'کارهای من', icon: 'tasks', to: '/tasks', page: 'tasks' },
  { label: 'تقویم', icon: 'calendar', to: '/calendar', page: 'calendar' },
  { label: 'آمارها', icon: 'chart', to: '/statistics', page: 'statistics' },
  { label: 'تنظیمات', icon: 'settings', to: '/dashboard#dashboard-profile' },
];

const FILTERS = [
  { value: 'all', label: 'همه' },
  { value: 'high', label: 'زیاد' },
  { value: 'medium', label: 'متوسط' },
  { value: 'low', label: 'کم' },
];

const MY_TASK_SCOPES = [
  { value: 'all', label: 'همه‌ی کارها' },
  { value: 'today', label: 'امروز' },
  { value: 'upcoming', label: 'پیش رو' },
  { value: 'completed', label: 'انجام‌شده' },
];

const TASK_SCHEDULES = {
  today: { label: 'امروز', detail: 'تمرکز اصلی روز' },
  tomorrow: { label: 'فردا', detail: 'آماده برای شروع روز بعد' },
  week: { label: 'این هفته', detail: 'برای روزهای پیش رو' },
};

const SCHEDULE_ORDER = ['today', 'tomorrow', 'week'];

const TASK_CATEGORIES = {
  work: { label: 'کاری', tone: 'green' },
  personal: { label: 'شخصی', tone: 'coral' },
  health: { label: 'سلامتی', tone: 'blue' },
};

const PERSIAN_WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

const PRODUCTIVITY_PATTERN = [0.62, 0.78, 0.55, 0.88, 0.72, 0.92, 0.68, 0.81, 0.74, 0.96];

const STATISTICS_PERIODS = [
  { value: 'week', label: '۷ روز گذشته' },
  { value: 'month', label: 'این ماه' },
  { value: 'year', label: 'امسال' },
];

const STATISTICS_DATA = {
  week: {
    periodLabel: '۷ روز گذشته',
    previousRate: 72,
    activeDays: 7,
    activeDetail: 'از ۷ روز گذشته',
    streak: 5,
    completedChange: 8,
    points: [
      { label: 'ش', accessibleLabel: 'شنبه', completed: 5, total: 6 },
      { label: 'ی', accessibleLabel: 'یکشنبه', completed: 6, total: 8 },
      { label: 'د', accessibleLabel: 'دوشنبه', completed: 4, total: 7 },
      { label: 'س', accessibleLabel: 'سه‌شنبه', completed: 7, total: 8 },
      { label: 'چ', accessibleLabel: 'چهارشنبه', completed: 6, total: 8 },
      { label: 'پ', accessibleLabel: 'پنجشنبه', completed: 9, total: 10 },
      { label: 'ج', accessibleLabel: 'جمعه', completed: 6, total: 7 },
    ],
  },
  month: {
    periodLabel: 'این ماه',
    previousRate: 74,
    activeDays: 24,
    activeDetail: 'از ۲۸ روز سپری‌شده',
    streak: 9,
    completedChange: 23,
    points: [
      { label: '۱', accessibleLabel: 'روز ۱', completed: 16, total: 24 },
      { label: '۴', accessibleLabel: 'روز ۴', completed: 19, total: 25 },
      { label: '۷', accessibleLabel: 'روز ۷', completed: 18, total: 24 },
      { label: '۱۰', accessibleLabel: 'روز ۱۰', completed: 22, total: 25 },
      { label: '۱۳', accessibleLabel: 'روز ۱۳', completed: 20, total: 27 },
      { label: '۱۶', accessibleLabel: 'روز ۱۶', completed: 24, total: 28 },
      { label: '۱۹', accessibleLabel: 'روز ۱۹', completed: 21, total: 26 },
      { label: '۲۲', accessibleLabel: 'روز ۲۲', completed: 25, total: 27 },
      { label: '۲۵', accessibleLabel: 'روز ۲۵', completed: 23, total: 29 },
      { label: '۲۸', accessibleLabel: 'روز ۲۸', completed: 27, total: 30 },
    ],
  },
  year: {
    periodLabel: 'امسال',
    previousRate: 78,
    activeDays: 286,
    activeDetail: 'روز همراه با فعالیت',
    streak: 24,
    completedChange: 146,
    points: [
      { label: 'فرو', accessibleLabel: 'فروردین', completed: 102, total: 145 },
      { label: 'ارد', accessibleLabel: 'اردیبهشت', completed: 112, total: 148 },
      { label: 'خرد', accessibleLabel: 'خرداد', completed: 118, total: 150 },
      { label: 'تیر', accessibleLabel: 'تیر', completed: 125, total: 154 },
      { label: 'مرد', accessibleLabel: 'مرداد', completed: 121, total: 147 },
      { label: 'شهر', accessibleLabel: 'شهریور', completed: 132, total: 155 },
      { label: 'مهر', accessibleLabel: 'مهر', completed: 128, total: 152 },
      { label: 'آبا', accessibleLabel: 'آبان', completed: 139, total: 158 },
      { label: 'آذر', accessibleLabel: 'آذر', completed: 133, total: 154 },
      { label: 'دی', accessibleLabel: 'دی', completed: 143, total: 160 },
      { label: 'بهم', accessibleLabel: 'بهمن', completed: 140, total: 156 },
      { label: 'اسف', accessibleLabel: 'اسفند', completed: 147, total: 162 },
    ],
  },
};

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
    firstDate: firstDay,
    label: MONTH_FORMATTER.format(date),
  };
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function getTaskDueDate(task, now) {
  if (task.dueDate) return parseDateKey(task.dueDate);

  const dueDate = new Date(now);
  dueDate.setHours(12, 0, 0, 0);

  if (task.schedule === 'tomorrow') {
    dueDate.setDate(dueDate.getDate() + 1);
  } else if (task.schedule === 'week') {
    dueDate.setDate(dueDate.getDate() + 2 + (Number(task.id) % 5));
  }

  return dueDate;
}

function getTaskScheduleForDate(date, now) {
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (toDateKey(date) === toDateKey(today)) return 'today';
  if (toDateKey(date) === toDateKey(tomorrow)) return 'tomorrow';
  return 'week';
}

function createPersianCalendarGrid(date) {
  const calendar = getCurrentCalendar(date);
  const startOffset = (calendar.firstDate.getDay() + 1) % 7;
  const gridStart = new Date(calendar.firstDate);
  gridStart.setDate(gridStart.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const cellDate = new Date(gridStart);
    cellDate.setDate(gridStart.getDate() + index);
    const parts = getCalendarParts(cellDate);

    return {
      date: cellDate,
      key: toDateKey(cellDate),
      day: parts.day,
      inCurrentMonth: parts.month === calendar.month && parts.year === calendar.year,
    };
  });
}

function shiftPersianMonth(date, offset) {
  const calendar = getCurrentCalendar(date);
  const shifted = new Date(calendar.firstDate);

  if (offset > 0) {
    shifted.setDate(shifted.getDate() + calendar.daysInMonth);
    return shifted;
  }

  shifted.setDate(shifted.getDate() - 1);
  return getCurrentCalendar(shifted).firstDate;
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
    'chevron-left': <path d="m15 18-6-6 6-6" />,
    'chevron-right': <path d="m9 18 6-6-6-6" />,
    trash: (
      <>
        <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
      </>
    ),
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

function Sidebar({ monthlyRate, activePage }) {
  return (
    <aside className="dashboard-sidebar" aria-label="ناوبری اصلی">
      <Link className="dashboard-brand" to="/dashboard" aria-label="دی‌میت، داشبورد">
        <DashboardLogo />
        <span>
          <strong>دی‌میت</strong>
          <small>همراه روزهای پربار</small>
        </span>
      </Link>

      <nav className="dashboard-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.page === activePage;

          return (
            <Link
              className={isActive ? 'dashboard-nav-item dashboard-nav-item-active' : 'dashboard-nav-item'}
              to={item.to}
              key={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="dashboard-nav-icon">
                <DashboardIcon name={item.icon} />
              </span>
              <span className="dashboard-nav-label">{item.label}</span>
              {isActive && <i aria-hidden="true" />}
            </Link>
          );
        })}
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

function TopBar({ searchTerm, onSearch, notificationsOpen, onToggleNotifications, searchPlaceholder }) {
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
          placeholder={searchPlaceholder}
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

function StatisticsMetricCard({ label, value, detail, badge, icon, tone }) {
  return (
    <article className={`statistics-metric-card statistics-metric-${tone}`}>
      <div className="statistics-metric-topline">
        <span className="statistics-metric-icon">
          <DashboardIcon name={icon} />
        </span>
        <span className="statistics-metric-badge">{badge}</span>
      </div>
      <span className="statistics-metric-label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function StatisticsTrendChart({ points, rate, periodLabel }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const width = 820;
  const height = 292;
  const padding = { top: 28, right: 28, bottom: 43, left: 48 };
  const chartWidth = width - padding.right - padding.left;
  const chartHeight = height - padding.top - padding.bottom;
  const gridValues = [100, 75, 50, 25, 0];
  const pointValues = points.map((point) => Math.round((point.completed / point.total) * 100));

  function getX(index) {
    return padding.left + (index / (points.length - 1)) * chartWidth;
  }

  function getY(value) {
    return padding.top + ((100 - value) / 100) * chartHeight;
  }

  const linePath = pointValues
    .map((value, index) => `${index === 0 ? 'M' : 'L'} ${getX(index)} ${getY(value)}`)
    .join(' ');
  const areaPath = `${linePath} L ${getX(points.length - 1)} ${getY(0)} L ${getX(0)} ${getY(0)} Z`;
  const activePoint = activeIndex === null ? null : points[activeIndex];
  const activeValue = activeIndex === null ? null : pointValues[activeIndex];
  const activeX = activeIndex === null ? 0 : getX(activeIndex);
  const activeY = activeValue === null ? 0 : getY(activeValue);
  const tooltipWidth = 142;
  const tooltipX = Math.min(width - tooltipWidth - 8, Math.max(8, activeX - tooltipWidth / 2));
  const tooltipY = Math.max(6, activeY - 63);

  return (
    <section className="dashboard-card statistics-trend-card" aria-labelledby="statistics-trend-title">
      <div className="statistics-card-heading statistics-trend-heading">
        <div>
          <span className="section-kicker">مسیر پیشرفت</span>
          <h2 id="statistics-trend-title">روند تکمیل کارها</h2>
        </div>
        <span className="statistics-average-pill">
          <i /> میانگین {toPersianDigits(rate)}٪
        </span>
      </div>

      <div className="statistics-chart-meta">
        <span><i /> نرخ تکمیل</span>
        <small>{periodLabel}</small>
      </div>

      <div className="statistics-chart-scroll">
        <svg
          className="statistics-trend-chart"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`نمودار روند تکمیل کارها در ${periodLabel}`}
        >
          <defs>
            <linearGradient id="statistics-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff8e72" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ff8e72" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {gridValues.map((value) => {
            const y = getY(value);
            return (
              <g className="statistics-chart-grid" key={value}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
                <text x={padding.left - 10} y={y + 4}>{toPersianDigits(value)}٪</text>
              </g>
            );
          })}

          <line
            className="statistics-average-line"
            x1={padding.left}
            x2={width - padding.right}
            y1={getY(rate)}
            y2={getY(rate)}
          />
          <path className="statistics-chart-area" d={areaPath} />
          <path className="statistics-chart-line" d={linePath} />

          {points.map((point, index) => {
            const x = getX(index);
            const y = getY(pointValues[index]);
            const isActive = index === activeIndex;

            return (
              <g key={`${point.accessibleLabel}-${index}`}>
                <text className="statistics-chart-label" x={x} y={height - 14}>{point.label}</text>
                <g
                  className={`statistics-chart-point ${isActive ? 'statistics-chart-point-active' : ''}`}
                  role="button"
                  tabIndex="0"
                  aria-label={`${point.accessibleLabel}، ${pointValues[index]} درصد، ${point.completed} از ${point.total} کار`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(null)}
                >
                  <circle className="statistics-point-hit" cx={x} cy={y} r="12" />
                  <circle className="statistics-point-halo" cx={x} cy={y} r={isActive ? 8 : 0} />
                  <circle className="statistics-point-dot" cx={x} cy={y} r={isActive ? 5 : 4} />
                </g>
              </g>
            );
          })}

          {activePoint && (
            <g className="statistics-chart-tooltip" transform={`translate(${tooltipX} ${tooltipY})`}>
              <rect width={tooltipWidth} height="53" rx="11" />
              <text className="statistics-tooltip-title" x={tooltipWidth - 11} y="20">
                {activePoint.accessibleLabel}
              </text>
              <text className="statistics-tooltip-value" x={tooltipWidth - 11} y="39">
                {toPersianDigits(activeValue)}٪ · {toPersianDigits(activePoint.completed)} از {toPersianDigits(activePoint.total)} کار
              </text>
            </g>
          )}
        </svg>
      </div>
    </section>
  );
}

function StatisticsCategoryBreakdown({ tasks, searchTerm }) {
  const total = tasks.length;
  let gradientCursor = 0;
  const categoryColors = {
    work: '#7ea36c',
    personal: '#ff8e72',
    health: '#6f98a8',
  };
  const categories = Object.entries(TASK_CATEGORIES).map(([value, category]) => {
    const categoryTasks = tasks.filter((task) => task.category === value);
    const completed = categoryTasks.filter((task) => task.completed).length;
    const share = total === 0 ? 0 : Math.round((categoryTasks.length / total) * 100);
    const completion = categoryTasks.length === 0 ? 0 : Math.round((completed / categoryTasks.length) * 100);
    const start = gradientCursor;
    gradientCursor += share;

    return {
      value,
      ...category,
      count: categoryTasks.length,
      share,
      completion,
      color: categoryColors[value],
      start,
      end: gradientCursor,
    };
  });
  const donutBackground = total === 0
    ? '#edf0eb'
    : `conic-gradient(${categories.map((category, index) => (
        `${category.color} ${category.start}% ${index === categories.length - 1 ? 100 : category.end}%`
      )).join(', ')})`;

  return (
    <section className="dashboard-card statistics-breakdown-card" aria-labelledby="statistics-category-title">
      <div className="statistics-card-heading">
        <div>
          <span className="section-kicker">تعادل برنامه</span>
          <h2 id="statistics-category-title">توزیع دسته‌بندی‌ها</h2>
        </div>
        <span className="statistics-card-badge">
          {searchTerm ? `${toPersianDigits(total)} نتیجه` : 'همه‌ی کارها'}
        </span>
      </div>

      <div className="statistics-category-layout">
        <div
          className="statistics-donut"
          style={{ background: donutBackground }}
          role="img"
          aria-label={`توزیع ${total} کار در دسته‌بندی‌ها`}
        >
          <span>
            <strong>{toPersianDigits(total)}</strong>
            <small>کار ثبت‌شده</small>
          </span>
        </div>

        <ul className="statistics-category-list">
          {categories.map((category) => (
            <li key={category.value}>
              <i style={{ background: category.color }} />
              <div>
                <span>
                  <strong>{category.label}</strong>
                  <small>{toPersianDigits(category.count)} کار</small>
                </span>
                <span className="statistics-category-progress" aria-label={`${category.completion} درصد تکمیل شده`}>
                  <i style={{ width: `${category.completion}%`, background: category.color }} />
                </span>
              </div>
              <b>{toPersianDigits(category.share)}٪</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function StatisticsPriorityBreakdown({ tasks, searchTerm }) {
  const priorities = Object.entries(PRIORITIES).map(([value, priority]) => {
    const priorityTasks = tasks.filter((task) => task.priority === value);
    const completed = priorityTasks.filter((task) => task.completed).length;
    return {
      value,
      label: priority.label,
      total: priorityTasks.length,
      completed,
      percentage: priorityTasks.length === 0 ? 0 : Math.round((completed / priorityTasks.length) * 100),
    };
  });
  const rankedPriorities = priorities.filter((priority) => priority.total > 0);
  const bestPriority = rankedPriorities.reduce(
    (best, priority) => (priority.percentage > best.percentage ? priority : best),
    rankedPriorities[0] ?? null,
  );

  return (
    <section className="dashboard-card statistics-priority-card" aria-labelledby="statistics-priority-title">
      <div className="statistics-card-heading">
        <div>
          <span className="section-kicker">کیفیت تمرکز</span>
          <h2 id="statistics-priority-title">عملکرد بر اساس اولویت</h2>
        </div>
        <span className="statistics-card-badge">{searchTerm ? 'نتایج جست‌وجو' : 'وضعیت فعلی'}</span>
      </div>

      <div className="statistics-priority-list">
        {priorities.map((priority) => (
          <div className={`statistics-priority-row statistics-priority-${priority.value}`} key={priority.value}>
            <div>
              <span><i /> اولویت {priority.label}</span>
              <small>{toPersianDigits(priority.completed)} از {toPersianDigits(priority.total)} کار انجام شده</small>
              <strong>{toPersianDigits(priority.percentage)}٪</strong>
            </div>
            <span className="statistics-priority-track" aria-label={`${priority.percentage} درصد تکمیل شده`}>
              <i style={{ width: `${priority.percentage}%` }} />
            </span>
          </div>
        ))}
      </div>

      <div className="statistics-priority-insight">
        <span><DashboardIcon name={bestPriority ? 'spark' : 'chart'} /></span>
        <p>
          {bestPriority ? `بهترین نرخ تکمیل برای اولویت ${bestPriority.label} است.` : 'هنوز کاری برای تحلیل وجود ندارد.'}
          <small>{bestPriority ? 'این الگو می‌تواند برای برنامه‌ریزی دوره‌ی بعد مفید باشد.' : 'با افزودن کارها، تحلیل اولویت‌ها اینجا نمایش داده می‌شود.'}</small>
        </p>
      </div>
    </section>
  );
}

function StatisticsView({ tasks, searchTerm, now }) {
  const [period, setPeriod] = useState('month');
  const periodData = STATISTICS_DATA[period];
  const completed = periodData.points.reduce((sum, point) => sum + point.completed, 0);
  const total = periodData.points.reduce((sum, point) => sum + point.total, 0);
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const change = completionRate - periodData.previousRate;
  const bestPoint = periodData.points.reduce((best, point) => {
    const percentage = Math.round((point.completed / point.total) * 100);
    const bestPercentage = Math.round((best.completed / best.total) * 100);
    return percentage > bestPercentage ? point : best;
  }, periodData.points[0]);
  const bestPointRate = Math.round((bestPoint.completed / bestPoint.total) * 100);
  const goal = 85;
  const goalGap = Math.max(0, goal - completionRate);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fa');
  const analyzedTasks = normalizedSearch
    ? tasks.filter((task) => (
        `${task.title} ${task.description ?? ''}`.toLocaleLowerCase('fa').includes(normalizedSearch)
      ))
    : tasks;
  const metrics = [
    {
      label: 'نرخ تکمیل',
      value: `${toPersianDigits(completionRate)}٪`,
      detail: 'نسبت کارهای انجام‌شده به کل برنامه',
      badge: `${change >= 0 ? '+' : ''}${toPersianDigits(change)}٪`,
      icon: 'target',
      tone: 'coral',
    },
    {
      label: 'کارهای انجام‌شده',
      value: toPersianDigits(completed),
      detail: `از ${toPersianDigits(total)} کار برنامه‌ریزی‌شده`,
      badge: `+${toPersianDigits(periodData.completedChange)}`,
      icon: 'check',
      tone: 'green',
    },
    {
      label: 'روزهای فعال',
      value: toPersianDigits(periodData.activeDays),
      detail: periodData.activeDetail,
      badge: 'پیوسته',
      icon: 'calendar',
      tone: 'blue',
    },
    {
      label: 'بهترین پیوستگی',
      value: `${toPersianDigits(periodData.streak)} روز`,
      detail: 'بدون وقفه در انجام برنامه',
      badge: 'رکورد',
      icon: 'trophy',
      tone: 'yellow',
    },
  ];

  return (
    <div className="dashboard-content statistics-content">
      <header className="statistics-page-heading">
        <div>
          <span className="welcome-overline">
            <i /> پیشرفت شما، روشن و قابل اندازه‌گیری
          </span>
          <h1>آمارها</h1>
          <p>الگوی عملکردتان را ببینید، روندها را کشف کنید و برای دوره‌ی بعد بهتر تصمیم بگیرید.</p>
        </div>
        <div className="statistics-heading-actions">
          <time dateTime={now.toISOString().slice(0, 10)}>
            <DashboardIcon name="calendar" />
            {MONTH_FORMATTER.format(now)}
          </time>
          <div className="statistics-period-control" role="group" aria-label="بازه‌ی زمانی آمارها">
            {STATISTICS_PERIODS.map((item) => (
              <button
                className={period === item.value ? 'statistics-period-active' : ''}
                type="button"
                key={item.value}
                aria-pressed={period === item.value}
                onClick={() => setPeriod(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <section className="statistics-summary-grid" aria-label="خلاصه‌ی آمارها">
        {metrics.map((metric) => <StatisticsMetricCard {...metric} key={metric.label} />)}
      </section>

      <div className="statistics-main-grid">
        <StatisticsTrendChart
          points={periodData.points}
          rate={completionRate}
          periodLabel={periodData.periodLabel}
          key={period}
        />

        <section className="statistics-goal-card" aria-labelledby="statistics-goal-title">
          <div className="statistics-goal-heading">
            <div>
              <span>هدف این دوره</span>
              <h2 id="statistics-goal-title">نرخ تکمیل {toPersianDigits(goal)}٪</h2>
            </div>
            <span><DashboardIcon name="target" /></span>
          </div>

          <div
            className="statistics-goal-ring"
            style={{ '--statistics-progress': `${completionRate * 3.6}deg` }}
            role="img"
            aria-label={`${completionRate} درصد از هدف دوره تکمیل شده است`}
          >
            <span>
              <strong>{toPersianDigits(completionRate)}٪</strong>
              <small>تکمیل فعلی</small>
            </span>
          </div>

          <p className="statistics-goal-copy">
            {goalGap === 0
              ? 'هدف این دوره را پشت سر گذاشته‌اید؛ همین ریتم را حفظ کنید.'
              : `فقط ${toPersianDigits(goalGap)}٪ تا رسیدن به هدف این دوره فاصله دارید.`}
          </p>

          <div className="statistics-goal-details">
            <div>
              <span><DashboardIcon name="trophy" /></span>
              <p><small>بهترین عملکرد</small><strong>{bestPoint.accessibleLabel}</strong></p>
              <b>{toPersianDigits(bestPointRate)}٪</b>
            </div>
            <div>
              <span><DashboardIcon name="trend" /></span>
              <p><small>نسبت به قبل</small><strong>روند رو به رشد</strong></p>
              <b>+{toPersianDigits(Math.max(0, change))}٪</b>
            </div>
          </div>

          <div className="statistics-goal-note">
            <DashboardIcon name="spark" />
            <p>
              ثبات شما نتیجه داده است.
              <small>روزهای پربازده را الگوی برنامه‌ی هفته‌ی بعد قرار دهید.</small>
            </p>
          </div>
        </section>
      </div>

      <div className="statistics-secondary-grid">
        <StatisticsCategoryBreakdown tasks={analyzedTasks} searchTerm={searchTerm} />
        <StatisticsPriorityBreakdown tasks={analyzedTasks} searchTerm={searchTerm} />
      </div>
    </div>
  );
}

function MyTaskSummaryCard({ label, value, detail, icon, tone }) {
  return (
    <article className={`my-task-summary-card my-task-summary-${tone}`}>
      <span className="my-task-summary-icon">
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

function MyTaskItem({ task, onToggle, onDelete }) {
  const priority = PRIORITIES[task.priority];
  const category = TASK_CATEGORIES[task.category] ?? TASK_CATEGORIES.work;
  const isOverdue = task.overdue && !task.completed;

  return (
    <li className={`my-task-item ${task.completed ? 'my-task-item-completed' : ''}`}>
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

      <div className="my-task-copy">
        <strong>{task.title}</strong>
        {task.description && <p>{task.description}</p>}
        <div className="my-task-mobile-meta">
          <span className={`my-task-category my-task-category-${category.tone}`}>
            <i />
            {category.label}
          </span>
          <span className={`priority-badge priority-${task.priority}`}>
            <DashboardIcon name={priority.icon} />
            {priority.label}
          </span>
          {isOverdue && <span className="overdue-badge">عقب‌افتاده</span>}
        </div>
      </div>

      <div className="my-task-meta">
        <span className={`my-task-category my-task-category-${category.tone}`}>
          <i />
          {category.label}
        </span>
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

      <button
        className="my-task-delete-button"
        type="button"
        aria-label={`حذف کار ${task.title}`}
        onClick={() => onDelete(task.id)}
      >
        <DashboardIcon name="trash" />
      </button>
    </li>
  );
}

function MyTasksView({
  tasks,
  visibleTasks,
  scope,
  onScope,
  priorityFilter,
  onPriorityFilter,
  categoryFilter,
  onCategoryFilter,
  onToggle,
  onDelete,
  onAddTask,
  searchTerm,
  now,
}) {
  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingToday = tasks.filter((task) => task.schedule === 'today' && !task.completed).length;
  const overdueTasks = tasks.filter((task) => task.overdue && !task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const completionPercentage = tasks.length === 0
    ? 0
    : Math.round((completedTasks / tasks.length) * 100);
  const nextTask = tasks.find((task) => task.overdue && !task.completed)
    ?? tasks.find((task) => task.priority === 'high' && !task.completed)
    ?? tasks.find((task) => !task.completed);

  function getScopeCount(value) {
    if (value === 'today') return tasks.filter((task) => task.schedule === 'today').length;
    if (value === 'upcoming') return tasks.filter((task) => task.schedule !== 'today' && !task.completed).length;
    if (value === 'completed') return completedTasks;
    return tasks.length;
  }

  return (
    <div className="dashboard-content my-tasks-content">
      <header className="my-tasks-heading">
        <div>
          <span className="welcome-overline">
            <i /> همه‌چیز زیر نظر شماست
          </span>
          <h1>کارهای من</h1>
          <p>کارهای امروز و روزهای آینده را یک‌جا ببینید، مرتب کنید و جلو ببرید.</p>
        </div>
        <div className="my-tasks-heading-actions">
          <time dateTime={now.toISOString().slice(0, 10)}>
            <DashboardIcon name="calendar" />
            <span>
              <small>امروز</small>
              <strong>{FULL_DATE_FORMATTER.format(now)}</strong>
            </span>
          </time>
          <button className="my-tasks-add-button" type="button" onClick={onAddTask}>
            <DashboardIcon name="plus" />
            افزودن کار جدید
          </button>
        </div>
      </header>

      <section className="my-tasks-summary" aria-label="خلاصه‌ی کارها">
        <MyTaskSummaryCard
          label="همه‌ی کارها"
          value={tasks.length}
          detail="در فهرست‌های شما"
          icon="stack"
          tone="total"
        />
        <MyTaskSummaryCard
          label="باقی‌مانده‌ی امروز"
          value={pendingToday}
          detail="برای تکمیل برنامه‌ی روز"
          icon="clock"
          tone="today"
        />
        <MyTaskSummaryCard
          label="انجام‌شده"
          value={completedTasks}
          detail={`${toPersianDigits(completionPercentage)}٪ از همه‌ی کارها`}
          icon="check"
          tone="done"
        />
        <MyTaskSummaryCard
          label="عقب‌افتاده"
          value={overdueTasks}
          detail={overdueTasks ? 'به توجه شما نیاز دارد' : 'همه‌چیز مرتب است'}
          icon="alert"
          tone="late"
        />
      </section>

      <div className="my-tasks-layout">
        <section className="dashboard-card my-tasks-list-card" aria-labelledby="my-tasks-list-title">
          <div className="my-tasks-list-heading">
            <div>
              <span className="section-kicker">فضای انجام کار</span>
              <h2 id="my-tasks-list-title">فهرست کارها</h2>
            </div>
            <span className="my-tasks-result-count">
              {toPersianDigits(visibleTasks.length)} نتیجه
            </span>
          </div>

          <div className="my-tasks-toolbar">
            <div className="my-task-scope-tabs" aria-label="فیلتر زمانی کارها">
              {MY_TASK_SCOPES.map((item) => (
                <button
                  className={scope === item.value ? 'my-task-scope-active' : ''}
                  type="button"
                  key={item.value}
                  aria-label={`نمایش ${item.label}`}
                  aria-pressed={scope === item.value}
                  onClick={() => onScope(item.value)}
                >
                  <span>{item.label}</span>
                  <b>{toPersianDigits(getScopeCount(item.value))}</b>
                </button>
              ))}
            </div>

            <label className="my-task-priority-select">
              <span>اولویت</span>
              <select
                value={priorityFilter}
                onChange={(event) => onPriorityFilter(event.target.value)}
                aria-label="فیلتر اولویت کارها"
              >
                {FILTERS.map((item) => (
                  <option value={item.value} key={item.value}>{item.label}</option>
                ))}
              </select>
            </label>
          </div>

          {visibleTasks.length > 0 ? (
            <div className="my-task-groups">
              {SCHEDULE_ORDER.map((schedule) => {
                const scheduledTasks = visibleTasks.filter((task) => task.schedule === schedule);
                if (scheduledTasks.length === 0) return null;

                const scheduleCopy = TASK_SCHEDULES[schedule];
                return (
                  <section className="my-task-group" key={schedule} aria-labelledby={`task-group-${schedule}`}>
                    <header>
                      <div>
                        <h3 id={`task-group-${schedule}`}>{scheduleCopy.label}</h3>
                        <span>{scheduleCopy.detail}</span>
                      </div>
                      <b>{toPersianDigits(scheduledTasks.length)} کار</b>
                    </header>
                    <ul>
                      {scheduledTasks.map((task) => (
                        <MyTaskItem
                          task={task}
                          onToggle={onToggle}
                          onDelete={onDelete}
                          key={task.id}
                        />
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="tasks-empty-state my-tasks-empty-state">
              <span><DashboardIcon name={searchTerm ? 'search' : 'check'} /></span>
              <strong>{searchTerm ? 'کاری با این عبارت پیدا نشد' : 'این بخش خالی است'}</strong>
              <p>فیلترها را تغییر دهید یا یک کار تازه به برنامه اضافه کنید.</p>
              <button type="button" onClick={onAddTask}>
                <DashboardIcon name="plus" />
                افزودن کار
              </button>
            </div>
          )}
        </section>

        <aside className="my-tasks-aside" aria-label="خلاصه و دسته‌بندی کارها">
          <section className="dashboard-card task-focus-card" aria-labelledby="task-focus-title">
            <div className="task-focus-heading">
              <div>
                <span className="section-kicker">ریتم این هفته</span>
                <h2 id="task-focus-title">پیشرفت کلی</h2>
              </div>
              <span
                className="task-focus-ring"
                style={{ '--task-completion': `${completionPercentage * 3.6}deg` }}
                aria-label={`${completionPercentage} درصد تکمیل شده`}
              >
                {toPersianDigits(completionPercentage)}٪
              </span>
            </div>

            <div className="task-focus-progress">
              <span style={{ width: `${completionPercentage}%` }} />
            </div>
            <p className="task-focus-copy">
              <strong>{toPersianDigits(completedTasks)}</strong> کار انجام شده و{' '}
              <strong>{toPersianDigits(pendingTasks)}</strong> کار دیگر باقی مانده است.
            </p>

            {nextTask && (
              <div className="task-focus-next">
                <span><DashboardIcon name="target" /></span>
                <p>
                  <small>پیشنهاد برای تمرکز بعدی</small>
                  <strong>{nextTask.title}</strong>
                </p>
                <time dateTime={nextTask.dueTime}>{toPersianDigits(nextTask.dueTime)}</time>
              </div>
            )}
          </section>

          <section className="dashboard-card task-categories-card" aria-labelledby="task-categories-title">
            <div className="task-categories-heading">
              <div>
                <span className="section-kicker">مرتب‌سازی سریع</span>
                <h2 id="task-categories-title">فهرست‌ها</h2>
              </div>
              <span>{toPersianDigits(tasks.length)} کار</span>
            </div>

            <div className="task-category-filters">
              <button
                className={categoryFilter === 'all' ? 'task-category-filter-active' : ''}
                type="button"
                aria-pressed={categoryFilter === 'all'}
                onClick={() => onCategoryFilter('all')}
              >
                <span className="task-category-filter-symbol task-category-filter-all">
                  <DashboardIcon name="stack" />
                </span>
                <strong>همه‌ی فهرست‌ها</strong>
                <b>{toPersianDigits(tasks.length)}</b>
              </button>
              {Object.entries(TASK_CATEGORIES).map(([value, category]) => (
                <button
                  className={categoryFilter === value ? 'task-category-filter-active' : ''}
                  type="button"
                  key={value}
                  aria-pressed={categoryFilter === value}
                  onClick={() => onCategoryFilter(value)}
                >
                  <span className={`task-category-filter-symbol task-category-filter-${category.tone}`}>
                    <i />
                  </span>
                  <strong>{category.label}</strong>
                  <b>{toPersianDigits(tasks.filter((task) => task.category === value).length)}</b>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function CalendarAgendaTask({ task, onToggle }) {
  const category = TASK_CATEGORIES[task.category] ?? TASK_CATEGORIES.work;

  return (
    <li className={task.completed ? 'calendar-agenda-task calendar-agenda-task-completed' : 'calendar-agenda-task'}>
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
      <div>
        <strong>{task.title}</strong>
        <small className={`calendar-agenda-category calendar-agenda-category-${category.tone}`}>
          <i /> {category.label}
        </small>
      </div>
      <time dateTime={task.dueTime}>{toPersianDigits(task.dueTime)}</time>
    </li>
  );
}

function CalendarView({
  tasks,
  searchTerm,
  now,
  calendarDate,
  selectedDate,
  onCalendarDateChange,
  onSelectDate,
  onToggle,
  onAddTask,
}) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const calendar = getCurrentCalendar(calendarDate);
  const calendarGrid = createPersianCalendarGrid(calendarDate);
  const selectedKey = toDateKey(selectedDate);
  const todayKey = toDateKey(now);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fa');
  const taskEntries = tasks.map((task) => {
    const taskDate = getTaskDueDate(task, now);
    return { ...task, taskDate, dateKey: toDateKey(taskDate) };
  });
  const visibleTaskEntries = taskEntries.filter((task) => {
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesSearch = !normalizedSearch
      || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase('fa').includes(normalizedSearch);
    return matchesCategory && matchesSearch;
  });
  const monthTasks = taskEntries.filter((task) => {
    const parts = getCalendarParts(task.taskDate);
    return parts.year === calendar.year && parts.month === calendar.month;
  });
  const selectedTasks = visibleTaskEntries.filter((task) => task.dateKey === selectedKey);
  const completedMonthTasks = monthTasks.filter((task) => task.completed).length;
  const monthCompletion = monthTasks.length === 0
    ? 0
    : Math.round((completedMonthTasks / monthTasks.length) * 100);
  const taskCountsByDate = monthTasks.reduce((counts, task) => ({
    ...counts,
    [task.dateKey]: (counts[task.dateKey] ?? 0) + 1,
  }), {});
  const busiestDateEntry = Object.entries(taskCountsByDate)
    .sort((first, second) => second[1] - first[1])[0];
  const busiestDay = busiestDateEntry
    ? getCalendarParts(parseDateKey(busiestDateEntry[0])).day
    : null;

  function changeMonth(offset) {
    const nextMonth = shiftPersianMonth(calendarDate, offset);
    onCalendarDateChange(nextMonth);
    onSelectDate(nextMonth);
  }

  function showToday() {
    const today = new Date();
    onCalendarDateChange(today);
    onSelectDate(today);
  }

  function selectCalendarDay(cell) {
    onSelectDate(cell.date);
    if (!cell.inCurrentMonth) onCalendarDateChange(cell.date);
  }

  return (
    <div className="dashboard-content calendar-content">
      <header className="calendar-page-heading">
        <div>
          <span className="welcome-overline">
            <i /> تصویر روشن‌تری از روزهای پیش رو
          </span>
          <h1>تقویم</h1>
          <p>برنامه‌ی ماه را مرور کنید و برای هر روز، کارهای مهم را کنار هم بچینید.</p>
        </div>
        <button className="calendar-add-button" type="button" onClick={onAddTask}>
          <DashboardIcon name="plus" />
          افزودن کار در این روز
        </button>
      </header>

      <section className="calendar-glance" aria-label="خلاصه‌ی تقویم">
        <article className="calendar-date-highlight">
          <span>روز انتخاب‌شده</span>
          <strong>{toPersianDigits(getCalendarParts(selectedDate).day)}</strong>
          <p>{FULL_DATE_FORMATTER.format(selectedDate)}</p>
          <i aria-hidden="true"><DashboardIcon name="calendar" /></i>
        </article>
        <article className="calendar-glance-card calendar-glance-coral">
          <span><DashboardIcon name="stack" /></span>
          <div>
            <small>کارهای این ماه</small>
            <strong>{toPersianDigits(monthTasks.length)}</strong>
            <p>{toPersianDigits(monthTasks.length - completedMonthTasks)} کار باقی مانده</p>
          </div>
        </article>
        <article className="calendar-glance-card calendar-glance-lime">
          <span><DashboardIcon name="check" /></span>
          <div>
            <small>انجام‌شده</small>
            <strong>{toPersianDigits(completedMonthTasks)}</strong>
            <p>{toPersianDigits(monthCompletion)}٪ تکمیل برنامه</p>
          </div>
        </article>
        <article className="calendar-glance-card calendar-glance-gold">
          <span><DashboardIcon name="spark" /></span>
          <div>
            <small>شلوغ‌ترین روز</small>
            <strong>{busiestDay ? toPersianDigits(busiestDay) : 'ـ'}</strong>
            <p>{busiestDateEntry ? `${toPersianDigits(busiestDateEntry[1])} کار برنامه‌ریزی‌شده` : 'هنوز کاری ثبت نشده'}</p>
          </div>
        </article>
      </section>

      <div className="calendar-layout">
        <section className="dashboard-card calendar-month-card" aria-labelledby="calendar-month-title">
          <header className="calendar-month-header">
            <div className="calendar-month-title-wrap">
              <span className="section-kicker">نمای ماهانه</span>
              <h2 id="calendar-month-title">{calendar.label}</h2>
            </div>
            <div className="calendar-month-actions">
              <button type="button" className="calendar-today-button" onClick={showToday}>امروز</button>
              <div className="calendar-month-navigation">
                <button type="button" aria-label="ماه قبل" onClick={() => changeMonth(-1)}>
                  <DashboardIcon name="chevron-right" />
                </button>
                <button type="button" aria-label="ماه بعد" onClick={() => changeMonth(1)}>
                  <DashboardIcon name="chevron-left" />
                </button>
              </div>
            </div>
          </header>

          <div className="calendar-category-filters" aria-label="فیلتر تقویم بر اساس فهرست">
            <button
              className={categoryFilter === 'all' ? 'calendar-category-active' : ''}
              type="button"
              aria-pressed={categoryFilter === 'all'}
              onClick={() => setCategoryFilter('all')}
            >
              <i className="calendar-category-all" /> همه
            </button>
            {Object.entries(TASK_CATEGORIES).map(([value, category]) => (
              <button
                className={categoryFilter === value ? 'calendar-category-active' : ''}
                type="button"
                key={value}
                aria-pressed={categoryFilter === value}
                onClick={() => setCategoryFilter(value)}
              >
                <i className={`calendar-category-${category.tone}`} /> {category.label}
              </button>
            ))}
          </div>

          <div className="calendar-grid-scroll">
            <div className="calendar-weekdays" aria-hidden="true">
              {PERSIAN_WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>
            <div className="calendar-month-grid" aria-label={`تقویم ${calendar.label}`}>
              {calendarGrid.map((cell) => {
                const dayTasks = visibleTaskEntries.filter((task) => task.dateKey === cell.key);
                const isSelected = cell.key === selectedKey;
                const isToday = cell.key === todayKey;
                const cellClasses = [
                  'calendar-day',
                  !cell.inCurrentMonth ? 'calendar-day-outside' : '',
                  isSelected ? 'calendar-day-selected' : '',
                  isToday ? 'calendar-day-today' : '',
                ].filter(Boolean).join(' ');

                return (
                  <button
                    className={cellClasses}
                    type="button"
                    key={cell.key}
                    aria-label={`${FULL_DATE_FORMATTER.format(cell.date)}، ${dayTasks.length} کار`}
                    aria-pressed={isSelected}
                    onClick={() => selectCalendarDay(cell)}
                  >
                    <span className="calendar-day-number">{toPersianDigits(cell.day)}</span>
                    <span className="calendar-day-tasks">
                      {dayTasks.slice(0, 2).map((task) => {
                        const category = TASK_CATEGORIES[task.category] ?? TASK_CATEGORIES.work;
                        return (
                          <span
                            className={`calendar-task-pill calendar-task-${category.tone} ${task.completed ? 'calendar-task-completed' : ''}`}
                            key={task.id}
                          >
                            <i />
                            <em>{task.title}</em>
                          </span>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <span className="calendar-more-tasks">+{toPersianDigits(dayTasks.length - 2)} کار</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="calendar-aside" aria-label="برنامه و وضعیت ماه">
          <section className="dashboard-card calendar-agenda-card" aria-label="برنامه‌ی روز انتخاب‌شده">
            <header>
              <div>
                <span className="section-kicker">برنامه‌ی روز</span>
                <h2>{FULL_DATE_FORMATTER.format(selectedDate)}</h2>
              </div>
              <b>{toPersianDigits(selectedTasks.length)} کار</b>
            </header>

            {selectedTasks.length > 0 ? (
              <ul className="calendar-agenda-list">
                {selectedTasks.map((task) => (
                  <CalendarAgendaTask task={task} onToggle={onToggle} key={task.id} />
                ))}
              </ul>
            ) : (
              <div className="calendar-agenda-empty">
                <span><DashboardIcon name="calendar" /></span>
                <strong>{searchTerm ? 'کاری با این جست‌وجو پیدا نشد' : 'این روز هنوز خلوت است'}</strong>
                <p>یک کار تازه اضافه کنید و برنامه‌ی این روز را بسازید.</p>
              </div>
            )}

            <button className="calendar-agenda-add" type="button" onClick={onAddTask}>
              <DashboardIcon name="plus" />
              افزودن کار برای این روز
            </button>
          </section>

          <section className="dashboard-card calendar-month-progress" aria-labelledby="calendar-progress-title">
            <div className="calendar-progress-heading">
              <div>
                <span className="section-kicker">نبض ماه</span>
                <h2 id="calendar-progress-title">وضعیت برنامه</h2>
              </div>
              <strong>{toPersianDigits(monthCompletion)}٪</strong>
            </div>
            <div className="calendar-progress-track">
              <span style={{ width: `${monthCompletion}%` }} />
            </div>
            <div className="calendar-progress-stats">
              <p><i className="calendar-progress-done" /><span>انجام‌شده</span><b>{toPersianDigits(completedMonthTasks)}</b></p>
              <p><i className="calendar-progress-pending" /><span>در انتظار</span><b>{toPersianDigits(monthTasks.length - completedMonthTasks)}</b></p>
            </div>
            <div className="calendar-progress-note">
              <DashboardIcon name="spark" />
              <p>
                {monthCompletion >= 60 ? 'ریتم خوبی ساخته‌اید.' : 'با یک کار کوچک شروع کنید.'}
                <small>{monthCompletion >= 60 ? 'همین روند را تا پایان ماه ادامه دهید.' : 'هر علامت تیک، مسیر ماه را روشن‌تر می‌کند.'}</small>
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function AddTaskModal({ onClose, onAdd, allTasks = false, calendarDate = null }) {
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
    const schedule = calendarDate
      ? getTaskScheduleForDate(calendarDate, now)
      : allTasks ? values.schedule : 'today';
    const overdue = (calendarDate && toDateKey(calendarDate) < toDateKey(now))
      || (schedule === 'today' && hours * 60 + minutes < now.getHours() * 60 + now.getMinutes());

    onAdd({
      id: Date.now(),
      title,
      description: values.description.trim(),
      priority: values.priority,
      dueTime: values.dueTime,
      completed: false,
      overdue,
      schedule,
      category: allTasks ? values.category : 'work',
      dueDate: calendarDate ? toDateKey(calendarDate) : undefined,
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

          {allTasks && (
            <div className="modal-fields-row modal-planning-row">
              <div>
                {calendarDate ? (
                  <>
                    <span className="modal-static-label">تاریخ انجام</span>
                    <div className="modal-selected-date">
                      <DashboardIcon name="calendar" />
                      {FULL_DATE_FORMATTER.format(calendarDate)}
                    </div>
                  </>
                ) : (
                  <>
                    <label htmlFor="new-task-schedule">زمان‌بندی</label>
                    <select id="new-task-schedule" name="schedule" defaultValue="today">
                      <option value="today">امروز</option>
                      <option value="tomorrow">فردا</option>
                      <option value="week">این هفته</option>
                    </select>
                  </>
                )}
              </div>
              <div>
                <label htmlFor="new-task-category">فهرست</label>
                <select id="new-task-category" name="category" defaultValue="work">
                  <option value="work">کاری</option>
                  <option value="personal">شخصی</option>
                  <option value="health">سلامتی</option>
                </select>
              </div>
            </div>
          )}

          <div className="task-modal-actions">
            <button className="modal-cancel-button" type="button" onClick={onClose}>انصراف</button>
            <button className="modal-submit-button" type="submit">
              <DashboardIcon name="plus" />
              {calendarDate ? 'افزودن به این روز' : allTasks ? 'افزودن کار' : 'افزودن به امروز'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Dashboard({ page = 'dashboard' }) {
  const now = new Date();
  const isTasksPage = page === 'tasks';
  const isCalendarPage = page === 'calendar';
  const isStatisticsPage = page === 'statistics';
  const calendar = getCurrentCalendar(now);
  const initialMonthlyData = createMonthlyData(calendar);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [myTaskScope, setMyTaskScope] = useState('all');
  const [myTaskPriorityFilter, setMyTaskPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [visibleCalendarDate, setVisibleCalendarDate] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date());

  const todayTasks = tasks.filter((task) => task.schedule === 'today');
  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((task) => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const overdueTasks = todayTasks.filter((task) => task.overdue && !task.completed).length;
  const dailyPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const normalizedSearch = searchTerm.trim().toLocaleLowerCase('fa');
  const visibleTasks = todayTasks.filter((task) => {
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesSearch = !normalizedSearch
      || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase('fa').includes(normalizedSearch);
    return matchesPriority && matchesSearch;
  });
  const visibleMyTasks = tasks.filter((task) => {
    const matchesScope = myTaskScope === 'all'
      || (myTaskScope === 'today' && task.schedule === 'today')
      || (myTaskScope === 'upcoming' && task.schedule !== 'today' && !task.completed)
      || (myTaskScope === 'completed' && task.completed);
    const matchesPriority = myTaskPriorityFilter === 'all' || task.priority === myTaskPriorityFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
    const matchesSearch = !normalizedSearch
      || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase('fa').includes(normalizedSearch);
    return matchesScope && matchesPriority && matchesCategory && matchesSearch;
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
    setMyTaskScope('all');
    setMyTaskPriorityFilter('all');
    setCategoryFilter('all');
    setSearchTerm('');
    setAddTaskOpen(false);
  }

  function deleteTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
  }

  return (
    <div className="dashboard-page" dir="rtl">
      <Sidebar monthlyRate={overallCompletion} activePage={page} />

      <main className="dashboard-workspace">
        <TopBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          notificationsOpen={notificationsOpen}
          onToggleNotifications={() => setNotificationsOpen((current) => !current)}
          searchPlaceholder={isCalendarPage
            ? 'جست‌وجو در کارهای تقویم...'
            : isTasksPage
              ? 'جست‌وجو در همه‌ی کارها...'
              : isStatisticsPage
                ? 'فیلتر آمار بر اساس عنوان کار...'
                : 'جست‌وجو در کارهای امروز...'}
        />

        {isTasksPage ? (
          <MyTasksView
            tasks={tasks}
            visibleTasks={visibleMyTasks}
            scope={myTaskScope}
            onScope={setMyTaskScope}
            priorityFilter={myTaskPriorityFilter}
            onPriorityFilter={setMyTaskPriorityFilter}
            categoryFilter={categoryFilter}
            onCategoryFilter={setCategoryFilter}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onAddTask={() => setAddTaskOpen(true)}
            searchTerm={searchTerm}
            now={now}
          />
        ) : isCalendarPage ? (
          <CalendarView
            tasks={tasks}
            searchTerm={searchTerm}
            now={now}
            calendarDate={visibleCalendarDate}
            selectedDate={selectedCalendarDate}
            onCalendarDateChange={setVisibleCalendarDate}
            onSelectDate={setSelectedCalendarDate}
            onToggle={toggleTask}
            onAddTask={() => setAddTaskOpen(true)}
          />
        ) : isStatisticsPage ? (
          <StatisticsView
            tasks={tasks}
            searchTerm={searchTerm}
            now={now}
          />
        ) : (
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
        )}
      </main>

      {addTaskOpen && (
        <AddTaskModal
          onClose={() => setAddTaskOpen(false)}
          onAdd={addTask}
          allTasks={isTasksPage || isCalendarPage}
          calendarDate={isCalendarPage ? selectedCalendarDate : null}
        />
      )}
    </div>
  );
}
