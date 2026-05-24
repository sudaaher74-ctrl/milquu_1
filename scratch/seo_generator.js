const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');

const baseTemplate = (title, desc, keywords, h1, bodyContent, schema) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${desc}">
  <meta name="keywords" content="${keywords}">
  <link rel="canonical" href="https://www.milquufresh.in${schema.urlPath}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.milquufresh.in${schema.urlPath}">
  <meta property="og:image" content="https://www.milquufresh.in/images/new-logo.jpeg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/images/new-logo.jpeg" type="image/jpeg">
  <link rel="stylesheet" href="/style.css">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${schema.type}",
    "name": "${title}",
    "description": "${desc}",
    "url": "https://www.milquufresh.in${schema.urlPath}",
    ${schema.extra ? schema.extra : ''}
  }
  </script>
</head>
<body>
  <nav class="navbar" id="navbar">
    <div class="container">
      <div class="nav-inner">
        <a href="/" class="logo">
          <img src="/images/new-logo.jpeg" alt="Milqu Fresh Logo" style="height:50px;width:50px;border-radius:8px;">
          <span class="logo-text">Milqu<span> Fresh</span></span>
        </a>
        <div class="nav-links">
          <a href="/" class="nl">Home</a>
          <a href="/#products" class="nl">Products</a>
          <a href="/#subscription" class="nl">Subscribe</a>
          <a href="/#contact" class="nl">Contact</a>
        </div>
      </div>
    </div>
  </nav>

  <div class="page active" style="padding-top: 100px;">
    <div class="container">
      <div class="page-hero">
        <h1>${h1}</h1>
        <p>${desc}</p>
      </div>
      <section class="section">
        ${bodyContent}
      </section>
      <section class="cta-section">
        <h2>Start Your Farm-Fresh Journey Today</h2>
        <p>Join hundreds of families enjoying pure, fresh produce delivered to their doorstep every morning.</p>
        <div class="cta-btns">
          <a href="/#products" class="btn btn-white">🛍 Shop Now</a>
          <a href="/#subscription" class="btn" style="background:rgba(255,255,255,.2);color:#fff;border:2px solid rgba(255,255,255,.5);">📦 Subscribe</a>
        </div>
      </section>
    </div>
  </div>
