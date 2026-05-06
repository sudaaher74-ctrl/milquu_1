# Milqu Fresh

Milqu Fresh is a Node.js + Express + MongoDB storefront and admin dashboard for dairy, grocery, subscription, delivery, analytics, export, and reporting workflows.

## What’s Included

- Advanced revenue and profit analytics
- Premium admin dashboard cards and Chart.js visualizations
- PDF / Excel / CSV exports for orders, revenue, customers, products, inventory, GST, subscriptions, and analytics
- Daily / weekly / monthly report generation with MongoDB + local JSON storage
- Delivery assignment, live tracking hooks, delivery OTP support, and performance analytics
- Customer loyalty foundations: wallet, reward points, cashback, VIP levels
- Smart inventory alerts, expiry tracking, movement logs, and restock recommendations
- Socket.IO live updates for orders, stock, revenue, and delivery tracking
- PWA basics: manifest, service worker cache, installability, offline fallback
- SEO basics: schema, OG tags, sitemap, robots
- Admin activity logs and login history

## Updated Folder Structure

```text
api/
  index.js

frontend/
  admin.html
  index.html
  admin.css
  style.css
  manifest.webmanifest
  sitemap.xml
  sw.js
  js/
    admin-analytics.js
    admin-core.js
    admin-delivery.js
    admin-export.js
    admin-inventory-enhanced.js
    admin-notifications-enhanced.js
    admin-panels.js
    admin-realtime.js
    config.js
    storefront-data.js
    storefront-ui.js
  images/

milqu-backend/
  jobs/
    report-cron.js
  middleware/
    auth.js
    rateLimit.js
  models/
    ActivityLog.js
    Admin.js
    AnalyticsHistory.js
    Area.js
    Content.js
    DeliveryTracking.js
    Expense.js
    InventoryLog.js
    LoyaltyAccount.js
    Message.js
    Notification.js
    Order.js
    Product.js
    Report.js
    Subscription.js
  routes/
    admin.js
    analytics.js
    areas.js
    content.js
    customers.js
    expenses.js
    export.js
    inventory.js
    messages.js
    notifications.js
    orders.js
    products.js
    reports.js
    subscriptions.js
  services/
    activity-log.js
    analytics-service.js
    date-range.js
    export-service.js
    report-service.js
    report-storage.js
  storage/
    reports/
  utils/
    cloudinary.js
    default-products.js
    public-id.js
    sanitize.js
    whatsapp.js
  server.js

package.json
vercel.json
```

## Required npm Packages

Core backend:

- `express`
- `mongoose`
- `jsonwebtoken`
- `bcryptjs`
- `helmet`
- `compression`
- `cors`
- `socket.io`
- `twilio`
- `node-cron`

Reporting / export:

- `exceljs`
- `jspdf`
- `jspdf-autotable`
- `qrcode`

Media / uploads:

- `multer`
- `cloudinary`
- `multer-storage-cloudinary`

Development:

- `nodemon`

## Install

```bash
npm install
npm run dev
```

Production:

```bash
npm install
npm start
```

## Environment Variables

Minimum:

```env
NODE_ENV=production
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/milqu_fresh
JWT_SECRET=replace-with-a-long-random-secret
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
ADMIN_AUTH_DISABLED=false
```

Admin / security:

```env
INITIAL_ADMIN_TOKEN=optional-first-admin-setup-token
```

Reports / cron / storage:

```env
CRON_TIMEZONE=Asia/Kolkata
REPORT_RETENTION_DAYS=90
REPORTS_STORAGE_DIR=./milqu-backend/storage/reports
DISABLE_NODE_CRON=false
```

Operational defaults:

```env
DEFAULT_PACKAGING_COST=2
DEFAULT_DELIVERY_COST=8
```

