import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Screen } from '../ui';
import { FARM_HERO } from '../catalogue';
import { useDaily } from '../DailyContext';

const SEEN_KEY = 'milquu.app.welcomeSeen';

export default function Welcome() {
  const navigate = useNavigate();
  const { areaName } = useDaily();

  // Shown once per device — after that, a bookmark, a back button or a shared
  // link lands straight in the shop instead of repeating the pitch.
  const [alreadySeen] = useState(
    () => typeof localStorage !== 'undefined' && localStorage.getItem(SEEN_KEY) === '1'
  );

  useEffect(() => {
    if (!alreadySeen && typeof localStorage !== 'undefined') {
      localStorage.setItem(SEEN_KEY, '1');
    }
  }, [alreadySeen]);

  if (alreadySeen) return <Navigate to="/app/shop" replace />;

  return (
    <Screen>
      <div style={{ height: 326, flex: 'none', overflow: 'hidden', borderRadius: '0 0 48px 48px' }}>
        <img
          src={FARM_HERO}
          alt="Fresh milk delivered at dawn"
          className="mq-photo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div className="mq-body" style={{ paddingTop: 32, gap: 14 }}>
        <h2 style={{ fontSize: 40, lineHeight: 1.02 }}>Fresh essentials,<br />delivered daily</h2>
        <p className="mq-lede">
          Trusted milk, delivered to your door{areaName ? ` in ${areaName}` : ''} every morning. Order today, delivered tomorrow.
        </p>
        <div className="mq-row" style={{ marginTop: 4 }}>
          <span className="mq-pill">Trusted partners</span>
          <span className="mq-pill">Doorstep delivery</span>
        </div>
      </div>

      <div className="mq-fill" />

      <div className="mq-col" style={{ gap: 12, padding: '0 26px calc(42px + env(safe-area-inset-bottom))' }}>
        <button type="button" className="mq-btn" onClick={() => navigate('/app/start/address')}>
          Start a plan
        </button>
        <button type="button" className="mq-btn-outline" onClick={() => navigate('/app/start/sample')}>
          Try a free 500 ml bottle
        </button>
        <button
          type="button"
          onClick={() => navigate('/app/shop')}
          style={{
            border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit',
            fontSize: 14, fontWeight: 700, color: 'var(--mq-neutral-700)', padding: '6px 0',
          }}
        >
          Skip — just let me browse
        </button>
      </div>
    </Screen>
  );
}
