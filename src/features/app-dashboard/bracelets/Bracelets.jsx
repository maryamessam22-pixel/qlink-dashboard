import React, { useState } from 'react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import '../../../styles/web-dashboard-pages.css';

const Bracelets = () => {
  const [seo, setSeo] = useState({
    slug: 'bracelets',
    metaTitle: 'Bracelets',
    metaDescription: 'In-app bracelet registrations.',
    keywords: 'bracelets, app, qlink',
    featuredImageAlt: 'Bracelets',
  });

  return (
    <div className="web-page">
      <PageMeta title="App · Bracelets" description={seo.metaDescription} keywords={seo.keywords} />
      <h1 className="web-page-title">Bracelets</h1>
      <p className="web-page-sub">Placeholder — ready for bracelet inventory tied to the app.</p>
      <SeoSection title="Bracelets SEO" slugPrefix="admin.qlink.com/app/bracelets/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default Bracelets;
