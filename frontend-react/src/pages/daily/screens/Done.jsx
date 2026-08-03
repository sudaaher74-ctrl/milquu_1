import { useNavigate } from 'react-router-dom';
import { Screen, Icon } from '../ui';
import { PRODUCTS } from '../catalogue';
import { useDaily, RIDER } from '../DailyContext';

const MILKS = ['cow', 'buf'];

export default function Done() {
  const navigate = useNavigate();
  const { crate, rhythmDef, slotDef } = useDaily();
  const milkKey = MILKS.find((k) => crate[k] > 0) ?? 'cow';
  const startsAt = slotDef.label.split(' – ')[0].replace(':00', '');

  return (
    <Screen>
      <div
        className="mq-col"
        style={{
          flex: 1,
          background: 'var(--mq-sage-800)',
          margin: 0,
        }}
      >
        <div className="mq-col" style={{ gap: 18, padding: 'calc(88px + env(safe-area-inset-top)) 30px 0' }}>
          <div
            style={{
              width: 76, height: 76, borderRadius: 999, background: 'var(--mq-sage-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="check" size={34} color="#56633f" />
          </div>

          <h2 style={{ fontSize: 38, color: 'var(--mq-sage-100)' }}>
            See you at<br />{startsAt} tomorrow
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--mq-sage-200)' }}>
            {crate[milkKey]} L of {PRODUCTS[milkKey].name.toLowerCase()}, {rhythmDef.long.toLowerCase()}.
            {' '}{RIDER.name.split(' ')[0]} delivers your street and will leave it in the milk box.
          </p>

          <div
            className="mq-col"
            style={{ gap: 9, background: 'var(--mq-sage-700)', borderRadius: 24, padding: '16px 18px' }}
          >
            <span className="mq-label" style={{ color: 'var(--mq-sage-200)' }}>Two things worth knowing</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--mq-sage-100)' }}>
              Edit or skip tomorrow until 9 pm tonight.
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--mq-sage-100)' }}>
              Leave the empty bottle out — we collect it next morning.
            </span>
          </div>
        </div>

        <div className="mq-fill" />

        <div
          className="mq-col"
          style={{ gap: 12, padding: '0 30px calc(44px + env(safe-area-inset-bottom))' }}
        >
          <button type="button" className="mq-btn-cream" onClick={() => navigate('/app')}>
            Go to my crate
          </button>
          <button type="button" className="mq-btn-cream-outline" onClick={() => navigate('/app/shop')}>
            Add ghee or paneer
          </button>
        </div>
      </div>
    </Screen>
  );
}
