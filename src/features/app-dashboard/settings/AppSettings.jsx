import React, { useState } from 'react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import '../../../styles/web-dashboard-pages.css';

const AppSettings = () => {
  const [policyEn, setPolicyEn] = useState('<p>App policy notes (EN).</p>');
  const [policyAr, setPolicyAr] = useState('<p>ملاحظات سياسة التطبيق (AR).</p>');
  const [seo, setSeo] = useState({
    slug: 'app-settings',
    metaTitle: 'App settings',
    metaDescription: 'Mobile app configuration.',
    keywords: 'settings, app, qlink',
    featuredImageAlt: 'App settings',
  });

  return (
    <div className="web-page">
      <PageMeta title="App · Settings" description={seo.metaDescription} keywords={seo.keywords} />
      <h1 className="web-page-title">App settings</h1>
      <p className="web-page-sub">Placeholder — extend with feature flags and remote config.</p>
      <section className="web-card" style={{ marginTop: 24 }}>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Policy (EN)</label>
        <RichTextEditor value={policyEn} onChange={setPolicyEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>السياسة (AR)</label>
          <RichTextEditor value={policyAr} onChange={setPolicyAr} rtl />
        </div>
      </section>
      <SeoSection title="App settings SEO" slugPrefix="admin.qlink.com/app/settings/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default AppSettings;
