import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';
import { rechargeWallet } from '../../../utils/razorpay';

/**
 * Paying for tomorrow's one-off additions.
 *
 * The plan's own crate is charged by the nightly engine out of the wallet, so
 * it is not paid for again here — only the extras in the cart are. The server
 * prices the order from the Product collection; the totals shown here are what
 * the customer sees, not what they are charged.
 */
export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart, cartTotal, wallet, slotDef, itemRows, clearCart, refresh, user, flash, placeOrder,
  } = useDaily();

  const rows = itemRows(cart);
  const short = Math.max(0, cartTotal - wallet);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const topUp = async () => {
    setError('');
    setBusy(true);
    try {
      const result = await rechargeWallet({ amount: short, user });
      // null means the customer closed the sheet — nothing was charged.
      if (result) await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const pay = async () => {
    setError('');
    setBusy(true);
    try {
      await placeOrder();
      clearCart();
      flash('Added to tomorrow’s crate');
      navigate('/app/track');
    } catch (err) {
      setError(err.response?.data?.message || 'We could not place that order.');
    } finally {
      setBusy(false);
    }
  };

  if (rows.length === 0) {
    return (
      <Screen>
        <TopBar title="Checkout" to="/app/cart" />
        <div className="mq-body" style={{ gap: 14 }}>
          <h2>Nothing to pay for</h2>
          <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--mq-neutral-700)' }}>
            Your plan’s crate comes out of your wallet the night before. Add something extra and
            you can pay for it here.
          </p>
          <button type="button" className="mq-btn-soft" style={{ alignSelf: 'flex-start' }} onClick={() => navigate('/app/shop')}>
            Browse the shop
          </button>
        </div>
        <div className="mq-fill" />
      </Screen>
    );
  }

  return (
    <Screen>
      <TopBar title="Checkout" to="/app/cart" />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2>Pay ₹{rupees(cartTotal)}</h2>
        <span className="mq-sub">Arriving tomorrow, {slotDef.label}</span>

        <div className="mq-card mq-card-list">
          {rows.map((row) => (
            <div key={row.key} className="mq-item">
              <img src={row.img} alt="" className="mq-item-thumb" style={{ width: 36, height: 50 }} />
              <div className="mq-item-body">
                <span className="mq-item-name">{row.short} {row.unit} × {row.qty}</span>
                <span className="mq-item-meta">One-off addition</span>
              </div>
              <span className="mq-item-price">₹{rupees(row.qty * row.price)}</span>
            </div>
          ))}
        </div>

        <div className="mq-card mq-card-pad mq-col" style={{ gap: 9, borderRadius: 24 }}>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Items</span>
            <span className="mq-strong">₹{rupees(cartTotal)}</span>
          </div>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Delivery</span>
            <span className="mq-strong" style={{ color: 'var(--mq-sage-800)' }}>Free</span>
          </div>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Wallet balance</span>
            <span className="mq-strong">₹{rupees(wallet)}</span>
          </div>
          <div className="mq-line mq-line-total">
            <span>{short > 0 ? 'Short by' : 'Covered by your wallet'}</span>
            <span>{short > 0 ? `₹${rupees(short)}` : '✓'}</span>
          </div>
        </div>

        {error && (
          <span role="alert" style={{ fontSize: 13, color: '#a4423a' }}>{error}</span>
        )}
      </div>

      <div className="mq-fill" />

      <ActionBar
        summary={{
          title: `₹${rupees(cartTotal)}`,
          note: short > 0 ? `Top up ₹${rupees(short)} to pay` : `Wallet ₹${rupees(wallet)}`,
        }}
      >
        {short > 0 ? (
          <button
            type="button"
            className="mq-btn mq-btn-md"
            onClick={topUp}
            disabled={busy}
            style={busy ? { opacity: 0.6, cursor: 'progress' } : undefined}
          >
            <Icon name="wallet" size={16} color="#fff" />
            {busy ? 'Opening…' : `Add ₹${rupees(short)}`}
          </button>
        ) : (
          <button
            type="button"
            className="mq-btn mq-btn-md"
            onClick={pay}
            disabled={busy}
            style={busy ? { opacity: 0.6, cursor: 'progress' } : undefined}
          >
            {busy ? 'Placing your order…' : 'Pay from wallet'}
          </button>
        )}
      </ActionBar>
    </Screen>
  );
}
