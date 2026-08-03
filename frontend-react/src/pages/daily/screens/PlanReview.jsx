import { useNavigate } from 'react-router-dom';
import { Screen, StepBar, ActionBar, Icon } from '../ui';
import { rupees, priceOf } from '../catalogue';
import { fmtDay } from '../dates';
import { useDaily, itemRows } from '../DailyContext';

export default function PlanReview() {
  const navigate = useNavigate();
  const {
    crate, rhythmDef, slotDef, tomorrow, planDaily, planMonthly,
    savingsMonthly, savingsPercent, startPlan,
  } = useDaily();

  const confirm = () => {
    startPlan();
    navigate('/app/start/done');
  };

  return (
    <Screen>
      <StepBar step={3} to="/app/start/rhythm" />

      <div className="mq-body" style={{ paddingTop: 22, gap: 18 }}>
        <h2>Your plan</h2>

        <div className="mq-card mq-card-md" style={{ padding: '6px 20px 18px' }}>
          {itemRows(crate).map((row) => (
            <div key={row.key} className="mq-item">
              <img src={row.img} alt="" className="mq-item-thumb" style={{ width: 40, height: 56 }} />
              <div className="mq-item-body">
                <span className="mq-item-name">
                  {row.name} · {row.cat === 'milk' ? `${row.qty} L` : `${row.unit} × ${row.qty}`}
                </span>
                <span className="mq-item-meta">{rhythmDef.long} · ₹{rupees(priceOf(row.key))} each</span>
              </div>
              <span className="mq-item-price">₹{rupees(row.qty * priceOf(row.key))}</span>
            </div>
          ))}

          <div className="mq-line" style={{ padding: '13px 0', borderTop: '1px solid var(--mq-divider)' }}>
            <span style={{ color: 'var(--mq-neutral-700)' }}>Starts</span>
            <span className="mq-strong">Tomorrow, {fmtDay(tomorrow)}</span>
          </div>
          <div className="mq-line" style={{ padding: '13px 0', borderTop: '1px solid var(--mq-divider)' }}>
            <span style={{ color: 'var(--mq-neutral-700)' }}>Slot</span>
            <span className="mq-strong">{slotDef.label}</span>
          </div>
          <div className="mq-line" style={{ padding: '13px 0', borderTop: '1px solid var(--mq-divider)' }}>
            <span style={{ color: 'var(--mq-neutral-700)' }}>About a month</span>
            <span className="mq-strong">₹{rupees(planMonthly)}</span>
          </div>
        </div>

        <div className="mq-dark mq-col" style={{ gap: 6 }}>
          <span className="mq-num" style={{ fontSize: 20, lineHeight: 1.15 }}>
            You save ₹{rupees(savingsMonthly)} a month
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--mq-sage-200)' }}>
            {savingsPercent}% off the one-off price, and the wallet auto-tops-up so a low balance never
            stops a delivery.
          </span>
        </div>

        <div className="mq-col" style={{ gap: 8 }}>
          <span className="mq-label">Pay from</span>
          <div className="mq-card mq-card-flat mq-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="wallet" color="#201e1d" />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Milquu wallet</span>
            <span className="mq-sub">Recharge ₹1,000</span>
          </div>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button type="button" className="mq-btn mq-btn-block" onClick={confirm}>
          Start tomorrow morning · ₹{rupees(planDaily)}/day
        </button>
      </ActionBar>
    </Screen>
  );
}
