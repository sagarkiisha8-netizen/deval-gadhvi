import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Default base domain (no example.com)
const BASE_URL = 'https://newarkmed.com';

// Real published articles for static fallback & search engine crawlers (matching real clinic physicians)
const PUBLISHED_ARTICLES = [
  {
    title: "Understanding High Blood Pressure: The Silent Risks and Daily Management",
    slug: "understanding-high-blood-pressure-risks-management",
    pubDate: "2026-03-15T08:00:00Z",
    rfc822Date: "Sun, 15 Mar 2026 08:00:00 GMT",
    excerpt: "High blood pressure often exhibits no warning symptoms until complications arise. Learn how routine monitoring, lifestyle adjustments, and targeted medical therapies protect your arterial health.",
    author: "Dr. Prahlad Gadhvi, MD, FACP",
    category: "Cardiovascular Health",
    noIndex: false
  },
  {
    title: "Why Your Annual Wellness Checkup Is the Cornerstone of Long-Term Health",
    slug: "why-annual-wellness-checkup-cornerstone-health",
    pubDate: "2026-03-10T08:00:00Z",
    rfc822Date: "Tue, 10 Mar 2026 08:00:00 GMT",
    excerpt: "An annual physical is far more than a routine signature—it is a proactive clinical assessment to detect hidden metabolic, cardiac, and organ changes years before symptoms arise.",
    author: "Dr. Deval Gadhvi, MD",
    category: "Preventive Care",
    noIndex: false
  },
  {
    title: "In-Office Ultrasound, EKG, and Rapid Blood Testing: What to Expect",
    slug: "in-office-ultrasound-ekg-rapid-blood-testing-guide",
    pubDate: "2026-03-05T08:00:00Z",
    rfc822Date: "Thu, 05 Mar 2026 08:00:00 GMT",
    excerpt: "Having advanced diagnostic equipment under one roof eliminates weeks of waiting between referral appointments. Here is how on-site imaging and lab testing expedite your diagnosis.",
    author: "Dr. Sankalp Pathak, MD",
    category: "Diagnostics & Testing",
    noIndex: false
  }
];

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/primary-care-newark-nj', priority: '0.95', changefreq: 'weekly' },
  { path: '/internal-medicine-newark-nj', priority: '0.95', changefreq: 'weekly' },
  { path: '/preventive-care-newark-nj', priority: '0.90', changefreq: 'weekly' },
  { path: '/chronic-disease-management-newark-nj', priority: '0.90', changefreq: 'weekly' },
  { path: '/annual-physical-newark-nj', priority: '0.90', changefreq: 'weekly' },
  { path: '/diabetes-management-newark-nj', priority: '0.90', changefreq: 'weekly' },
  { path: '/hypertension-treatment-newark-nj', priority: '0.90', changefreq: 'weekly' },
  { path: '/in-office-diagnostics-newark-nj', priority: '0.90', changefreq: 'weekly' },
  { path: '/onsite-laboratory-newark-nj', priority: '0.90', changefreq: 'weekly' },
  { path: '/medical-weight-loss-newark-nj', priority: '0.85', changefreq: 'weekly' },
  { path: '/immigration-physicals-newark-nj', priority: '0.85', changefreq: 'weekly' },
  { path: '/locations/newark-nj', priority: '0.95', changefreq: 'weekly' },
  { path: '/insurance-pricing', priority: '0.85', changefreq: 'monthly' },
  { path: '/about', priority: '0.8', changefreq: 'monthly' },
  { path: '/services', priority: '0.9', changefreq: 'weekly' },
  { path: '/providers', priority: '0.85', changefreq: 'weekly' },
  { path: '/providers/dr-prahlad-gadhvi', priority: '0.90', changefreq: 'weekly' },
  { path: '/providers/dr-deval-gadhvi', priority: '0.90', changefreq: 'weekly' },
  { path: '/providers/dr-sankalp-pathak', priority: '0.85', changefreq: 'weekly' },
  { path: '/contact', priority: '0.85', changefreq: 'monthly' },
  { path: '/appointments', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'daily' }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Local development bridge for Netlify Function: upload-provider-image
  app.all('/.netlify/functions/upload-provider-image', express.raw({ type: '*/*', limit: '10mb' }), async (req, res) => {
    try {
      const { handler } = await import('./netlify/functions/upload-provider-image');
      const event: any = {
        httpMethod: req.method,
        headers: req.headers,
        queryStringParameters: req.query,
        body: Buffer.isBuffer(req.body)
          ? (req.headers['content-type']?.includes('application/json') ? req.body.toString('utf8') : req.body.toString('binary'))
          : (req.body || ''),
        isBase64Encoded: false,
      };
      const result = await handler(event, {} as any, () => {});
      if (!result) {
        return res.status(500).json({ error: 'No response from function' });
      }
      res.status(result.statusCode || 200);
      if (result.headers) {
        for (const [key, value] of Object.entries(result.headers)) {
          res.setHeader(key, value as string);
        }
      }
      res.send(result.body);
    } catch (err: any) {
      console.error('[Local Netlify Function Error]:', err);
      res.status(500).json({ error: err.message || 'Function execution error' });
    }
  });

  app.use(express.json());

  // 1. Dynamic Standard XML Sitemap
  app.get('/sitemap.xml', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static Pages
    STATIC_PAGES.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}${page.path}</loc>\n`;
      xml += `    <lastmod>${today}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Blog Articles (Only indexable published articles - drafts and noindex are strictly excluded)
    PUBLISHED_ARTICLES.filter(art => !art.noIndex).forEach(art => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/blog/${art.slug}</loc>\n`;
      xml += `    <lastmod>${art.pubDate.split('T')[0]}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.85</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  // 2. Dynamic Google News XML Sitemap
  const renderNewsSitemap = (req: express.Request, res: express.Response) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`;

    // Only indexable published articles (no drafts, no noIndex pages)
    PUBLISHED_ARTICLES.filter(art => !art.noIndex).forEach(art => {
      xml += `  <url>\n`;
      xml += `    <loc>${BASE_URL}/blog/${art.slug}</loc>\n`;
      xml += `    <news:news>\n`;
      xml += `      <news:publication>\n`;
      xml += `        <news:name>Newark Medical Associates Health Journal</news:name>\n`;
      xml += `        <news:language>en</news:language>\n`;
      xml += `      </news:publication>\n`;
      xml += `      <news:publication_date>${art.pubDate}</news:publication_date>\n`;
      xml += `      <news:title><![CDATA[${art.title}]]></news:title>\n`;
      xml += `    </news:news>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  };

  app.get('/news-sitemap.xml', renderNewsSitemap);
  app.get('/sitemap-news.xml', renderNewsSitemap);

  // 3. Dynamic RSS 2.0 Feed
  app.get('/rss.xml', (req, res) => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>Newark Medical Associates | Health Journal &amp; Clinical Perspectives</title>\n`;
    xml += `    <link>${BASE_URL}/blog</link>\n`;
    xml += `    <description>Evidence-based primary care, preventive cardiology, and diagnostic insights from board-certified physicians in Newark, New Jersey.</description>\n`;
    xml += `    <language>en-us</language>\n`;
    xml += `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
    xml += `    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />\n`;

    PUBLISHED_ARTICLES.filter(art => !art.noIndex).forEach(art => {
      xml += `    <item>\n`;
      xml += `      <title><![CDATA[${art.title}]]></title>\n`;
      xml += `      <link>${BASE_URL}/blog/${art.slug}</link>\n`;
      xml += `      <guid isPermaLink="true">${BASE_URL}/blog/${art.slug}</guid>\n`;
      xml += `      <description><![CDATA[${art.excerpt}]]></description>\n`;
      xml += `      <author>medicalnewark@gmail.com (${art.author})</author>\n`;
      xml += `      <category>${art.category}</category>\n`;
      xml += `      <pubDate>${art.rfc822Date}</pubDate>\n`;
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>`;

    res.header('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(xml);
  });

  // 4. Dynamic Robots.txt
  app.get('/robots.txt', (req, res) => {
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /preview
Disallow: /preview/*

Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/news-sitemap.xml
`;
    res.header('Content-Type', 'text/plain; charset=utf-8');
    res.send(robots);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
