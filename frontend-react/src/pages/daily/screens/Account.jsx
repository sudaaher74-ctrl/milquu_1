import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, Icon, ListRow } from '../ui';
import { useDaily, PAST_ORDERS } from '../DailyContext';

const USER = { initials: 'RK', name: 'Ravi Kulkarni', meta: '+91 98204 11238 · since March' };
const STATS = [['146', 'mornings delivered'], ['143', 'bottles returned']];

export default function Account() {
  const navigate = useNavigate();
  const { address, flash } = useDaily();

  return (
    <Screen>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 'calc(40px + env(safe-area-inset-top)) 22px 0' }}>
        <div
          className="mq-num"
          style={{
            width: 60, height: 60, borderRadius: 999, background: 'var(--mq-sage-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'var(--mq-sage-800)',
          }}
        >
          {USER.initials}
        </div>
        <div className="mq-col" style={{ flex: 1, gap: 2 }}>
          <span className="mq-num" style={{ fontSize: 24, lineHeight: 1.1 }}>{USER.name}</span>
          <span className="mq-sub" style={{ fontSize: 14 }}>{USER.meta}</span>
        </div>
      </div>

      <div className="mq-body" style={{ paddingTop: 22 }}>
        <div className="mq-row" style={{ gap: 12 }}>
          {STATS.map(([value, label]) => (
            <div key={label} className="mq-card mq-col" style={{ flex: 1, borderRadius: 24, padding: '14px 16px', gap: 2 }}>
              <span className="mq-num" style={{ fontSize: 24 }}>{value}</span>
              <span className="mq-sub">{label}</span>
            </div>
          ))}
        </div>

        <div className="mq-col" style={{ gap: 10 }}>
          <span className="mq-label">Past orders</span>
          <div className="mq-card mq-card-list">
            {PAST_ORDERS.map(([title, note, onTime]) => (
              <button
                key={title}
                type="button"
                className="mq-item"
                style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                onClick={() => navigate('/app/track')}
              >
                <div className="mq-item-body">
                  <span className="mq-item-name">{title}</span>
                  <span
                    className="mq-item-meta"
                    style={{ color: onTime ? 'var(--mq-sage-800)' : undefined }}
                  >
                    {note}
                  </span>
                </div>
                <Icon name="next" size={17} color="#82796a" />
              </button>
            ))}
          </div>
        </div>

        <div className="mq-col" style={{ gap: 10 }}>
          <ListRow
            icon="pin"
            label="Addresses"
            value={address.label}
            onClick={() => navigate('/app/start/address')}
          />
          <ListRow
            icon="bag"
            label="Gift a free bottle"
            value="₹100 for you"
            onClick={() => navigate('/app/start/sample')}
          />
          <ListRow
            icon="help"
            label="Help and refunds"
            chevron
            onClick={() => flash('Our Panvel team replies before 9 pm')}
          />
        </div>
      </div>

      <div className="mq-fill" style={{ minHeight: 28 }} />
      <TabBar />
    </Screen>
  );
}
