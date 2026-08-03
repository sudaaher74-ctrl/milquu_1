import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { fmtDay, fromKey } from '../dates';
import { useDaily, itemRows } from '../DailyContext';

/**
 * Live tracking — the rider, the ETA, the stop count — comes from the delivery
 * API on the morning of the round. Until then this screen states only what the
 * order itself knows, rather than inventing a position.
 */
export default function Track() {
  const navigate = useNavigate();
  const { nextOrder, orders, slotDef } = useDaily();
  const order = nextOrder ?? orders[0] ?? null;

  return (
    <Screen>
      <TopBar title="Your delivery" to="/app" />

      {!order ? (
        <div className="mq-body" style={{ gap: 14 }}>
          <h2>Nothing out for delivery</h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--mq-neutral-700)' }}>
            Once a crate is scheduled you’ll be able to follow it here on the morning it arrives.
          </p>
          <button type="button" className="mq-btn-soft" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/app/shop')}>
            Browse the shop
          </button>
        </div>
      ) : (
        <div className="mq-body" style={{ gap: 18 }}>
          <div className="mq-col" style={{ gap: 4 }}>
            <span className="mq-kicker mq-kicker-sage">Scheduled</span>
            <h2 style={{ fontSize: 32 }}>{fmtDay(fromKey(order.on))}<br />{slotDef.label}</h2>
          </div>

          <div className="mq-card mq-card-list">
            {itemRows(order.items).map((row) => (
              <div key={row.key} className="mq-item">
                <img src={row.img} alt="" className="mq-item-thumb" style={{ width: 36, height: 50 }} />
                <div className="mq-item-body">
                  <span className="mq-item-name">
                    {row.short} {row.unit}{row.qty > 1 ? ` × ${row.qty}` : ''}
                  </span>
                </div>
              </div>
            ))}
            <div className="mq-line" style={{ padding: '14px 0', borderTop: '1px solid var(--mq-divider)' }}>
              <span style={{ color: 'var(--mq-neutral-700)' }}>Paid</span>
              <span className="mq-strong">₹{rupees(order.total)}</span>
            </div>
          </div>

          <div className="mq-note">
            <Icon name="clock" color="#3d472b" />
            <span style={{ flex: 1 }}>
              Live tracking and your rider’s details appear here on the morning of the delivery.
            </span>
          </div>

          <div className="mq-note">
            <Icon name="bag" color="#3d472b" />
            <span style={{ flex: 1 }}>
              Leave any empty bottles outside — they’re collected on the same round.
            </span>
          </div>
        </div>
      )}

      <div className="mq-fill" />

      <ActionBar>
        <button type="button" className="mq-btn mq-btn-block" onClick={() => navigate('/app')}>
          Done
        </button>
      </ActionBar>
    </Screen>
  );
}
