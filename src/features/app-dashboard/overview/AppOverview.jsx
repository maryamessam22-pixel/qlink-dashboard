import React, { useState } from 'react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import '../../../styles/web-dashboard-pages.css';

const AppOverview = () => {
  const [notesEn, setNotesEn] = useState('<p>App dashboard summary notes (EN).</p>');
  const [notesAr, setNotesAr] = useState('<p>ملاحظات ملخص تطبيق (AR).</p>');
  const [seo, setSeo] = useState({
    slug: 'app-overview',
    metaTitle: 'App dashboard overview',
    metaDescription: 'Mobile app analytics and health (placeholder).',
    keywords: 'app, qlink, admin',
    featuredImageAlt: 'App overview',
  });

  return (
    <div className="web-page">
      <PageMeta title="App · Overview" description={seo.metaDescription} keywords={seo.keywords} />
      <h1 className="web-page-title">App dashboard overview</h1>
      <p className="web-page-sub">Placeholder screen — replace with live app analytics when you share designs.</p>
      <section className="web-card" style={{ marginTop: 24 }}>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Notes (EN)</label>
        <RichTextEditor value={notesEn} onChange={setNotesEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>ملاحظات (AR)</label>
          <RichTextEditor value={notesAr} onChange={setNotesAr} rtl />
        </div>
      </section>
      <SeoSection title="App overview SEO" slugPrefix="admin.qlink.com/app/overview/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default AppOverview;
