import React, { useEffect, useState } from 'react';
import { Plus, Star, Trash2, Search } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const CmsReviews = () => {
  const [quoteEn, setQuoteEn] = useState('“Qlink gave our family peace of mind.”');
  const [quoteAr, setQuoteAr] = useState('«كيو لينك منح عائلتنا راحة البال»');
  const [storyEn, setStoryEn] = useState('<p>Full featured story about a verified customer experience.</p>');
  const [storyAr, setStoryAr] = useState('<p>قصة كاملة عن تجربة عميل موثقة.</p>');
  const [authorEn, setAuthorEn] = useState('Malak Yasser');
  const [authorAr, setAuthorAr] = useState('ملك ياسر');
  const [authorSubEn, setAuthorSubEn] = useState('Verified purchase');
  const [authorSubAr, setAuthorSubAr] = useState('شراء موثق');
  const [reviews, setReviews] = useState([
    { nameEn: 'Salma Ahmed', nameAr: 'سلمى أحمد', subEn: 'Diabetes patient', subAr: 'مريضة سكري', rating: 5, textEn: '<p>Excellent product.</p>', textAr: '<p>منتج ممتاز.</p>' },
  ]);
  const [seo, setSeo] = useState({
    slug: 'reviews',
    metaTitle: 'Customer reviews — Qlink',
    metaDescription: 'Read verified Qlink bracelet reviews.',
    keywords: 'reviews, qlink, testimonials',
    featuredImageAlt: 'Reviews',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('All');

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = 
        rev.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
        rev.textEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rev.nameAr.includes(searchQuery) ||
        rev.textAr.includes(searchQuery);
    
    const matchesFilter = filterRating === 'All' || rev.rating === Number(filterRating);
    
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    const onAdd = () => {
      setReviews((r) => [...r, { nameEn: '', nameAr: '', subEn: '', subAr: '', rating: 5, textEn: '', textAr: '' }]);
    };
    window.addEventListener('cms:add-section', onAdd);
    return () => window.removeEventListener('cms:add-section', onAdd);
  }, []);

  const patch = (i, key, val) => {
    setReviews((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };

  return (
    <div>
      <PageMeta title="CMS · Reviews" description={seo.metaDescription} keywords={seo.keywords} />

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>
          <Star size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#eab308' }} />
          Featured story
        </h2>
        <BilingualTextInput
          labelEn="Headline quote (EN)"
          labelAr="اقتباس العنوان (AR)"
          valueEn={quoteEn}
          valueAr={quoteAr}
          onChangeEn={setQuoteEn}
          onChangeAr={setQuoteAr}
        />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Full story (EN)</label>
          <RichTextEditor value={storyEn} onChange={setStoryEn} />
        </div>
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>القصة الكاملة (AR)</label>
          <RichTextEditor value={storyAr} onChange={setStoryAr} rtl />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Author name (EN)"
            labelAr="اسم المؤلف (AR)"
            valueEn={authorEn}
            valueAr={authorAr}
            onChangeEn={setAuthorEn}
            onChangeAr={setAuthorAr}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Author subtitle (EN)"
            labelAr="العنوان الفرعي (AR)"
            valueEn={authorSubEn}
            valueAr={authorSubAr}
            onChangeEn={setAuthorSubEn}
            onChangeAr={setAuthorSubAr}
          />
        </div>
      </section>

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">Customer reviews</h2>
          <button type="button" className="btn-primary" onClick={() => setReviews((r) => [...r, { nameEn: '', nameAr: '', subEn: '', subAr: '', rating: 5, textEn: '', textAr: '' }])}>
            <Plus size={18} />
            Add review
          </button>
        </div>
        
        <div className="filter-row" style={{ marginBottom: '24px' }}>
            <div className="search-wide-wrap">
                <Search className="search-wide-icon" size={18} />
                <input 
                    type="search" 
                    className="field-input" 
                    placeholder="Search reviews..." 
                    style={{ width: '100%', paddingLeft: '44px' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                {['All', '5', '4', '3', '2', '1'].map(r => (
                    <button 
                        key={r}
                        className={`filter-pill ${filterRating === r ? 'active' : ''}`}
                        onClick={() => setFilterRating(r)}
                    >
                        {r === 'All' ? 'All ratings' : `${r} Stars`}
                    </button>
                ))}
            </div>
        </div>

        {filteredReviews.map((rev, i) => {
          // Since we are mapping over filtered list but need to patch original index,
          // we should find original index.
          const originalIndex = reviews.indexOf(rev);
          return (
            <div key={originalIndex} className="review-editor-block">
              <div className="review-editor-block-head">
                <span className="review-editor-index">Review {originalIndex + 1}</span>
                <button type="button" className="about-team-remove" style={{ position: 'static' }} aria-label="Remove" onClick={() => setReviews((p) => p.filter((_, j) => j !== originalIndex))}>
                  <Trash2 size={16} />
                </button>
              </div>
              <BilingualTextInput
                labelEn="Name (EN)"
                labelAr="الاسم (AR)"
                valueEn={rev.nameEn}
                valueAr={rev.nameAr}
                onChangeEn={(v) => patch(originalIndex, 'nameEn', v)}
                onChangeAr={(v) => patch(originalIndex, 'nameAr', v)}
              />
              <div style={{ marginTop: 12 }}>
                <BilingualTextInput
                  labelEn="Subtitle (EN)"
                  labelAr="العنوان الفرعي (AR)"
                  valueEn={rev.subEn}
                  valueAr={rev.subAr}
                  onChangeEn={(v) => patch(originalIndex, 'subEn', v)}
                  onChangeAr={(v) => patch(originalIndex, 'subAr', v)}
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
                  onChange={(e) => patch(originalIndex, 'rating', Number(e.target.value))}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Review text (EN)</label>
                <RichTextEditor value={rev.textEn} onChange={(v) => patch(originalIndex, 'textEn', v)} />
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>نص المراجعة (AR)</label>
                <RichTextEditor value={rev.textAr} onChange={(v) => patch(originalIndex, 'textAr', v)} rtl />
              </div>
            </div>
          );
        })}
      </section>

      <SeoSection title="Reviews SEO" slugPrefix="qlink.com/reviews/" value={seo} onChange={setSeo} />
    </div>
  );
};

export default CmsReviews;
