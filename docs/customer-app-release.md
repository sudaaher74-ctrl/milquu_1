# Customer app release — deployment notes

Everything the customer app needs to work end to end for many concurrent
customers: sign up with a phone number, set an address, choose a plan, pay into
the wallet, and have milk delivered every morning automatically.

## Deploy order

1. **Rotate `JWT_SECRET` on Render** to a 64+ character random value. The
   current one is 27 characters.

   ```
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

   **This signs every existing user out**, including admin and delivery staff.
   They sign back in with the same credentials. Do it during a quiet window,
   and tell the delivery team before the morning round, not during it.

2. **Set `CORS_ORIGIN`** to the real frontend origin. `render.yaml` currently
   declares `https://milquu-frontend.onrender.com`, but the brief says the
   frontend is on Vercel — confirm which is live and correct the file.
   Comma-separated if there is more than one.

3. **Deploy the backend**, then run the migration (below).

4. **Deploy the frontend.**

5. **Confirm the cron service** `milquu-subscription-engine` exists in Render
   and is scheduled for `0 16 * * *` (UTC) = 21:30 IST.

## Migration

Dry run first — it changes nothing and prints exactly what it would do:

```
cd backend
node seeder/migrate.js
node seeder/migrate.js --apply
```

It is idempotent and safe to re-run. It:

- **Rebuilds the `email` index.** `email` used to be `required` and
  non-sparse-unique. It is now optional and sparse-unique, so customers can
  sign up with only a phone number. Changing the schema does not rebuild the
  index, so the old one must be dropped or the second account without an email
  collides on `null`.
- **Normalises phone numbers** to bare 10 digits, since the phone number is now
  the sign-in identifier. Duplicates and unusable numbers are **reported, not
  resolved** — two accounts sharing a number is a business decision.
- **Parses legacy `address` strings** into the structured `deliveryAddress`,
  but only where the locality is unambiguous. Anything else is left alone and
  the customer is sent through the address screen on first open, which is the
  correct outcome rather than a broken state. Never guess an area: the wrong
  locality sends a van to the wrong suburb.
- **Recomputes `dailyTotal`/`monthlyTotal`** on every live subscription from
  the Product collection. These are what the engine charges from, and they used
  to be whatever the client sent — usually nothing, leaving the daily cost
  `NaN`.
- **Reports milks with no `planPrice`.** It does not invent a discount; an
  unset `planPrice` bills at the one-off rate, which is a pricing decision for
  someone to make. Set them in the admin product editor or re-run the seeder.

## The nightly engine

`runSubscriptionEngine` was imported in `server.js` and never called. It now
runs from two places, and both are safe:

| | |
|---|---|
| **Render cron** (authoritative) | `node cron/subscriptionEngine.js` at 21:30 IST |
| **In-process** (safety net) | `node-cron` in the web service, same time |

Set `DISABLE_IN_PROCESS_CRON=true` on the web service if you would rather the
cron job own it alone. Running both is harmless: the engine claims a
`SubscriptionDelivery` row unique on `(subscription, deliveryDate)` before any
money moves, so whichever run arrives second is a no-op rather than a second
charge.

**21:30 IST is deliberately after the 21:00 IST cut-off** that closes changes to
tomorrow's crate. Running it earlier would build the order from a plan the
customer could still change.

Recovery for a missed night:

```
POST /api/admin/subscription-engine/run    { "date": "2026-08-05" }   # admin only
```

or `node cron/subscriptionEngine.js` directly. Both are idempotent.

## Verifying after deploy

```
cd backend && npx vitest run
```

74 tests, including integration coverage against a real database for the
acceptance criteria: one order and one debit per day, no duplicate on a second
run, skipped days costing nothing, auto-pause on a short balance, and two
customers on one browser seeing only their own data.

## Known issues, not addressed here

- `frontend-react` does not lint clean — 300 pre-existing problems at the time
  of this branch. This work adds none and fixes a few in the files it touches.
- The engine still only logs a simulated SMS. Out of scope per the brief.
