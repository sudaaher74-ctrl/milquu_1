import ReactGA from 'react-ga4';

export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (measurementId) {
    ReactGA.initialize(measurementId);
    console.log('Google Analytics initialized.');
  } else {
    console.warn('GA Measurement ID not found. Analytics will not track.');
  }
};

export const trackPageView = (path) => {
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

export const trackEvent = (category, action, label = '') => {
  if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
    });
  }
};
