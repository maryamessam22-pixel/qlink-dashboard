import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Sets document title and meta tags for admin pages (and mirrors CMS SEO fields in head when provided).
 */
const PageMeta = ({ title, description, keywords, noIndex = true }) => {
  const fullTitle = title ? `${title} · Qlink Admin` : 'Qlink Admin';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description ? <meta name="description" content={description} /> : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}
    </Helmet>
  );
};

export default PageMeta;
