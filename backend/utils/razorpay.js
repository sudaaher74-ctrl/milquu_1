import Razorpay from 'razorpay';
import crypto from 'crypto';

const secret = () => process.env.RAZORPAY_SECRET || process.env.RAZORPAY_KEY_SECRET;

export const isGatewayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && secret());

export const razorpayClient = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: secret()
});

/** Timing-safe check that Razorpay signed this order/payment pair. */
export const isValidPaymentSignature = (orderId, paymentId, signature) => {
  if (typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') {
    return false;
  }
  const expected = Buffer.from(
    crypto.createHmac('sha256', secret()).update(`${orderId}|${paymentId}`).digest('hex'),
    'utf8'
  );
  const provided = Buffer.from(signature, 'utf8');
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected);
};
