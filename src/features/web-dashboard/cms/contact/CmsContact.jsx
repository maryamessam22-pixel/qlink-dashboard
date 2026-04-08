import React, { useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const CmsContact = () => {
  const [headline, setHeadline] = useState('Get in Touch');
  const [subEn, setSubEn] = useState('<p>Have questions about Qlink? Our team is here to help.</p>');
  const [subAr, setSubAr] = useState('<p>لديك أسئلة حول كيو لينك؟ فريقنا هنا لمساعدتك.</p>');
  const [email, setEmail] = useState('Support@qlink.com');
  const [phone, setPhone] = useState('01112866320');
  const [addressEn, setAddressEn] = useState('Maadi, 223 st.');
  const [addressAr, setAddressAr] = useState('المعادي، شارع ٢٢٣');
  const [seo, setSeo] = useState({
    slug: 'contact',
    metaTitle: 'Contact Qlink',
    metaDescription: 'Reach Qlink support.',
    keywords: 'contact, qlink, support',
    featuredImageAlt: 'Contact',
  });

  return (
    <div>
      <PageMeta title="CMS · Contact" description={seo.metaDescription} keywords={seo.keywords} />

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
