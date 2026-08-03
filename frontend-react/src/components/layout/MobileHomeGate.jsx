import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/** Tailwind's `md` breakpoint, which the rest of the layout already switches on. */
const PHONE_MAX = 767;

/**
 * A zero width means the page has no layout yet (hidden tab, prerender). Treat
 * that as "not a phone" so a desktop visitor is never misrouted.
 */
const isPhoneViewport = () => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width > 0 && width <= PHONE_MAX;
};

/**
 * Sends signed-in customers on a phone straight into the Milquu app — that is
 * where their crate, plan and wallet live.
 *
 * Signed-out visitors keep the marketing homepage and its free-sample funnel:
 * the app is account-only, so redirecting them would put a login wall in front
 * of people who have never bought anything.
 *
 * The viewport is read once on mount so resizing a desktop window narrow never
 * bounces someone mid-session. `/?site=web` opts out entirely.
 */
export default function MobileHomeGate({ children }) {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const [isPhone] = useState(isPhoneViewport);

  if (isPhone && user && params.get('site') !== 'web') {
    return <Navigate to="/app" replace />;
  }
  return children;
}
