import { useNavigate } from 'react-router-dom';
import { Screen } from '../ui';
import { FARM_HERO } from '../catalogue';
import { useDaily } from '../DailyContext';

export default function Welcome() {
  const navigate = useNavigate();
  const { areaName } = useDaily();
  return (
    <Screen>
      <div style={{ height: 326, flex: 'none', overflow: 'hidden', borderRadius: '0 0 48px 48px' }}>
        <img
          src={FARM_HERO}
          alt="The Milquu dairy at dawn"
          className="mq-photo"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      <div className="mq-body" style={{ paddingTop: 32, gap: 14 }}>
        <h2 style={{ fontSize: 40, lineHeight: 1.02 }}>Milk that was<br />grass this week</h2>
        <p className="mq-lede">
          Milked at 5 am{areaName ? `, at your door in ${areaName}` : ', at your door'} by 7:30.
          Glass bottles, collected the next morning.
        </p>
        <div className="mq-row" style={{ marginTop: 4 }}>
          <span className="mq-pill">Lab tested daily</span>
          <span className="mq-pill">No preservatives</span>
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
