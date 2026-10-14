# Google Search Console (GSC) Setup & Operations Guide

**Domain:** `https://milquufresh.in`  
**Sitemap URL:** `https://milquufresh.in/sitemap.xml`  
**Audience:** Site Administrator / Marketing Manager

---

## 1. Property Setup & Ownership Verification

### Option A: DNS TXT Verification (Recommended for Domain Property)
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Choose **Domain** property and enter: `milquufresh.in`.
3. Copy the provided TXT verification record:
   ```
   google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
4. Log in to your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.) and add:
   - **Type:** `TXT`
   - **Host / Name:** `@`
   - **Value:** `google-site-verification=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
   - **TTL:** `Auto` or `300`
5. Click **Verify** in Search Console.

### Option B: HTML Meta Tag Verification (URL Prefix Property)
If using the URL Prefix property (`https://milquufresh.in`):
1. In Google Search Console, select **HTML tag** verification.
2. Copy the token string from the meta tag:
   ```html
   <meta name="google-site-verification" content="YOUR_TOKEN_HERE" />
   ```
3. Set the environment variable in your production deployment (`.env` or Vercel Environment Variables):
   ```env
   VITE_GSC_VERIFICATION=YOUR_TOKEN_HERE
   ```
4. The application's `SEOHead.jsx` component automatically renders this verification meta tag on the homepage.
5. Trigger a deployment and click **Verify**.

---

## 2. XML Sitemap Submission

Once verified:
1. In the left navigation menu, click **Sitemaps** under *Indexing*.
2. In the "Add a new sitemap" input, enter:
   ```
   sitemap.xml
   ```
3. Click **Submit**.
4. Confirm status changes to **Success** (green).
5. Verify that Search Console reports **28 discovered URLs**.

---

## 3. Priority URL Inspection & Indexing Queue

After submitting the sitemap, manually submit top commercial pages via the **URL Inspection Tool** (top search bar in GSC) to expedite crawling:

1. `https://milquufresh.in/` (Homepage)
2. `https://milquufresh.in/products` (Product Hub)
3. `https://milquufresh.in/glass-bottle-milk-delivery` (USP Landing Page)
4. `https://milquufresh.in/milk-delivery-navi-mumbai` (Regional Hub)
5. `https://milquufresh.in/product/farm-fresh-cow-milk` (A2 Gir Cow Milk)
6. `https://milquufresh.in/product/pure-buffalo-milk` (Buffalo Milk)
7. `https://milquufresh.in/product/desi-cow-ghee` (Bilona Desi Ghee)
8. `https://milquufresh.in/product/fresh-paneer` (Fresh Malai Paneer)
9. `https://milquufresh.in/milk-delivery-panvel` (Panvel Landing Page)
10. `https://milquufresh.in/organic-milk-kharghar` (Kharghar Landing Page)

**Action for each URL:**
- Paste URL into the top search bar.
- Click **Test Live URL**.
- Click **Request Indexing**.

---

## 4. Performance & Query Monitoring Protocol

Set up a bi-weekly monitoring routine under **Performance > Search results**:

### Queries to Track:
- **Branded:** `milquu fresh`, `milquufresh`, `milquu milk`
- **Location Specific:** `milk delivery panvel`, `milk delivery kharghar`, `fresh milk new panvel`, `milk delivery nerul`
- **Product Category:** `A2 cow milk navi mumbai`, `buffalo milk delivery navi mumbai`, `bilona ghee panvel`
- **USP:** `glass bottle milk delivery navi mumbai`, `plastic free milk delivery`

### Key Performance Indicators:
- **Average Position:** Target top 3 for local keywords within 90 days.
- **Click-Through Rate (CTR):** Optimize title/meta descriptions if CTR is below 4% for positions 1–5.
- **Coverage Status:** Zero pages marked "Duplicate without user-selected canonical" or "Crawled - currently not indexed".
