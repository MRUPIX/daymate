import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App.jsx';

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('Persian authentication pages', () => {
  it('renders the login page in Persian and switches to signup', async () => {
    const user = userEvent.setup();
    renderAt('/login');

    expect(screen.getByRole('heading', { name: 'دوباره خوش آمدید' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^ایمیل/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^رمز عبور/)).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'ساخت حساب' }));

    expect(screen.getByRole('heading', { name: 'حساب خود را بسازید' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^نام و نام خانوادگی/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^تکرار رمز عبور/)).toBeInTheDocument();
  });

  it('shows Persian validation messages for an incomplete signup', async () => {
    const user = userEvent.setup();
    renderAt('/signup');

    await user.click(screen.getByRole('button', { name: 'ساخت حساب کاربری' }));

    expect(screen.getByText('لطفاً نام و نام خانوادگی خود را وارد کنید.')).toBeInTheDocument();
    expect(screen.getByText('وارد کردن ایمیل الزامی است.')).toBeInTheDocument();
    expect(screen.getByText('وارد کردن رمز عبور الزامی است.')).toBeInTheDocument();
    expect(
      screen.getByText('برای ادامه، قوانین استفاده و حریم خصوصی را بپذیرید.'),
    ).toBeInTheDocument();
  });

  it('accepts valid login input without making a backend request', async () => {
    const user = userEvent.setup();
    renderAt('/login');

    await user.type(screen.getByLabelText(/^ایمیل/), 'sara@example.com');
    await user.type(screen.getByLabelText(/^رمز عبور/), 'secure-password');
    await user.click(screen.getByRole('button', { name: 'ورود به دی‌میت' }));

    expect(screen.getByRole('status')).toHaveTextContent(
      'اطلاعات ورود معتبر است و برای ارسال آماده شد.',
    );
  });
});
