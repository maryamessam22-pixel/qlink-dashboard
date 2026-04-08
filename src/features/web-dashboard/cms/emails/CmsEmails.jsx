import React, { useState } from 'react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const CmsEmails = () => {
  const [templateEn, setTemplateEn] = useState('Order confirmation');
  const [templateAr, setTemplateAr] = useState('تأكيد الطلب');
  const [subjectEn, setSubjectEn] = useState('Your Qlink order is confirmed');
  const [subjectAr, setSubjectAr] = useState('تم تأكيد طلبك من كيو لينك');
  const [bodyEn, setBodyEn] = useState('<p>Hi {{name}}, thanks for your order.</p>');
  const [bodyAr, setBodyAr] = useState('<p>مرحبًا {{name}}، شكرًا لطلبك.</p>');
  const [seo, setSeo] = useState({
    slug: 'emails',
    metaTitle: 'Email templates — Qlink',
    metaDescription: 'Transactional email content for Qlink.',
    keywords: 'email, templates, qlink',
    featuredImageAlt: 'Emails',
  });

  return (
    <div>
      <PageMeta title="CMS · Emails" description={seo.metaDescription} keywords={seo.keywords} />

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
