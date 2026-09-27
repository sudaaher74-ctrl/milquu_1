// User-supplied text must never be dropped into a RegExp as-is: a vendor called
// "Gokul (Wholesale)" or an email with a "+" in it changes the pattern's meaning,
// and a crafted value can make the match hang. Escape it first.

/** Escape every RegExp metacharacter in `value`. */
export const escapeRegex = (value) => String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Case-insensitive whole-string match for `value`, safe for any input. */
export const exactCaseInsensitive = (value) => new RegExp(`^${escapeRegex(String(value ?? '').trim())}$`, 'i');
