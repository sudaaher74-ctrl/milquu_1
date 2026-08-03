import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { tomorrowTotal, wallet, upiDue, checkout } = useDaily();
  const [method, setMethod] = useState('wallet');

  const methods = [
    {
      key: 'wallet',
      icon: 'wallet',
      title: `Wallet ₹${rupees(wallet)}`,
      note: upiDue > 0
        ? `Covers ₹${rupees(Math.min(wallet, tomorrowTotal))} · ₹${rupees(upiDue)} by UPI`
        : 'Covers the whole crate',
    },
    { key: 'upi', icon: 'mobile', title: 'UPI · ravi@okhdfc', note: 'One tap in your UPI app' },
    { key: 'cash', icon: 'cash', title: 'Cash to the delivery boy', note: 'Please keep change ready' },
  ];

  const pay = () => {
    checkout(method);
    navigate('/app/track');
  };

  return (
    <Screen>
      <TopBar title="Checkout" to="/app/cart" />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2>Pay ₹{rupees(tomorrowTotal)}</h2>

        <div className="mq-col" style={{ gap: 10 }} role="radiogroup" aria-label="Payment method">
          {methods.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              aria-checked={method === m.key}
              className={`mq-pick${method === m.key ? ' mq-pick-on' : ''}`}
              style={{ borderRadius: 24, gap: 12 }}
              onClick={() => setMethod(m.key)}
            >
              <Icon name={m.icon} color="#201e1d" />
              <div className="mq-col" style={{ flex: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{m.title}</span>
                <span className="mq-sub">{m.note}</span>
              </div>
              {method === m.key && (
                <span className="mq-pick-check">
                  <Icon name="check" size={12} color="#ffffff" strokeWidth="3.2" />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mq-note">
          <Icon name="shield" color="#3d472b" />
          <span style={{ flex: 1 }}>
            Recharge ₹1,000 and your plan never pauses for a low balance. Refundable any time.
          </span>
        </div>

        <div className="mq-card mq-card-pad mq-col" style={{ gap: 9, borderRadius: 24 }}>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Tomorrow’s crate</span>
            <span className="mq-strong">₹{rupees(tomorrowTotal)}</span>
          </div>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Delivery</span>
            <span className="mq-strong" style={{ color: 'var(--mq-sage-800)' }}>Free</span>
          </div>
          <div className="mq-line mq-line-total">
            <span>To pay</span>
            <span>₹{rupees(tomorrowTotal)}</span>
          </div>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button type="button" className="mq-btn mq-btn-block" onClick={pay}>
          Pay and confirm
        </button>
      </ActionBar>
    </Screen>
  );
}
