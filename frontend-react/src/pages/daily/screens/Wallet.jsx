import { useState } from 'react';
import { Screen, TabBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { addDays, fmtDay } from '../dates';
import { useDaily } from '../DailyContext';
import { rechargeWallet } from '../../../utils/razorpay';

/** Wallet transactions come from the API as { type, amount, description, createdAt }. */
const signOf = (t) => (t.type === 'credit' ? 1 : -1);

/** Enough for roughly a week, a fortnight and a month of a typical plan. */
const PRESETS = [500, 1000, 2000];

export default function Wallet() {
  const { wallet, runwayDays, today, ledger, planActive, planDaily, user, refresh, flash } = useDaily();
  const runsOut = addDays(today, runwayDays);

  /* Recharge happens here now rather than sending the customer out to the
     marketing site's account page. */
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addMoney = async (value) => {
    setError('');
    setBusy(true);
    try {
      const result = await rechargeWallet({ amount: value, user });
      // A null result means the customer closed the sheet — nothing was charged.
      if (result) {
        await refresh();
        setAmount('');
        flash(`₹${rupees(result.walletBalance - wallet)} added to your wallet`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

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

        <div className="mq-row" style={{ gap: 8, marginTop: 2 }}>
          {PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className="mq-btn-cream-outline"
              style={{ flex: 1, fontSize: 14, padding: '11px 0' }}
              disabled={busy}
              onClick={() => addMoney(preset)}
            >
              ₹{rupees(preset)}
            </button>
          ))}
        </div>

        <div className="mq-row" style={{ gap: 8 }}>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
            inputMode="numeric"
            placeholder="Other amount"
            aria-label="Amount to add, in rupees"
            style={{
              flex: 1, minWidth: 0, borderRadius: 999, border: 0, padding: '13px 18px',
              font: 'inherit', fontSize: 15, background: 'var(--mq-sage-700)',
              color: 'var(--mq-sage-100)', outline: 'none',
            }}
          />
          <button
            type="button"
            className="mq-btn-cream"
            style={{ fontSize: 15, padding: '13px 22px' }}
            disabled={busy || !amount}
            onClick={() => addMoney(amount)}
          >
            {busy ? 'Opening…' : 'Add money'}
          </button>
        </div>

        {error && (
          <span role="alert" style={{ fontSize: 13, color: 'var(--mq-sage-200)' }}>{error}</span>
        )}
      </div>

      <div className="mq-body" style={{ paddingTop: 24, gap: 14 }}>
        {planActive && planDaily > 0 && runwayDays <= 3 && (
          <div className="mq-note">
            <Icon name="alert" color="#6b5313" />
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
            {ledger.map((t) => (
              <div key={t._id} className="mq-item">
                <div className="mq-item-body">
                  <span className="mq-item-name">{t.description}</span>
                  <span className="mq-item-meta">{fmtDay(new Date(t.createdAt))}</span>
                </div>
                <span
                  className="mq-item-price"
                  style={{ color: signOf(t) > 0 ? 'var(--mq-sage-800)' : undefined }}
                >
                  {signOf(t) > 0 ? '+' : '−'}₹{rupees(Math.abs(t.amount))}
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
