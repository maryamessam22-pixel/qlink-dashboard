import React, { useCallback, useEffect, useState } from 'react';
import { HelpCircle, Loader2, Pencil, Plus, Save, Search, Trash2, X } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import { supabase } from '../../../../lib/supabase';
import '../../../../styles/web-dashboard-pages.css';

const SEO_SLUG = 'support/faqs';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Normalize plain-text DB answers for RichTextEditor */
function answerToHtml(raw) {
  if (raw == null || String(raw).trim() === '') return '<p></p>';
  const t = String(raw).trim();
  if (t.startsWith('<')) return t;
  return `<p>${escapeHtml(t).replace(/\n/g, '<br/>')}</p>`;
}

function mapFaqRow(row) {
  return {
    id: row.id,
    qEn: row.question_en ?? '',
    qAr: row.question_ar ?? '',
    aEn: answerToHtml(row.answer_en),
    aAr: answerToHtml(row.answer_ar),
    display_order: row.display_order ?? 0,
  };
}

function newEmptyFaq() {
  return {
    _key: globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    qEn: '',
    qAr: '',
    aEn: '<p></p>',
    aAr: '<p></p>',
  };
}

function rowKey(item) {
  return item.id ?? item._key;
}

function stripHtmlPreview(html, maxLen = 160) {
  const t = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= maxLen) return t || '—';
  return `${t.slice(0, maxLen)}…`;
}

