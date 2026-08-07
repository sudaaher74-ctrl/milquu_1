import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';

export default function CancelPlan() {
  const navigate = useNavigate();
  const { cancelPlan, wallet, flash } = useDaily();

  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  const confirm = async () => {
    setCancelling(true);
    setError('');
    try {
      await cancelPlan();
      flash('Your plan is cancelled');
      navigate('/app');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel your plan just now.');
      setCancelling(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Cancel plan" to="/app/plan" />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2 style={{ fontSize: 32 }}>End your plan?</h2>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--mq-neutral-700)' }}>
          No more mornings will be scheduled or charged. If you just need a break, pausing
          keeps your plan, price and slot exactly as they are — cancelling starts over from
          scratch next time.
        </p>

        <div className="mq-note mq-note-col">
          <span style={{ fontSize: 14, fontWeight: 700 }}>₹{rupees(wallet)} stays in your wallet</span>
          <span style={{ fontSize: 13, color: 'var(--mq-sage-800)' }}>
            Nothing is refunded automatically — use it to order one-off from the shop, or ask us
            for a withdrawal from your account.
          </span>
        </div>

        {error && (
          <span role="alert" style={{ fontSize: 13, color: 'var(--mq-clay-700, #a4423a)' }}>{error}</span>
        )}
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button type="button" className="mq-btn-outline" style={{ flex: 1, padding: '14px 0' }} onClick={() => navigate('/app/plan')}>
          Keep my plan
        </button>
        <button
          type="button"
          className="mq-btn mq-btn-md"
          style={{ flex: 1.4, padding: '14px 0', background: 'var(--mq-clay-700, #a4423a)' }}
          onClick={confirm}
          disabled={cancelling}
        >
          {cancelling ? 'Cancelling…' : 'Cancel my plan'}
        </button>
      </ActionBar>
    </Screen>
  );
}
