import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Guards a single app screen.
 *
 * The app itself is open — a phone visitor can see the welcome screen, the
 * free sample, the shop and a product without an account, which is what keeps
 * the acquisition funnel on mobile. This wraps only the screens that read or
 * write a real account: the address, confirming a plan, the wallet, orders.
 *
 * Where the visitor was headed is passed to login so they come back to the step
 * they were on rather than to the top of the app.
 *
 * It lives in its own module because the router loads DailyApp lazily, and a
 * lazy chunk cannot supply a component the router needs while matching routes.
 */
export default function RequireAccount({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/app/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return children;
}
