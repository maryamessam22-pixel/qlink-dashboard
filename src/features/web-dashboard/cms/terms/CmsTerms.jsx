import React, { useEffect, useState } from 'react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const STORAGE_KEY = 'qlink_cms_terms_v1';

const DEFAULTS = {
  privacyEn:
    '<p>We take your privacy seriously. Medical data is encrypted and never sold to third parties.</p>',
  privacyAr: '<p>نحن نحترم خصوصيتك. البيانات الطبية مشفرة ولا تُباع لأطراف ثالثة.</p>',
  termsEn:
    '<p>By using Qlink you agree to our terms. The bracelet is an information tool and does not replace medical advice.</p>',
  termsAr: '<p>باستخدام كيو لينك فإنك توافق على الشروط. السوار أداة معلومات ولا يغني عن الاستشارة الطبية.</p>',
  seo: {
    slug: 'legal',
    metaTitle: 'Terms & Privacy — Qlink',
    metaDescription: 'Legal policies for Qlink.',
    keywords: 'terms, privacy, qlink',
    featuredImageAlt: 'Legal',
  },
};

const CmsTerms = () => {
  const [privacyEn, setPrivacyEn] = useState(DEFAULTS.privacyEn);
  const [privacyAr, setPrivacyAr] = useState(DEFAULTS.privacyAr);
  const [termsEn, setTermsEn] = useState(DEFAULTS.termsEn);
  const [termsAr, setTermsAr] = useState(DEFAULTS.termsAr);
  const [seo, setSeo] = useState(DEFAULTS.seo);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.privacyEn != null) setPrivacyEn(p.privacyEn);
      if (p.privacyAr != null) setPrivacyAr(p.privacyAr);
      if (p.termsEn != null) setTermsEn(p.termsEn);
      if (p.termsAr != null) setTermsAr(p.termsAr);
      if (p.seo && typeof p.seo === 'object') setSeo((s) => ({ ...s, ...p.seo }));
    } catch {
      /* ignore */
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ privacyEn, privacyAr, termsEn, termsAr, seo }));
    alert('Terms & privacy draft saved in this browser.');
  };

  const resetDraft = () => {
    if (!window.confirm('Clear saved draft and restore default legal copy?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setPrivacyEn(DEFAULTS.privacyEn);
    setPrivacyAr(DEFAULTS.privacyAr);
    setTermsEn(DEFAULTS.termsEn);
    setTermsAr(DEFAULTS.termsAr);
    setSeo({ ...DEFAULTS.seo });
  };

  return (
    <div>
      <PageMeta title="CMS · Terms & Privacy" description={seo.metaDescription} keywords={seo.keywords} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>Terms &amp; Privacy CMS</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" className="btn-secondary" onClick={resetDraft}>
            Reset / clear draft
          </button>
          <button type="button" className="btn-publish" onClick={saveDraft}>
            Save draft
          </button>
        </div>
      </div>

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
