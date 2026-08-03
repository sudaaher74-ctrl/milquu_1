import { NavLink, useNavigate } from 'react-router-dom';

/* ── icons ───────────────────────────────────────────────────────────────────
   One stroked set at a single weight, drawn on the 24-grid. `Icon` takes the
   name so screens never hand-roll an <svg>. */

const PATHS = {
  back: <path d="m15 18-6-6 6-6" />,
  next: <path d="m9 18 6-6-6-6" />,
  down: <path d="m6 9 6 6 6-6" />,
  check: <path d="M20 6 9 17l-5-5" />,
  star: <path d="M12 3l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8L6.8 19.2l1-5.9L3.5 9.2l5.9-.8L12 3Z" />,
  pin: <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
  clock: <><path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" /></>,
  wallet: <><rect x="3" y="6" width="18" height="13" rx="4" /><path d="M16 12h2" /></>,
  bag: <><path d="M4 7h16l-1.5 13H5.5L4 7Z" /><path d="M9 7a3 3 0 0 1 6 0" /></>,
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="4" /><path d="M8 3v4M16 3v4M3 11h18" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  phone: <path d="M4 5c0 8 7 15 15 15l2-3-4-2-2 2c-2-1-5-4-6-6l2-2-2-4-3 2Z" />,
  shield: <path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3Z" />,
  mobile: <><rect x="4" y="2" width="16" height="20" rx="4" /><path d="M11 18h2" /></>,
  cash: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M9 12h6" /></>,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></>,
  alert: <><path d="M12 9v4" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></>,
  help: <><path d="M12 17h.01" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" /><circle cx="12" cy="12" r="9" /></>,
};

export function Icon({ name, size = 20, color = 'currentColor', fill = 'none', ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={fill === 'none' ? color : 'none'}
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

/* ── screen chrome ───────────────────────────────────────────────────────── */

/** A full screen: content column plus whatever sticky footer it was given. */
export function Screen({ children, className = '' }) {
  return <div className={`mq-screen ${className}`}>{children}</div>;
}

/** Back chevron + caption. `to` overrides the default "one step back". */
export function TopBar({ title, to, right, solid = false }) {
  const navigate = useNavigate();
  return (
    <div className="mq-top">
      <button
        type="button"
        className={`mq-back${solid ? ' mq-back-solid' : ''}`}
        onClick={() => (to ? navigate(to) : navigate(-1))}
        aria-label="Go back"
      >
        <Icon name="back" size={15} color="#201e1d" />
      </button>
      {title && <span className="mq-top-title">{title}</span>}
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}

/** Back chevron + the three-segment signup progress rail. */
export function StepBar({ step, to }) {
  const navigate = useNavigate();
  return (
    <div className="mq-top">
      <button type="button" className="mq-back" onClick={() => navigate(to)} aria-label="Go back">
        <Icon name="back" size={15} color="#201e1d" />
      </button>
      <div className="mq-steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
        {[1, 2, 3].map((n) => <span key={n} className={n <= step ? 'on' : undefined} />)}
      </div>
    </div>
  );
}

/** Sticky action footer. With `summary`, the label sits left of the button. */
export function ActionBar({ summary, children }) {
  return (
    <>
      <div className="mq-bar-space mq-bar-space-action" />
      <div className="mq-bar mq-sticky">
        {summary && (
          <div className="mq-sticky-summary">
            <span style={{ fontSize: 16, fontWeight: 700 }}>{summary.title}</span>
            {summary.note && <span className="mq-sub">{summary.note}</span>}
          </div>
        )}
        {children}
      </div>
    </>
  );
}

const TABS = [
  ['/app', 'home', 'Home'],
  ['/app/shop', 'bag', 'Shop'],
  ['/app/plan', 'calendar', 'Plan'],
  ['/app/wallet', 'wallet', 'Wallet'],
  ['/app/account', 'user', 'You'],
];

export function TabBar() {
  return (
    <>
      <div className="mq-bar-space mq-bar-space-tab" />
      <nav className="mq-bar mq-tabbar">
        {TABS.map(([to, icon, label]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/app'}
            className={({ isActive }) => `mq-tab${isActive ? ' mq-tab-on' : ''}`}
          >
            <Icon name={icon} size={23} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

/* ── small parts ─────────────────────────────────────────────────────────── */

export function Stepper({ value, onDec, onInc, min = 0, max = 6, label }) {
  return (
    <div className="mq-stepper">
      <button type="button" onClick={onDec} disabled={value <= min} aria-label={`One fewer ${label}`}>−</button>
      <span>{value}</span>
      <button type="button" onClick={onInc} disabled={value >= max} aria-label={`One more ${label}`}>+</button>
    </div>
  );
}

/** Sage advisory strip. */
export function Note({ icon, children }) {
  return (
    <div className="mq-note">
      {icon && <Icon name={icon} color="#3d472b" />}
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}

/** A settings-style row: icon, bold label, trailing value or chevron. */
export function ListRow({ icon, label, value, chevron, onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="mq-card mq-card-pad"
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%',
        textAlign: 'left', border: 0, cursor: onClick ? 'pointer' : 'default',
        font: 'inherit', color: 'inherit',
      }}
    >
      {icon && <Icon name={icon} color="#201e1d" />}
      <span style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{label}</span>
      {value && <span className="mq-sub">{value}</span>}
      {chevron && <Icon name="next" size={17} color="#82796a" />}
    </Tag>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="mq-toast" role="status">{message}</div>;
}
