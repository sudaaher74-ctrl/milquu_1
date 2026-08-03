import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { rupees } from '../catalogue';
import { addDays, dayKey, fmtShort, monthGrid, monthName, startOfDay, WEEKDAY_INITIALS } from '../dates';
import { useDaily } from '../DailyContext';

/** Inclusive count of mornings between two days. */
const spanDays = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / 86400000) + 1;

export default function Pause() {
  const navigate = useNavigate();
  const { today, pauseRange, planDaily, rhythmDef, flash } = useDaily();

  const tomorrow = addDays(today, 1);
  const [month, setMonth] = useState(() => startOfDay(tomorrow));
  const [range, setRange] = useState({ from: tomorrow, to: tomorrow });

  /* Presets pick a range rather than committing it — the calendar stays in sync. */
  const presets = useMemo(() => {
    const saturday = addDays(today, ((6 - today.getDay()) + 7) % 7 || 7);
    return [
      ['Tomorrow only', { from: tomorrow, to: tomorrow }],
      ['This weekend', { from: saturday, to: addDays(saturday, 1) }],
      ['A week', { from: tomorrow, to: addDays(tomorrow, 6) }],
    ];
  }, [today, tomorrow]);

  const activePreset = presets.find(
    ([, r]) => dayKey(r.from) === dayKey(range.from) && dayKey(r.to) === dayKey(range.to),
  );

  const pick = (date) => {
    setRange((r) => {
      // A complete range starts a new one; otherwise extend from the anchor.
      if (r.to || date < r.from) return { from: date, to: null };
      return { from: r.from, to: date };
    });
  };

  const from = range.from;
  const to = range.to ?? range.from;
  const nights = spanDays(from, to);
  /* Only the mornings the rhythm would actually have delivered are held back. */
  const mornings = Array.from({ length: nights }, (_, i) => addDays(from, i))
    .filter((d) => rhythmDef.days.includes((d.getDay() + 6) % 7)).length;
  const held = mornings * planDaily;

  const confirm = () => {
    pauseRange(from, to);
    flash(`Paused ${fmtShort(from)}${nights > 1 ? ` – ${fmtShort(to)}` : ''}`);
    navigate('/app/plan');
  };

  const cells = monthGrid(month);

  return (
    <Screen>
      <TopBar title="Pause deliveries" to="/app/plan" />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2>Away for a while?</h2>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: 'var(--mq-neutral-700)' }}>
          Pause instead of cancelling — your plan, price and slot stay exactly as they are.
        </p>

        <div className="mq-row mq-row-wrap" style={{ gap: 9 }}>
          {presets.map(([label, r]) => (
            <button
              key={label}
              type="button"
              className={`mq-chip${activePreset?.[0] === label ? ' mq-chip-on' : ''}`}
              style={{ padding: '10px 15px' }}
              onClick={() => { setRange(r); setMonth(startOfDay(r.from)); }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mq-card" style={{ padding: 18 }}>
          <div className="mq-between" style={{ paddingBottom: 14 }}>
            <span className="mq-num" style={{ fontSize: 18 }}>{monthName(month)} {month.getFullYear()}</span>
            <div className="mq-row" style={{ gap: 8 }}>
              <button
                type="button"
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                aria-label="Previous month"
                style={{ width: 30, height: 30, borderRadius: 999, border: '1px solid var(--mq-divider)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="back" size={12} color="#82796a" />
              </button>
              <button
                type="button"
                onClick={() => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                aria-label="Next month"
                style={{ width: 30, height: 30, borderRadius: 999, border: '1px solid var(--mq-divider)', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="next" size={12} color="#201e1d" />
              </button>
            </div>
          </div>

          <div className="mq-cal" aria-hidden="true">
            {WEEKDAY_INITIALS.map((d, i) => <span key={`${d}-${i}`} className="mq-cal-dow">{d}</span>)}
          </div>

          <div className="mq-cal" role="grid" aria-label="Pick the days to pause">
            {cells.map((date, i) => {
              if (!date) return <span key={`pad-${i}`} />;
              const key = dayKey(date);
              const past = date < tomorrow;
              const isFrom = key === dayKey(from);
              const isTo = key === dayKey(to);
              const inside = date > from && date < to;
              const cls = [
                key === dayKey(today) && 'mq-cal-today',
                inside && 'mq-cal-mid',
                (isFrom || isTo) && 'mq-cal-end',
                isFrom && 'mq-cal-from',
                isTo && 'mq-cal-to',
              ].filter(Boolean).join(' ');
              return (
                <button
                  key={key}
                  type="button"
                  className={cls}
                  disabled={past}
                  aria-pressed={isFrom || isTo || inside}
                  onClick={() => pick(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mq-note mq-note-col">
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            {nights > 1
              ? `Paused ${fmtShort(from)} – ${fmtShort(to)}, ${mornings} ${mornings === 1 ? 'morning' : 'mornings'}`
              : `Paused ${fmtShort(from)}, one morning`}
          </span>
          <span style={{ fontSize: 13, color: 'var(--mq-sage-800)' }}>
            ₹{rupees(held)} stays in your wallet. Deliveries resume {fmtShort(addDays(to, 1))}.
          </span>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button type="button" className="mq-btn-outline" style={{ flex: 1, padding: '14px 0' }} onClick={() => navigate('/app/plan')}>
          Cancel
        </button>
        <button type="button" className="mq-btn mq-btn-md" style={{ flex: 1.4, padding: '14px 0' }} onClick={confirm}>
          Pause these days
        </button>
      </ActionBar>
    </Screen>
  );
}
