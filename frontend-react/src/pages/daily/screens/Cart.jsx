import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Stepper } from '../ui';
import { PRODUCTS, rupees, priceOf } from '../catalogue';
import { useDaily, itemRows } from '../DailyContext';

/** The one add-on we nudge for, whichever is not already in the crate or cart. */
const NUDGES = ['pan', 'lassi', 'ghee'];

export default function Cart() {
  const navigate = useNavigate();
  const { crate, cart, bumpCart, addToCart, tomorrowTotal, wallet, slotDef, upiDue } = useDaily();

  const nudgeKey = NUDGES.find((k) => !crate[k] && !cart[k]);
  const nudge = nudgeKey ? PRODUCTS[nudgeKey] : null;
  const empty = itemRows(crate).length === 0 && itemRows(cart).length === 0;

  return (
    <Screen>
      <TopBar title="Adding to tomorrow’s crate" to="/app/shop" />

      <div className="mq-body">
        <h2>Tomorrow, {slotDef.label}</h2>

        {empty ? (
          <div className="mq-card mq-card-pad mq-col" style={{ gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Nothing in tomorrow’s crate yet.</span>
            <span className="mq-sub">Add a bottle or a tub and it arrives with the morning round.</span>
            <button type="button" className="mq-btn-soft" onClick={() => navigate('/app/shop')}>
              Browse the shop
            </button>
          </div>
        ) : (
          <div className="mq-card mq-card-list">
            {itemRows(crate).map((row) => (
              <div key={`plan-${row.key}`} className="mq-item">
                <img src={row.img} alt="" className="mq-item-thumb" style={{ width: 36, height: 50 }} />
                <div className="mq-item-body">
                  <span className="mq-item-name">{row.short} {row.unit} × {row.qty}</span>
                  <span style={{ fontSize: 13, color: 'var(--mq-sage-800)' }}>
                    On your plan · ₹{rupees(priceOf(row.key))} each
                  </span>
                </div>
                <span className="mq-item-price">₹{rupees(row.qty * priceOf(row.key))}</span>
              </div>
            ))}

            {itemRows(cart).map((row) => (
              <div key={`once-${row.key}`} className="mq-item">
                <img src={row.img} alt="" className="mq-item-thumb" style={{ width: 36, height: 50 }} />
                {/* The stepper already states the quantity, so the name doesn't. */}
                <div className="mq-item-body">
                  <span className="mq-item-name">{row.short} {row.unit}</span>
                  <span className="mq-item-meta">One-off addition</span>
                </div>
                <Stepper
                  value={row.qty}
                  min={0}
                  onDec={() => bumpCart(row.key, -1)}
                  onInc={() => bumpCart(row.key, 1)}
                  label={row.name}
                />
                <span className="mq-item-price">₹{rupees(row.qty * priceOf(row.key, false))}</span>
              </div>
            ))}
          </div>
        )}

        {nudge && (
          <div className="mq-note" style={{ borderRadius: 28, padding: '16px 18px', gap: 14 }}>
            <img src={nudge.img} alt="" style={{ width: 44, height: 60, objectFit: 'contain' }} />
            <div className="mq-col" style={{ flex: 1, gap: 2 }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{nudge.name} for Wednesday?</span>
              <span style={{ fontSize: 13, color: 'var(--mq-sage-800)' }}>
                {nudge.kicker}, ₹{rupees(nudge.price)} for {nudge.unit}
              </span>
            </div>
            <button
              type="button"
              className="mq-btn-cream"
              style={{ fontSize: 13, padding: '10px 16px' }}
              onClick={() => addToCart(nudge.key)}
            >
              + Add
            </button>
          </div>
        )}

        <div className="mq-col" style={{ gap: 10 }}>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Items</span>
            <span className="mq-strong">₹{rupees(tomorrowTotal)}</span>
          </div>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Delivery</span>
            <span className="mq-strong" style={{ color: 'var(--mq-sage-800)' }}>Free on plans</span>
          </div>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar
        summary={{
          title: `₹${rupees(tomorrowTotal)}`,
          note: upiDue > 0
            ? `Wallet ₹${rupees(wallet)} · pay ₹${rupees(upiDue)} by UPI`
            : `Covered by your wallet · ₹${rupees(wallet)}`,
        }}
      >
        <button
          type="button"
          className="mq-btn mq-btn-md"
          disabled={empty}
          style={empty ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
          onClick={() => navigate('/app/checkout')}
        >
          Checkout
        </button>
      </ActionBar>
    </Screen>
  );
}
