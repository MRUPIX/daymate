import { useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const pageContent = {
  login: {
    eyebrow: 'مدیریت روز، ساده‌تر از همیشه',
    title: 'خوش آمدید',
    description: 'برای دیدن کارهای امروز، وارد حساب خود شوید.',
    submit: 'ورود به دی‌میت',
    question: 'هنوز حساب کاربری ندارید؟',
    switchLabel: 'ساخت حساب',
    switchTo: '/signup',
  },
  signup: {
    eyebrow: 'یک قدم تا روزهای منظم‌تر',
    title: 'حساب خود را بسازید',
    description: 'کمتر از یک دقیقه تا شروع برنامه‌ریزی روزانه فاصله دارید.',
    submit: 'ساخت حساب کاربری',
    question: 'قبلاً ثبت‌نام کرده‌اید؟',
    switchLabel: 'وارد شوید',
    switchTo: '/login',
  },
};

function LogoMark() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true">
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
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
      <path d="m22 7-10 7L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="10" width="18" height="11" rx="3" />
      <path d="M7 10V7a5 5 0 0 1 10 0v3" />
    </svg>
  );
}

function EyeIcon({ hidden }) {
  return hidden ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m3 3 18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A11.8 11.8 0 0 1 12 4c5.5 0 9.5 5 10 8a11.9 11.9 0 0 1-2 4.2M6.2 6.2C3.9 7.7 2.4 10 2 12c.5 3 4.5 8 10 8 1.5 0 2.9-.4 4.1-1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 12c.5-3 4.5-8 10-8s9.5 5 10 8c-.5 3-4.5 8-10 8S2.5 15 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  );
}

function FieldError({ id, message }) {
  if (!message) return null;

  return (
    <span className="field-error" id={id} role="alert">
      {message}
    </span>
  );
}

function VisualPanel() {
  return (
    <aside className="visual-panel" aria-label="معرفی دی‌میت">
      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <div className="brand">
        <span className="brand-mark">
          <LogoMark />
        </span>
        <span className="brand-name">دی‌میت</span>
      </div>

      <div className="visual-copy">
        <span className="visual-kicker">
          <i />
          همراه روزهای پربار شما
        </span>
        <h2>
          کارها را بنویسید،
          <strong>ذهنتان را آزاد کنید.</strong>
        </h2>
        <p>همه‌ی برنامه‌های روزانه در یک جای ساده، روشن و همیشه در دسترس.</p>
      </div>

      <div className="day-card" aria-hidden="true">
        <div className="day-card-header">
          <div>
            <span>برنامه‌ی امروز</span>
            <strong>سه‌شنبه، ۱۴ آبان</strong>
          </div>
          <div className="progress-ring">
            <span>۶۰٪</span>
          </div>
        </div>

        <div className="progress-track">
          <span />
        </div>

        <div className="task-list">
          <div className="task-row task-done">
            <span className="task-check">✓</span>
            <span>مرور برنامه‌ی هفتگی</span>
            <small>۰۸:۳۰</small>
          </div>
          <div className="task-row">
            <span className="task-check" />
            <span>جلسه با تیم طراحی</span>
            <small>۱۰:۳۰</small>
          </div>
          <div className="task-row">
            <span className="task-check" />
            <span>سی دقیقه مطالعه</span>
            <small>۱۸:۰۰</small>
          </div>
        </div>
      </div>

      <div className="floating-note" aria-hidden="true">
        <span>✓</span>
        <p>
          عالی پیش می‌روید
          <small>۳ کار از ۵ کار انجام شده</small>
        </p>
      </div>
    </aside>
  );
}

