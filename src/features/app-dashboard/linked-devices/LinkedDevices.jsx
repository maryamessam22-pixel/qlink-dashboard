import React, { useState } from 'react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import '../../../styles/web-dashboard-pages.css';

const LinkedDevices = () => {
  const [seo, setSeo] = useState({
    slug: 'linked-devices',
    metaTitle: 'Linked devices',
    metaDescription: 'Phones linked to Qlink accounts.',
    keywords: 'devices, app, qlink',
    featuredImageAlt: 'Devices',
  });

  return (
    <div className="web-page">
      <PageMeta title="App · Linked devices" description={seo.metaDescription} keywords={seo.keywords} />
      <h1 className="web-page-title">Linked devices</h1>
      <p className="web-page-sub">Placeholder — ready for device list.</p>
      <SeoSection title="Devices SEO" slugPrefix="admin.qlink.com/app/linked-devices/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default LinkedDevices;
