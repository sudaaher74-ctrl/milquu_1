import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { fmtDay } from '../dates';
import { useDaily } from '../DailyContext';

/**
 * What the order actually knows. Nothing here is invented: there is no rider
 * name, ETA or stop count unless the order carries one, because a made-up
 * position on a milk round is worse than no position at all.
 */
const STAGES = [
  { key: 'Pending', label: 'Scheduled', note: 'Booked onto tomorrow’s round.' },
  { key: 'Out For Delivery', label: 'On the way', note: 'Your crate has left the dairy.' },
  { key: 'Delivered', label: 'Delivered', note: 'Left where you asked us to leave it.' },
];

export default function Track() {
  const navigate = useNavigate();
  const { orders, slotDef } = useDaily();
  const order = orders[0] ?? null;

  // deliveryStatus is the delivery app's field; isDelivered is the older flag,
  // and either one being set is enough to call it delivered.
  const status = order?.isDelivered ? 'Delivered' : (order?.deliveryStatus || 'Pending');
  const stageIndex = Math.max(0, STAGES.findIndex((s) => s.key === status));
  const failed = status === 'Failed';

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
            <span className="mq-kicker mq-kicker-sage">
              {failed ? 'Could not deliver' : STAGES[stageIndex].label}
            </span>
            <h2 style={{ fontSize: 32 }}>
              {fmtDay(new Date(order.scheduledDeliveryDate || order.createdAt))}<br />{slotDef.label}
            </h2>
          </div>

          <div className="mq-card mq-card-list">
            {(order.orderItems || []).map((row) => (
              <div key={row._id ?? row.name} className="mq-item">
                <div className="mq-item-body">
                  <span className="mq-item-name">
                    {row.name}{row.qty > 1 ? ` × ${row.qty}` : ''}
                  </span>
                </div>
                <span className="mq-item-price">₹{rupees(row.price * row.qty)}</span>
              </div>
            ))}
            <div className="mq-line" style={{ padding: '14px 0', borderTop: '1px solid var(--mq-divider)' }}>
              <span style={{ color: 'var(--mq-neutral-700)' }}>Paid</span>
              <span className="mq-strong">₹{rupees(order.totalPrice)}</span>
            </div>
          </div>

          {/* The progress of the round, from the order itself. */}
          <div className="mq-card mq-card-pad mq-col" style={{ gap: 12 }}>
            {STAGES.map((stage, i) => {
              const done = i <= stageIndex;
              return (
                <div key={stage.key} className="mq-row" style={{ gap: 12, alignItems: 'flex-start', opacity: done ? 1 : 0.45 }}>
                  <Icon name={done ? 'check' : 'clock'} size={16} color={done ? '#56633f' : '#82796a'} />
                  <div className="mq-col" style={{ flex: 1, gap: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{stage.label}</span>
                    <span className="mq-item-meta">{stage.note}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {failed && order.failedReason && (
            <div className="mq-note">
              <Icon name="alert" color="#3d472b" />
              <span style={{ flex: 1 }}>{order.failedReason}</span>
            </div>
          )}

          {/* Only shown when a rider has actually been assigned. */}
          {order.deliveryStaff && status === 'Out For Delivery' && (
            <div className="mq-note">
              <Icon name="clock" color="#3d472b" />
              <span style={{ flex: 1 }}>
                Someone is on the round now. They arrive within your {slotDef.label} window.
              </span>
            </div>
          )}

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
