// In-process schedule for the nightly subscription run.
//
// This is a safety net, not the primary scheduler. A single Render web service
// restarts on deploy and can sleep, and a missed night means no milk — so the
// authoritative run is the Render cron job in render.yaml, which invokes
// cron/subscriptionEngine.js directly. Both are safe to run: the engine's
// (subscription, deliveryDate) guard means whichever gets there second is a
// no-op.

import cron from 'node-cron';
import logger from '../utils/logger.js';
import { runSubscriptionEngine } from './subscriptionEngine.js';

// 21:30 IST, after the 21:00 cut-off closes tomorrow's crate. Running before
// the cut-off would build the order from a plan the customer could still
// change. node-cron applies the timezone itself, so this is not affected by
// the host clock being UTC.
const NIGHTLY = '30 21 * * *';
const TIMEZONE = 'Asia/Kolkata';

let task = null;

export const startScheduler = () => {
  // Opt out where a separate worker owns the run, so it does not happen twice.
  if (process.env.DISABLE_IN_PROCESS_CRON === 'true') {
    logger.info('[scheduler] in-process cron disabled by DISABLE_IN_PROCESS_CRON');
    return null;
  }
  if (task) return task;

  task = cron.schedule(
    NIGHTLY,
    async () => {
      try {
        const summary = await runSubscriptionEngine();
        logger.info(`[scheduler] nightly run complete: ${JSON.stringify(summary)}`);
      } catch (error) {
        logger.error(`[scheduler] nightly run failed: ${error.message}`);
      }
    },
    { scheduled: true, timezone: TIMEZONE }
  );

  logger.info(`[scheduler] subscription engine scheduled at ${NIGHTLY} ${TIMEZONE}`);
  return task;
};

export const stopScheduler = () => {
  if (task) {
    task.stop();
    task = null;
  }
};
