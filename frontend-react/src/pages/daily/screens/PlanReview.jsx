import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, StepBar, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { fmtDay } from '../dates';
import { useDaily } from '../DailyContext';
import { rechargeWallet } from '../../../utils/razorpay';

export default function PlanReview() {
  const navigate = useNavigate();
  const {
    crate, rhythmDef, slotDef, tomorrow, planDaily, planMonthly,
    savingsMonthly, savingsPercent, startPlan, itemRows, priceOf, wallet,
    refresh, user,
  } = useDaily();

  /* The plan is charged nightly out of the wallet — starting it without
     enough for even the first crate would just mean a silent pause from day
     one, so the server refuses and this mirrors that here rather than
     letting the customer hit the error. */
  const short = Math.max(0, planDaily - wallet);

  /* Confirming creates the subscription on the account, so it can fail — a
     dropped connection, an address that is no longer serviceable. Only move on
     once the server has actually accepted it. */
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const topUp = async () => {
    setError('');
    setSaving(true);
    try {
      const result = await rechargeWallet({ amount: Math.max(short, 100), user });
      if (result) await refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const confirm = async () => {
    setSaving(true);
    setError('');
    try {
      await startPlan();
      navigate('/app/start/done');
    } catch (err) {
      setError(err.response?.data?.message || 'We could not start your plan just now.');
    } finally {
      setSaving(false);
    }
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
            {savingsPercent}% off the one-off price. Each morning's crate comes out of your wallet —
            we pause the plan rather than deliver on credit if it runs low.
          </span>
        </div>

        <div className="mq-col" style={{ gap: 8 }}>
          <span className="mq-label">Pay from</span>
          <div className="mq-card mq-card-flat mq-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="wallet" color="#201e1d" />
            <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>Milquu wallet</span>
            <span className="mq-sub">₹{rupees(wallet)}</span>
          </div>
          {short > 0 && (
            <span style={{ fontSize: 13, color: 'var(--mq-clay-700, #8a5a3b)' }}>
              Add ₹{rupees(short)} to cover tomorrow's first crate before starting.
            </span>
          )}
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <div className="mq-col" style={{ flex: 1, gap: 8 }}>
          {error && (
            <span role="alert" style={{ fontSize: 13, color: 'var(--mq-clay-700, #a4423a)' }}>{error}</span>
          )}
          {short > 0 ? (
            <button
              type="button"
              className="mq-btn mq-btn-block"
              onClick={topUp}
              disabled={saving}
              style={saving ? { opacity: 0.6, cursor: 'progress' } : undefined}
            >
              {saving ? 'Opening…' : `Add ₹${rupees(Math.max(short, 100))} to start`}
            </button>
          ) : (
            <button
              type="button"
              className="mq-btn mq-btn-block"
              onClick={confirm}
              disabled={saving}
              style={saving ? { opacity: 0.6, cursor: 'progress' } : undefined}
            >
              {saving ? 'Starting your plan…' : `Start tomorrow morning · ₹${rupees(planDaily)}/day`}
            </button>
          )}
        </div>
      </ActionBar>
    </Screen>
  );
}
