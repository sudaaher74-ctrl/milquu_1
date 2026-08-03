import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { useDaily, RIDER, TRACK_STEPS } from '../DailyContext';

export default function Track() {
  const navigate = useNavigate();
  const { flash } = useDaily();

  return (
    <Screen>
      <TopBar title="This morning’s delivery" to="/app" />

      <div className="mq-body" style={{ gap: 18 }}>
        <div className="mq-col" style={{ gap: 4 }}>
          <span className="mq-kicker mq-kicker-sage">4 stops away</span>
          <h2 style={{ fontSize: 32 }}>At your door by<br />6:38 am</h2>
        </div>

        <div className="mq-card mq-card-pad" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            className="mq-num"
            style={{
              width: 52, height: 52, flex: 'none', borderRadius: 999, background: 'var(--mq-sage-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 19, color: 'var(--mq-sage-800)',
            }}
          >
            {RIDER.initials}
          </div>
          <div className="mq-col" style={{ flex: 1, gap: 2 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{RIDER.name}</span>
            <span className="mq-sub">{RIDER.note}</span>
          </div>
          <button
            type="button"
            onClick={() => flash(`Calling ${RIDER.name.split(' ')[0]}…`)}
            aria-label={`Call ${RIDER.name}`}
            style={{
              width: 44, height: 44, border: 0, borderRadius: 999, background: 'var(--mq-sage-200)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Icon name="phone" size={19} color="#3d472b" />
          </button>
        </div>

        <div className="mq-card mq-card-pad">
          {TRACK_STEPS.map(([title, note, state], i) => {
            const last = i === TRACK_STEPS.length - 1;
            const done = state !== 'todo';
            return (
              <div key={title} className="mq-track">
                <div className="mq-track-rail">
                  <span
                    className={`mq-track-dot${state === 'now' ? ' mq-track-dot-now' : ''}${done ? '' : ' mq-track-dot-todo'}`}
                  />
                  {!last && <span className={`mq-track-line${state === 'now' ? ' mq-track-line-todo' : ''}`} />}
                </div>
                <div className="mq-track-body">
                  <span style={{ fontSize: 15, fontWeight: 700, color: done ? undefined : 'var(--mq-neutral-600)' }}>
                    {title}
                  </span>
                  <span className="mq-sub">{note}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mq-note">
          <Icon name="bag" color="#3d472b" />
          <span style={{ flex: 1 }}>
            Leave yesterday’s empty bottle outside — {RIDER.name.split(' ')[0]} picks it up on this round.
          </span>
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button
          type="button"
          className="mq-btn-outline"
          style={{ flex: 1, padding: '14px 0' }}
          onClick={() => flash('Your note reaches the rider before the round')}
        >
          Add a note
        </button>
        <button type="button" className="mq-btn mq-btn-md" style={{ flex: 1, padding: '14px 0' }} onClick={() => navigate('/app')}>
          Done
        </button>
      </ActionBar>
    </Screen>
  );
}
