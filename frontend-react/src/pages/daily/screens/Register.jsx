import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Screen, TopBar, ActionBar } from '../ui';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/api';

const NAME_RE = /^[A-Za-z\s]+$/;

export default function AppRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/app';

  const set = (field) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const submit = async (e) => {
    e.preventDefault();

    const next = {};
    if (!NAME_RE.test(form.name.trim())) next.name = 'Enter a name without numbers or symbols.';
    if (form.password.length < 8) next.password = 'At least 8 characters, with a letter and a number.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      const { data } = await api.post('/api/users/register', form);
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setErrors({ password: err.response?.data?.message || err.message || 'Could not create your account.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Create account" to="/app" />

      <form className="mq-body" style={{ gap: 18 }} onSubmit={submit}>
        <h2 style={{ fontSize: 32 }}>Join Milquu</h2>
        <p className="mq-lede">Daily farm-fresh deliveries, at your door by 7:30.</p>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-reg-name">Full name</label>
          <input
            id="mq-reg-name"
            className={`mq-input${errors.name ? ' mq-input-err' : ''}`}
            required
            value={form.name}
            onChange={set('name')}
            placeholder="John Doe"
          />
          {errors.name && <span className="mq-err">{errors.name}</span>}
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-reg-phone">Phone number</label>
          <input
            id="mq-reg-phone"
            className="mq-input"
            type="tel"
            inputMode="tel"
            autoComplete="username"
            required
            pattern="(\+?91|0)?[6-9][0-9]{9}"
            title="Enter a 10-digit mobile number"
            value={form.phone}
            onChange={set('phone')}
            placeholder="98200 98200"
          />
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-reg-password">Password</label>
          <input
            id="mq-reg-password"
            className={`mq-input${errors.password ? ' mq-input-err' : ''}`}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
          />
          {errors.password && <span className="mq-err">{errors.password}</span>}
        </div>

        <p style={{ fontSize: 14, color: 'var(--mq-neutral-700)' }}>
          Already have an account?{' '}
          <Link to="/app/login" state={location.state} style={{ fontWeight: 700, color: 'var(--mq-sage-800)' }}>
            Sign in
          </Link>
        </p>

        <div className="mq-fill" />

        <ActionBar>
          <button type="submit" className="mq-btn mq-btn-block" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </ActionBar>
      </form>
    </Screen>
  );
}
