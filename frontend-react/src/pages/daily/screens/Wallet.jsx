import { Screen, TabBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { addDays, fmtDay } from '../dates';
import { useDaily, LEDGER } from '../DailyContext';

export default function Wallet() {
  const { wallet, topUp, runwayDays, today } = useDaily();
  const runsOut = addDays(today, runwayDays);

  return (
    <Screen>
      <div
        className="mq-col"
        style={{
          gap: 14,
          background: 'var(--mq-sage-800)',
          borderRadius: '0 0 44px 44px',
          padding: 'calc(38px + env(safe-area-inset-top)) 24px 26px',
        }}
      >
        <div className="mq-between">
          <span className="mq-label" style={{ color: 'var(--mq-sage-200)' }}>Milquu wallet</span>
          <span
            className="mq-pill"
            style={{ background: 'var(--mq-sage-700)', color: 'var(--mq-sage-100)', padding: '7px 12px' }}
          >
            Auto top-up on
          </span>
        </div>

        <span className="mq-num" style={{ fontSize: 44, lineHeight: 1, color: 'var(--mq-sage-100)' }}>
          ₹{rupees(wallet)}
        </span>
        <span style={{ fontSize: 14, color: 'var(--mq-sage-200)' }}>
          {runwayDays > 0
            ? `About ${runwayDays} more ${runwayDays === 1 ? 'morning' : 'mornings'} at your current plan.`
            : 'Not enough for tomorrow’s crate — top up to keep the round going.'}
        </span>

        <div className="mq-row" style={{ marginTop: 2 }}>
          <button type="button" className="mq-btn-cream" style={{ flex: 1, fontSize: 14, padding: '13px 0' }} onClick={() => topUp(1000)}>
            Add ₹1,000
          </button>
          <button type="button" className="mq-btn-cream-outline" style={{ flex: 1, fontSize: 14, padding: '13px 0' }} onClick={() => topUp(2000)}>
            Add ₹2,000
          </button>
        </div>
      </div>

      <div className="mq-body" style={{ paddingTop: 24, gap: 14 }}>
        <div className="mq-note">
          <Icon name="alert" color="#3d472b" />
          <span style={{ flex: 1 }}>
            Balance runs out {fmtDay(runsOut)}. Auto top-up will add ₹1,000 the night before.
          </span>
        </div>

        <span className="mq-label">Recent</span>
        <div className="mq-col">
          {LEDGER.map(([title, note, amount]) => (
            <div key={title} className="mq-item">
              <div className="mq-item-body">
                <span className="mq-item-name">{title}</span>
                <span className="mq-item-meta">{note}</span>
              </div>
              <span
                className="mq-item-price"
                style={{ color: amount > 0 ? 'var(--mq-sage-800)' : undefined }}
              >
                {amount > 0 ? '+' : '−'}₹{rupees(Math.abs(amount))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mq-fill" style={{ minHeight: 28 }} />
      <TabBar />
    </Screen>
  );
}