WhatsApp / Twilio:

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ADMIN_WHATSAPP_NUMBER=whatsapp:+91XXXXXXXXXX
ENABLE_CUSTOMER_WHATSAPP=false
```

Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Backend API Overview

Analytics:

- `GET /api/analytics/revenue`
- `GET /api/analytics/revenue/detailed`
- `GET /api/analytics/dashboard-summary`
- `GET /api/analytics/orders`
- `GET /api/analytics/products`
- `GET /api/analytics/customers`
- `GET /api/analytics/expenses`
- `GET /api/analytics/areas`
- `GET /api/analytics/delivery`
- `GET /api/analytics/ai-insights`

Reports:

- `POST /api/reports/generate`
- `GET /api/reports`
- `GET /api/reports/:reportId`
- `GET /api/reports/latest/:type`
- `POST /api/reports/:reportId/download-log`
- `POST /api/reports/cleanup`
- `POST /api/reports/cron/daily`
- `POST /api/reports/cron/weekly`
- `POST /api/reports/cron/monthly`

Exports:

- `GET /api/export/orders`
- `GET /api/export/revenue`
- `GET /api/export/customers`
- `GET /api/export/products`
- `GET /api/export/inventory`
- `GET /api/export/gst`
- `GET /api/export/subscriptions`
- `GET /api/export/analytics`

Orders / delivery:

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:orderId`
- `PATCH /api/orders/:orderId/status`
- `PATCH /api/orders/:orderId/delivery-status`
- `PATCH /api/orders/:orderId/assign`
- `POST /api/orders/:orderId/delivery-otp`
- `POST /api/orders/:orderId/verify-otp`
- `PATCH /api/orders/:orderId/location`
- `POST /api/orders/bulk-assign`

Admin / security:

- `POST /api/admin/register`
- `POST /api/admin/login`
- `GET /api/admin/me`
- `PUT /api/admin/credentials`
- `GET /api/admin/activity-logs`
- `GET /api/admin/login-history`

## Frontend Integration Notes

- The admin dashboard reads all analytics/export/report data directly from `/api/*` via `frontend/js/admin-*.js`
- `frontend/js/admin-export.js` uses `jsPDF`, `jsPDF-AutoTable`, and `ExcelJS` in-browser
- `frontend/js/admin-realtime.js` listens for:
  - `new_order`
  - `order_status_changed`
  - `revenue_updated`
  - `stock_updated`
  - `delivery_tracking_updated`
  - `sub_status_update`

## Report Storage

Reports are stored in two places:

- MongoDB: report metadata, summary payload, history, download logs
- Local JSON files: `milqu-backend/storage/reports/<year>/<month>/<reportId>.json`

Cleanup:

- Local Node server uses `node-cron`
- Vercel uses the cron routes configured in `vercel.json`

## Dummy Analytics Data

If you want demo charts on a fresh database, seed a few:

- orders across multiple days and statuses
- expenses in `milk_purchase`, `packaging`, `delivery_fuel`, `staff_salary`, `electricity`
- products with `costPrice`, `stock`, `lowStockThreshold`, `expiryDays`
- subscriptions across `active`, `paused`, `cancelled`
- admins with `manager` and `delivery_staff` roles

Example order totals that work well for testing:

- 12 delivered orders across 7 days
- 3 pending orders
- 2 cancelled orders
- 1 failed order
- mixed totals from `₹120` to `₹1,450`

## Deployment

### Render

Best fit if you want:

- long-running Node server
- `node-cron` local scheduling
- Socket.IO on a persistent instance
- local JSON report storage on attached disk

Steps:

1. Create a Web Service from this repo
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add all env vars listed above
5. Mount a persistent disk and point `REPORTS_STORAGE_DIR` to it
6. Open `/api/health`
7. Open `/admin`

### Vercel

Best fit if you want:

- serverless API
- static frontend hosting
- Vercel cron triggers instead of local `node-cron`

Notes:

- `vercel.json` already rewrites `/api/*` to `api/index.js`
- `vercel.json` already defines daily / weekly / monthly cron routes
- local report storage is ephemeral on Vercel, so MongoDB remains the durable source of truth

Steps:

1. Import the repo into Vercel
2. Set all env vars
3. Deploy
4. Check `/api/health`
5. Verify cron routes are enabled

## Production Checklist

- Set a strong `JWT_SECRET`
- Keep `ADMIN_AUTH_DISABLED=false`
- Set `CORS_ORIGIN`
- Use MongoDB Atlas or managed MongoDB
- Configure Twilio only if WhatsApp automation is needed
- Configure Cloudinary if image uploads are enabled
- Verify `/api/health`
- Generate a daily report from `/admin`
- Confirm local report files are being written on Render / local server
- Test service worker registration in the browser

## Notes

- The current implementation adds strong foundations for analytics, exports, reports, delivery tracking, loyalty, admin logging, and PWA support.
- Some larger business modules like full coupon/blog systems, complete push-subscription management, deep invoice QR workflows, and backup/restore orchestration still need a dedicated second phase plus third-party credentials.
