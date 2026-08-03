import { useNavigate } from 'react-router-dom';
import { Screen, StepBar, ActionBar, Icon } from '../ui';
import { RHYTHMS, DELIVERY_SLOTS } from '../catalogue';
import { WEEKDAY_INITIALS } from '../dates';
import { useDaily } from '../DailyContext';

export default function PlanRhythm() {
  const navigate = useNavigate();
  const { rhythm, setRhythm, rhythmDef, slot, setSlot, slotDef } = useDaily();

  return (
    <Screen>
      <StepBar step={2} to="/app/start/milk" />

      <div className="mq-body" style={{ paddingTop: 22, gap: 20 }}>
        <h2>How often, and when?</h2>

        <div className="mq-col" style={{ gap: 10 }}>
          <span className="mq-label">Rhythm</span>
          <div className="mq-row" style={{ gap: 8 }} role="radiogroup" aria-label="Delivery rhythm">
            {RHYTHMS.map((r) => (
              <button
                key={r.key}
                type="button"
                role="radio"
                aria-checked={rhythm === r.key}
                className={`mq-chip mq-chip-flex${rhythm === r.key ? ' mq-chip-on' : ''}`}
                onClick={() => setRhythm(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          {/* The week strip reads out the rhythm rather than being set directly. */}
          <div className="mq-row" style={{ gap: 7, marginTop: 4 }} aria-label={`Delivering ${rhythmDef.long}`}>
            {WEEKDAY_INITIALS.map((initial, i) => {
              const on = rhythmDef.days.includes(i);
              return (
                <span
                  key={`${initial}-${i}`}
                  aria-hidden="true"
                  style={{
                    flex: 1, textAlign: 'center', fontSize: 13, fontWeight: 700,
                    borderRadius: 999, padding: '11px 0',
                    background: on ? 'var(--mq-sage-200)' : 'var(--mq-tint)',
                    color: on ? 'var(--mq-sage-800)' : 'var(--mq-neutral-600)',
                  }}
                >
                  {initial}
                </span>
              );
            })}
          </div>
        </div>

        <div className="mq-col" style={{ gap: 10 }}>
          <span className="mq-label">Morning slot</span>
          {DELIVERY_SLOTS.map((s) => (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={slot === s.key}
              className={`mq-pick${slot === s.key ? ' mq-pick-on' : ''}`}
              onClick={() => setSlot(s.key)}
            >
              <div className="mq-col" style={{ flex: 1 }}>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{s.label}</span>
                <span className="mq-sub">{s.note}</span>
              </div>
              {s.badge && <span className="mq-pill">{s.badge}</span>}
            </button>
          ))}
        </div>

        <div className="mq-note">
          <Icon name="clock" color="#3d472b" />
          <span style={{ flex: 1 }}>
            Change tomorrow’s crate until 9 pm tonight. Skip any day, any time.
          </span>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar summary={{ title: rhythmDef.long, note: slotDef.label }}>
        <button type="button" className="mq-btn mq-btn-md" onClick={() => navigate('/app/start/review')}>
          Review
        </button>
      </ActionBar>
    </Screen>
  );
}
