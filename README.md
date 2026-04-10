# 🌿 Milqu Fresh — Deployment & Backend Guide

## What this backend does
- Saves every **order** from the checkout page → MongoDB
- Saves every **subscription** from the subscribe page → MongoDB
- Saves every **contact message** → MongoDB
- Provides an **Admin API** so your admin dashboard reads live data from MongoDB

## ✅ Production Checklist
- Set `NODE_ENV=production`
- Set a strong `JWT_SECRET`
- Keep `ADMIN_AUTH_DISABLED=false`
- Set `CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com`
- Use MongoDB Atlas or another managed MongoDB instance
- Open `/admin` after deploy and create the first admin account
- Do not run `clear-db`, `seed-admin`, or `seed-areas` unless you intentionally set their confirmation env vars

---

## 📁 File Structure

```
milqu-backend/
├── server.js                  ← Main entry point
├── .env                       ← Your MongoDB URL & port
├── package.json
├── models/
│   ├── Order.js               ← Order schema
│   ├── Subscription.js        ← Subscription schema
│   └── Message.js             ← Contact message schema
├── routes/
│   ├── orders.js              ← /api/orders
│   ├── subscriptions.js       ← /api/subscriptions
│   └── messages.js            ← /api/messages
└── frontend-api-connector.js  ← Paste this into your script.js
```

---

## 🚀 Step-by-Step Setup

### Step 1 — Install Node.js
Download from https://nodejs.org (choose the LTS version)

### Step 2 — Install MongoDB
**Option A (Local MongoDB):**
Download from https://www.mongodb.com/try/download/community

**Option B (Free Cloud — Recommended):**
1. Go to https://www.mongodb.com/atlas
2. Create a free account → Create a free cluster
3. Click "Connect" → Copy your connection string
4. It looks like: `mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/`

### Step 3 — Configure `.env`
Open the `.env` file and set your MongoDB URL:

```env
NODE_ENV=production

# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/milqu_fresh

# OR MongoDB Atlas (cloud):
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/milqu_fresh

JWT_SECRET=replace-this-with-a-long-random-secret
PORT=5000
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
ADMIN_AUTH_DISABLED=false
```

### Step 4 — Install & Run the backend
Open a terminal in the `milqu-backend` folder:

```bash
npm install
npm start
```

You should see:
```
✅ MongoDB connected to milqu_fresh database
🚀 Milqu Fresh backend running on http://localhost:5000
```

Test it by visiting: http://localhost:5000/api/health

---

## 🔌 Step 5 — Connect Your Frontend

The current frontend is already wired to the backend through `frontend/js/config.js`.

- Local development uses `http://localhost:5000/api`
- Production uses the same site origin plus `/api`
- If you deploy frontend and backend on different domains, set `CORS_ORIGIN` on the backend and update `frontend/js/config.js` with your API host

---

## 📊 Admin Dashboard API Endpoints

Use these URLs in your admin dashboard (`milqu-admin.html`):

| What | Method | URL |
|------|--------|-----|
| All orders | GET | `http://localhost:5000/api/orders` |
| Orders by status | GET | `http://localhost:5000/api/orders?status=confirmed` |
| Single order | GET | `http://localhost:5000/api/orders/MQ-001234` |
| Update order status | PATCH | `http://localhost:5000/api/orders/MQ-001234/status` |
| Dashboard stats | GET | `http://localhost:5000/api/orders/stats/summary` |
| All subscriptions | GET | `http://localhost:5000/api/subscriptions` |
| All messages | GET | `http://localhost:5000/api/messages` |
| Mark message read | PATCH | `http://localhost:5000/api/messages/MSG-001/status` |

### Example: Fetch orders in admin JS
```javascript
const res  = await fetch('http://localhost:5000/api/orders');
const data = await res.json();
console.log(data.orders); // array of all orders from MongoDB
```

### Example: Update order status
```javascript
await fetch('http://localhost:5000/api/orders/MQ-001234/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'delivered' })
});
```

---

## 🌐 Deploying to Production (free options)

| Service | Best for |
|---------|----------|
| **Render.com** | Easy, free Node.js hosting |
| **Railway.app** | Fast deploy from GitHub |
| **Vercel** | If you convert to serverless |

For any of these:
- Set `MONGO_URI` to your MongoDB Atlas URL
- Set `JWT_SECRET`
- Set `CORS_ORIGIN`
- Keep `ADMIN_AUTH_DISABLED=false`
- Visit `/api/health` after deploy
- Visit `/admin` and create the first admin if one does not exist

---

## ✅ MongoDB Collections Created Automatically

Once you run the server and place one order, MongoDB will create:
- `orders` collection
- `subscriptions` collection  
- `messages` collection

You can view them using **MongoDB Compass** (free GUI): https://www.mongodb.com/try/download/compass
