import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { PRODUCTS } from '../catalogue';
import { useDaily } from '../DailyContext';
import { fmtDay } from '../dates';

const STEPS = [
  'Taste it tomorrow morning with your chai.',
  'We ask once, in the app, whether to keep coming.',
  'Say yes and your first week is 20% off. No card needed today.',
];

export default function Sample() {
  const navigate = useNavigate();
  const { tomorrow, slotDef } = useDaily();

  return (
    <Screen>
      <TopBar title="Free sample" to="/app/start" />

      <div className="mq-body">
        <h2 style={{ fontSize: 34 }}>One bottle, on us</h2>

        <div className="mq-card mq-card-md" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src={PRODUCTS.cow.img} alt="" style={{ width: 66, height: 92, objectFit: 'contain' }} />
          <div className="mq-col" style={{ flex: 1, gap: 4 }}>
            <span className="mq-num" style={{ fontSize: 20, lineHeight: 1.1 }}>500 ml desi cow milk</span>
            <span style={{ fontSize: 14, color: 'var(--mq-neutral-700)' }}>
              Tomorrow, {fmtDay(tomorrow)} · {slotDef.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mq-sage-800)' }}>
              ₹0 · one per household
            </span>
          </div>
        </div>

        <ol className="mq-col" style={{ gap: 13, margin: 0, padding: 0, listStyle: 'none' }}>
          {STEPS.map((text, i) => (
            <li key={text} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <span
                className="mq-num"
                style={{
                  width: 26, height: 26, flex: 'none', borderRadius: 999,
                  background: 'var(--mq-sage-200)', color: 'var(--mq-sage-800)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--mq-neutral-800)' }}>{text}</span>
            </li>
          ))}
        </ol>

        <div className="mq-note">
          <Icon name="star" color="#3d472b" />
          <span style={{ flex: 1 }}><strong>4.8</strong> from 1,240 families in Panvel</span>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button
          type="button"
          className="mq-btn mq-btn-block"
          onClick={() => navigate('/app/start/address')}
        >
          Claim my bottle
        </button>
      </ActionBar>
    </Screen>
  );
}
