import { useState, useEffect } from 'react';
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
    refresh, user, address, areaName, ensurePlanMilk,
  } = useDaily();

  const hasAddress = Boolean(address?.line1 && address?.area);

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

  // Make sure crate has a milk if empty
  useEffect(() => {
    if (!Object.keys(crate || {}).length) {
      ensurePlanMilk();
    }
  }, [crate, ensurePlanMilk]);

  const handleStartPlan = async () => {
    if (!hasAddress) {
      navigate('/app/start/address', { state: { from: '/app/start/review' } });
      return;
    }

    setError('');
    setSaving(true);
    try {
      if (short > 0) {
        const topUpResult = await rechargeWallet({ amount: short, user });
        if (!topUpResult) {
          // Payment sheet was dismissed
          setSaving(false);
          return;
        }
        await refresh();
      }

      await startPlan();
      navigate('/app/start/done');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'We could not start your plan just now.');
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

        {/* Delivering To Section */}
        <div className="mq-col" style={{ gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="mq-label">Delivering to</span>
            <button
              type="button"
              style={{
                background: 'transparent',
                border: 0,
                color: '#856214',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/app/start/address', { state: { from: '/app/start/review' } })}
            >
              {hasAddress ? 'Change' : 'Add address'}
            </button>
          </div>

          <div
            className="mq-card mq-card-flat mq-card-pad"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              border: !hasAddress ? '1.5px dashed #b45309' : '1px solid #e2e8f0',
              background: !hasAddress ? '#fffbeb' : '#ffffff',
            }}
            onClick={() => navigate('/app/start/address', { state: { from: '/app/start/review' } })}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: !hasAddress ? '#fef3c7' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon name="pin" size={17} color={!hasAddress ? '#b45309' : '#1f2937'} strokeWidth={2.2} />
            </div>

            {hasAddress ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: '#1e293b' }}>
                  {address.line1}
                </span>
                <span style={{ display: 'block', fontSize: 12, color: '#64748b', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {[address.line2, areaName].filter(Boolean).join(', ')}
                </span>
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#b45309' }}>
                  Add your delivery address
                </span>
                <span style={{ display: 'block', fontSize: 11.5, color: '#92400e', marginTop: 2 }}>
                  Required so we know where to drop your milk
                </span>
              </div>
            )}

            <Icon name="right" size={14} color="#94a3b8" />
          </div>
        </div>

        <div className="mq-dark mq-col" style={{ gap: 6 }}>
          <span className="mq-num" style={{ fontSize: 20, lineHeight: 1.15 }}>
            You save ₹{rupees(savingsMonthly)} a month
          </span>
          <span style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--mq-green-200)' }}>
            {savingsPercent}% off the one-off price. Each morning's crate comes out of your wallet —
            we pause the plan rather than deliver on credit if it runs low.
          </span>
        </div>

        <div className="mq-col" style={{ gap: 8 }}>
          <span className="mq-label">Pay from</span>
          <div className="mq-card mq-card-flat mq-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icon name="wallet" color="#1f2937" />
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
            <span role="alert" style={{ fontSize: 13, color: 'var(--mq-clay-700, #a4423a)', fontWeight: 500 }}>
              {error}
            </span>
          )}
          {!hasAddress ? (
            <button
              type="button"
              className="mq-btn mq-btn-block"
              onClick={() => navigate('/app/start/address', { state: { from: '/app/start/review' } })}
            >
              Add delivery address to continue
            </button>
          ) : short > 0 ? (
            <button
              type="button"
              className="mq-btn mq-btn-block"
              onClick={handleStartPlan}
              disabled={saving}
              style={saving ? { opacity: 0.6, cursor: 'progress' } : undefined}
            >
              {saving ? 'Opening payment…' : `Pay ₹${rupees(short)} & Start Plan`}
            </button>
          ) : (
            <button
              type="button"
              className="mq-btn mq-btn-block"
              onClick={handleStartPlan}
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
