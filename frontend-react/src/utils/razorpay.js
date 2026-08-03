// Wallet top-up through Razorpay.
//
// The server is the authority on the amount: create-recharge-order returns the
// order it actually created, and the wallet is credited from the amount
// Razorpay charged, never from anything sent back by this file. So the amount
// here is a request, not a claim.

import api from './api';

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

/** Load the Razorpay checkout script once, reusing it on later calls. */
export const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export class RechargeError extends Error {}

/**
 * Top up the signed-in customer's wallet.
 *
 * Resolves with the new balance once the server has verified the payment
 * signature and credited the account. Rejects with a RechargeError carrying a
 * message worth showing; resolves `null` if the customer closed the sheet.
 */
export const rechargeWallet = async ({ amount, user }) => {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw new RechargeError('Enter an amount to add');
  }

  const ready = await loadRazorpay();
  if (!ready) {
    throw new RechargeError('Could not reach Razorpay. Check your connection and try again.');
  }

  let order;
  try {
    ({ data: order } = await api.post('/api/users/wallet/create-recharge-order', { amount: value }));
  } catch (err) {
    throw new RechargeError(err.response?.data?.message || 'Could not start the payment.');
  }

  if (!order?.id) throw new RechargeError('Could not start the payment.');

  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'Milquu',
      description: 'Wallet top-up',
      order_id: order.id,
      handler: async (response) => {
        try {
          // Only the three Razorpay fields are sent. The amount is deliberately
          // not — the server reads it from the Razorpay order.
          const { data } = await api.post('/api/users/wallet/recharge', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          resolve(data);
        } catch (err) {
          reject(new RechargeError(err.response?.data?.message || 'We could not verify that payment.'));
        }
      },
      // Closing the sheet is not a failure — nothing was charged.
      modal: { ondismiss: () => resolve(null) },
      prefill: {
        name: user?.name,
        email: user?.email || undefined,
        contact: user?.phone,
      },
      theme: { color: '#56633f' },
    });

    checkout.open();
  });
};
