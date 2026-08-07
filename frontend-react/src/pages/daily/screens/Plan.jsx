import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TabBar, Stepper, ListRow } from '../ui';
import { addDays, dayKey, fmtShort, fromKey } from '../dates';
import { useDaily } from '../DailyContext';

const DOW = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function Plan() {
  const navigate = useNavigate();
  const {
    crate, bumpCrate, today, rhythmDef, slotDef, isSkipped, toggleSkip, planActive, planStartedOn,
    itemRows, inRhythm,
  } = useDaily();

  /* The seven mornings after today, each on or off. Whether a morning is in
     the rhythm is answered by the context, which mirrors the server's rule —
     alternate days count from the plan's start date and cannot be derived
     from a fixed weekday list. */
  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i + 1);
    const key = dayKey(date);
    const scheduled = inRhythm(date);
    return { date, key, on: scheduled && !isSkipped(key), inRhythm: scheduled };
  }), [today, inRhythm, isSkipped]);

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
                <span className="mq-item-meta">{rhythmDef.long} · {slotDef.label}</span>
              </div>
              <Stepper
                value={row.qty}
                min={1}
                onDec={() => bumpCrate(row.key, -1)}
                onInc={() => bumpCrate(row.key, 1)}
                label={row.name}
              />
            </div>
          ))}
        </div>

        <div className="mq-col" style={{ gap: 10 }}>
          <ListRow
            icon="bag"
            label="Ghee, paneer, lassi and more"
            value="One-off, from the shop"
            chevron
            onClick={() => navigate('/app/shop')}
          />
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
