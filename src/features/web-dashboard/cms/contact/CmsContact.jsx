import React, { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const STORAGE_KEY = 'qlink_cms_contact_v1';

const DEFAULTS = {
  headline: 'Get in Touch',
  subEn: '<p>Have questions about Qlink? Our team is here to help.</p>',
  subAr: '<p>لديك أسئلة حول كيو لينك؟ فريقنا هنا لمساعدتك.</p>',
  email: 'Support@qlink.com',
  phone: '01112866320',
  addressEn: 'Maadi, 223 st.',
  addressAr: 'المعادي، شارع ٢٢٣',
  seo: {
    slug: 'contact',
    metaTitle: 'Contact Qlink',
    metaDescription: 'Reach Qlink support.',
    keywords: 'contact, qlink, support',
    featuredImageAlt: 'Contact',
  },
};

const CmsContact = () => {
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [subEn, setSubEn] = useState(DEFAULTS.subEn);
  const [subAr, setSubAr] = useState(DEFAULTS.subAr);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [phone, setPhone] = useState(DEFAULTS.phone);
  const [addressEn, setAddressEn] = useState(DEFAULTS.addressEn);
  const [addressAr, setAddressAr] = useState(DEFAULTS.addressAr);
  const [seo, setSeo] = useState(DEFAULTS.seo);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.headline != null) setHeadline(p.headline);
      if (p.subEn != null) setSubEn(p.subEn);
      if (p.subAr != null) setSubAr(p.subAr);
      if (p.email != null) setEmail(p.email);
      if (p.phone != null) setPhone(p.phone);
      if (p.addressEn != null) setAddressEn(p.addressEn);
      if (p.addressAr != null) setAddressAr(p.addressAr);
      if (p.seo && typeof p.seo === 'object') setSeo((s) => ({ ...s, ...p.seo }));
    } catch {
      /* ignore */
    }
  }, []);

  const saveDraft = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ headline, subEn, subAr, email, phone, addressEn, addressAr, seo })
    );
    alert('Contact page draft saved in this browser. Wire Supabase when your schema is ready.');
  };

  const resetDraft = () => {
    if (!window.confirm('Clear saved draft and restore default contact copy?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setHeadline(DEFAULTS.headline);
    setSubEn(DEFAULTS.subEn);
    setSubAr(DEFAULTS.subAr);
    setEmail(DEFAULTS.email);
    setPhone(DEFAULTS.phone);
    setAddressEn(DEFAULTS.addressEn);
    setAddressAr(DEFAULTS.addressAr);
    setSeo({ ...DEFAULTS.seo });
  };

  return (
    <div>
      <PageMeta title="CMS · Contact" description={seo.metaDescription} keywords={seo.keywords} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>Contact CMS</h1>
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
        <div className="web-card-head">
          <h2 className="web-card-title">
            <LayoutGrid size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#94a3b8' }} />
            Contact &amp; support information
          </h2>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Support headline</label>
          <input className="field-input" type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} style={{ width: '100%' }} />
        </div>

        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Support sub-headline (EN)</label>
        <RichTextEditor value={subEn} onChange={setSubEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>دعم العنوان الفرعي (AR)</label>
          <RichTextEditor value={subAr} onChange={setSubAr} rtl />
        </div>

        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Support email</label>
          <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Support phone</label>
          <input className="field-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 20 }}>
          <BilingualTextInput
            labelEn="Office address (EN)"
            labelAr="عنوان المكتب (AR)"
            valueEn={addressEn}
            valueAr={addressAr}
            onChangeEn={setAddressEn}
            onChangeAr={setAddressAr}
          />
        </div>
      </section>

      <SeoSection title="Contact SEO" slugPrefix="qlink.com/contact/" value={seo} onChange={setSeo} />
    </div>
  );
};

export default CmsContact;
