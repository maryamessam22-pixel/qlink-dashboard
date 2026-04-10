import React, { useEffect, useState } from 'react';
import { Sparkles, Loader2, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput, BilingualTextarea } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import { supabase } from '../../../../lib/supabase';
import '../../../../styles/web-dashboard-pages.css';

const SECTION_KEYS = {
  hero: 'home_hero',
  features: 'home_features',
  simple: 'home_simple_secure',
  why: 'home_why_choose',
  journey: 'home_journey',
  who: 'home_who_it_for',
};

const defaultCards = () => [
  { titleEn: 'Works Offline', titleAr: 'يعمل دون إنترنت', descEn: 'No internet required for basic ID.', descAr: 'لا يتطلب إنترنت للهوية الأساسية.' },
  { titleEn: 'QR Emergency Access', titleAr: 'وصول طوارئ QR', descEn: 'Instant access to ID and Meds.', descAr: 'وصول فوري للهوية والأدوية.' },
  { titleEn: 'Privacy-Controlled', titleAr: 'خصوصية تحت سيطرتك', descEn: 'You decide what data is public.', descAr: 'أنت تقرر ما يُعرض للعامة.' },
];

const emptyCard = () => ({ titleEn: '', titleAr: '', descEn: '', descAr: '' });

const CARD_PREFIXES = ['card-one', 'card-two', 'card-three', 'card-four'];

function normalizeExtra(row) {
  let o = {};
  if (row?.extra_data != null) {
    try {
      o =
        typeof row.extra_data === 'object' && row.extra_data !== null
          ? { ...row.extra_data }
          : JSON.parse(String(row.extra_data));
    } catch {
      o = {};
    }
  }
  if (o.visible === undefined) o.visible = true;
  return o;
}

function fourCardsFromRow(row) {
  return CARD_PREFIXES.map((prefix) => ({
    titleEn: row[`${prefix}-title-en`] || '',
    titleAr: row[`${prefix}-title-ar`] || '',
    descEn: row[`${prefix}-desc-en`] || '',
    descAr: row[`${prefix}-desc-ar`] || '',
  }));
}

function payloadFourCards(cards) {
  const out = {};
  CARD_PREFIXES.forEach((prefix, i) => {
    const c = cards[i] || emptyCard();
    out[`${prefix}-title-en`] = c.titleEn;
    out[`${prefix}-title-ar`] = c.titleAr;
    out[`${prefix}-desc-en`] = c.descEn;
    out[`${prefix}-desc-ar`] = c.descAr;
  });
  return out;
}

function SectionShowToggle({ visible, onChange, label = 'Show on public website' }) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 13,
        fontWeight: 600,
        color: visible ? '#34a853' : '#8b949e',
      }}
    >
      <input
        type="checkbox"
        checked={visible}
        onChange={(e) => onChange(e.target.checked)}
        style={{ width: 18, height: 18, accentColor: '#e03232' }}
      />
      {visible ? <Eye size={18} /> : <EyeOff size={18} />}
      {label}
    </label>
  );
}

