import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

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
 * Sends phone visitors from `/` into the Milquu app; desktop keeps the
 * marketing homepage. The viewport is read once on mount so resizing a desktop
 * window narrow never bounces someone mid-session.
 *
 * `/?site=web` opts out, so the marketing homepage stays reachable on a phone.
 */
export default function MobileHomeGate({ children }) {
  const [params] = useSearchParams();
  const [isPhone] = useState(isPhoneViewport);

  if (isPhone && params.get('site') !== 'web') return <Navigate to="/app" replace />;
  return children;
}
