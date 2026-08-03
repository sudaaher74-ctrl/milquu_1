import { Screen, TabBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { addDays, fmtDay, fromKey } from '../dates';
import { useDaily } from '../DailyContext';

export default function Wallet() {
  const { wallet, topUp, runwayDays, today, ledger, planActive, planDaily } = useDaily();
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
        <span className="mq-label" style={{ color: 'var(--mq-sage-200)' }}>Milquu wallet</span>

        <span className="mq-num" style={{ fontSize: 44, lineHeight: 1, color: 'var(--mq-sage-100)' }}>
          ₹{rupees(wallet)}
        </span>
        <span style={{ fontSize: 14, color: 'var(--mq-sage-200)' }}>
          {!planActive || planDaily === 0
            ? 'Top up once and your mornings are paid for automatically.'
            : runwayDays > 0
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
        {planActive && planDaily > 0 && runwayDays <= 3 && (
          <div className="mq-note">
            <Icon name="alert" color="#3d472b" />
            <span style={{ flex: 1 }}>
              {runwayDays > 0
                ? `At this rate the balance runs out around ${fmtDay(runsOut)}.`
                : 'There isn’t enough for tomorrow’s crate yet.'}
            </span>
          </div>
        )}

        <span className="mq-label">Recent</span>
        {ledger.length === 0 ? (
          <span className="mq-sub">
            Nothing yet. Top-ups and the mornings you pay for will be listed here.
          </span>
        ) : (
          <div className="mq-col">
            {ledger.map((entry) => (
              <div key={entry.id} className="mq-item">
                <div className="mq-item-body">
                  <span className="mq-item-name">{entry.title}</span>
                  <span className="mq-item-meta">{fmtDay(fromKey(entry.at))} · {entry.note}</span>
                </div>
                <span
                  className="mq-item-price"
                  style={{ color: entry.amount > 0 ? 'var(--mq-sage-800)' : undefined }}
                >
                  {entry.amount > 0 ? '+' : '−'}₹{rupees(Math.abs(entry.amount))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mq-fill" style={{ minHeight: 28 }} />
      <TabBar />
    </Screen>
  );
}
