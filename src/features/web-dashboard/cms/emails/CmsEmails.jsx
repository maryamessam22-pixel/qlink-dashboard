import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const STORAGE_KEY = 'qlink_cms_emails_v1';

const DEFAULTS = {
  templateEn: 'Order confirmation',
  templateAr: 'تأكيد الطلب',
  subjectEn: 'Your Qlink order is confirmed',
  subjectAr: 'تم تأكيد طلبك من كيو لينك',
  bodyEn: '<p>Hi {{name}}, thanks for your order.</p>',
  bodyAr: '<p>مرحبًا {{name}}، شكرًا لطلبك.</p>',
  seo: {
    slug: 'emails',
    metaTitle: 'Email templates — Qlink',
    metaDescription: 'Transactional email content for Qlink.',
    keywords: 'email, templates, qlink',
    featuredImageAlt: 'Emails',
  },
};

const CmsEmails = () => {
  const [templateEn, setTemplateEn] = useState(DEFAULTS.templateEn);
  const [templateAr, setTemplateAr] = useState(DEFAULTS.templateAr);
  const [subjectEn, setSubjectEn] = useState(DEFAULTS.subjectEn);
  const [subjectAr, setSubjectAr] = useState(DEFAULTS.subjectAr);
  const [bodyEn, setBodyEn] = useState(DEFAULTS.bodyEn);
  const [bodyAr, setBodyAr] = useState(DEFAULTS.bodyAr);
  const [seo, setSeo] = useState(DEFAULTS.seo);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.templateEn != null) setTemplateEn(p.templateEn);
      if (p.templateAr != null) setTemplateAr(p.templateAr);
      if (p.subjectEn != null) setSubjectEn(p.subjectEn);
      if (p.subjectAr != null) setSubjectAr(p.subjectAr);
      if (p.bodyEn != null) setBodyEn(p.bodyEn);
      if (p.bodyAr != null) setBodyAr(p.bodyAr);
      if (p.seo && typeof p.seo === 'object') setSeo((s) => ({ ...s, ...p.seo }));
    } catch {
      /* ignore */
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ templateEn, templateAr, subjectEn, subjectAr, bodyEn, bodyAr, seo })
    );
    alert('Email template draft saved in this browser.');
  };

  const resetDraft = () => {
    if (!window.confirm('Clear saved draft and restore default template text?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setTemplateEn(DEFAULTS.templateEn);
    setTemplateAr(DEFAULTS.templateAr);
    setSubjectEn(DEFAULTS.subjectEn);
    setSubjectAr(DEFAULTS.subjectAr);
    setBodyEn(DEFAULTS.bodyEn);
    setBodyAr(DEFAULTS.bodyAr);
    setSeo({ ...DEFAULTS.seo });
  };

  return (
    <div>
      <PageMeta title="CMS · Emails" description={seo.metaDescription} keywords={seo.keywords} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>Emails CMS</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" className="btn-secondary" onClick={resetDraft}>
            Reset / clear draft
          </button>
          <button
            type="button"
            className="btn-publish"
            onClick={saveDraft}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Transactional templates</h2>
        <BilingualTextInput
          labelEn="Template name (EN)"
          labelAr="اسم القالب (AR)"
          valueEn={templateEn}
          valueAr={templateAr}
          onChangeEn={setTemplateEn}
          onChangeAr={setTemplateAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Subject line (EN)"
            labelAr="سطر الموضوع (AR)"
            valueEn={subjectEn}
            valueAr={subjectAr}
            onChangeEn={setSubjectEn}
            onChangeAr={setSubjectAr}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>HTML body (EN)</label>
          <RichTextEditor value={bodyEn} onChange={setBodyEn} />
        </div>
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>محتوى HTML (AR)</label>
          <RichTextEditor value={bodyAr} onChange={setBodyAr} rtl />
        </div>
      </section>

      <SeoSection title="Emails admin SEO" slugPrefix="admin.qlink.com/cms/emails/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default CmsEmails;