const CmsFaqs = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingRowKey, setSavingRowKey] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [items, setItems] = useState([]);
  /** Saved rows start collapsed; new rows (no id) stay in edit mode until first save. */
  const [editingKeys, setEditingKeys] = useState({});

  const [seo, setSeo] = useState({
    slug: SEO_SLUG,
    metaTitle: 'Frequently Asked Questions - Qlink',
    metaTitleAr: 'الأسئلة الشائعة - Qlink',
    metaDescription: 'Find answers to frequently asked questions about Qlink.',
    metaDescriptionAr: 'اعثر على إجابات للأسئلة المتكررة حول كيو لينك.',
    keywords: 'faq, qlink, help, support',
    featuredImageAlt: 'FAQ',
  });

  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setFetchError('');
    setLoading(true);
    try {
      const { data: faqRows, error: faqError } = await supabase
        .from('faqs')
        .select('*')
        .order('display_order', { ascending: true });

      if (faqError) {
        console.error('faqs fetch:', faqError);
        setFetchError(faqError.message || 'Failed to load FAQs.');
        setItems([]);
      } else if (faqRows?.length) {
        setItems(faqRows.map(mapFaqRow));
      } else {
        setItems([]);
      }

      const { data: seoData, error: seoError } = await supabase
        .from('seo')
        .select('*')
        .eq('slug', SEO_SLUG.trim())
        .maybeSingle();

      if (seoError) {
        console.error('seo fetch:', seoError);
        setFetchError((prev) => prev || seoError.message || 'Failed to load SEO.');
      }

      if (seoData) {
        const slug = (seoData.slug || SEO_SLUG).trim() || SEO_SLUG;
        setSeo({
          slug,
          metaTitle: seoData.title_en || '',
          metaTitleAr: seoData.title_ar || '',
          metaDescription: seoData.description_en || '',
          metaDescriptionAr: seoData.description_ar || '',
          keywords: seoData.keywords || 'faq, qlink, help',
          featuredImageAlt: seoData.featured_image_alt || 'FAQ',
        });
      }
    } catch (e) {
      console.error(e);
      setFetchError(e?.message || 'Failed to load FAQ page data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onAdd = () => {
      setItems((list) => [...list, newEmptyFaq()]);
    };
    window.addEventListener('cms:add-section', onAdd);
    return () => window.removeEventListener('cms:add-section', onAdd);
  }, []);

  const findIndex = (item) =>
    items.findIndex((it) => (item.id && it.id === item.id) || (!item.id && it._key === item._key));

  const isRowEditing = (item) => !item.id || Boolean(editingKeys[rowKey(item)]);

  const startEdit = (item) => {
    setEditingKeys((k) => ({ ...k, [rowKey(item)]: true }));
  };

  const stopEdit = (item) => {
    const key = rowKey(item);
    setEditingKeys((k) => {
      const next = { ...k };
      delete next[key];
      return next;
    });
  };

  const patch = (item, key, val) => {
    const i = findIndex(item);
    if (i < 0) return;
    setItems((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };

  const removeItem = async (item) => {
    const i = findIndex(item);
    if (i < 0) return;
    if (item.id) {
      if (!window.confirm('Delete this FAQ from the database?')) return;
      const { error } = await supabase.from('faqs').delete().eq('id', item.id);
      if (error) {
        window.alert(error.message || 'Delete failed.');
        return;
      }
    }
    stopEdit(item);
    setItems((prev) => prev.filter((_, j) => j !== i));
  };

  const cancelRowEdit = async (item) => {
    if (!item.id) {
      removeItem(item);
      return;
    }
    stopEdit(item);
    const { data, error } = await supabase.from('faqs').select('*').eq('id', item.id).single();
    if (error) {
      console.error(error);
      window.alert(error.message || 'Could not reload this FAQ.');
      return;
    }
    if (data) {
      setItems((prev) => {
        const n = [...prev];
        const idx = n.findIndex((it) => it.id === item.id);
        if (idx >= 0) n[idx] = mapFaqRow(data);
        return n;
      });
    }
  };

  const handleSaveOne = async (item) => {
    const i = findIndex(item);
    if (i < 0) return;
    const key = rowKey(item);
    setSavingRowKey(key);
    try {
      const it = items[i];
      const payload = {
        question_en: it.qEn || '',
        question_ar: it.qAr || '',
        answer_en: it.aEn || '',
        answer_ar: it.aAr || '',
        display_order: i + 1,
      };
      if (it.id) {
        const { error } = await supabase.from('faqs').update(payload).eq('id', it.id);
        if (error) throw error;
        stopEdit(it);
        await loadData();
        window.alert('FAQ saved.');
      } else {
        const { data, error } = await supabase.from('faqs').insert([payload]).select('*').single();
        if (error) throw error;
        stopEdit(it);
        setItems((prev) => {
          const n = [...prev];
          const j = n.findIndex((row) => row._key === it._key);
          if (j >= 0 && data) n[j] = mapFaqRow(data);
          return n;
        });
        window.alert('FAQ added.');
      }
    } catch (e) {
      console.error(e);
      window.alert(e?.message || 'Save failed.');
    } finally {
      setSavingRowKey(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFetchError('');
    try {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const payload = {
          question_en: it.qEn || '',
          question_ar: it.qAr || '',
          answer_en: it.aEn || '',
          answer_ar: it.aAr || '',
          display_order: i + 1,
        };
        if (it.id) {
          const { error } = await supabase.from('faqs').update(payload).eq('id', it.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('faqs').insert([payload]);
          if (error) throw error;
        }
      }

      const seoSlug = (seo.slug || SEO_SLUG).trim() || SEO_SLUG;
      const seoPayload = {
        slug: seoSlug,
        title_en: seo.metaTitle,
        title_ar: seo.metaTitleAr,
        description_en: seo.metaDescription,
        description_ar: seo.metaDescriptionAr,
        keywords: seo.keywords,
        featured_image_alt: seo.featuredImageAlt,
      };
      const { data: existingSeo, error: seoLookupErr } = await supabase
        .from('seo')
        .select('id')
        .eq('slug', seoSlug)
        .maybeSingle();
      if (seoLookupErr) throw seoLookupErr;

      if (existingSeo?.id) {
        const { error: seoUpd } = await supabase.from('seo').update(seoPayload).eq('id', existingSeo.id);
        if (seoUpd) throw seoUpd;
      } else {
        const { error: seoIns } = await supabase.from('seo').insert([seoPayload]);
        if (seoIns) throw seoIns;
      }

      await loadData();
      window.alert('Saved.');
    } catch (e) {
      console.error(e);
      window.alert(e?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const filteredItems = items.filter(
    (it) =>
      it.qEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.qAr.includes(searchQuery) ||
      it.aEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.aAr.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="web-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 24 }}>
        <Loader2 className="animate-spin" size={22} />
        <span>Loading FAQs…</span>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="CMS · FAQ" description={seo.metaDescription} keywords={seo.keywords} />

      {fetchError ? (
        <div
          className="web-card"
          style={{ marginBottom: 16, borderColor: 'rgba(248, 113, 113, 0.45)', color: '#fecaca' }}
        >
          <strong>Load issue:</strong> {fetchError}
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <button type="button" className="btn-secondary" disabled={saving} onClick={() => loadData()}>
          Reload from database
        </button>
        <button type="button" className="btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? <Loader2 size={18} className="animate-spin" style={{ marginRight: 8 }} /> : <Save size={18} style={{ marginRight: 8 }} />}
          Save all FAQs &amp; SEO
        </button>
      </div>

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">
            <HelpCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#38bdf8' }} />
            Support questions
          </h2>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setItems((list) => [...list, newEmptyFaq()])}
            title="Add a new FAQ entry"
          >
            <Plus size={18} style={{ marginRight: 8 }} />
            Add question
          </button>
        </div>

        <div className="search-wide-wrap" style={{ marginBottom: '24px' }}>
          <Search className="search-wide-icon" size={18} />
          <input
            type="search"
            className="field-input"
            placeholder="Search FAQs..."
            style={{ width: '100%', paddingLeft: '44px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {items.length === 0 && !fetchError ? (
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>No FAQs in the database yet. Add questions or pull data from Supabase.</p>
        ) : null}

        {filteredItems.map((item) => {
          const rk = rowKey(item);
          const editing = isRowEditing(item);
          const rowSaving = savingRowKey === rk;
          return (
            <div key={rk} className="faq-editor-card">
              <div className="faq-editor-head" style={{ flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 600, color: '#fff' }}>
                  Q{findIndex(item) + 1}
                  {item.id ? <span style={{ opacity: 0.5, fontWeight: 400, marginLeft: 8 }}>(saved)</span> : (
                    <span style={{ opacity: 0.6, fontWeight: 400, marginLeft: 8 }}>(new — save to store)</span>
                  )}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {editing ? (
                    <>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        disabled={rowSaving}
                        onClick={() => handleSaveOne(item)}
                      >
                        {rowSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        disabled={rowSaving}
                        onClick={() => cancelRowEdit(item)}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="about-team-remove"
                        style={{ position: 'static', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => removeItem(item)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => startEdit(item)}
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="about-team-remove"
                        style={{ position: 'static', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        onClick={() => removeItem(item)}
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
              {!editing ? (
                <div
                  style={{
                    padding: '14px 0',
                    color: '#cbd5e1',
                    fontSize: 14,
                    lineHeight: 1.5,
                    cursor: 'default',
                  }}
                  onDoubleClick={() => startEdit(item)}
                >
                  <div style={{ fontWeight: 600, color: '#f1f5f9', marginBottom: 8 }}>{item.qEn || '(No EN question)'}</div>
                  {item.qAr ? <div style={{ marginBottom: 10, opacity: 0.9 }}>{item.qAr}</div> : null}
                  <div style={{ opacity: 0.85 }}>{stripHtmlPreview(item.aEn)}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Double-click to edit</div>
                </div>
              ) : (
                <>
                  <BilingualTextInput
                    labelEn="Question (EN)"
                    labelAr="السؤال (AR)"
                    valueEn={item.qEn}
                    valueAr={item.qAr}
                    onChangeEn={(v) => patch(item, 'qEn', v)}
                    onChangeAr={(v) => patch(item, 'qAr', v)}
                  />
                  <div style={{ marginTop: 16 }}>
                    <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                      Answer (EN)
                    </label>
                    <RichTextEditor value={item.aEn} onChange={(v) => patch(item, 'aEn', v)} />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                      الإجابة (AR)
                    </label>
                    <RichTextEditor value={item.aAr} onChange={(v) => patch(item, 'aAr', v)} rtl />
                  </div>
                </>
              )}
            </div>
          );
        })}
      </section>

      <SeoSection
        title="FAQ page SEO"
        slugPrefix="qlink.com/"
        slugSuffixHint="support/faqs"
        value={seo}
        onChange={setSeo}
        badge="Live"
      />
      <section className="web-card" style={{ marginTop: 20 }}>
        <h3 className="web-card-title" style={{ marginBottom: 16, fontSize: 15 }}>
          Arabic SEO (<code style={{ fontSize: 12, color: '#94a3b8' }}>title_ar</code>,{' '}
          <code style={{ fontSize: 12, color: '#94a3b8' }}>description_ar</code>)
        </h3>
        <div style={{ marginBottom: 14 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Meta title (AR)
          </label>
          <input
            className="field-input"
            type="text"
            style={{ width: '100%' }}
            value={seo.metaTitleAr}
            onChange={(e) => setSeo((s) => ({ ...s, metaTitleAr: e.target.value }))}
          />
        </div>
        <div>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Meta description (AR)
          </label>
          <textarea
            className="field-input"
            rows={3}
            style={{ width: '100%', resize: 'vertical' }}
            value={seo.metaDescriptionAr}
            onChange={(e) => setSeo((s) => ({ ...s, metaDescriptionAr: e.target.value }))}
          />
        </div>
      </section>
    </div>
  );
};

export default CmsFaqs;
