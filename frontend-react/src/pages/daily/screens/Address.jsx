import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { SERVICE_AREA } from '../catalogue';
import { useDaily } from '../DailyContext';

const LABELS = ['Home', 'Office', 'Other'];

export default function Address() {
  const navigate = useNavigate();
  const { address, setAddress, slotDef } = useDaily();
  const [draft, setDraft] = useState(address);
  const [errors, setErrors] = useState({});

  const set = (field) => (e) => {
    const { value } = e.target;
    setDraft((d) => ({ ...d, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const save = () => {
    const next = {};
    if (!draft.flat.trim()) next.flat = 'We need a flat or house number.';
    if (!draft.street.trim()) next.street = 'A street or landmark helps Ravi find you.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setAddress(draft);
    navigate('/app/start/milk');
  };

  return (
    <Screen>
      <TopBar title="Where to deliver" to="/app/start" />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2 style={{ fontSize: 32 }}>Where should the<br />bottles go?</h2>

        <div className="mq-note">
          <Icon name="pin" color="#3d472b" />
          <span style={{ flex: 1, fontWeight: 700 }}>
            We deliver in {SERVICE_AREA} — {slotDef.label}
          </span>
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-flat">Flat / house</label>
          <input
            id="mq-flat"
            className={`mq-input${errors.flat ? ' mq-input-err' : ''}`}
            value={draft.flat}
            onChange={set('flat')}
            placeholder="B-704, Sai Residency"
          />
          {errors.flat && <span className="mq-err">{errors.flat}</span>}
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-street">Street, landmark</label>
          <input
            id="mq-street"
            className={`mq-input${errors.street ? ' mq-input-err' : ''}`}
            value={draft.street}
            onChange={set('street')}
            placeholder="Plot 22, near Gharda school"
          />
          {errors.street && <span className="mq-err">{errors.street}</span>}
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-note">Where to leave it</label>
          <textarea
            id="mq-note"
            className="mq-input"
            value={draft.note}
            onChange={set('note')}
            placeholder="In the milk box outside the door."
          />
        </div>

        <div className="mq-row">
          {LABELS.map((label) => (
            <button
              key={label}
              type="button"
              className={`mq-chip${draft.label === label ? ' mq-chip-on' : ''}`}
              onClick={() => setDraft((d) => ({ ...d, label }))}
              aria-pressed={draft.label === label}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mq-fill" />

      <ActionBar>
        <button type="button" className="mq-btn mq-btn-block" onClick={save}>
          Save and pick milk
        </button>
      </ActionBar>
    </Screen>
  );
}
