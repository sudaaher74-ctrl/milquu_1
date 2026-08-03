// Money is stored in rupees across the existing models (walletBalance,
// totalPrice, WalletTransaction.amount) and back-compat rules that out as a
// thing to change. What we can do is never let a float accumulate: every sum
// is built in integer paise and converted back once, at the end.

/** Rupees (possibly fractional) -> integer paise. */
export const toPaise = (rupees) => Math.round(Number(rupees || 0) * 100);

/** Integer paise -> rupees, to two decimal places. */
export const toRupees = (paise) => Math.round(Number(paise || 0)) / 100;

/**
 * Sum `{ price, quantity }` rows without ever adding two floats together.
 * Returns integer paise.
 */
export const sumItemsPaise = (items = []) =>
  items.reduce((total, item) => total + toPaise(item.price) * Number(item.quantity || 0), 0);

/** Round a rupee amount to 2dp, for values that came from elsewhere. */
export const roundRupees = (rupees) => toRupees(toPaise(rupees));
