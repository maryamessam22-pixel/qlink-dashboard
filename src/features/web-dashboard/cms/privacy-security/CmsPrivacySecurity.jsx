import React, { useCallback, useEffect, useState } from 'react';
import { Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import FormDraftToolbar from '../../../../components/cms/FormDraftToolbar';
import { supabase } from '../../../../lib/supabase';
import { upsertSeoBySlug } from '../../../../lib/seoUpsert';
import { normalizeRichTextHtml } from '../../../../lib/richTextHtml';
import { clearFormDraft } from '../../../../lib/formDraft';
import '../../../../styles/web-dashboard-pages.css';

const DRAFT_KEY = 'qlink_draft_cms_privacy_security_v1';
const SEO_SLUG = 'about/privacy';

const CMS_SECTION_KEYS = [
  'privacy_hero',
  'privacy_control',
  'legal_privacy',
  'privacy_protocol',
  'legal_terms',
];

const SECTION_LABELS = {
  privacy_hero: 'Hero — privacy_hero',
  privacy_control: 'You are in control — privacy_control',
  legal_privacy: 'Our data promise — legal_privacy',
  privacy_protocol: 'Offline fallback protocol — privacy_protocol',
  legal_terms: 'Terms of service — legal_terms',
};

const EMPTY_SECTION = () => ({
  id: null,
  titleEn: '',
  titleAr: '',
  subtitleEn: '',
  subtitleAr: '',
  contentEn: '',
  contentAr: '',
});

function parsePoints(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw.map((x) => String(x));
  if (typeof raw === 'string') {
    try {
      const j = JSON.parse(raw);
      return Array.isArray(j) ? j.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

const CmsPrivacySecurity = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const [cards, setCards] = useState({
    not_shared: { id: null, titleEn: '', titleAr: '', pointsEn: [], pointsAr: [] },
    shared: { id: null, titleEn: '', titleAr: '', pointsEn: [], pointsAr: [] },
  });

  const [sections, setSections] = useState(() =>
    Object.fromEntries(CMS_SECTION_KEYS.map((k) => [k, EMPTY_SECTION()]))
  );

  const [seo, setSeo] = useState({
    slug: SEO_SLUG,
    metaTitle: 'Privacy & Security',
    metaTitleAr: 'الخصوصية والأمان',
    metaDescription: 'Your privacy is our priority. Discover how we protect your data.',
    metaDescriptionAr: 'خصوصيتك هي أولويتنا. اكتشف كيف نحمي بياناتك.',
    keywords: 'privacy, security, qlink, medical data',
    featuredImageAlt: 'Privacy and security',
  });

  const setSection = useCallback((key, patch) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  }, []);

  const captureDraft = useCallback(() => ({ cards, sections, seo }), [cards, sections, seo]);

  const applyDraft = useCallback((d) => {
    if (!d || typeof d !== 'object') return;
    if (d.cards && typeof d.cards === 'object') {
      setCards((prev) => ({
        not_shared: {
          ...prev.not_shared,
          ...d.cards.not_shared,
          pointsEn: Array.isArray(d.cards.not_shared?.pointsEn)
            ? d.cards.not_shared.pointsEn
            : prev.not_shared.pointsEn,
          pointsAr: Array.isArray(d.cards.not_shared?.pointsAr)
            ? d.cards.not_shared.pointsAr
            : prev.not_shared.pointsAr,
        },
        shared: {
          ...prev.shared,
          ...d.cards.shared,
          pointsEn: Array.isArray(d.cards.shared?.pointsEn) ? d.cards.shared.pointsEn : prev.shared.pointsEn,
          pointsAr: Array.isArray(d.cards.shared?.pointsAr) ? d.cards.shared.pointsAr : prev.shared.pointsAr,
        },
      }));
    }
    if (d.sections && typeof d.sections === 'object') {
      setSections((prev) => {
        const next = { ...prev };
        CMS_SECTION_KEYS.forEach((k) => {
          if (d.sections[k]) next[k] = { ...next[k], ...d.sections[k] };
        });
        return next;
      });
    }
    if (d.seo && typeof d.seo === 'object') setSeo((s) => ({ ...s, ...d.seo }));
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setFetchError('');

        const [{ data: cardRows, error: cardErr }, { data: cmsRows, error: cmsErr }, { data: seoRow, error: seoErr }] =
          await Promise.all([
            supabase.from('privacy_security_cards').select('*').order('card_type', { ascending: true }),
            supabase.from('cms_content').select('*').in('section_key', CMS_SECTION_KEYS),
            supabase.from('seo').select('*').eq('slug', SEO_SLUG).maybeSingle(),
          ]);

        if (cardErr) {
          console.error(cardErr);
          setFetchError(cardErr.message || 'Failed to load privacy_security_cards.');
        } else if (cardRows?.length) {
          setCards((prev) => {
            const next = { ...prev };
            cardRows.forEach((row) => {
              const t = row.card_type;
              if (t !== 'not_shared' && t !== 'shared') return;
              next[t] = {
                id: row.id,
                titleEn: row.title_en || '',
                titleAr: row.title_ar || '',
                pointsEn: parsePoints(row.points_en),
                pointsAr: parsePoints(row.points_ar),
              };
            });
            return next;
          });
        }

        if (cmsErr) {
          console.error(cmsErr);
          setFetchError((prev) => prev || cmsErr.message || 'Failed to load cms_content.');
        } else if (cmsRows?.length) {
          setSections((prev) => {
            const next = { ...prev };
            cmsRows.forEach((row) => {
              const k = row.section_key;
              if (!CMS_SECTION_KEYS.includes(k)) return;
              next[k] = {
                id: row.id,
                titleEn: row.title_en || '',
                titleAr: row.title_ar || '',
                subtitleEn: row.subtitle_en || '',
                subtitleAr: row.subtitle_ar || '',
                contentEn: row.content_en || '',
                contentAr: row.content_ar || '',
              };
            });
            return next;
          });
        }

        if (seoErr) console.error(seoErr);
        if (seoRow) {
          setSeo({
            slug: seoRow.slug ?? SEO_SLUG,
            metaTitle: seoRow.title_en || '',
            metaTitleAr: seoRow.title_ar || '',
            metaDescription: seoRow.description_en || '',
            metaDescriptionAr: seoRow.description_ar || '',
            keywords: seoRow.keywords || 'privacy, security, qlink',
            featuredImageAlt: seoRow.featured_image_alt || 'Privacy',
          });
        }

      } catch (e) {
        console.error(e);
        setFetchError(e?.message || 'Failed to load privacy & security data.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const updateCardPoints = (type, lang, index, value) => {
    setCards((prev) => {
      const c = prev[type];
      const key = lang === 'en' ? 'pointsEn' : 'pointsAr';
      const list = [...c[key]];
      list[index] = value;
      return { ...prev, [type]: { ...c, [key]: list } };
    });
  };

  const addCardPoint = (type, lang) => {
    setCards((prev) => {
      const c = prev[type];
      const key = lang === 'en' ? 'pointsEn' : 'pointsAr';
      return { ...prev, [type]: { ...c, [key]: [...c[key], ''] } };
    });
  };

  const removeCardPoint = (type, lang, index) => {
    setCards((prev) => {
      const c = prev[type];
      const key = lang === 'en' ? 'pointsEn' : 'pointsAr';
      return { ...prev, [type]: { ...c, [key]: c[key].filter((_, i) => i !== index) } };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const now = new Date().toISOString();

      for (const type of ['not_shared', 'shared']) {
        const c = cards[type];
        if (!c.id) continue;
        const payload = {
          title_en: c.titleEn,
          title_ar: c.titleAr || null,
          points_en: c.pointsEn,
          points_ar: c.pointsAr,
        };
        const { error } = await supabase.from('privacy_security_cards').update(payload).eq('id', c.id);
        if (error) throw error;
      }

      for (const key of CMS_SECTION_KEYS) {
        const s = sections[key];
        if (!s.id) continue;
        const { error } = await supabase
          .from('cms_content')
          .update({
            title_en: s.titleEn,
            title_ar: s.titleAr || null,
            subtitle_en: s.subtitleEn || null,
            subtitle_ar: s.subtitleAr || null,
            content_en: normalizeRichTextHtml(s.contentEn),
            content_ar: normalizeRichTextHtml(s.contentAr),
            updated_at: now,
          })
          .eq('id', s.id);
        if (error) throw error;
      }

      const slug = (seo.slug || SEO_SLUG).trim() || SEO_SLUG;
      await upsertSeoBySlug(supabase, slug, {
        title_en: seo.metaTitle,
        title_ar: seo.metaTitleAr || null,
        description_en: seo.metaDescription,
        description_ar: seo.metaDescriptionAr || null,
      });

      clearFormDraft(DRAFT_KEY);
      alert('Privacy & Security content saved. Live site reads from Supabase.');
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="web-page-loading"
        style={{
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: 16 }}>Loading privacy &amp; security…</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="CMS · Privacy & Security"
        description={seo.metaDescription}
        keywords={seo.keywords}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <h1 className="web-page-title" style={{ margin: 0 }}>
          Privacy &amp; Security
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <FormDraftToolbar storageKey={DRAFT_KEY} capture={captureDraft} apply={applyDraft} disabled={saving} />
          <button
            type="button"
            className="btn-publish"
            disabled={saving}
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>

      {fetchError ? (
        <p className="field-label" style={{ color: '#f87171', marginBottom: 16 }}>
          {fetchError}
        </p>
      ) : null}

      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8b949e', lineHeight: 1.55 }}>
        Data from <code style={{ color: '#cbd5e1' }}>privacy_security_cards</code>,{' '}
        <code style={{ color: '#cbd5e1' }}>cms_content</code> (sections above), and{' '}
        <code style={{ color: '#cbd5e1' }}>seo</code> slug <code style={{ color: '#cbd5e1' }}>{SEO_SLUG}</code>.
      </p>

      {['not_shared', 'shared'].map((type) => {
        const c = cards[type];
        const label = type === 'not_shared' ? 'What is NOT shared' : 'What is shared';
        return (
          <section key={type} className="web-card" style={{ marginBottom: 20 }}>
            <h2 className="web-card-title" style={{ marginBottom: 16 }}>
              {label}{' '}
              <code style={{ fontSize: 12, color: '#94a3b8' }}>({type})</code>
            </h2>
            <BilingualTextInput
              labelEn="Card title (EN)"
              labelAr="عنوان البطاقة (AR)"
              valueEn={c.titleEn}
              valueAr={c.titleAr}
              onChangeEn={(v) => setCards((p) => ({ ...p, [type]: { ...p[type], titleEn: v } }))}
              onChangeAr={(v) => setCards((p) => ({ ...p, [type]: { ...p[type], titleAr: v } }))}
            />
            <div style={{ marginTop: 20 }}>
              <p className="field-label" style={{ marginBottom: 10 }}>
                Bullet points (EN) — <code style={{ fontSize: 11, color: '#64748b' }}>points_en</code>
              </p>
              {c.pointsEn.map((line, i) => (
                <div key={`en-${type}-${i}`} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <GripVertical size={16} style={{ color: '#64748b', flexShrink: 0 }} aria-hidden />
                  <input
                    type="text"
                    className="field-input"
                    value={line}
                    onChange={(e) => updateCardPoints(type, 'en', i, e.target.value)}
                    placeholder="Point text"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => removeCardPoint(type, 'en', i)}
                    aria-label="Remove point"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={() => addCardPoint(type, 'en')} style={{ marginTop: 4 }}>
                <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                Add point (EN)
              </button>
            </div>
            <div style={{ marginTop: 20 }}>
              <p className="field-label" style={{ marginBottom: 10 }}>
                النقاط (AR) — <code style={{ fontSize: 11, color: '#64748b' }}>points_ar</code>
              </p>
              {c.pointsAr.map((line, i) => (
                <div key={`ar-${type}-${i}`} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <GripVertical size={16} style={{ color: '#64748b', flexShrink: 0 }} aria-hidden />
                  <input
                    type="text"
                    className="field-input"
                    dir="rtl"
                    value={line}
                    onChange={(e) => updateCardPoints(type, 'ar', i, e.target.value)}
                    placeholder="نص النقطة"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => removeCardPoint(type, 'ar', i)}
                    aria-label="حذف"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary" onClick={() => addCardPoint(type, 'ar')} style={{ marginTop: 4 }}>
                <Plus size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                إضافة نقطة (AR)
              </button>
            </div>
          </section>
        );
      })}

      {CMS_SECTION_KEYS.map((key) => {
        const s = sections[key];
        return (
          <section key={key} className="web-card" style={{ marginBottom: 20 }}>
            <h2 className="web-card-title" style={{ marginBottom: 16 }}>
              {SECTION_LABELS[key]}
            </h2>
            <BilingualTextInput
              labelEn="Title (EN) — title_en"
              labelAr="العنوان (AR) — title_ar"
              valueEn={s.titleEn}
              valueAr={s.titleAr}
              onChangeEn={(v) => setSection(key, { titleEn: v })}
              onChangeAr={(v) => setSection(key, { titleAr: v })}
            />
            <div style={{ marginTop: 16 }}>
              <BilingualTextInput
                labelEn="Subtitle (EN) — subtitle_en"
                labelAr="العنوان الفرعي (AR) — subtitle_ar"
                valueEn={s.subtitleEn}
                valueAr={s.subtitleAr}
                onChangeEn={(v) => setSection(key, { subtitleEn: v })}
                onChangeAr={(v) => setSection(key, { subtitleAr: v })}
              />
            </div>
            <div style={{ marginTop: 20 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                Body (EN) — content_en
              </label>
              <RichTextEditor value={s.contentEn} onChange={(v) => setSection(key, { contentEn: v })} />
            </div>
            <div style={{ marginTop: 20 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                المحتوى (AR) — content_ar
              </label>
              <RichTextEditor value={s.contentAr} onChange={(v) => setSection(key, { contentAr: v })} rtl />
            </div>
          </section>
        );
      })}

      <section className="web-card" style={{ marginBottom: 20 }}>
        <h2 className="web-card-title" style={{ marginBottom: 12 }}>Page SEO — seo table</h2>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#8b949e' }}>
          Slug <code style={{ color: '#cbd5e1' }}>{SEO_SLUG}</code> (about/privacy). Arabic fields map to{' '}
          <code style={{ color: '#cbd5e1' }}>title_ar</code> and <code style={{ color: '#cbd5e1' }}>description_ar</code>.
        </p>
        <SeoSection
          title=""
          slugPrefix="qlink.com/"
          slugSuffixHint="about/privacy"
          value={seo}
          onChange={setSeo}
          badge="Live"
        />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Meta title (AR) — title_ar
          </label>
          <input
            type="text"
            className="field-input"
            dir="rtl"
            value={seo.metaTitleAr}
            onChange={(e) => setSeo((prev) => ({ ...prev, metaTitleAr: e.target.value }))}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Meta description (AR) — description_ar
          </label>
          <textarea
            className="field-input"
            dir="rtl"
            rows={3}
            value={seo.metaDescriptionAr}
            onChange={(e) => setSeo((prev) => ({ ...prev, metaDescriptionAr: e.target.value }))}
          />
        </div>
      </section>
    </div>
  );
};

export default CmsPrivacySecurity;
