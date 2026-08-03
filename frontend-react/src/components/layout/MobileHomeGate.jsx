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
 * On a phone, the Milquu app *is* the site. Every phone visitor goes to /app —
 * signed in they land on their crate, signed out they get the app's own
 * welcome, free-sample and shop screens and are asked to sign in only when
 * they commit to something (an address, a plan, the wallet).
 *
 * This used to redirect only signed-in customers, leaving everyone else on the
 * marketing homepage. The app's onboarding now carries that funnel instead.
 *
 * The viewport is read once on mount so resizing a desktop window narrow never
 * bounces someone mid-session. `/?site=web` opts out entirely, which is how you
 * reach the marketing homepage from a phone.
 */
export default function MobileHomeGate({ children }) {
  const [params] = useSearchParams();
  const [isPhone] = useState(isPhoneViewport);

  if (isPhone && params.get('site') !== 'web') {
    return <Navigate to="/app" replace />;
  }
  return children;
}
