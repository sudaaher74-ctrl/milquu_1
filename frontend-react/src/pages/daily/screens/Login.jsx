import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Screen, TopBar, ActionBar } from '../ui';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../utils/api';
import { GoogleLogin } from '@react-oauth/google';

export default function AppLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/app';

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/login', { identifier, password });
      login(data);
      navigate(from, { replace: true, state: location.state?.returnState });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Could not sign in. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/google-login', { token: credentialResponse.credential });
      login(data);
      navigate(from, { replace: true, state: location.state?.returnState });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Sign in" to="/app" />

      <form className="mq-body" style={{ gap: 16 }} onSubmit={handlePasswordLogin}>
        <h2 style={{ fontSize: 30 }}>Welcome back</h2>
        <p className="mq-lede">Sign in to manage your plan, wallet and deliveries.</p>

        {error && <span className="mq-err">{error}</span>}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            useOneTap
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0', fontSize: 13, color: 'var(--mq-neutral-600)' }}>
          <div style={{ flex: 1, borderTop: '1px solid var(--mq-neutral-200, #e2e8f0)' }}></div>
          <span style={{ padding: '0 12px', fontWeight: 500 }}>or sign in with phone</span>
          <div style={{ flex: 1, borderTop: '1px solid var(--mq-neutral-200, #e2e8f0)' }}></div>
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-login-phone">Phone number or email</label>
          <input
            id="mq-login-phone"
            className={`mq-input${error ? ' mq-input-err' : ''}`}
            type="text"
            inputMode="tel"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="98200 98200"
          />
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-login-password">Password</label>
          <input
            id="mq-login-password"
            className={`mq-input${error ? ' mq-input-err' : ''}`}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="mq-btn mq-btn-block"
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p style={{ fontSize: 14, color: 'var(--mq-neutral-700)', marginTop: 8 }}>
          New here?{' '}
          <Link to="/app/join" state={location.state} style={{ fontWeight: 700, color: 'var(--mq-sage-800)' }}>
            Create an account
          </Link>
        </p>

        <div className="mq-fill" />
      </form>
    </Screen>
  );
}
