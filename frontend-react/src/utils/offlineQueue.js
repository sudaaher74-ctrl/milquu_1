import { eventBus } from './eventBus';

/**
 * offlineQueue — IndexedDB-backed queue for write operations that failed while
 * offline. When connectivity restores, queued requests are replayed in order.
 *
 * Storage: IndexedDB database "milquu-sync", object store "pending-requests".
 * Each entry stores the full Axios config needed to replay the request.
 *
 * Events emitted on eventBus:
 *   SYNC_QUEUE_CHANGE  → { count: number }  whenever the queue size changes
 *   SYNC_ITEM_RESULT   → { id, ok, error? }  after each replay attempt
 */

const DB_NAME = 'milquu-sync';
const STORE_NAME = 'pending-requests';
const DB_VERSION = 1;

// ─── IndexedDB helpers ────────────────────────────────────────────────────────

/** Open (or create) the database. */
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Run a read-write transaction and return a promise for its completion. */
function withStore(mode, callback) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const result = callback(store);
        tx.oncomplete = () => resolve(result);
        tx.onerror = () => reject(tx.error);
      })
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Enqueue a failed write request for later replay.
 * @param {import('axios').InternalAxiosRequestConfig} config - Axios request config
 * @returns {Promise<void>}
 */
export async function enqueue(config) {
  // Strip non-cloneable fields (functions, circular refs, Axios internals)
  const entry = {
    timestamp: Date.now(),
    method: config.method,
    url: config.url,
    baseURL: config.baseURL,
    data: config.data,
    params: config.params,
    headers: {
      // Only persist the auth header; the rest are rebuilt by Axios
      Authorization: config.headers?.Authorization,
      'Content-Type': config.headers?.['Content-Type'] || 'application/json',
    },
    // Human-readable label for the UI
    label: describeRequest(config),
  };

  await withStore('readwrite', (store) => store.add(entry));
  emitCount();
}

/**
 * Get all pending entries (oldest first).
 * @returns {Promise<Array>}
 */
export async function getAll() {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      })
  );
}

/**
 * Remove a single entry by id.
 * @param {number} id
 */
export async function remove(id) {
  await withStore('readwrite', (store) => store.delete(id));
  emitCount();
}

/**
 * Clear the entire queue.
 */
export async function clearAll() {
  await withStore('readwrite', (store) => store.clear());
  emitCount();
}

/**
 * Get current queue count.
 * @returns {Promise<number>}
 */
export async function count() {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const req = tx.objectStore(STORE_NAME).count();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

/**
 * Replay all queued requests in order using the provided Axios instance.
 * Successfully replayed items are removed; failures stay in the queue.
 *
 * @param {import('axios').AxiosInstance} axiosInstance
 * @returns {Promise<{ synced: number, failed: number }>}
 */
export async function replayAll(axiosInstance) {
  const items = await getAll();
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    try {
      await axiosInstance.request({
        method: item.method,
        url: item.url,
        baseURL: item.baseURL,
        data: item.data,
        params: item.params,
        headers: item.headers,
        // Mark replayed requests so the error interceptor doesn't re-queue them
        _fromSync: true,
      });
      await remove(item.id);
      synced++;
      eventBus.emit('SYNC_ITEM_RESULT', { id: item.id, ok: true });
    } catch (err) {
      failed++;
      eventBus.emit('SYNC_ITEM_RESULT', {
        id: item.id,
        ok: false,
        error: err.response?.data?.message || err.message,
      });
      // If we get a network error again, stop trying — still offline
      if (!err.response) break;
      // If it's a server error (4xx/5xx), remove it to avoid infinite retries
      // of bad data — except 5xx which might be transient
      if (err.response.status >= 400 && err.response.status < 500) {
        await remove(item.id);
      }
    }
  }

  emitCount();
  return { synced, failed };
}

// ─── Internals ────────────────────────────────────────────────────────────────

/** Emit the current queue count so UI components can react. */
async function emitCount() {
  try {
    const c = await count();
    eventBus.emit('SYNC_QUEUE_CHANGE', { count: c });
  } catch {
    // IndexedDB might not be available (private browsing edge cases)
  }
}

/** Build a short human-readable description of a request for the queue UI. */
function describeRequest(config) {
  const method = (config.method || 'post').toUpperCase();
  const url = config.url || '';

  // Map common admin API paths to friendly labels
  const labels = {
    '/api/erp/expenses': 'Add Expense',
    '/api/erp/wastages': 'Record Wastage',
    '/api/erp/purchases': 'Add Purchase',
    '/api/erp/procurements': 'Add Procurement',
    '/api/erp/delivery-staff': 'Update Delivery Staff',
    '/api/products': method === 'POST' ? 'Add Product' : 'Update Product',
    '/api/admin/settings': 'Update Settings',
    '/api/admin/employees': 'Update Employee',
    '/api/subscriptions': method === 'POST' ? 'Create Subscription' : 'Update Subscription',
    '/api/free-sample': 'Update Free Sample',
    '/api/erp/orders': 'Update Order',
  };

  for (const [path, label] of Object.entries(labels)) {
    if (url.includes(path)) return label;
  }

  return `${method} ${url.split('/api/')[1] || url}`;
}

// Boot: emit initial count so the UI can render the badge immediately
if (typeof indexedDB !== 'undefined') {
  emitCount();
}
