import React from 'react';
import './SeoSection.css';

const defaultSeo = {
  slug: '',
  metaTitle: '',
  metaDescription: '',
  keywords: '',
  featuredImageAlt: '',
};


const SeoSection = ({
  title = 'Page SEO',
  slugPrefix = 'qlink.com/',
  slugSuffixHint = 'unique-slug',
  value,
  onChange,
  showFeaturedAlt = true,
  badge,
}) => {
  const v = { ...defaultSeo, ...value };

  const patch = (key, val) => {
    onChange({ ...v, [key]: val });
  };

  return (
    <section className="seo-section" aria-labelledby={title ? 'seo-section-title' : undefined}>
      {(title || badge) ? (
        <div className="seo-section-head">
          {title ? (
            <h3 id="seo-section-title" className="seo-section-title">
              {title}
            </h3>
          ) : null}
          {badge ? <span className="seo-badge">{badge}</span> : null}
        </div>
      ) : null}

      <div className="seo-field">
        <label className="seo-label">Slug / URL</label>
        <div className="seo-slug-row">
          <span className="seo-slug-prefix">{slugPrefix}</span>
          <input
            type="text"
            className="seo-input"
            dir="ltr"
            value={v.slug}
            onChange={(e) => patch('slug', e.target.value)}
            placeholder={slugSuffixHint}
          />
        </div>
      </div>

      <div className="seo-field">
        <label className="seo-label">Meta title (page title)</label>
        <input
          type="text"
          className="seo-input"
          value={v.metaTitle}
          onChange={(e) => patch('metaTitle', e.target.value)}
          placeholder="SEO title displayed in search results"
        />
      </div>

      <div className="seo-field">
        <label className="seo-label">Meta description</label>
        <textarea
          className="seo-input seo-textarea"
          rows={3}
          value={v.metaDescription}
          onChange={(e) => patch('metaDescription', e.target.value)}
          placeholder="Brief summary for search engines…"
        />
      </div>

      <div className="seo-field">
        <label className="seo-label">Keywords</label>
        <input
          type="text"
          className="seo-input"
          value={v.keywords}
          onChange={(e) => patch('keywords', e.target.value)}
          placeholder="comma, separated, keywords"
        />
      </div>

      {showFeaturedAlt ? (
        <div className="seo-field">
          <label className="seo-label">Featured image alt text</label>
          <input
            type="text"
            className="seo-input"
            value={v.featuredImageAlt}
            onChange={(e) => patch('featuredImageAlt', e.target.value)}
            placeholder="Describe the image for accessibility and SEO"
          />
        </div>
      ) : null}
    </section>
  );
};

export default SeoSection;
