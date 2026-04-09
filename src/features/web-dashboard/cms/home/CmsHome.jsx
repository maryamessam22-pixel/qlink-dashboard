import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Save, Trash2 } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput, BilingualTextarea } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import { supabase } from '../../../../lib/supabase';
import '../../../../styles/web-dashboard-pages.css';

const defaultCards = () => [
  { titleEn: 'Works Offline', titleAr: 'يعمل دون إنترنت', descEn: 'No internet required for basic ID.', descAr: 'لا يتطلب إنترنت للهوية الأساسية.' },
  { titleEn: 'QR Emergency Access', titleAr: 'وصول طوارئ QR', descEn: 'Instant access to ID and Meds.', descAr: 'وصول فوري للهوية والأدوية.' },
  { titleEn: 'Privacy-Controlled', titleAr: 'خصوصية تحت سيطرتك', descEn: 'You decide what data is public.', descAr: 'أنت تقرر ما يُعرض للعامة.' },
];

const CmsHome = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [headlineEn, setHeadlineEn] = useState('');
  const [headlineAr, setHeadlineAr] = useState('');
  const [subRteEn, setSubRteEn] = useState('');
  const [subRteAr, setSubRteAr] = useState('');
  const [btnPrimaryEn, setBtnPrimaryEn] = useState('');
  const [btnPrimaryAr, setBtnPrimaryAr] = useState('');
  const [btnSecondaryEn, setBtnSecondaryEn] = useState('');
  const [btnSecondaryAr, setBtnSecondaryAr] = useState('');

  const [whatSubtitleEn, setWhatSubtitleEn] = useState('');
  const [whatSubtitleAr, setWhatSubtitleAr] = useState('');
  const [cards, setCards] = useState(defaultCards());

  const [simpleRteEn, setSimpleRteEn] = useState('');
  const [simpleRteAr, setSimpleRteAr] = useState('');

  const [seo, setSeo] = useState({
    slug: '',
    metaTitle: 'Qlink | Smart Emergency QR Bracelet',
    metaDescription: 'Qlink is a smart emergency QR bracelet that provides instant access to vital medical information during emergencies.',
    keywords: 'qlink, bracelet, medical id, qr',
    featuredImageAlt: 'Qlink bracelet hero',
  });

  useEffect(() => {
    const fetchCmsData = async () => {
      try {
        setLoading(true);

        const { data: cmsData, error: cmsError } = await supabase
          .from('cms_content')
          .select('*')
          .in('section_key', ['home_hero', 'home_features', 'home_simple_secure']);

        if (cmsError) throw cmsError;

        if (cmsData) {
          cmsData.forEach((row) => {
            if (row.section_key === 'home_hero') {
              setHeadlineEn(row.title_en || '');
              setHeadlineAr(row.title_ar || '');
              setSubRteEn(row.subtitle_en || '');
              setSubRteAr(row.subtitle_ar || '');
              setBtnPrimaryEn(row['first-btn-en'] || '');
              setBtnPrimaryAr(row['first-btn-ar'] || '');
              setBtnSecondaryEn(row['sec-btn-en'] || '');
              setBtnSecondaryAr(row['sec-btn-ar'] || '');
            } 
            else if (row.section_key === 'home_features') {
              setWhatSubtitleEn(row.subtitle_en || '');
              setWhatSubtitleAr(row.subtitle_ar || '');
              setCards([
                { 
                  titleEn: row['card-one-title-en'] || '', titleAr: row['card-one-title-ar'] || '', 
                  descEn: row['card-one-desc-en'] || '', descAr: row['card-one-desc-ar'] || '' 
                },
                { 
                  titleEn: row['card-two-title-en'] || '', titleAr: row['card-two-title-ar'] || '', 
                  descEn: row['card-two-desc-en'] || '', descAr: row['card-two-desc-ar'] || '' 
                },
                { 
                  titleEn: row['card-three-title-en'] || '', titleAr: row['card-three-title-ar'] || '', 
                  descEn: row['card-three-desc-en'] || '', descAr: row['card-three-desc-ar'] || '' 
                }
              ]);
            }
            else if (row.section_key === 'home_simple_secure') {
              setSimpleRteEn(row.content_en || '');
              setSimpleRteAr(row.content_ar || '');
            }
          });
        }

        const { data: seoData, error: seoError } = await supabase
          .from('seo')
          .select('*')
          .eq('slug', '')
          .single();

        if (seoError && seoError.code !== 'PGRST116') {
          console.error("SEO Fetch Error:", seoError);
        }

        if (seoData) {
          setSeo({
            slug: seoData.slug || '',
            metaTitle: seoData.title_en || '',
            metaDescription: seoData.description_en || '',
            keywords: seoData.keywords || 'qlink, bracelet, medical id, qr',
            featuredImageAlt: seoData.featured_image_alt || 'Qlink bracelet hero',
          });
        }

      } catch (err) {
        console.error('Fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    const onAdd = () => {
      setCards((c) => [
        ...c,
        { titleEn: 'New feature', titleAr: 'ميزة جديدة', descEn: 'Description', descAr: 'الوصف' },
      ]);
    };
    window.addEventListener('cms:add-section', onAdd);

    fetchCmsData();

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

  const removeCard = (i) => {
    setCards((prev) => prev.filter((_, j) => j !== i));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const now = new Date().toISOString();

      const { error: err1 } = await supabase.from('cms_content').update({
        title_en: headlineEn,
        title_ar: headlineAr,
        subtitle_en: subRteEn,
        subtitle_ar: subRteAr,
        'first-btn-en': btnPrimaryEn,
        'first-btn-ar': btnPrimaryAr,
        'sec-btn-en': btnSecondaryEn,
        'sec-btn-ar': btnSecondaryAr,
        updated_at: now
      }).eq('section_key', 'home_hero');
      if (err1) throw err1;

      const { error: err2 } = await supabase.from('cms_content').update({
        subtitle_en: whatSubtitleEn,
        subtitle_ar: whatSubtitleAr,
        'card-one-title-en': cards[0]?.titleEn,
        'card-one-title-ar': cards[0]?.titleAr,
        'card-one-desc-en': cards[0]?.descEn,
        'card-one-desc-ar': cards[0]?.descAr,
        'card-two-title-en': cards[1]?.titleEn,
        'card-two-title-ar': cards[1]?.titleAr,
        'card-two-desc-en': cards[1]?.descEn,
        'card-two-desc-ar': cards[1]?.descAr,
        'card-three-title-en': cards[2]?.titleEn,
        'card-three-title-ar': cards[2]?.titleAr,
        'card-three-desc-en': cards[2]?.descEn,
        'card-three-desc-ar': cards[2]?.descAr,
        updated_at: now
      }).eq('section_key', 'home_features');
      if (err2) throw err2;

      const { error: err3 } = await supabase.from('cms_content').update({
        content_en: simpleRteEn,
        content_ar: simpleRteAr,
        updated_at: now
      }).eq('section_key', 'home_simple_secure');
      if (err3) throw err3;

      const { error: errSeo } = await supabase.from('seo').update({
        title_en: seo.metaTitle,
        description_en: seo.metaDescription,
      }).eq('slug', '');

      if (errSeo) throw errSeo;

      alert('Homepage content and SEO updated successfully!');
    } catch (err) {
      console.error('Save error:', err.message);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="web-page-loading" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading homepage data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="CMS · Homepage" description={seo.metaDescription} keywords={seo.keywords} />

      {/* زرار الحفظ الرئيسي */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>Homepage CMS</h1>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-publish" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

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
          <div key={i} style={{ marginTop: 20, paddingTop: 20, borderTop: i ? '1px solid #1f2937' : 'none', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#8b949e' }}>Card {i + 1}</p>
              <button 
                type="button" 
                onClick={() => removeCard(i)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                onMouseEnter={(e) => e.target.style.color = '#e03232'}
                onMouseLeave={(e) => e.target.style.color = '#6b7280'}
              >
                <Trash2 size={16} />
              </button>
            </div>
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

      <SeoSection 
        title="Homepage SEO" 
        slugPrefix="qlink.com/" 
        value={seo} 
        onChange={setSeo} 
        badge="Global" 
      />
    </div>
  );
};

export default CmsHome;