import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, StepBar, ActionBar, Stepper } from '../ui';
import { rupees } from '../catalogue';
import { useDaily } from '../DailyContext';

export default function PlanMilk() {
  const navigate = useNavigate();
  const {
    crate, bumpCrate, addToPlan, ensurePlanMilk, planDaily, flash,
    milks, suggested, productOf,
  } = useDaily();

  /* The milks are whichever plan-priced milks the catalogue offers — the crate
     holds at most one of them. */
  const onPlan = milks.find((p) => crate[p.id] > 0);
  const picked = onPlan?.id ?? milks[0]?.id ?? null;
  const qty = picked ? (crate[picked] ?? 1) : 0;
  const pickedProduct = picked ? productOf(picked) : null;

  /* Seed the default milk so the running total matches the stepper rather than
     reading ₹0 against a quantity of 1. */
  useEffect(ensurePlanMilk, [ensurePlanMilk]);

  /* Picking a milk swaps it in at the quantity the other one was carrying. */
  const pick = (key) => {
    if (key === picked || !picked) return;
    const carried = crate[picked] ?? 1;
    bumpCrate(picked, -carried);
    bumpCrate(key, carried);
  };

  return (
    <Screen>
      <StepBar step={1} to="/app/start/address" />

      <div className="mq-body" style={{ paddingTop: 22 }}>
        <h2>Which milk, how much?</h2>

        {milks.map((p) => {
          const key = p.id;
          const on = key === picked;
          return (
            <div
              key={key}
              role="radio"
              aria-checked={on}
              tabIndex={0}
              className={`mq-pick${on ? ' mq-pick-on' : ''}`}
              onClick={() => pick(key)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(key); }
              }}
            >
              <img src={p.img} alt="" style={{ width: 52, height: 74, objectFit: 'contain' }} />
              <div className="mq-col" style={{ flex: 1, gap: 3 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{p.name}</span>
                <span className="mq-sub">{p.meta}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mq-sage-800)' }}>
                  ₹{p.plan} / L on a plan{on ? ` · ₹${p.price} one-off` : ''}
                </span>
              </div>
              {on ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <Stepper
                    value={qty}
                    min={1}
                    onDec={() => bumpCrate(key, -1)}
                    onInc={() => bumpCrate(key, 1)}
                    label={`litres of ${p.name}`}
                  />
                </div>
              ) : (
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--mq-sage-800)' }}>Add</span>
              )}
            </div>
          );
        })}

        <div className="mq-col" style={{ gap: 10, marginTop: 4 }}>
          <span className="mq-label">Families usually add</span>
          <div className="mq-row" style={{ gap: 12 }}>
            {suggested.map((p) => {
              const key = p.id;
              const added = crate[key] > 0;
              return (
                <div key={key} className="mq-card" style={{ flex: 1, borderRadius: 24, padding: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <img src={p.img} alt="" style={{ width: '100%', height: 64, objectFit: 'contain' }} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{p.name} {p.unit}</span>
                  <span style={{ fontSize: 12, color: 'var(--mq-neutral-600)' }}>₹{rupees(p.price)} · {p.meta.split(' · ')[1] ?? p.meta}</span>
                  <button
                    type="button"
                    className="mq-btn-soft"
                    style={{ padding: '7px 0', fontSize: 12 }}
                    onClick={() => (added ? flash(`${p.name} is already on your plan`) : addToPlan(key))}
                  >
                    {added ? 'Added' : '+ Add'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar
        summary={{
          title: `₹${rupees(planDaily)} a day`,
          note: pickedProduct ? `${qty} L ${pickedProduct.name.toLowerCase()}` : 'Choose a milk',
        }}
      >
        <button type="button" className="mq-btn mq-btn-md" onClick={() => navigate('/app/start/rhythm')}>
          Pick days
        </button>
      </ActionBar>
    </Screen>
  );
}
