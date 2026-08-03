// Phone numbers are the customer's sign-in identifier, so the value stored and
// the value looked up have to agree exactly. Everything is normalised to the
// bare 10 digits: a customer who signed up as +91 98200 98200 can sign back in
// as 09820098200 and land on the same account.

/** Strip country code, leading zero, spaces and punctuation. */
export const normalisePhone = (value) => {
  if (value === undefined || value === null) return '';
  const digits = String(value).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
};

/** True for a 10-digit Indian mobile number. */
export const isValidPhone = (value) => /^[6-9]\d{9}$/.test(normalisePhone(value));

/** True when the string looks like an email rather than a phone number. */
export const looksLikeEmail = (value) => String(value || '').includes('@');
