import React, { useCallback, useEffect, useState } from 'react';
import { LayoutGrid, Loader2, Save } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import { supabase } from '../../../../lib/supabase';
import { upsertSeoBySlug } from '../../../../lib/seoUpsert';
import '../../../../styles/web-dashboard-pages.css';

const SECTION_CONTACT = 'contact_info';
const SEO_SLUG = 'support/contact';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Normalize subtitle fields for RichTextEditor */
function textToHtml(raw) {
  if (raw == null || String(raw).trim() === '') return '<p></p>';
  const t = String(raw).trim();
  if (t.startsWith('<')) return t;
  return `<p>${escapeHtml(t).replace(/\n/g, '<br/>')}</p>`;
}

function parseExtraData(raw) {
  if (raw == null) return {};
  if (typeof raw === 'object' && !Array.isArray(raw)) return raw;
  try {
    return JSON.parse(String(raw));
  } catch {
    return {};
  }
}

const CmsContact = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [cmsRowId, setCmsRowId] = useState(null);

  const [titleEn, setTitleEn] = useState('Get in Touch');
  const [titleAr, setTitleAr] = useState('تواصل معنا');
  const [subEn, setSubEn] = useState('<p>Have questions about Qlink? Our team is here to help.</p>');
  const [subAr, setSubAr] = useState('<p>لديك أسئلة حول كيو لينك؟ فريقنا هنا لمساعدتك.</p>');
  const [email, setEmail] = useState('Support@qlink.com');
  const [phone, setPhone] = useState('01112866320');
  const [addressEn, setAddressEn] = useState('Maadi, 223 st.');
  const [addressAr, setAddressAr] = useState('');

  const [seo, setSeo] = useState({
    slug: SEO_SLUG,
    metaTitle: 'Contact Us',
    metaTitleAr: 'اتصل بنا',
    metaDescription: 'Get in touch with the Qlink team for any inquiries or support.',
    metaDescriptionAr: 'تواصل مع فريق كيو لينك لأي استفسارات أو دعم.',
    keywords: 'contact, qlink, support',
    featuredImageAlt: 'Contact',
  });

  const loadData = useCallback(async () => {
    setFetchError('');
    setLoading(true);
    try {
      const { data: cms, error: cmsError } = await supabase
        .from('cms_content')
        .select('*')
        .eq('section_key', SECTION_CONTACT)
        .maybeSingle();

      if (cmsError) {
        console.error('cms_content fetch:', cmsError);
        setFetchError(cmsError.message || 'Failed to load contact content.');
      } else if (cms) {
        setCmsRowId(cms.id ?? null);
        setTitleEn(cms.title_en || '');
        setTitleAr(cms.title_ar || '');
        setSubEn(textToHtml(cms.subtitle_en));
        setSubAr(textToHtml(cms.subtitle_ar));
        const extra = parseExtraData(cms.extra_data);
        setEmail(extra.email ?? cms.content_en ?? '');
        setPhone(extra.phone ?? cms.content_ar ?? '');
        setAddressEn(extra.address ?? '');
        setAddressAr(extra.address_ar ?? '');
      } else {
        setCmsRowId(null);
      }

      const { data: seoData, error: seoError } = await supabase.from('seo').select('*').eq('slug', SEO_SLUG).maybeSingle();

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
          keywords: seoData.keywords || 'contact, qlink, support',
          featuredImageAlt: seoData.featured_image_alt || 'Contact',
        });
      }
    } catch (e) {
      console.error(e);
      setFetchError(e?.message || 'Failed to load contact page data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    setFetchError('');
    try {
      const now = new Date().toISOString();
      const extra_data = {
        email: email || '',
        phone: phone || '',
        address: addressEn || '',
        address_ar: addressAr || '',
      };

      const cmsPayload = {
        section_key: SECTION_CONTACT,
        title_en: titleEn || '',
        title_ar: titleAr || '',
        subtitle_en: subEn || '',
        subtitle_ar: subAr || '',
        content_en: email || '',
        content_ar: phone || '',
        extra_data,
        updated_at: now,
      };

      if (cmsRowId) {
        const { error: upErr } = await supabase.from('cms_content').update(cmsPayload).eq('id', cmsRowId);
        if (upErr) throw upErr;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('cms_content')
          .insert([cmsPayload])
          .select('id')
          .single();
        if (insErr) throw insErr;
        if (inserted?.id) setCmsRowId(inserted.id);
      }

      const seoSlug = (seo.slug || SEO_SLUG).trim() || SEO_SLUG;
      await upsertSeoBySlug(supabase, seoSlug, {
        title_en: seo.metaTitle,
        title_ar: seo.metaTitleAr,
        description_en: seo.metaDescription,
        description_ar: seo.metaDescriptionAr,
      });

      await loadData();
      window.alert('Contact page and SEO saved.');
    } catch (e) {
      console.error(e);
      window.alert(e?.message || 'Save failed.');
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
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading contact page…</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="CMS · Contact" description={seo.metaDescription} keywords={seo.keywords} />

      {fetchError ? (
        <div
          className="web-card"
          style={{ marginBottom: 16, borderColor: 'rgba(248, 113, 113, 0.45)', color: '#fecaca' }}
        >
          <strong>Load issue:</strong> {fetchError}
        </div>
      ) : null}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <h1 className="web-page-title" style={{ margin: 0 }}>
          Contact CMS
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => loadData()}>
            Reload
          </button>
          <button
            type="button"
            className="btn-publish"
            disabled={saving}
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">
            <LayoutGrid size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#94a3b8' }} />
            Contact &amp; support (<code style={{ fontSize: 12, color: '#94a3b8' }}>cms_content · {SECTION_CONTACT}</code>)
          </h2>
        </div>

        {!cmsRowId ? (
          <p style={{ color: '#94a3b8', marginBottom: 16 }}>
            No <code>contact_info</code> row found yet. Defaults are shown; saving will insert a new row.
          </p>
        ) : null}

        <BilingualTextInput
          labelEn="Page title (EN)"
          labelAr="عنوان الصفحة (AR)"
          valueEn={titleEn}
          valueAr={titleAr}
          onChangeEn={setTitleEn}
          onChangeAr={setTitleAr}
        />

        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Sub-headline (EN) → <code style={{ fontSize: 11, color: '#64748b' }}>subtitle_en</code>
          </label>
          <RichTextEditor value={subEn} onChange={setSubEn} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            العنوان الفرعي (AR) → <code style={{ fontSize: 11, color: '#64748b' }}>subtitle_ar</code>
          </label>
          <RichTextEditor value={subAr} onChange={setSubAr} rtl />
        </div>

        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Support email → <code style={{ fontSize: 11, color: '#64748b' }}>extra_data.email</code> &amp;{' '}
            <code style={{ fontSize: 11, color: '#64748b' }}>content_en</code>
          </label>
          <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
            Support phone → <code style={{ fontSize: 11, color: '#64748b' }}>extra_data.phone</code> &amp;{' '}
            <code style={{ fontSize: 11, color: '#64748b' }}>content_ar</code>
          </label>
          <input className="field-input" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%' }} />
        </div>
        <div style={{ marginTop: 20 }}>
          <BilingualTextInput
            labelEn="Office address (EN) → extra_data.address"
            labelAr="عنوان المكتب (AR) → extra_data.address_ar"
            valueEn={addressEn}
            valueAr={addressAr}
            onChangeEn={setAddressEn}
            onChangeAr={setAddressAr}
          />
        </div>
      </section>

      <SeoSection
        title="Contact page SEO"
        slugPrefix="qlink.com/"
        slugSuffixHint="support/contact"
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

export default CmsContact;
