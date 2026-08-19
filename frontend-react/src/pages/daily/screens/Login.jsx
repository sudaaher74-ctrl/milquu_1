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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/app';



  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/users/google-login', { token: credentialResponse.credential });
      login(data);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Sign in" to="/app" />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2 style={{ fontSize: 32 }}>Welcome back</h2>
        <p className="mq-lede">Sign in to manage your plan, wallet and deliveries.</p>

        {error && <span className="mq-err">{error}</span>}

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            useOneTap
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <p style={{ fontSize: 14, color: 'var(--mq-neutral-700)' }}>
          New here?{' '}
          <Link to="/app/join" state={location.state} style={{ fontWeight: 700, color: 'var(--mq-sage-800)' }}>
            Create an account
          </Link>
        </p>

        <div className="mq-fill" />
      </div>
    </Screen>
  );
}
