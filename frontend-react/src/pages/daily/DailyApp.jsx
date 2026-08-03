import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DailyProvider, useDaily } from './DailyContext';
import { useAuth } from '../../context/AuthContext';
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
 * Every customer has their own account, so the app is signed-in only — the crate,
 * wallet and orders are all read from the account behind the token. Where the
 * customer was headed is passed along so login can return them to it.
 */
export default function DailyApp() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  return (
    <div className="mq-app">
      <DailyProvider>
        <Shell />
      </DailyProvider>
    </div>
  );
}
