import { useEffect, useState } from 'react';
import api from './api';

// The business details printed on receipts and vouchers. Fetched once per
// page load and shared; the defaults are what the receipts printed before the
// details were editable, so nothing prints blank while loading.
export const DEFAULT_BUSINESS = {
  businessName: 'MilQuu Fresh',
  tagline: 'Pure Farm Fresh Milk & Dairy',
  supportEmail: 'support@milquufresh.in',
  supportPhone: '+91 87670 67884',
  address: 'Panvel, Navi Mumbai, Maharashtra',
  gstin: '',
  fssaiLicense: ''
};

let cached = null;
let inflight = null;
const listeners = new Set();

const load = () => {
  if (!inflight) {
    inflight = api.get('/api/admin/settings')
      .then(({ data }) => {
        cached = { ...DEFAULT_BUSINESS, ...(data?.business || {}) };
        listeners.forEach((fn) => fn(cached));
        return cached;
      })
      .catch(() => {
        inflight = null;
        return cached || DEFAULT_BUSINESS;
      });
  }
  return inflight;
};

/** Call after saving settings so every open page picks up the change. */
export const setBusinessSettings = (business) => {
  cached = { ...DEFAULT_BUSINESS, ...business };
  listeners.forEach((fn) => fn(cached));
};

export const useBusinessSettings = () => {
  const [business, setBusiness] = useState(cached || DEFAULT_BUSINESS);
  useEffect(() => {
    listeners.add(setBusiness);
    if (!cached) load();
    return () => listeners.delete(setBusiness);
  }, []);
  return business;
};
