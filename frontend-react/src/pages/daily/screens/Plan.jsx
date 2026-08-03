import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, Stepper, ListRow } from '../ui';
import { addDays, dayKey, fmtShort, fromKey } from '../dates';
import { useDaily, itemRows } from '../DailyContext';

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Plan() {
  const navigate = useNavigate();
  const {
    crate, bumpCrate, today, rhythmDef, slotDef, isSkipped, toggleSkip, planActive, planStartedOn,
  } = useDaily();

  /* The seven mornings after today, each on or off. */
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i + 1);
    const key = dayKey(date);
    const inRhythm = rhythmDef.days.includes((date.getDay() + 6) % 7);
    return { date, key, on: inRhythm && !isSkipped(key), inRhythm };
  }), [today, rhythmDef, isSkipped]);

  const offCount = week.filter((d) => !d.on).length;

  return (
    <Screen>
      <div className="mq-between" style={{ padding: 'calc(40px + env(safe-area-inset-top)) 22px 0', alignItems: 'flex-start' }}>
        <div className="mq-col" style={{ gap: 4 }}>
          <span className="mq-kicker">
            {planStartedOn ? `Active since ${fmtShort(fromKey(planStartedOn))}` : 'Your plan'}
          </span>
          <h2 style={{ fontSize: 32 }}>My plan</h2>
        </div>
        <span className="mq-pill" style={{ padding: '8px 13px' }}>{planActive ? 'Running' : 'Paused'}</span>
      </div>

      <div className="mq-body" style={{ paddingTop: 22 }}>
        <div className="mq-card mq-card-list">
          {itemRows(crate).map((row) => (
            <div key={row.key} className="mq-item">
              <img src={row.img} alt="" className="mq-item-thumb" style={{ width: 36, height: 50 }} />
              <div className="mq-item-body">
                <span className="mq-item-name">{row.short} {row.unit}</span>
                <span className="mq-item-meta">
                  {row.cat === 'milk' ? `${rhythmDef.long} · ${slotDef.label}` : row.meta}
                </span>
              </div>
              <Stepper
                value={row.qty}
                min={0}
                onDec={() => bumpCrate(row.key, -1)}
                onInc={() => bumpCrate(row.key, 1)}
                label={row.name}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => navigate('/app/shop')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '15px 0',
              border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit',
              borderTop: itemRows(crate).length ? '1px solid var(--mq-divider)' : 0,
            }}
          >
            <span
              style={{
                width: 36, height: 36, borderRadius: 999, background: 'var(--mq-sage-200)',
                color: 'var(--mq-sage-800)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, fontWeight: 700,
              }}
            >
              +
            </span>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 15, fontWeight: 700, color: 'var(--mq-sage-800)' }}>
              Add ghee, paneer or lassi
            </span>
          </button>
        </div>

        <div className="mq-col" style={{ gap: 10 }}>
          <span className="mq-label">Next seven days</span>
          <div className="mq-week">
            {week.map((d) => (
              <button
                key={d.key}
                type="button"
                className={d.on ? undefined : 'mq-week-off'}
                onClick={() => d.inRhythm && toggleSkip(d.key)}
                disabled={!d.inRhythm}
                aria-pressed={d.on}
                aria-label={`${DOW[d.date.getDay()]} ${d.date.getDate()} — ${d.on ? 'delivering' : 'no delivery'}`}
              >
                <span className="mq-week-dow">{DOW[d.date.getDay()]}</span>
                <span className="mq-week-date">{d.date.getDate()}</span>
                <span className="mq-week-mark" />
              </button>
            ))}
          </div>
          <span className="mq-sub">
            {offCount === 0
              ? 'Every morning this week. Tap a day to skip it.'
              : `${offCount} ${offCount === 1 ? 'day is' : 'days are'} off. Tap a day to skip or restore it.`}
          </span>
        </div>

        <div className="mq-col" style={{ gap: 10 }}>
          <ListRow icon="pause" label="Pause for a trip" chevron onClick={() => navigate('/app/plan/pause')} />
          <ListRow icon="clock" label="Change my slot" value={slotDef.label} onClick={() => navigate('/app/start/rhythm')} />
        </div>
      </div>

      <div className="mq-fill" style={{ minHeight: 28 }} />
      <TabBar />
    </Screen>
  );
}
