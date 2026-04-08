import React, { useState } from 'react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const CmsTerms = () => {
  const [privacyEn, setPrivacyEn] = useState(
    '<p>We take your privacy seriously. Medical data is encrypted and never sold to third parties.</p>'
  );
  const [privacyAr, setPrivacyAr] = useState('<p>نحن نحترم خصوصيتك. البيانات الطبية مشفرة ولا تُباع لأطراف ثالثة.</p>');
  const [termsEn, setTermsEn] = useState(
    '<p>By using Qlink you agree to our terms. The bracelet is an information tool and does not replace medical advice.</p>'
  );
  const [termsAr, setTermsAr] = useState('<p>باستخدام كيو لينك فإنك توافق على الشروط. السوار أداة معلومات ولا يغني عن الاستشارة الطبية.</p>');
  const [seo, setSeo] = useState({
    slug: 'legal',
    metaTitle: 'Terms & Privacy — Qlink',
    metaDescription: 'Legal policies for Qlink.',
    keywords: 'terms, privacy, qlink',
    featuredImageAlt: 'Legal',
  });

  return (
    <div>
      <PageMeta title="CMS · Terms & Privacy" description={seo.metaDescription} keywords={seo.keywords} />

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Privacy policy</h2>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Privacy policy (EN)</label>
        <RichTextEditor value={privacyEn} onChange={setPrivacyEn} />
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>سياسة الخصوصية (AR)</label>
          <RichTextEditor value={privacyAr} onChange={setPrivacyAr} rtl />
        </div>
      </section>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Terms of service</h2>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Terms (EN)</label>
        <RichTextEditor value={termsEn} onChange={setTermsEn} />
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>شروط الخدمة (AR)</label>
          <RichTextEditor value={termsAr} onChange={setTermsAr} rtl />
        </div>
      </section>

      <SeoSection title="Legal SEO" slugPrefix="qlink.com/legal/" value={seo} onChange={setSeo} />
    </div>
  );
};

export default CmsTerms;
