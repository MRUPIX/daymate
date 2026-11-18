import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

function renderDashboard(path = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('task management dashboard', () => {
  it('renders the overview, task list, progress, chart, and statistics', () => {
    renderDashboard();

    expect(screen.getByRole('heading', { level: 1, name: /سارا/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'امروز در یک نگاه' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'کارهای امروز' })).toBeInTheDocument();
    expect(screen.getByLabelText('پیشرفت روزانه 33 درصد')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /نمودار بهره‌وری روزانه/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'آمارهای سریع' })).toBeInTheDocument();
  });

  it('updates daily progress immediately when a task is completed', async () => {
    const user = userEvent.setup();
    renderDashboard();

    const taskCheckbox = screen.getByRole('checkbox', { name: 'انجام کار جلسه با تیم طراحی' });
    await user.click(taskCheckbox);

    expect(taskCheckbox).toBeChecked();
    expect(screen.getByLabelText('پیشرفت روزانه 50 درصد')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'بازگرداندن کار جلسه با تیم طراحی' })).toBeChecked();
  });

  it('filters tasks by priority and searches the visible list', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'زیاد' }));

    expect(screen.getByText('جلسه با تیم طراحی')).toBeInTheDocument();
    expect(screen.getByText('آماده‌سازی گزارش پیشرفت')).toBeInTheDocument();
    expect(screen.queryByText('سی دقیقه مطالعه')).not.toBeInTheDocument();

    const searchInput = screen.getByLabelText('جست‌وجوی کارها');
    await user.keyboard('{Control>}k{/Control}');
    expect(searchInput).toHaveFocus();
    await user.type(searchInput, 'گزارش');

    expect(screen.queryByText('جلسه با تیم طراحی')).not.toBeInTheDocument();
    expect(screen.getByText('آماده‌سازی گزارش پیشرفت')).toBeInTheDocument();
  });

  it('adds a new task through the local modal form', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'کار جدید' }));

    const dialog = screen.getByRole('dialog', { name: 'افزودن کار جدید' });
    await user.type(within(dialog).getByLabelText(/^عنوان کار/), 'برنامه‌ریزی فردا');
    await user.type(within(dialog).getByLabelText(/توضیح کوتاه/), 'سه اولویت اصلی را مشخص کن.');
    await user.selectOptions(within(dialog).getByLabelText('اولویت'), 'high');
    await user.click(within(dialog).getByRole('button', { name: 'افزودن به امروز' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('برنامه‌ریزی فردا')).toBeInTheDocument();
    expect(screen.getByLabelText('پیشرفت روزانه 29 درصد')).toBeInTheDocument();
  });

  it('opens the full task page from the sidebar and filters completed work', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('link', { name: 'کارهای من' }));

    expect(screen.getByRole('heading', { level: 1, name: 'کارهای من' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'کارهای من' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('تکمیل طرح ارائه')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'نمایش انجام‌شده' }));

    expect(screen.getByText('مرور برنامه‌ی هفتگی')).toBeInTheDocument();
    expect(screen.queryByText('تکمیل طرح ارائه')).not.toBeInTheDocument();
  });

  it('adds a scheduled task from the full task page', async () => {
    const user = userEvent.setup();
    renderDashboard('/tasks');

    await user.click(screen.getByRole('button', { name: 'افزودن کار جدید' }));

    const dialog = screen.getByRole('dialog', { name: 'افزودن کار جدید' });
    await user.type(within(dialog).getByLabelText(/^عنوان کار/), 'تماس با مربی');
    await user.selectOptions(within(dialog).getByLabelText('زمان‌بندی'), 'tomorrow');
    await user.selectOptions(within(dialog).getByLabelText('فهرست'), 'health');
    await user.click(within(dialog).getByRole('button', { name: 'افزودن کار' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('تماس با مربی')).toBeInTheDocument();
  });

  it('opens the Persian calendar from the sidebar and changes months', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('link', { name: 'تقویم' }));

    expect(screen.getByRole('heading', { level: 1, name: 'تقویم' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'تقویم' })).toHaveAttribute('aria-current', 'page');

    const currentCalendar = screen.getByLabelText(/^تقویم /);
    const currentCalendarLabel = currentCalendar.getAttribute('aria-label');
    await user.click(screen.getByRole('button', { name: 'ماه بعد' }));

    expect(screen.queryByLabelText(currentCalendarLabel)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^تقویم /)).toBeInTheDocument();
  });

  it('adds a task to the selected calendar day', async () => {
    const user = userEvent.setup();
    renderDashboard('/calendar');

    await user.click(screen.getByRole('button', { name: 'افزودن کار در این روز' }));

    const dialog = screen.getByRole('dialog', { name: 'افزودن کار جدید' });
    expect(within(dialog).getByText('تاریخ انجام')).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText(/^عنوان کار/), 'مرور برنامه‌ی ماه');
    await user.selectOptions(within(dialog).getByLabelText('فهرست'), 'personal');
    await user.click(within(dialog).getByRole('button', { name: 'افزودن به این روز' }));

    const agenda = screen.getByRole('region', { name: 'برنامه‌ی روز انتخاب‌شده' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(within(agenda).getByText('مرور برنامه‌ی ماه')).toBeInTheDocument();
  });
});