</body>
</html>`;

const locations = [
  {
    path: '/milk-delivery-kharghar',
    title: 'Fresh Milk Delivery in Kharghar | Milquu Fresh',
    desc: 'Get farm-fresh, organic cow and buffalo milk delivered daily to your doorstep in Kharghar. Subscribe to Milquu Fresh for premium dairy.',
    keywords: 'milk delivery kharghar, fresh milk kharghar, organic milk delivery, pure cow milk kharghar',
    h1: 'Premium Milk Delivery in Kharghar',
    body: `
      <h2>Why Choose Milquu Fresh in Kharghar?</h2>
      <p>Kharghar residents trust Milquu Fresh for our uncompromising quality. We deliver farm-fresh milk every morning directly from local farms. No preservatives, no middlemen—just pure dairy goodness.</p>
      <h3>Our Services in Kharghar</h3>
      <ul>
        <li>Cow Milk Delivery</li>
        <li>Buffalo Milk Delivery</li>
        <li>Organic Milk Delivery</li>
        <li>Fresh Paneer and Curd</li>
      </ul>
      <h2>Frequently Asked Questions</h2>
      <div class="faq">
        <h4>Do you deliver to all sectors in Kharghar?</h4>
        <p>Yes, we cover all major sectors and premium residential societies in Kharghar with our daily morning delivery service before 7 AM.</p>
      </div>
    `
  },
  {
    path: '/fresh-dairy-panvel',
    title: 'Fresh Dairy Products in Panvel | Milquu Fresh',
    desc: 'Order pure, fresh dairy products including milk, paneer, and ghee in Panvel. Milquu Fresh offers daily morning delivery.',
    keywords: 'fresh dairy panvel, milk delivery panvel, paneer delivery panvel, pure ghee',
    h1: 'Fresh Dairy Products in Panvel',
    body: `
      <h2>Farm Fresh Dairy Delivery in Panvel</h2>
      <p>Enjoy the authentic taste of farm-fresh dairy in Panvel. Milquu Fresh brings you premium cow milk, buffalo milk, and rich dairy by-products directly to your home.</p>
      <h3>Products Available in Panvel</h3>
      <ul>
        <li>Fresh Milk</li>
        <li>Pure Desi Ghee</li>
        <li>Soft Malai Paneer</li>
        <li>Farm Fresh Vegetables</li>
      </ul>
    `
  },
  {
    path: '/organic-milk-kamothe',
    title: 'Organic Milk Delivery in Kamothe | Milquu Fresh',
    desc: 'Looking for 100% organic, chemical-free milk in Kamothe? Milquu Fresh delivers pure milk straight from the farm every morning.',
    keywords: 'organic milk kamothe, pure milk delivery kamothe, farm fresh milk',
    h1: 'Organic Milk Delivery in Kamothe',
    body: `
      <h2>100% Organic Milk in Kamothe</h2>
      <p>For health-conscious families in Kamothe, our organic milk is the perfect choice. Sourced from grass-fed cows and naturally processed.</p>
      <h2>Why Organic?</h2>
      <p>No hormones, no antibiotics, just natural nutrition. We deliver directly to your doorstep in Kamothe before you wake up.</p>
    `
  },
  {
    path: '/paneer-delivery-belapur',
    title: 'Fresh Paneer Delivery in Belapur | Milquu Fresh',
    desc: 'Order soft, fresh, malai paneer delivered to your home in Belapur. Quality dairy products from Milquu Fresh.',
    keywords: 'fresh paneer belapur, malai paneer delivery, pure dairy belapur',
    h1: 'Fresh Paneer Delivery in Belapur',
    body: `
      <h2>Premium Malai Paneer in Belapur</h2>
      <p>Experience the melt-in-your-mouth goodness of Milquu Fresh Paneer. Made daily from pure milk, our paneer is completely natural and preservative-free.</p>
      <p>We deliver fresh paneer across all sectors in CBD Belapur.</p>
    `
  },
  {
    path: '/fresh-milk-new-panvel',
    title: 'Fresh Milk Delivery in New Panvel | Milquu Fresh',
    desc: 'Daily fresh milk subscription in New Panvel. Milquu Fresh delivers premium cow and buffalo milk straight from the farm.',
    keywords: 'milk delivery new panvel, cow milk new panvel, daily milk subscription',
    h1: 'Fresh Milk Delivery in New Panvel',
    body: `
      <h2>Start Your Milk Subscription in New Panvel</h2>
      <p>New Panvel families love our daily milk delivery service. Set up your subscription once and wake up to fresh milk every single morning without fail.</p>
      <p>We guarantee purity and hygiene in every drop.</p>
    `
  },
  {
    path: '/dairy-products-karanjade',
    title: 'Dairy Products Delivery in Karanjade | Milquu Fresh',
    desc: 'Get high-quality, farm-fresh dairy products delivered to your home in Karanjade. Milk, paneer, and more from Milquu Fresh.',
    keywords: 'dairy products karanjade, milk delivery karanjade, fresh paneer karanjade',
    h1: 'Fresh Dairy Products in Karanjade',
    body: `
      <h2>Your Local Dairy Partner in Karanjade</h2>
      <p>Milquu Fresh is proud to serve the Karanjade community with the finest dairy products. From daily milk to fresh paneer and ghee, we bring the farm to your table.</p>
    `
  }
];

const blogs = [
  {
    path: '/blog/best-fresh-milk-delivery-kharghar',
    title: 'Best Fresh Milk Delivery in Kharghar | Milquu Fresh Blog',
    desc: 'Discover why Milquu Fresh is the top choice for fresh milk delivery in Kharghar. Learn about our farm-to-home process.',
    keywords: 'best milk delivery kharghar, farm fresh milk kharghar, top dairy kharghar',
    h1: 'Best Fresh Milk Delivery in Kharghar',
    body: `
      <article>
        <p>Finding pure, unadulterated milk in the city can be challenging. For residents of Kharghar, the search ends with Milquu Fresh.</p>
        <h2>The Farm-to-Home Difference</h2>
        <p>Unlike packaged milk that sits on store shelves for days, our milk reaches your doorstep within hours of milking. This preserves the natural nutrients, taste, and creaminess that families love.</p>
        <h2>Why Kharghar Families Trust Us</h2>
        <ul>
          <li>Strict Quality Testing</li>
          <li>Daily Timely Delivery before 7 AM</li>
          <li>Easy App/Web Subscription Management</li>
        </ul>
      </article>
    `
  },
  {
    path: '/blog/why-navi-mumbai-families-prefer-farm-fresh-dairy',
    title: 'Why Navi Mumbai Families Prefer Farm Fresh Dairy | Milquu Fresh',
    desc: 'Learn the health benefits of switching to farm-fresh dairy. Why more Navi Mumbai families are choosing Milquu Fresh.',
    keywords: 'farm fresh dairy navi mumbai, healthy milk, organic dairy benefits',
    h1: 'Why Navi Mumbai Families Prefer Farm Fresh Dairy',
    body: `
      <article>
        <p>The shift towards healthy living has made Navi Mumbai families rethink their dairy choices. Packaged, highly processed milk is out, and farm-fresh dairy is in.</p>
        <h2>Health Benefits of Farm-Fresh Milk</h2>
        <p>Farm-fresh milk retains essential enzymes, vitamins, and a rich flavor profile. It's easier to digest and completely free from artificial hormones.</p>
      </article>
    `
  },
  {
    path: '/blog/fresh-paneer-vs-packaged-paneer',
    title: 'Fresh Paneer vs Packaged Paneer: The Ultimate Guide | Milquu Fresh',
    desc: 'What is the difference between farm-fresh paneer and packaged store paneer? Find out why fresh is always better.',
    keywords: 'fresh paneer vs packaged paneer, malai paneer, real paneer benefits',
    h1: 'Fresh Paneer vs Packaged Paneer',
    body: `
      <article>
        <p>If you have ever tasted real, farm-fresh malai paneer, you know there is no going back to the rubbery, packaged alternative.</p>
        <h2>The Texture Test</h2>
        <p>Fresh paneer is soft, crumbly, and melts in your mouth. Packaged paneer often contains stabilizers to increase shelf life, making it hard.</p>
        <h2>Nutritional Value</h2>
        <p>Milquu Fresh paneer is made purely from fresh milk and natural coagulants, retaining maximum protein and calcium without any chemical additives.</p>
      </article>
    `
  },
  {
    path: '/blog/healthy-dairy-products-delivered-panvel',
    title: 'Healthy Dairy Products Delivered in Panvel | Milquu Fresh',
    desc: 'Explore the range of healthy, farm-fresh dairy products available for home delivery in Panvel by Milquu Fresh.',
    keywords: 'healthy dairy panvel, pure ghee panvel, fresh curd panvel',
    h1: 'Healthy Dairy Products Delivered in Panvel',
    body: `
      <article>
        <p>Panvel residents now have access to the healthiest, purest dairy products, delivered right to their doorstep.</p>
        <h2>Our Healthy Range</h2>
        <p>From pure A2 Cow Milk to traditionally churned Bilona Ghee, our products are crafted for health-conscious individuals who refuse to compromise on quality.</p>
      </article>
    `
  }
];

// Ensure blog dir exists
const blogDir = path.join(FRONTEND_DIR, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}

locations.forEach(loc => {
  const schema = {
    type: 'LocalBusiness',
    urlPath: loc.path,
    extra: '"areaServed": "Navi Mumbai"'
  };
  const html = baseTemplate(loc.title, loc.desc, loc.keywords, loc.h1, loc.body, schema);
  fs.writeFileSync(path.join(FRONTEND_DIR, `${loc.path.replace('/', '')}.html`), html);
  console.log(`Created ${loc.path}.html`);
});

blogs.forEach(blog => {
  const schema = {
    type: 'BlogPosting',
    urlPath: blog.path,
    extra: '"author": {"@type": "Organization", "name": "Milquu Fresh"}'
  };
  const html = baseTemplate(blog.title, blog.desc, blog.keywords, blog.h1, blog.body, schema);
  fs.writeFileSync(path.join(FRONTEND_DIR, `${blog.path.substring(1)}.html`), html);
  console.log(`Created ${blog.path}.html`);
});

// Generate Sitemap
const urls = ['/'].concat(locations.map(l => l.path)).concat(blogs.map(b => b.path));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>https://www.milquufresh.in${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(FRONTEND_DIR, 'sitemap.xml'), sitemap);
console.log('Created sitemap.xml');

// Generate Robots.txt
const robots = `User-agent: *
Allow: /

Sitemap: https://www.milquufresh.in/sitemap.xml
`;
fs.writeFileSync(path.join(FRONTEND_DIR, 'robots.txt'), robots);
console.log('Created robots.txt');

console.log('All SEO files generated successfully!');
