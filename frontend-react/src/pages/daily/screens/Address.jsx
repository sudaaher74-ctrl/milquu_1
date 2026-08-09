import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Screen, TopBar, ActionBar, Icon } from '../ui';
import { useDaily } from '../DailyContext';

const LABELS = ['Home', 'Office', 'Other'];

export default function Address() {
  const navigate = useNavigate();
  const { address, saveAddress, areas, slotDef, planActive, flash } = useDaily();
  const [draft, setDraft] = useState(address);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    const { value } = e.target;
    setDraft((d) => ({ ...d, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const pickArea = (slug) => {
    setDraft((d) => ({ ...d, area: slug }));
    setErrors((prev) => (prev.area ? { ...prev, area: undefined } : prev));
  };

  const save = async () => {
    const next = {};
    if (!draft.line1.trim()) next.line1 = 'We need a flat or house number.';
    if (!draft.area) next.area = 'Pick the area you want deliveries in.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await saveAddress(draft);
      navigate(planActive ? '/app' : '/app/start/milk');
    } catch (err) {
      const message = err?.response?.data?.message ?? 'Could not save that address. Try again.';
      setErrors({ area: message });
      flash(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <TopBar title="Where to deliver" to={planActive ? '/app/account' : '/app/start'} />

      <div className="mq-body" style={{ gap: 18 }}>
        <h2 style={{ fontSize: 32 }}>Where should the<br />bottles go?</h2>

        <div className="mq-col" style={{ gap: 8 }}>
          <span className="mq-label">Your area</span>
          <div className="mq-row mq-row-wrap" style={{ gap: 8 }} role="radiogroup" aria-label="Delivery area">
            {areas.map((a) => (
              <button
                key={a.slug}
                type="button"
                role="radio"
                aria-checked={draft.area === a.slug}
                className={`mq-chip${draft.area === a.slug ? ' mq-chip-on' : ''}`}
                onClick={() => pickArea(a.slug)}
              >
                {a.name}
              </button>
            ))}
          </div>
          {errors.area && <span className="mq-err">{errors.area}</span>}
        </div>

        {draft.area && (
          <div className="mq-note">
            <Icon name="pin" color="#6b5313" />
            <span style={{ flex: 1, fontWeight: 700 }}>
              We deliver in {areas.find((a) => a.slug === draft.area)?.name} — {slotDef.label}
            </span>
          </div>
        )}

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-line1">Flat / house</label>
          <input
            id="mq-line1"
            className={`mq-input${errors.line1 ? ' mq-input-err' : ''}`}
            value={draft.line1}
            onChange={set('line1')}
            placeholder="B-704, Sai Residency"
          />
          {errors.line1 && <span className="mq-err">{errors.line1}</span>}
        </div>

        <div className="mq-field">
          <label className="mq-label" htmlFor="mq-line2">Street, landmark</label>
          <input
            id="mq-line2"
            className="mq-input"
            value={draft.line2}
            onChange={set('line2')}
            placeholder="Plot 22, near the school"
          />
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
        <button type="button" className="mq-btn mq-btn-block" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : planActive ? 'Save address' : 'Save and pick milk'}
        </button>
      </ActionBar>
    </Screen>
  );
}
