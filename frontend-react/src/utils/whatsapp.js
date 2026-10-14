// WhatsApp click-to-chat helpers. The business number is the one already used by
// the floating WhatsApp button and the site footer.
import { WHATSAPP } from '../data/schemas.js';

export const WHATSAPP_DISPLAY = '+91 87670 67884';
export const WHATSAPP_NUMBER = WHATSAPP || '918767067884';

/** wa.me link with an optional pre-filled message. */
export const buildWhatsAppUrl = (message = '') =>
  `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodeURIComponent(message)}` : ''}`;

export const getWhatsAppUrl = buildWhatsAppUrl;