function CardBlockEditor({ cards, setCards }) {
  const updateCard = (i, field, lang, val) => {
    setCards((prev) => {
      const next = [...prev];
      const key = `${field}${lang === 'en' ? 'En' : 'Ar'}`;
      next[i] = { ...next[i], [key]: val };
      return next;
    });
  };

  return cards.map((card, i) => (
    <div
      key={i}
      style={{
        marginTop: 20,
        paddingTop: 20,
        borderTop: i > 0 ? '1px solid #1f2937' : 'none',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#8b949e' }}>Card {i + 1}</p>
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
          rows={3}
        />
      </div>
    </div>
  ));
}

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
  const [heroExtra, setHeroExtra] = useState({ visible: true });

  const [whatSubtitleEn, setWhatSubtitleEn] = useState('');
  const [whatSubtitleAr, setWhatSubtitleAr] = useState('');
  const [cards, setCards] = useState(defaultCards());
  const [featuresExtra, setFeaturesExtra] = useState({ visible: true });

  const [simpleRteEn, setSimpleRteEn] = useState('');
  const [simpleRteAr, setSimpleRteAr] = useState('');
  const [simpleExtra, setSimpleExtra] = useState({ visible: true });

  const [whyTitleEn, setWhyTitleEn] = useState('');
  const [whyTitleAr, setWhyTitleAr] = useState('');
  const [whySubEn, setWhySubEn] = useState('');
  const [whySubAr, setWhySubAr] = useState('');
  const [whyCards, setWhyCards] = useState(() => Array.from({ length: 4 }, () => emptyCard()));
  const [whyExtra, setWhyExtra] = useState({ visible: true });

  const [journeyTitleEn, setJourneyTitleEn] = useState('');
  const [journeyTitleAr, setJourneyTitleAr] = useState('');
  const [journeySubEn, setJourneySubEn] = useState('');
  const [journeySubAr, setJourneySubAr] = useState('');
  const [journeyCards, setJourneyCards] = useState(() => Array.from({ length: 4 }, () => emptyCard()));
  const [journeyExtra, setJourneyExtra] = useState({ visible: true });

  const [whoTitleEn, setWhoTitleEn] = useState('');
  const [whoTitleAr, setWhoTitleAr] = useState('');
  const [whoSubEn, setWhoSubEn] = useState('');
  const [whoSubAr, setWhoSubAr] = useState('');
  const [whoCards, setWhoCards] = useState(() => Array.from({ length: 4 }, () => emptyCard()));
  const [whoExtra, setWhoExtra] = useState({ visible: true });

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

        const keys = [
          SECTION_KEYS.hero,
          SECTION_KEYS.features,
          SECTION_KEYS.simple,
          SECTION_KEYS.why,
          SECTION_KEYS.journey,
          SECTION_KEYS.who,
        ];

        const { data: cmsData, error: cmsError } = await supabase.from('cms_content').select('*').in('section_key', keys);

        if (cmsError) throw cmsError;

        if (cmsData) {
          cmsData.forEach((row) => {
            if (row.section_key === SECTION_KEYS.hero) {
              setHeadlineEn(row.title_en || '');
              setHeadlineAr(row.title_ar || '');
              setSubRteEn(row.subtitle_en || '');
              setSubRteAr(row.subtitle_ar || '');
              setBtnPrimaryEn(row['first-btn-en'] || '');
              setBtnPrimaryAr(row['first-btn-ar'] || '');
              setBtnSecondaryEn(row['sec-btn-en'] || '');
              setBtnSecondaryAr(row['sec-btn-ar'] || '');
              setHeroExtra(normalizeExtra(row));
            } else if (row.section_key === SECTION_KEYS.features) {
              setWhatSubtitleEn(row.subtitle_en || '');
              setWhatSubtitleAr(row.subtitle_ar || '');
              const three = [
                {
                  titleEn: row['card-one-title-en'] || '',
                  titleAr: row['card-one-title-ar'] || '',
                  descEn: row['card-one-desc-en'] || '',
                  descAr: row['card-one-desc-ar'] || '',
                },
                {
                  titleEn: row['card-two-title-en'] || '',
                  titleAr: row['card-two-title-ar'] || '',
                  descEn: row['card-two-desc-en'] || '',
                  descAr: row['card-two-desc-ar'] || '',
                },
                {
                  titleEn: row['card-three-title-en'] || '',
                  titleAr: row['card-three-title-ar'] || '',
                  descEn: row['card-three-desc-en'] || '',
                  descAr: row['card-three-desc-ar'] || '',
                },
              ];
              let extras = [];
              try {
                const raw = row.content_en;
                if (raw && typeof raw === 'string' && raw.trim().startsWith('{')) {
                  const parsed = JSON.parse(raw);
                  if (parsed && Array.isArray(parsed.extra_feature_cards)) {
                    extras = parsed.extra_feature_cards.map((c) => ({
                      titleEn: c.titleEn || '',
                      titleAr: c.titleAr || '',
                      descEn: c.descEn || '',
                      descAr: c.descAr || '',
                    }));
                  }
                }
              } catch {
                /* ignore */
              }
              setCards([...three, ...extras]);
              setFeaturesExtra(normalizeExtra(row));
            } else if (row.section_key === SECTION_KEYS.simple) {
              setSimpleRteEn(row.content_en || '');
              setSimpleRteAr(row.content_ar || '');
              setSimpleExtra(normalizeExtra(row));
            } else if (row.section_key === SECTION_KEYS.why) {
              setWhyTitleEn(row.title_en || '');
              setWhyTitleAr(row.title_ar || '');
              setWhySubEn(row.subtitle_en || '');
              setWhySubAr(row.subtitle_ar || '');
              setWhyCards(fourCardsFromRow(row));
              setWhyExtra(normalizeExtra(row));
            } else if (row.section_key === SECTION_KEYS.journey) {
              setJourneyTitleEn(row.title_en || '');
              setJourneyTitleAr(row.title_ar || '');
              setJourneySubEn(row.subtitle_en || '');
              setJourneySubAr(row.subtitle_ar || '');
              setJourneyCards(fourCardsFromRow(row));
              setJourneyExtra(normalizeExtra(row));
            } else if (row.section_key === SECTION_KEYS.who) {
              setWhoTitleEn(row.title_en || '');
              setWhoTitleAr(row.title_ar || '');
              setWhoSubEn(row.subtitle_en || '');
              setWhoSubAr(row.subtitle_ar || '');
              setWhoCards(fourCardsFromRow(row));
              setWhoExtra(normalizeExtra(row));
            }
          });
        }

        const { data: seoData, error: seoError } = await supabase.from('seo').select('*').eq('slug', '').single();

        if (seoError && seoError.code !== 'PGRST116') {
          console.error('SEO Fetch Error:', seoError);
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
      setCards((c) => [...c, { titleEn: 'New feature', titleAr: 'ميزة جديدة', descEn: 'Description', descAr: 'الوصف' }]);
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

      const heroPayload = {
        title_en: headlineEn,
        title_ar: headlineAr,
        subtitle_en: subRteEn,
        subtitle_ar: subRteAr,
        'first-btn-en': btnPrimaryEn,
        'first-btn-ar': btnPrimaryAr,
        'sec-btn-en': btnSecondaryEn,
        'sec-btn-ar': btnSecondaryAr,
        extra_data: { ...heroExtra, visible: heroExtra.visible !== false },
        updated_at: now,
      };
      const { error: err1 } = await supabase.from('cms_content').update(heroPayload).eq('section_key', SECTION_KEYS.hero);
      if (err1) throw err1;

      const padCard = (i) => cards[i] || { titleEn: '', titleAr: '', descEn: '', descAr: '' };
      const c0 = padCard(0);
      const c1 = padCard(1);
      const c2 = padCard(2);
      const extraCards = cards.slice(3);
      const contentEnExtras = extraCards.length > 0 ? JSON.stringify({ extra_feature_cards: extraCards }) : null;

      const { error: err2 } = await supabase
        .from('cms_content')
        .update({
          subtitle_en: whatSubtitleEn,
          subtitle_ar: whatSubtitleAr,
          'card-one-title-en': c0.titleEn,
          'card-one-title-ar': c0.titleAr,
          'card-one-desc-en': c0.descEn,
          'card-one-desc-ar': c0.descAr,
          'card-two-title-en': c1.titleEn,
          'card-two-title-ar': c1.titleAr,
          'card-two-desc-en': c1.descEn,
          'card-two-desc-ar': c1.descAr,
          'card-three-title-en': c2.titleEn,
          'card-three-title-ar': c2.titleAr,
          'card-three-desc-en': c2.descEn,
          'card-three-desc-ar': c2.descAr,
          content_en: contentEnExtras,
          extra_data: { ...featuresExtra, visible: featuresExtra.visible !== false },
          updated_at: now,
        })
        .eq('section_key', SECTION_KEYS.features);
      if (err2) throw err2;

      const { error: err3 } = await supabase
        .from('cms_content')
        .update({
          content_en: simpleRteEn,
          content_ar: simpleRteAr,
          extra_data: { ...simpleExtra, visible: simpleExtra.visible !== false },
          updated_at: now,
        })
        .eq('section_key', SECTION_KEYS.simple);
      if (err3) throw err3;

      const { error: errWhy } = await supabase
        .from('cms_content')
        .update({
          title_en: whyTitleEn,
          title_ar: whyTitleAr,
          subtitle_en: whySubEn,
          subtitle_ar: whySubAr,
          ...payloadFourCards(whyCards),
          extra_data: { ...whyExtra, visible: whyExtra.visible !== false },
          updated_at: now,
        })
        .eq('section_key', SECTION_KEYS.why);
      if (errWhy) throw errWhy;

      const { error: errJ } = await supabase
        .from('cms_content')
        .update({
          title_en: journeyTitleEn,
          title_ar: journeyTitleAr,
          subtitle_en: journeySubEn,
          subtitle_ar: journeySubAr,
          ...payloadFourCards(journeyCards),
          extra_data: { ...journeyExtra, visible: journeyExtra.visible !== false },
          updated_at: now,
        })
        .eq('section_key', SECTION_KEYS.journey);
      if (errJ) throw errJ;

      const { error: errWho } = await supabase
        .from('cms_content')
        .update({
          title_en: whoTitleEn,
          title_ar: whoTitleAr,
          subtitle_en: whoSubEn,
          subtitle_ar: whoSubAr,
          ...payloadFourCards(whoCards),
          extra_data: { ...whoExtra, visible: whoExtra.visible !== false },
          updated_at: now,
        })
        .eq('section_key', SECTION_KEYS.who);
      if (errWho) throw errWho;

      const { error: errSeo } = await supabase
        .from('seo')
        .update({
          title_en: seo.metaTitle,
          description_en: seo.metaDescription,
        })
        .eq('slug', '');

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
      <div
        className="web-page-loading"
        style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}
      >
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading homepage data...</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="CMS · Homepage" description={seo.metaDescription} keywords={seo.keywords} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>
          Homepage CMS
        </h1>
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
        <div className="web-card-head" style={{ alignItems: 'center' }}>
          <h2 className="web-card-title" style={{ margin: 0 }}>
            <Sparkles size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#e03232' }} />
            Hero Section
          </h2>
          <SectionShowToggle visible={heroExtra.visible !== false} onChange={(v) => setHeroExtra((e) => ({ ...e, visible: v }))} />
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
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Sub-headline (EN)
          </label>
          <RichTextEditor value={subRteEn} onChange={setSubRteEn} rtl={false} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            العنوان الفرعي (AR)
          </label>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="web-page-title" style={{ margin: 0, fontSize: 18 }}>
            &quot;What is Qlink&quot; section
          </h2>
          <SectionShowToggle visible={featuresExtra.visible !== false} onChange={(v) => setFeaturesExtra((e) => ({ ...e, visible: v }))} />
        </div>
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
          <div
            key={i}
            style={{ marginTop: 20, paddingTop: 20, borderTop: i ? '1px solid #1f2937' : 'none', position: 'relative' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p style={{ margin: 0, fontSize: 13, color: '#8b949e' }}>Card {i + 1}</p>
              <button
                type="button"
                onClick={() => removeCard(i)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#e03232';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280';
                }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="web-page-title" style={{ margin: 0, fontSize: 18 }}>
            &quot;Simple. Secure.&quot; block
          </h2>
          <SectionShowToggle visible={simpleExtra.visible !== false} onChange={(v) => setSimpleExtra((e) => ({ ...e, visible: v }))} />
        </div>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
          Main body (EN)
        </label>
        <RichTextEditor value={simpleRteEn} onChange={setSimpleRteEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            الوصف النصي الرئيسي (AR)
          </label>
          <RichTextEditor value={simpleRteAr} onChange={setSimpleRteAr} rtl />
        </div>
      </section>

      <section className="web-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="web-page-title" style={{ margin: 0, fontSize: 18 }}>
            Why Choose Qlink · <code style={{ fontSize: 12 }}>home_why_choose</code>
          </h2>
          <SectionShowToggle visible={whyExtra.visible !== false} onChange={(v) => setWhyExtra((e) => ({ ...e, visible: v }))} />
        </div>
        <BilingualTextInput
          labelEn="Section title (EN)"
          labelAr="عنوان القسم (AR)"
          valueEn={whyTitleEn}
          valueAr={whyTitleAr}
          onChangeEn={setWhyTitleEn}
          onChangeAr={setWhyTitleAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextarea
            labelEn="Subtitle (EN)"
            labelAr="العنوان الفرعي (AR)"
            valueEn={whySubEn}
            valueAr={whySubAr}
            onChangeEn={setWhySubEn}
            onChangeAr={setWhySubAr}
            rows={2}
          />
        </div>
        <CardBlockEditor cards={whyCards} setCards={setWhyCards} />
      </section>

      <section className="web-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="web-page-title" style={{ margin: 0, fontSize: 18 }}>
            Safety journey · <code style={{ fontSize: 12 }}>home_journey</code>
          </h2>
          <SectionShowToggle visible={journeyExtra.visible !== false} onChange={(v) => setJourneyExtra((e) => ({ ...e, visible: v }))} />
        </div>
        <BilingualTextInput
          labelEn="Section title (EN)"
          labelAr="عنوان القسم (AR)"
          valueEn={journeyTitleEn}
          valueAr={journeyTitleAr}
          onChangeEn={setJourneyTitleEn}
          onChangeAr={setJourneyTitleAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextarea
            labelEn="Subtitle (EN)"
            labelAr="العنوان الفرعي (AR)"
            valueEn={journeySubEn}
            valueAr={journeySubAr}
            onChangeEn={setJourneySubEn}
            onChangeAr={setJourneySubAr}
            rows={2}
          />
        </div>
        <CardBlockEditor cards={journeyCards} setCards={setJourneyCards} />
      </section>

      <section className="web-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <h2 className="web-page-title" style={{ margin: 0, fontSize: 18 }}>
            Who is Qlink for? · <code style={{ fontSize: 12 }}>home_who_it_for</code>
          </h2>
          <SectionShowToggle visible={whoExtra.visible !== false} onChange={(v) => setWhoExtra((e) => ({ ...e, visible: v }))} />
        </div>
        <BilingualTextInput
          labelEn="Section title (EN)"
          labelAr="عنوان القسم (AR)"
          valueEn={whoTitleEn}
          valueAr={whoTitleAr}
          onChangeEn={setWhoTitleEn}
          onChangeAr={setWhoTitleAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextarea
            labelEn="Subtitle (EN)"
            labelAr="العنوان الفرعي (AR)"
            valueEn={whoSubEn}
            valueAr={whoSubAr}
            onChangeEn={setWhoSubEn}
            onChangeAr={setWhoSubAr}
            rows={2}
          />
        </div>
        <CardBlockEditor cards={whoCards} setCards={setWhoCards} />
      </section>

      <SeoSection title="Homepage SEO" slugPrefix="qlink.com/" value={seo} onChange={setSeo} badge="Global" />
    </div>
  );
};

export default CmsHome;
