import { NavLink, useNavigate } from 'react-router-dom';
import { useDaily } from './DailyContext';

/* ── icons ───────────────────────────────────────────────────────────────────
   Clean stroked set matching the mobile app design specification. */

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
  'shield-check': <><path d="M12 3l7 3v6c0 4.4-3 8-7 9-4-1-7-4.6-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  mobile: <><rect x="4" y="2" width="16" height="20" rx="4" /><path d="M11 18h2" /></>,
  cash: <><circle cx="12" cy="12" r="9" /><path d="M12 8v8M9 12h6" /></>,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1.5" /><rect x="14" y="4" width="4" height="16" rx="1.5" /></>,
  alert: <><path d="M12 9v4" /><path d="M12 17h.01" /><circle cx="12" cy="12" r="9" /></>,
  help: <><path d="M12 17h.01" /><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7" /><circle cx="12" cy="12" r="9" /></>,
  truck: <><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
  leaf: <path d="M11 20A7 7 0 0 1 4 13c0-4.5 3-8 9-9 4.5 0 7 3.5 7 8 0 4.5-3.5 8-9 8Z M11 20v-7" />,
  heart: <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>,
  cart: <><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  crown: <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 4.8 0 0 1 12 8a4.8 4.8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" /></>,
  gear: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>,
  headset: <><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></>,
  package: <><path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,

  /* Category specific outline icons */
  'cat-milk': <><path d="M9 2h6v3H9z" /><path d="M9 5a4 4 0 0 0-2 3.5V19a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V8.5A4 4 0 0 0 15 5H9z" /><line x1="8" y1="13" x2="16" y2="13" /></>,
  'cat-ghee': <><rect x="6" y="3" width="12" height="3" rx="1.5" /><path d="M6 6h12v12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V6z" /><line x1="6" y1="10" x2="18" y2="10" /><line x1="9" y1="14" x2="15" y2="14" /></>,
  'cat-curd': <><path d="M4 11a8 8 0 0 0 16 0H4z" /><path d="m14 5 5 5" /><path d="M6 19h12" /></>,
  'cat-paneer': <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 12 4 7.5M12 12l8-4.5M12 12v9" /></>,
  'cat-lassi': <><path d="M6 3h12l-2 17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2L6 3z" /><path d="M13 2v6" /><line x1="7" y1="9" x2="17" y2="9" /></>,
  'cat-vegetables': <><path d="M11 20A7 7 0 0 1 4 13c0-4.5 3-8 9-9 4.5 0 7 3.5 7 8 0 4.5-3.5 8-9 8Z" /><path d="M11 20v-7" /></>,
  'cat-all': <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /></>,
};

export function Icon({ name, size = 20, color = 'currentColor', fill = 'none', strokeWidth = 2, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={fill === 'none' ? color : 'none'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name] || <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/* ── Logo Component ──────────────────────────────────────────────────────── */

export function MilquuLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 800,
            fontSize: 21,
            color: '#15251a',
            letterSpacing: '-0.02em',
          }}
        >
          Mil<span style={{ position: 'relative', display: 'inline-block' }}>
            Q
            <svg
              style={{
                position: 'absolute',
                top: -6,
                right: -2,
                width: 12,
                height: 12,
                color: '#22c55e',
              }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.5 2 2 6.5 2 12c4 0 7-3 8-7 1 4 4 7 8 7 0-5.5-4.5-10-10-10z" />
            </svg>
          </span>uu
        </span>
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 21,
            color: '#22c55e',
            marginLeft: 3,
          }}
        >
          Fresh
        </span>
      </div>
      <span
        style={{
          fontSize: 9.5,
          fontWeight: 500,
          color: '#64748b',
          letterSpacing: '0.04em',
          marginTop: 1,
        }}
      >
        Pure • Fresh • Everyday
      </span>
    </div>
  );
}

/* ── Top Bar with Logo & Location & Bell/Cart ─────────────────────────────── */

export function MobileHeader({ rightIcon = 'bell', cartCount = 0 }) {
  const navigate = useNavigate();
  const { areaName } = useDaily();

  return (
    <header className="mq-header">
      <div className="mq-header-inner">
        <MilquuLogo />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <button
            type="button"
            className="mq-location-chip"
            onClick={() => navigate('/app/start/address')}
            aria-label="Change delivery location"
          >
            <Icon name="pin" size={13} color="#a16207" strokeWidth={2.5} />
            <span className="mq-location-text">{areaName || 'Kharghar, Navi Mumbai'}</span>
            <Icon name="down" size={11} color="#64748b" strokeWidth={2.5} />
          </button>

          {rightIcon === 'cart' ? (
            <button
              type="button"
              className="mq-icon-btn"
              onClick={() => navigate('/app/cart')}
              aria-label={`Cart with ${cartCount} items`}
            >
              <Icon name="cart" size={20} color="#1f2937" strokeWidth={1.8} />
              {cartCount > 0 && (
                <span className="mq-cart-badge">{cartCount}</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              className="mq-icon-btn"
              onClick={() => navigate('/app/account')}
              aria-label="Notifications"
            >
              <Icon name="bell" size={20} color="#1f2937" strokeWidth={1.8} />
              <span className="mq-bell-dot" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Screen Chrome ───────────────────────────────────────────────────────── */

export function Screen({ children, className = '' }) {
  return <div className={`mq-screen ${className}`}>{children}</div>;
}

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
        <Icon name="back" size={15} color="#1f2937" />
      </button>
      {title && <span className="mq-top-title">{title}</span>}
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}

export function StepBar({ step, to }) {
  const navigate = useNavigate();
  return (
    <div className="mq-top">
      <button type="button" className="mq-back" onClick={() => navigate(to)} aria-label="Go back">
        <Icon name="back" size={15} color="#1f2937" />
      </button>
      <div className="mq-steps" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
        {[1, 2, 3].map((n) => <span key={n} className={n <= step ? 'on' : undefined} />)}
      </div>
    </div>
  );
}

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
            <Icon name={icon} size={22} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

/* ── Small Parts ─────────────────────────────────────────────────────────── */

export function Stepper({ value, onDec, onInc, min = 0, max = 6, label }) {
  return (
    <div className="mq-stepper">
      <button type="button" onClick={onDec} disabled={value <= min} aria-label={`One fewer ${label}`}>−</button>
      <span>{value}</span>
      <button type="button" onClick={onInc} disabled={value >= max} aria-label={`One more ${label}`}>+</button>
    </div>
  );
}

export function Note({ icon, children }) {
  return (
    <div className="mq-note">
      {icon && <Icon name={icon} color="#6b5313" />}
      <span style={{ flex: 1 }}>{children}</span>
    </div>
  );
}

export function ListRow({ icon, label, value, chevron, onClick, sublabel }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className="mq-list-row"
    >
      {icon && <div className="mq-row-icon">{icon}</div>}
      <div className="mq-row-text">
        <span className="mq-row-title">{label}</span>
        {sublabel && <span className="mq-row-subtitle">{sublabel}</span>}
      </div>
      {value && <span className="mq-row-value">{value}</span>}
      {chevron && <Icon name="next" size={16} color="#94a3b8" />}
    </Tag>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="mq-toast" role="status">{message}</div>;
}
