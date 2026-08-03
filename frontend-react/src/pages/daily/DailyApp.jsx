import { Outlet } from 'react-router-dom';
import { DailyProvider, useDaily } from './DailyContext';
import { Toast } from './ui';
import './daily.css';

/** The toast lives outside the routed screen so it survives navigation. */
function Shell() {
  const { toast, loading } = useDaily();
  return (
    <div className="mq-shell">
      {loading ? <Loading /> : <Outlet />}
      <Toast message={toast} />
    </div>
  );
}

function Loading() {
  return (
    <div className="mq-screen" style={{ alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <span className="mq-num" style={{ fontSize: 22 }}>Milquu</span>
      <span className="mq-sub">Loading your account…</span>
    </div>
  );
}

/**
 * The app is what a phone visitor gets, signed in or not.
 *
 * Browsing — the welcome screen, the free sample, the shop, a product — needs
 * no account. Anything that touches a real account does: saving an address,
 * confirming a plan, the wallet, orders. Those screens wrap themselves in
 * <RequireAccount> rather than the whole app being walled off, so a first-time
 * visitor can see what they are signing up for.
 */
export default function DailyApp() {
  return (
    <div className="mq-app">
      <DailyProvider>
        <Shell />
      </DailyProvider>
    </div>
  );
}
