import { useNavigate } from 'react-router-dom';
import { Screen, Icon } from '../ui';
import { useDaily } from '../DailyContext';

export default function Done() {
  const navigate = useNavigate();
  const { crate, rhythmDef, slotDef, areaName, itemRows } = useDaily();
  // The milk the plan was built around, straight off the confirmed crate.
  const milk = itemRows(crate).find((row) => row.cat === 'milk') ?? null;
  const startsAt = slotDef.label.split(' – ')[0].replace(':00', '');

  return (
    <Screen>
      <div
        className="mq-col"
        style={{
          flex: 1,
          background: 'var(--mq-green-700)',
          margin: 0,
        }}
      >
        <div className="mq-col" style={{ gap: 18, padding: 'calc(88px + env(safe-area-inset-top)) 30px 0' }}>
          <div
            style={{
              width: 76, height: 76, borderRadius: 999, background: 'var(--mq-green-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Icon name="check" size={34} color="#256428" />
          </div>

          <h2 style={{ fontSize: 38, color: 'var(--mq-green-100)' }}>
            See you at<br />{startsAt} tomorrow
          </h2>

          <p style={{ fontSize: 16, lineHeight: 1.55, color: 'var(--mq-green-200)' }}>
            {milk ? `${milk.qty} L of ${milk.name.toLowerCase()}, ` : ''}{rhythmDef.long.toLowerCase()}
            {areaName ? `, delivered in ${areaName}` : ''}, left where you asked us to leave it.
          </p>

          <div
            className="mq-col"
            style={{ gap: 9, background: 'var(--mq-green-900)', borderRadius: 24, padding: '16px 18px' }}
          >
            <span className="mq-label" style={{ color: 'var(--mq-green-200)' }}>Two things worth knowing</span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--mq-green-100)' }}>
              Edit or skip tomorrow until 9 pm tonight.
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--mq-green-100)' }}>
              Leave the empty bottle out — we collect it next morning.
            </span>
          </div>
        </div>

        <div className="mq-fill" />

        <div
          className="mq-col"
          style={{ gap: 12, padding: '0 30px calc(44px + env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            onClick={() => navigate('/app')}
            style={{
              border: 0, cursor: 'pointer', borderRadius: 999, background: 'var(--mq-green-100)',
              color: 'var(--mq-green-900)', fontSize: 15, padding: '14px 20px', fontWeight: 700,
            }}
          >
            Go to my crate
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/shop')}
            style={{
              border: '1px solid var(--mq-green-200)', cursor: 'pointer', borderRadius: 999, background: 'transparent',
              color: 'var(--mq-green-100)', fontSize: 15, padding: '13px 20px', fontWeight: 700,
            }}
          >
            Add ghee or paneer
          </button>
        </div>
      </div>
    </Screen>
  );
}