function AuthPage({ mode }) {
  const isSignup = mode === 'signup';
  const content = pageContent[mode];
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState('');

  function clearFeedback(event) {
    const fieldName = event.target.name;

    setNotice('');
    if (fieldName && errors[fieldName]) {
      setErrors((current) => ({ ...current, [fieldName]: '' }));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const nextErrors = {};

    if (isSignup && !values.username.trim()) {
      nextErrors.username = 'وارد کردن نام کاربری الزامی است.';
    }

    if (!isSignup && !values.identifier.trim()) {
      nextErrors.identifier = 'وارد کردن ایمیل یا نام کاربری الزامی است.';
    }

    if (isSignup && !values.email) {
      nextErrors.email = 'وارد کردن ایمیل الزامی است.';
    } else if (isSignup && !EMAIL_PATTERN.test(values.email)) {
      nextErrors.email = 'یک ایمیل معتبر وارد کنید.';
    }

    if (!values.password) {
      nextErrors.password = 'وارد کردن رمز عبور الزامی است.';
    } else if (isSignup && values.password.length < 8) {
      nextErrors.password = 'رمز عبور باید دست‌کم ۸ نویسه داشته باشد.';
    }

    if (isSignup && values.terms !== 'accepted') {
      nextErrors.terms = 'برای ادامه، قوانین استفاده و حریم خصوصی را بپذیرید.';
    }

    setErrors(nextErrors);
    setNotice('');

    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      form.elements[firstInvalidField]?.focus();
      return;
    }

    setNotice(
      isSignup
        ? 'اطلاعات شما معتبر است و برای ساخت حساب آماده شد.'
        : 'اطلاعات ورود معتبر است و برای ارسال آماده شد.',
    );
  }

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-shell">
        <main className="form-panel">
          <div className="mobile-brand">
            <span className="brand-mark">
              <LogoMark />
            </span>
            <span className="brand-name">دی‌میت</span>
          </div>

          <div className="form-content">
            <header className="form-heading">
              <span className="form-eyebrow">{content.eyebrow}</span>
              <h1>{content.title}</h1>
              <p>{content.description}</p>
            </header>

            <form className="auth-form" onSubmit={handleSubmit} onChange={clearFeedback} noValidate>
              {isSignup && (
                <div className="form-field">
                  <label htmlFor="username">
                    نام کاربری
                    <span aria-hidden="true">*</span>
                  </label>
                  <div className={`input-shell ${errors.username ? 'input-error' : ''}`}>
                    <span className="field-icon">
                      <UserIcon />
                    </span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      placeholder="برای نمونه: sara_ahmadi"
                      dir="ltr"
                      aria-invalid={Boolean(errors.username)}
                      aria-describedby={errors.username ? 'username-error' : undefined}
                    />
                  </div>
                  <FieldError id="username-error" message={errors.username} />
                </div>
              )}

              {isSignup ? (
                <div className="form-field">
                  <label htmlFor="email">
                    ایمیل
                    <span aria-hidden="true">*</span>
                  </label>
                  <div className={`input-shell ${errors.email ? 'input-error' : ''}`}>
                    <span className="field-icon">
                      <MailIcon />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      dir="ltr"
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                  </div>
                  <FieldError id="email-error" message={errors.email} />
                </div>
              ) : (
                <div className="form-field">
                  <label htmlFor="identifier">
                    ایمیل یا نام کاربری
                    <span aria-hidden="true">*</span>
                  </label>
                  <div className={`input-shell ${errors.identifier ? 'input-error' : ''}`}>
                    <span className="field-icon">
                      <UserIcon />
                    </span>
                    <input
                      id="identifier"
                      name="identifier"
                      type="text"
                      autoComplete="username"
                      placeholder="ایمیل یا نام کاربری"
                      dir="ltr"
                      aria-invalid={Boolean(errors.identifier)}
                      aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                    />
                  </div>
                  <FieldError id="identifier-error" message={errors.identifier} />
                </div>
              )}

              <div className="form-field">
                <div className="label-row">
                  <label htmlFor="password">
                    رمز عبور
                    <span aria-hidden="true">*</span>
                  </label>
                  {!isSignup && (
                    <button
                      className="text-button forgot-button"
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setNotice('بازیابی رمز عبور در مرحله‌ی بعد فعال می‌شود.');
                      }}
                    >
                      رمز عبور را فراموش کرده‌اید؟
                    </button>
                  )}
                </div>
                <div className={`input-shell ${errors.password ? 'input-error' : ''}`}>
                  <span className="field-icon">
                    <LockIcon />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    placeholder={isSignup ? 'حداقل ۸ نویسه' : 'رمز عبور شما'}
                    dir="ltr"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    className="visibility-button"
                    type="button"
                    onClick={() => setPasswordVisible((current) => !current)}
                    aria-label={passwordVisible ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
                    aria-pressed={passwordVisible}
                  >
                    <EyeIcon hidden={passwordVisible} />
                  </button>
                </div>
                <FieldError id="password-error" message={errors.password} />
              </div>

              {isSignup ? (
                <div className="terms-field">
                  <label className="check-label">
                    <input name="terms" type="checkbox" value="accepted" />
                    <span className="custom-check" aria-hidden="true">✓</span>
                    <span>قوانین استفاده و حریم خصوصی را می‌پذیرم.</span>
                  </label>
                  <FieldError id="terms-error" message={errors.terms} />
                </div>
              ) : (
                <label className="check-label remember-label">
                  <input name="remember" type="checkbox" value="yes" />
                  <span className="custom-check" aria-hidden="true">✓</span>
                  <span>مرا به خاطر بسپار</span>
                </label>
              )}

              {notice && (
                <div className="form-notice" role="status">
                  <span>✓</span>
                  {notice}
                </div>
              )}

              <button className="submit-button" type="submit">
                <span>{content.submit}</span>
                <ArrowIcon />
              </button>
            </form>

            <p className="switch-copy">
              {content.question}
              <Link to={content.switchTo}>{content.switchLabel}</Link>
            </p>
          </div>

          <p className="form-footer">یک روز خوب، از یک برنامه‌ی روشن شروع می‌شود.</p>
        </main>

        <VisualPanel />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/signup" element={<AuthPage key="signup" mode="signup" />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
