import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';

/**
 * Placing the order is the one step still to be wired: it has to post real
 * Product ids to the orders API, and the catalogue this app renders from is
 * still a local file. Rather than show a "Pay and confirm" button that quietly
 * does nothing, the screen says so and sends people to the wallet, which is real.
 */
export default function Checkout() {
  const navigate = useNavigate();
  const { tomorrowTotal, wallet, upiDue } = useDaily();

  return (
    <Screen>
      <TopBar title="Checkout" to="/app/cart" />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2>Pay ₹{rupees(tomorrowTotal)}</h2>

        <div className="mq-card mq-card-pad mq-col" style={{ gap: 9, borderRadius: 24 }}>
          <div className="mq-line">
            <span style={{ color: 'var(--mq-neutral-700)' }}>Tomorrow’s crate</span>
            <span className="mq-strong">₹{rupees(tomorrowTotal)}</span>
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
            <span>{upiDue > 0 ? 'Short by' : 'Covered by your wallet'}</span>
            <span>{upiDue > 0 ? `₹${rupees(upiDue)}` : '✓'}</span>
          </div>
        </div>

        <div className="mq-note mq-note-col">
          <span style={{ fontSize: 14, fontWeight: 700 }}>Ordering from the app isn’t live yet</span>
          <span style={{ fontSize: 13, color: 'var(--mq-sage-800)' }}>
            Your account, address and wallet are real — placing the order still needs
            connecting to the orders API. You can top up your wallet in the meantime.
          </span>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button
          type="button"
          className="mq-btn-outline"
          style={{ flex: 1, padding: '15px 0' }}
          onClick={() => navigate('/app/cart')}
        >
          Back to crate
        </button>
        <button
          type="button"
          className="mq-btn mq-btn-md"
          style={{ flex: 1, padding: '15px 0' }}
          onClick={() => navigate('/app/wallet')}
        >
          <Icon name="wallet" size={16} color="#fff" />
          Wallet
        </button>
      </ActionBar>
    </Screen>
  );
}
