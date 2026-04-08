import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput, BilingualTextarea } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const defaultCards = () => [
  { titleEn: 'Works Offline', titleAr: 'يعمل دون إنترنت', descEn: 'No internet required for basic ID.', descAr: 'لا يتطلب إنترنت للهوية الأساسية.' },
  { titleEn: 'QR Emergency Access', titleAr: 'وصول طوارئ QR', descEn: 'Instant access to ID and Meds.', descAr: 'وصول فوري للهوية والأدوية.' },
  { titleEn: 'Privacy-Controlled', titleAr: 'خصوصية تحت سيطرتك', descEn: 'You decide what data is public.', descAr: 'أنت تقرر ما يُعرض للعامة.' },
];

const CmsHome = () => {
  const [headlineEn, setHeadlineEn] = useState('Safety in a Scan. Peace of Mind Forever.');
  const [headlineAr, setHeadlineAr] = useState('الأمان في مسح واحد. راحة بال دائمة.');
  const [subRteEn, setSubRteEn] = useState('<p>Qlink is a QR-based medical safety bracelet for emergencies.</p>');
  const [subRteAr, setSubRteAr] = useState('<p>كيو لينك سوار طبي للطوارئ يعتمد على رمز الاستجابة السريعة.</p>');
  const [btnPrimaryEn, setBtnPrimaryEn] = useState('How It Works');
  const [btnPrimaryAr, setBtnPrimaryAr] = useState('كيف يعمل');
  const [btnSecondaryEn, setBtnSecondaryEn] = useState('Explore the Bracelet');
  const [btnSecondaryAr, setBtnSecondaryAr] = useState('استكشف السوار');
  const [whatSubtitleEn, setWhatSubtitleEn] = useState('A personal safety wearable that keeps critical info accessible.');
  const [whatSubtitleAr, setWhatSubtitleAr] = useState('جهاز سلامة شخصي يبقي معلوماتك الحيوية في متناول اليد.');
  const [cards, setCards] = useState(defaultCards);
  const [simpleRteEn, setSimpleRteEn] = useState('<p>Simple. Secure. Built for real-world emergencies.</p>');
  const [simpleRteAr, setSimpleRteAr] = useState('<p>بسيط. آمن. مصمم لحالات الطوارئ الحقيقية.</p>');
  const [seo, setSeo] = useState({
    slug: 'home',
    metaTitle: 'Qlink — Medical safety bracelet',
    metaDescription: 'QR medical ID bracelet for emergencies.',
    keywords: 'qlink, bracelet, medical id, qr',
    featuredImageAlt: 'Qlink bracelet hero',
  });

  useEffect(() => {
    const onAdd = () => {
      setCards((c) => [
        ...c,
        { titleEn: 'New feature', titleAr: 'ميزة جديدة', descEn: 'Description', descAr: 'الوصف' },
      ]);
    };
    window.addEventListener('cms:add-section', onAdd);
    return () => window.removeEventListener('cms:add-section', onAdd);
  }, []);

  const updateCard = (i, field, lang, val) => {
    setCards((prev) => {
      const next = [...prev];
      const key = `${field}${lang === 'en' ? 'En' : 'Ar'}`;
      next[i] = { ...next[i], [key]: val };
      return next;
    });
  };

  return (
    <div>
      <PageMeta title="CMS · Homepage" description={seo.metaDescription} keywords={seo.keywords} />

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">
            <Sparkles size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#e03232' }} />
            Hero Section
          </h2>
        </div>
        <BilingualTextInput
          labelEn="Main headline (EN)"
          labelAr="العنوان الرئيسي (AR)"
          valueEn={headlineEn}
          valueAr={headlineAr}
          onChangeEn={setHeadlineEn}
          onChangeAr={setHeadlineAr}
        />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Sub-headline (EN)</label>
          <RichTextEditor value={subRteEn} onChange={setSubRteEn} rtl={false} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>العنوان الفرعي (AR)</label>
          <RichTextEditor value={subRteAr} onChange={setSubRteAr} rtl />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Primary button text (EN)"
            labelAr="نص الزر الأساسي (AR)"
            valueEn={btnPrimaryEn}
            valueAr={btnPrimaryAr}
            onChangeEn={setBtnPrimaryEn}
            onChangeAr={setBtnPrimaryAr}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Secondary button text (EN)"
            labelAr="نص الزر الثانوي (AR)"
            valueEn={btnSecondaryEn}
            valueAr={btnSecondaryAr}
            onChangeEn={setBtnSecondaryEn}
            onChangeAr={setBtnSecondaryAr}
          />
        </div>
      </section>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>&quot;What is Qlink&quot; section</h2>
        <BilingualTextarea
          labelEn="Section subtitle (EN)"
          labelAr="العنوان الفرعي للقسم (AR)"
          valueEn={whatSubtitleEn}
          valueAr={whatSubtitleAr}
          onChangeEn={setWhatSubtitleEn}
          onChangeAr={setWhatSubtitleAr}
          rows={3}
        />
        {cards.map((card, i) => (
          <div key={i} style={{ marginTop: 20, paddingTop: 20, borderTop: i ? '1px solid #1f2937' : 'none' }}>
            <p style={{ margin: '0 0 12px', fontSize: 13, color: '#8b949e' }}>Card {i + 1}</p>
            <BilingualTextInput
              labelEn="Title (EN)"
              labelAr="العنوان (AR)"
              valueEn={card.titleEn}
              valueAr={card.titleAr}
              onChangeEn={(v) => updateCard(i, 'title', 'en', v)}
              onChangeAr={(v) => updateCard(i, 'title', 'ar', v)}
            />
            <div style={{ marginTop: 12 }}>
              <BilingualTextarea
                labelEn="Description (EN)"
                labelAr="الوصف (AR)"
                valueEn={card.descEn}
                valueAr={card.descAr}
                onChangeEn={(v) => updateCard(i, 'desc', 'en', v)}
                onChangeAr={(v) => updateCard(i, 'desc', 'ar', v)}
                rows={2}
              />
            </div>
          </div>
        ))}
      </section>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>&quot;Simple. Secure.&quot; text block</h2>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Main body (EN)</label>
        <RichTextEditor value={simpleRteEn} onChange={setSimpleRteEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>الوصف النصي الرئيسي (AR)</label>
          <RichTextEditor value={simpleRteAr} onChange={setSimpleRteAr} rtl />
        </div>
      </section>

      <SeoSection title="Homepage SEO" slugPrefix="qlink.com/" value={seo} onChange={setSeo} badge="Global" />
    </div>
  );
};

export default CmsHome;
