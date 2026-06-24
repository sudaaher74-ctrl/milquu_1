import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({
  title = 'MilQuu Fresh – Premium Dairy Delivery in Navi Mumbai',
  description = 'Fresh milk delivery and quality-verified dairy products delivered daily to your doorstep in Panvel, New Panvel, Kharghar, Belapur, Nerul & Karanjade. Subscribe for daily delivery.',
  keywords = 'milk delivery navi mumbai, fresh milk panvel, cow milk delivery, buffalo milk, A2 milk, dairy delivery, MilQuu Fresh',
  canonical = 'https://milquufresh.in',
  ogImage = 'https://milquufresh.in/og-image.jpg',
  ogType = 'website',
  schema = null,
}) => {
  const fullTitle = title.includes('MilQuu') ? title : `${title} | MilQuu Fresh`;
  
  return (
    <Helmet>
      {/* Primary Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="MilQuu Fresh" />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content="MilQuu Fresh" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Geo Tags */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Navi Mumbai" />
      <meta name="geo.position" content="18.9894;73.1175" />
      <meta name="ICBM" content="18.9894, 73.1175" />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
