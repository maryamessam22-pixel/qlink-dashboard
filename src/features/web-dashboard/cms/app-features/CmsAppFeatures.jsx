import React, { useCallback, useEffect, useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import FormDraftToolbar from '../../../../components/cms/FormDraftToolbar';
import { supabase } from '../../../../lib/supabase';
import { clearFormDraft } from '../../../../lib/formDraft';
import '../../../../styles/web-dashboard-pages.css';

const SECTION_KEY = 'app_features_page';
const DRAFT_KEY = 'qlink_draft_cms_app_features_v1';

const CARD_PREFIXES = ['card-one', 'card-two', 'card-three', 'card-four', 'card-five', 'card-six'];

const EMPTY_CARD = () => ({
  titleEn: '',
  titleAr: '',
  descEn: '',
  descAr: '',
});

function rowToCards(row) {
  return CARD_PREFIXES.map((prefix) => ({
    titleEn: row[`${prefix}-title-en`] ?? '',
    titleAr: row[`${prefix}-title-ar`] ?? '',
    descEn: row[`${prefix}-desc-en`] ?? '',
    descAr: row[`${prefix}-desc-ar`] ?? '',
  }));
}

function buildUpdatePayload(titleEn, titleAr, subtitleEn, subtitleAr, firstBtnEn, firstBtnAr, secBtnEn, secBtnAr, cards) {
  const out = {
    title_en: titleEn || null,
    title_ar: titleAr || null,
    subtitle_en: subtitleEn || null,
    subtitle_ar: subtitleAr || null,
    'first-btn-en': firstBtnEn || null,
    'first-btn-ar': firstBtnAr || null,
    'sec-btn-en': secBtnEn || null,
    'sec-btn-ar': secBtnAr || null,
    updated_at: new Date().toISOString(),
  };
  CARD_PREFIXES.forEach((prefix, i) => {
    const c = cards[i] || EMPTY_CARD();
    out[`${prefix}-title-en`] = c.titleEn || null;
    out[`${prefix}-title-ar`] = c.titleAr || null;
    out[`${prefix}-desc-en`] = c.descEn || null;
    out[`${prefix}-desc-ar`] = c.descAr || null;
  });
  return out;
}

const CmsAppFeatures = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [rowId, setRowId] = useState(null);

  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [firstBtnEn, setFirstBtnEn] = useState('');
  const [firstBtnAr, setFirstBtnAr] = useState('');
  const [secBtnEn, setSecBtnEn] = useState('');
  const [secBtnAr, setSecBtnAr] = useState('');
  const [cards, setCards] = useState(() => Array.from({ length: 6 }, () => EMPTY_CARD()));

  const setCardField = useCallback((index, field, value) => {
    setCards((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setFetchError('');
        const { data: row, error } = await supabase
          .from('cms_content')
          .select('*')
          .eq('section_key', SECTION_KEY)
          .maybeSingle();

        if (error) {
          console.error('cms_content app_features:', error);
          setFetchError(error.message || 'Failed to load cms_content.');
          return;
        }
        if (!row) {
          setFetchError(
            `No row found for section_key "${SECTION_KEY}". Add it in Supabase (see your seed SQL) then refresh.`
          );
          return;
        }

        setRowId(row.id);
        setTitleEn(row.title_en || '');
        setTitleAr(row.title_ar || '');
        setSubtitleEn(row.subtitle_en || '');
        setSubtitleAr(row.subtitle_ar || '');
        setFirstBtnEn(row['first-btn-en'] || '');
        setFirstBtnAr(row['first-btn-ar'] || '');
        setSecBtnEn(row['sec-btn-en'] || '');
        setSecBtnAr(row['sec-btn-ar'] || '');
        setCards(rowToCards(row));
      } catch (e) {
        console.error(e);
        setFetchError(e?.message || 'Failed to load.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const captureDraft = () => ({
    titleEn,
    titleAr,
    subtitleEn,
    subtitleAr,
    firstBtnEn,
    firstBtnAr,
    secBtnEn,
    secBtnAr,
    cards,
  });

  const applyDraft = (d) => {
    if (!d || typeof d !== 'object') return;
    if (d.titleEn !== undefined) setTitleEn(d.titleEn);
    if (d.titleAr !== undefined) setTitleAr(d.titleAr);
    if (d.subtitleEn !== undefined) setSubtitleEn(d.subtitleEn);
    if (d.subtitleAr !== undefined) setSubtitleAr(d.subtitleAr);
    if (d.firstBtnEn !== undefined) setFirstBtnEn(d.firstBtnEn);
    if (d.firstBtnAr !== undefined) setFirstBtnAr(d.firstBtnAr);
    if (d.secBtnEn !== undefined) setSecBtnEn(d.secBtnEn);
    if (d.secBtnAr !== undefined) setSecBtnAr(d.secBtnAr);
    if (Array.isArray(d.cards)) setCards(d.cards.map((c) => ({ ...EMPTY_CARD(), ...c })));
  };

  const handleSave = async () => {
    if (!rowId) {
      alert('Cannot save: row id missing.');
      return;
    }
    try {
      setSaving(true);
      const payload = buildUpdatePayload(
        titleEn,
        titleAr,
        subtitleEn,
        subtitleAr,
        firstBtnEn,
        firstBtnAr,
        secBtnEn,
        secBtnAr,
        cards
      );
      const { error } = await supabase.from('cms_content').update(payload).eq('id', rowId);
      if (error) throw error;
      clearFormDraft(DRAFT_KEY);
      alert('App features page saved. Your marketing site / app download page can read this from cms_content.');
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to save.');
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
          gap: '16px',
        }}
      >
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading app features…</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="CMS · App features"
        description="Download app & feature grid (cms_content · app_features_page)."
        keywords="cms, app, features, qlink"
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
          App features (download page)
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <FormDraftToolbar
            storageKey={DRAFT_KEY}
            capture={captureDraft}
            apply={applyDraft}
            disabled={saving || !rowId}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !rowId}
            className="btn-publish"
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
        Maps to <code style={{ color: '#cbd5e1' }}>cms_content.section_key = &quot;{SECTION_KEY}&quot;</code>. Saving
        updates Supabase so your public site can render the same row (hero + six feature cards).
      </p>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>
          Page header
        </h2>
        <BilingualTextInput
          labelEn="Main title (EN) — title_en"
          labelAr="العنوان الرئيسي (AR) — title_ar"
          valueEn={titleEn}
          valueAr={titleAr}
          onChangeEn={setTitleEn}
          onChangeAr={setTitleAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Subtitle (EN) — subtitle_en"
            labelAr="العنوان الفرعي (AR) — subtitle_ar"
            valueEn={subtitleEn}
            valueAr={subtitleAr}
            onChangeEn={setSubtitleEn}
            onChangeAr={setSubtitleAr}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Primary button (EN) — first-btn-en"
            labelAr="زر رئيسي (AR) — first-btn-ar"
            valueEn={firstBtnEn}
            valueAr={firstBtnAr}
            onChangeEn={setFirstBtnEn}
            onChangeAr={setFirstBtnAr}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Secondary button (EN) — sec-btn-en"
            labelAr="زر ثانوي (AR) — sec-btn-ar"
            valueEn={secBtnEn}
            valueAr={secBtnAr}
            onChangeEn={setSecBtnEn}
            onChangeAr={setSecBtnAr}
          />
        </div>
      </section>

      {cards.map((card, i) => (
        <section key={CARD_PREFIXES[i]} className="web-card" style={{ marginTop: 20 }}>
          <h2 className="web-card-title" style={{ marginBottom: 16 }}>
            Feature card {i + 1} — <code style={{ fontSize: 13, color: '#94a3b8' }}>{CARD_PREFIXES[i]}</code>
          </h2>
          <BilingualTextInput
            labelEn="Card title (EN)"
            labelAr="عنوان البطاقة (AR)"
            valueEn={card.titleEn}
            valueAr={card.titleAr}
            onChangeEn={(v) => setCardField(i, 'titleEn', v)}
            onChangeAr={(v) => setCardField(i, 'titleAr', v)}
          />
          <div style={{ marginTop: 16 }}>
            <BilingualTextInput
              labelEn="Card description (EN)"
              labelAr="وصف البطاقة (AR)"
              valueEn={card.descEn}
              valueAr={card.descAr}
              onChangeEn={(v) => setCardField(i, 'descEn', v)}
              onChangeAr={(v) => setCardField(i, 'descAr', v)}
            />
          </div>
        </section>
      ))}
    </div>
  );
};

export default CmsAppFeatures;
