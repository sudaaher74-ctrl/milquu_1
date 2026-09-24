import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-9S1HY0WW38';

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    try {
      ReactGA.initialize(GA_MEASUREMENT_ID);
      console.log('Google Analytics initialized.');
    } catch (err) {
      console.warn('ReactGA init skipped:', err);
    }
  }
};

export const trackPageView = (path) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
  if (GA_MEASUREMENT_ID) {
    try {
      ReactGA.send({ hitType: 'pageview', page: path });
    } catch (e) {
      // ignore
    }
  }
};

export const trackEvent = (category, action, label = '') => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
  if (GA_MEASUREMENT_ID) {
    try {
      ReactGA.event({
        category,
        action,
        label,
      });
    } catch (e) {
      // ignore
    }
  }
};

