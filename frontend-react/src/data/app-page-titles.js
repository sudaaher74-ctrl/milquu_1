// Shared by the app shell and build-time HTML, so direct visits and SPA
// navigation use the same titles without changing the desktop site layout.
export const appPageTitles = {
  '/app': 'Daily Milk & Dairy Delivery | MilQuuFresh',
  '/app/shop': 'Dairy Shop | MilQuuFresh',
  '/app/cart': 'Your Shopping Cart | MilQuuFresh',
  '/app/account': 'Your Account | MilQuuFresh',
  '/app/plan': 'Your Milk Subscription | MilQuuFresh',
  '/app/wallet': 'Your Wallet | MilQuuFresh',
  '/app/help': 'Help & Refunds | MilQuuFresh',
  '/app/login': 'Sign In to Your Account | MilQuuFresh',
  '/app/join': 'Create Your Account | MilQuuFresh',
  '/app/start': 'Start Your Daily Milk Plan | MilQuuFresh',
  '/app/start/sample': 'Request a Free Milk Sample | MilQuuFresh',
  '/app/start/milk': 'Choose Milk for Your Plan | MilQuuFresh',
  '/app/start/rhythm': 'Choose Your Delivery Schedule | MilQuuFresh',
  '/app/start/address': 'Your Delivery Address | MilQuuFresh',
  '/app/start/review': 'Review Your Milk Plan | MilQuuFresh',
  '/app/start/done': 'Milk Plan Confirmation | MilQuuFresh',
  '/app/checkout': 'Complete Your Dairy Order | MilQuuFresh',
  '/app/track': 'Track Your Delivery | MilQuuFresh',
  '/app/plan/pause': 'Pause Your Milk Plan | MilQuuFresh',
  '/app/plan/cancel': 'Cancel Your Milk Plan | MilQuuFresh',
};

export function getAppPageTitle(pathname) {
  const path = pathname.split(/[?#]/)[0].replace(/\/+$/, '');
  return appPageTitles[path] || 'MilQuuFresh App';
}
