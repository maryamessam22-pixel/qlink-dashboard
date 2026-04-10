import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, Loader2, Plus, Save, Search, Star, Trash2 } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import SeoSection from '../../../../components/seo/SeoSection';
import { supabase } from '../../../../lib/supabase';
import '../../../../styles/web-dashboard-pages.css';

const SEO_SLUG = 'reviews';

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Normalize plain-text DB values for RichTextEditor */
function reviewTextToHtml(raw) {
  if (raw == null || String(raw).trim() === '') return '<p></p>';
  const t = String(raw).trim();
  if (t.startsWith('<')) return t;
  return `<p>${escapeHtml(t).replace(/\n/g, '<br/>')}</p>`;
}

function mapRow(row) {
  const vis = row.is_visible;
  return {
    id: row.id,
    customer_name: row.customer_name ?? '',
    customer_subtitle: row.customer_subtitle ?? '',
    rating: Math.min(5, Math.max(1, Number(row.rating) || 5)),
    review_text: reviewTextToHtml(row.review_text),
    is_featured: Boolean(row.is_featured),
    /* DB column is_visible boolean NOT NULL DEFAULT true */
    is_visible: vis === false ? false : true,
    created_at: row.created_at,
  };
}

function isMissingIsVisibleColumn(error) {
  if (!error) return false;
  const msg = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`.toLowerCase();
  return error.code === '42703' || msg.includes('is_visible');
}

const CmsReviews = () => {
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [schemaHint, setSchemaHint] = useState('');
  /** When false, DB has no is_visible column — hide toggle and omit field from writes. */
  const [hasIsVisibleColumn, setHasIsVisibleColumn] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [seoSaving, setSeoSaving] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('All');

  const [seo, setSeo] = useState({
    slug: SEO_SLUG,
    metaTitle: 'Customer reviews — Qlink',
    metaDescription: 'Read verified Qlink bracelet reviews.',
    keywords: 'reviews, qlink, testimonials',
    featuredImageAlt: 'Reviews',
  });

  const loadReviews = useCallback(async () => {
    setListError('');
    setSchemaHint('');
    const fullSelect =
      'id, customer_name, customer_subtitle, rating, review_text, is_featured, is_visible, created_at';
    const baseSelect = 'id, customer_name, customer_subtitle, rating, review_text, is_featured, created_at';

    let { data, error } = await supabase.from('reviews').select(fullSelect).order('created_at', { ascending: false });

    if (error && isMissingIsVisibleColumn(error)) {
      setHasIsVisibleColumn(false);
      setSchemaHint(
        'Show/hide on the website is optional: add column is_visible (file supabase/reviews_add_is_visible.sql). Until then, all reviews load normally and Featured still works.'
      );
      const second = await supabase.from('reviews').select(baseSelect).order('created_at', { ascending: false });
      data = second.data;
      error = second.error;
    } else if (!error) {
      setHasIsVisibleColumn(true);
    }

    if (error) {
      setListError(error.message || 'Failed to load reviews. Check Supabase URL/key and RLS policies for table reviews.');
      setReviews([]);
      return;
    }
    setReviews((data || []).map(mapRow));
  }, []);

  const loadSeo = useCallback(async () => {
    const { data, error } = await supabase.from('seo').select('*').eq('slug', SEO_SLUG).maybeSingle();
    if (error && error.code !== 'PGRST116') console.error('SEO fetch:', error);
    if (data) {
      setSeo({
        slug: data.slug || SEO_SLUG,
        metaTitle: data.title_en || 'Customer reviews — Qlink',
        metaDescription: data.description_en || '',
        keywords: data.keywords || 'reviews, qlink, testimonials',
        featuredImageAlt: data.featured_image_alt || 'Reviews',
      });
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadReviews(), loadSeo()]);
    setLoading(false);
  }, [loadReviews, loadSeo]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const patchLocal = (id, partial) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...partial } : r)));
  };

  const handleAddReview = useCallback(async () => {
    setAdding(true);
    setListError('');
    try {
      const payload = {
        customer_name: 'New customer',
        customer_subtitle: '',
        rating: 5,
        review_text: '<p></p>',
        is_featured: false,
        is_visible: true,
      };
      let { data, error } = await supabase.from('reviews').insert([payload]).select('*').single();
      if (error && isMissingIsVisibleColumn(error)) {
        setHasIsVisibleColumn(false);
        const { customer_name, customer_subtitle, rating, review_text, is_featured } = payload;
        const retry = await supabase
          .from('reviews')
          .insert([{ customer_name, customer_subtitle, rating, review_text, is_featured }])
          .select('*')
          .single();
        data = retry.data;
        error = retry.error;
      }
      if (error) {
        alert(error.message || 'Could not add review.');
        return;
      }
      setReviews((prev) => [mapRow(data), ...prev]);
    } finally {
      setAdding(false);
    }
  }, []);

  useEffect(() => {
    const onAdd = () => {
      handleAddReview();
    };
    window.addEventListener('cms:add-section', onAdd);
    return () => window.removeEventListener('cms:add-section', onAdd);
  }, [handleAddReview]);

  const handleSaveReview = async (rev) => {
    if (!rev.id) return;
    setSavingId(rev.id);
    setListError('');
    try {
      const basePayload = {
        customer_name: rev.customer_name,
        customer_subtitle: rev.customer_subtitle,
        rating: rev.rating,
        review_text: rev.review_text,
        is_featured: rev.is_featured,
      };
      const payload = hasIsVisibleColumn ? { ...basePayload, is_visible: rev.is_visible } : basePayload;

      let { error } = await supabase.from('reviews').update(payload).eq('id', rev.id);

      if (error && hasIsVisibleColumn && isMissingIsVisibleColumn(error)) {
        setHasIsVisibleColumn(false);
        const { error: e2 } = await supabase.from('reviews').update(basePayload).eq('id', rev.id);
        error = e2;
      }

      if (error) {
        window.alert(error.message || 'Save failed.');
        return;
      }
      await loadReviews();
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) {
        alert(error.message || 'Delete failed.');
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleField = async (id, field, value) => {
    if (field === 'is_visible' && !hasIsVisibleColumn) return;
    patchLocal(id, { [field]: value });
    const { error } = await supabase.from('reviews').update({ [field]: value }).eq('id', id);
    if (error) {
      patchLocal(id, { [field]: !value });
      if (field === 'is_visible' && isMissingIsVisibleColumn(error)) {
        setHasIsVisibleColumn(false);
        setSchemaHint(
          'Database has no is_visible column yet. Add it with supabase/reviews_add_is_visible.sql to use Show on site.'
        );
      } else {
        window.alert(error.message || 'Update failed.');
      }
      await loadReviews();
    }
  };

  const saveSeo = async () => {
    setSeoSaving(true);
    try {
      const { data: existing } = await supabase.from('seo').select('id').eq('slug', seo.slug).maybeSingle();
      const payload = {
        slug: seo.slug,
        title_en: seo.metaTitle,
        description_en: seo.metaDescription,
        keywords: seo.keywords,
        featured_image_alt: seo.featuredImageAlt,
      };
      if (existing?.id) {
        const { error } = await supabase.from('seo').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('seo').insert([payload]);
        if (error) throw error;
      }
      alert('SEO saved.');
    } catch (e) {
      console.error(e);
      alert(e?.message || 'Failed to save SEO.');
    } finally {
      setSeoSaving(false);
    }
  };

  const stripHtml = (html) =>
    String(html || '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const filteredReviews = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return reviews.filter((rev) => {
      const blob = `${rev.customer_name} ${rev.customer_subtitle} ${stripHtml(rev.review_text)}`.toLowerCase();
      const matchesSearch = !q || blob.includes(q);
      const matchesFilter = filterRating === 'All' || rev.rating === Number(filterRating);
      return matchesSearch && matchesFilter;
    });
  }, [reviews, searchQuery, filterRating]);

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
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading reviews…</p>
      </div>
    );
  }

  return (
    <div>
      <PageMeta title="CMS · Reviews" description={seo.metaDescription} keywords={seo.keywords} />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <h1 className="web-page-title" style={{ margin: 0 }}>
          Reviews CMS
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button type="button" className="btn-secondary" onClick={loadAll}>
            Reload
          </button>
          <button type="button" className="btn-primary" onClick={handleAddReview} disabled={adding}>
            {adding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Add review
          </button>
        </div>
      </div>

      {listError ? (
        <p className="field-label" style={{ color: '#f87171', marginBottom: 16 }}>
          {listError}
        </p>
      ) : null}

      {schemaHint ? (
        <p
          className="field-label"
          style={{
            color: '#86efac',
            marginBottom: 16,
            padding: '12px 14px',
            background: 'rgba(34, 197, 94, 0.08)',
            borderRadius: 10,
            border: '1px solid rgba(34, 197, 94, 0.25)',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {schemaHint}
        </p>
      ) : null}

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">
            <Star size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#eab308' }} />
            Customer reviews (Supabase)
          </h2>
        </div>
        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#8b949e' }}>
          Loaded <strong style={{ color: '#e6edf3' }}>{reviews.length}</strong> review{reviews.length === 1 ? '' : 's'}{' '}
          from Supabase.
          {hasIsVisibleColumn ? (
            <>
              {' '}
              <strong style={{ color: '#e6edf3' }}>Show on site</strong> updates <code style={{ color: '#cbd5e1' }}>is_visible</code>
              — the public site should only list rows where it is <code style={{ color: '#cbd5e1' }}>true</code>.
              <strong style={{ color: '#e6edf3' }}> Featured</strong> is independent (marketing highlight).
            </>
          ) : (
            <>
              {' '}
              Add column <code style={{ color: '#cbd5e1' }}>is_visible</code> (see <code style={{ color: '#cbd5e1' }}>supabase/reviews_add_is_visible.sql</code>)
              to enable show/hide.
            </>
          )}
        </p>
        {(searchQuery.trim() || filterRating !== 'All') && filteredReviews.length < reviews.length ? (
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#fbbf24' }}>
            Filters hide {reviews.length - filteredReviews.length} review(s). Use &quot;All ratings&quot; and clear
            search to see every row (e.g. 2-star reviews).
            <button
              type="button"
              className="btn-ghost"
              style={{ marginLeft: 10, padding: '4px 10px', fontSize: 12 }}
              onClick={() => {
                setSearchQuery('');
                setFilterRating('All');
              }}
            >
              Clear filters
            </button>
          </p>
        ) : null}

        <div className="filter-row" style={{ marginBottom: 24, marginTop: 8 }}>
          <div className="search-wide-wrap">
            <Search className="search-wide-icon" size={18} />
            <input
              type="search"
              className="field-input"
              placeholder="Search by name, subtitle, or review text…"
              style={{ width: '100%', paddingLeft: 44 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', '5', '4', '3', '2', '1'].map((r) => (
              <button
                key={r}
                type="button"
                className={`filter-pill ${filterRating === r ? 'active' : ''}`}
                onClick={() => setFilterRating(r)}
              >
                {r === 'All' ? 'All ratings' : `${r} stars`}
              </button>
            ))}
          </div>
        </div>

        {filteredReviews.length === 0 && reviews.length > 0 ? (
          <p style={{ color: '#8b949e', fontSize: 14 }}>
            No reviews match your filters ({reviews.length} in database).{' '}
            <button type="button" className="btn-ghost" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => {
              setSearchQuery('');
              setFilterRating('All');
            }}>
              Clear filters
            </button>
          </p>
        ) : null}
        {reviews.length === 0 && !listError ? (
          <p style={{ color: '#8b949e', fontSize: 14 }}>
            No rows returned. Confirm data exists in table <code style={{ color: '#cbd5e1' }}>reviews</code> and that
            Row Level Security allows read for your anon key.
          </p>
        ) : null}

        {filteredReviews.map((rev) => {
          const created = rev.created_at
            ? new Date(rev.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
            : '';
          return (
            <div key={rev.id} className="review-editor-block">
              <div className="review-editor-block-head">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="review-editor-index" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                    {rev.customer_name || 'Untitled'}
                    {hasIsVisibleColumn && !rev.is_visible ? (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(248, 113, 113, 0.12)',
                          color: '#f87171',
                          border: '1px solid rgba(248, 113, 113, 0.35)',
                        }}
                      >
                        Hidden on site
                      </span>
                    ) : null}
                    {rev.is_featured ? (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(234, 179, 8, 0.12)',
                          color: '#eab308',
                          border: '1px solid rgba(234, 179, 8, 0.35)',
                        }}
                      >
                        Featured
                      </span>
                    ) : null}
                  </span>
                  {created ? (
                    <span style={{ fontSize: 11, color: '#8b949e', fontWeight: 500 }}>{created}</span>
                  ) : null}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  {hasIsVisibleColumn ? (
                    <label
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 12,
                        color: '#cbd5e1',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rev.is_visible}
                        onChange={(e) => toggleField(rev.id, 'is_visible', e.target.checked)}
                      />
                      {rev.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      Show on site
                    </label>
                  ) : null}
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#cbd5e1',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rev.is_featured}
                      onChange={(e) => toggleField(rev.id, 'is_featured', e.target.checked)}
                    />
                    <Star size={14} style={{ color: '#eab308' }} />
                    Featured
                  </label>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '8px 14px', fontSize: 12 }}
                    onClick={() => handleSaveReview(rev)}
                    disabled={savingId === rev.id}
                  >
                    {savingId === rev.id ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save
                  </button>
                  <button
                    type="button"
                    className="about-team-remove"
                    style={{ position: 'static' }}
                    aria-label="Delete review"
                    onClick={() => handleDeleteReview(rev.id)}
                    disabled={deletingId === rev.id}
                  >
                    {deletingId === rev.id ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                  Customer name
                </label>
                <input
                  className="field-input"
                  style={{ width: '100%' }}
                  value={rev.customer_name}
                  onChange={(e) => patchLocal(rev.id, { customer_name: e.target.value })}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                  Subtitle / role
                </label>
                <input
                  className="field-input"
                  style={{ width: '100%' }}
                  value={rev.customer_subtitle}
                  onChange={(e) => patchLocal(rev.id, { customer_subtitle: e.target.value })}
                />
              </div>
              <div style={{ marginTop: 12 }} className="rating-row">
                <label className="field-label">Rating (1–5)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="field-input rating-input"
                  value={rev.rating}
                  onChange={(e) =>
                    patchLocal(rev.id, { rating: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })
                  }
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>
                  Review text
                </label>
                <RichTextEditor value={rev.review_text} onChange={(html) => patchLocal(rev.id, { review_text: html })} />
              </div>
            </div>
          );
        })}
      </section>

      <SeoSection title="Reviews SEO" slugPrefix="qlink.com/" value={seo} onChange={setSeo} badge="Live" />
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="btn-publish"
          onClick={saveSeo}
          disabled={seoSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
        >
          {seoSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {seoSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default CmsReviews;
