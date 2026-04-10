import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, Save, Trash2 } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../components/bilingual/BilingualField';
import SeoSection from '../../../components/seo/SeoSection';
import { supabase } from '../../../lib/supabase';
import { upsertSeoBySlug } from '../../../lib/seoUpsert';
import { normalizeRichTextHtml } from '../../../lib/richTextHtml';
import { generateUUID } from '../../../lib/generateId';
import '../../../styles/web-dashboard-pages.css';

const seoSlugFor = (pageSlug) => `pages/${pageSlug}`;

const CmsCustomPage = () => {
  const { pageSlug } = useParams();
  const navigate = useNavigate();
  const sectionKey = `cms_page_${pageSlug}`;
  const seoSlug = seoSlugFor(pageSlug);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowId, setRowId] = useState(null);
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [contentAr, setContentAr] = useState('');
  const [seo, setSeo] = useState({
    slug: seoSlug,
    metaTitle: '',
    metaDescription: '',
    keywords: 'qlink, landing',
    featuredImageAlt: '',
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const { data: row } = await supabase.from('cms_content').select('*').eq('section_key', sectionKey).maybeSingle();
      if (!mounted) return;
      if (row) {
        setRowId(row.id);
        setTitleEn(row.title_en || '');
        setTitleAr(row.title_ar || '');
        setContentEn(row.content_en || '');
        setContentAr(row.content_ar || '');
      }

      const { data: seoRow } = await supabase.from('seo').select('*').eq('slug', seoSlug).maybeSingle();
      if (mounted && seoRow) {
        setSeo({
          slug: seoRow.slug || seoSlug,
          metaTitle: seoRow.title_en || '',
          metaDescription: seoRow.description_en || '',
          keywords: seoRow.keywords || 'qlink, landing',
          featuredImageAlt: seoRow.featured_image_alt || '',
        });
      } else if (mounted) {
        setSeo((s) => ({ ...s, slug: seoSlug }));
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [sectionKey, seoSlug]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const now = new Date().toISOString();
      const base = {
        section_key: sectionKey,
        title_en: titleEn,
        title_ar: titleAr,
        content_en: normalizeRichTextHtml(contentEn),
        content_ar: normalizeRichTextHtml(contentAr),
        updated_at: now,
      };
      if (rowId) {
        const { error } = await supabase.from('cms_content').update(base).eq('id', rowId);
        if (error) throw error;
      } else {
        const newId = generateUUID();
        const { data, error } = await supabase
          .from('cms_content')
          .insert([{ ...base, id: newId }])
          .select('id')
          .single();
        if (error) throw error;
        if (data?.id) setRowId(data.id);
      }

      await upsertSeoBySlug(supabase, seoSlug, {
        title_en: seo.metaTitle,
        description_en: seo.metaDescription,
      });

      alert('Page saved.');
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to save page.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async () => {
    if (!window.confirm('Delete this custom page from the database and remove its CMS tab? This cannot be undone.')) return;
    try {
      setDeleting(true);
      await supabase.from('cms_content').delete().eq('section_key', sectionKey);
      await supabase.from('seo').delete().eq('slug', seoSlug);
      window.dispatchEvent(new CustomEvent('cms:remove-custom-tab', { detail: { to: `p/${pageSlug}` } }));
      navigate('/web/cms/home');
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to delete page.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="web-page-loading" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading page…</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title={`CMS · ${titleEn || pageSlug}`} description={seo.metaDescription} keywords={seo.keywords} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>Custom page</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleDeletePage}
            disabled={deleting || saving}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', color: '#f87171', borderColor: 'rgba(248,113,113,0.45)' }}
          >
            {deleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
            Delete page
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || deleting}
            className="btn-publish"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#8b949e' }}>
        Public URL slug: <code style={{ color: '#cbd5e1' }}>{pageSlug}</code> · Stored as <code style={{ color: '#cbd5e1' }}>{sectionKey}</code>
      </p>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Page content</h2>
        <BilingualTextInput
          labelEn="Page title (EN)"
          labelAr="عنوان الصفحة (AR)"
          valueEn={titleEn}
          valueAr={titleAr}
          onChangeEn={setTitleEn}
          onChangeAr={setTitleAr}
        />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Body (EN)</label>
          <RichTextEditor value={contentEn} onChange={setContentEn} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>المحتوى (AR)</label>
          <RichTextEditor value={contentAr} onChange={setContentAr} rtl />
        </div>
      </section>

      <SeoSection title="Page SEO" slugPrefix="qlink.com/" value={seo} onChange={setSeo} badge="Landing" />
    </div>
  );
};

export default CmsCustomPage;
