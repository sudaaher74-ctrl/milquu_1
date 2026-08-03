import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, Icon, ListRow } from '../ui';
import { rupees } from '../catalogue';
import { fmtDay, fromKey } from '../dates';
import { useDaily, itemRows } from '../DailyContext';
import { useAuth } from '../../../context/AuthContext';

const initialsOf = (name) =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

/** One line describing what a scheduled order contains. */
const summarise = (items) =>
  itemRows(items)
    .map((r) => (r.cat === 'milk' ? `${r.qty} L ${r.short.toLowerCase()}` : r.short.toLowerCase()))
    .join(', ');

export default function Account() {
  const navigate = useNavigate();
  const { address, orders, planActive, resetApp, flash } = useDaily();
  const { user, logout } = useAuth();

  return (
    <Screen>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 'calc(40px + env(safe-area-inset-top)) 22px 0' }}>
        <div
          className="mq-num"
          style={{
            width: 60, height: 60, flex: 'none', borderRadius: 999, background: 'var(--mq-sage-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: 'var(--mq-sage-800)',
          }}
        >
          {user?.name ? initialsOf(user.name) : <Icon name="user" size={26} color="#3d472b" />}
        </div>
        <div className="mq-col" style={{ flex: 1, gap: 2 }}>
          <span className="mq-num" style={{ fontSize: 24, lineHeight: 1.1 }}>
            {user?.name ?? 'Not signed in'}
          </span>
          <span className="mq-sub" style={{ fontSize: 14 }}>
            {user?.phone || user?.email || 'Sign in to sync your plan across devices'}
          </span>
        </div>
      </div>

      <div className="mq-body" style={{ paddingTop: 22 }}>
        {!user && (
          <button type="button" className="mq-btn mq-btn-block" onClick={() => navigate('/login')}>
            Sign in
          </button>
        )}

        <div className="mq-col" style={{ gap: 10 }}>
          <span className="mq-label">Orders</span>
          {orders.length === 0 ? (
            <div className="mq-card mq-card-pad mq-col" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span className="mq-sub">
                No orders yet. Your mornings will show up here once your first crate is on its way.
              </span>
              <button type="button" className="mq-btn-soft" onClick={() => navigate('/app/shop')}>
                Browse the shop
              </button>
            </div>
          ) : (
            <div className="mq-card mq-card-list">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="mq-item"
                  style={{ width: '100%', border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit', textAlign: 'left' }}
                  onClick={() => navigate('/app/track')}
                >
                  <div className="mq-item-body">
                    <span className="mq-item-name">
                      {fmtDay(fromKey(order.on))} · {summarise(order.items)}
                    </span>
                    <span className="mq-item-meta">
                      Scheduled · ₹{rupees(order.total)}
                    </span>
                  </div>
                  <Icon name="next" size={17} color="#82796a" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mq-col" style={{ gap: 10 }}>
          <ListRow
            icon="pin"
            label="Delivery address"
            value={address.flat ? address.label : 'Not set'}
            onClick={() => navigate('/app/start/address')}
          />
          <ListRow
            icon="help"
            label="Help and refunds"
            chevron
            onClick={() => navigate('/contact')}
          />
          {(planActive || orders.length > 0) && (
            <ListRow
              icon="alert"
              label="Reset this device"
              value="Clears local data"
              onClick={() => {
                resetApp();
                flash('Cleared. Starting fresh.');
                navigate('/app/start', { replace: true });
              }}
            />
          )}
          {user && (
            <ListRow icon="user" label="Sign out" onClick={() => { logout(); flash('Signed out'); }} />
          )}
        </div>
      </div>

      <div className="mq-fill" style={{ minHeight: 28 }} />
      <TabBar />
    </Screen>
  );
}
