import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import { SAMPLE_PRODUCTS } from './ProductEditor';
import '../../../styles/web-dashboard-pages.css';
import './Products.css';

const Products = () => {
  const [q, setQ] = useState('');
  const [seo, setSeo] = useState({
    slug: 'catalog',
    metaTitle: 'Product catalog — Qlink Admin',
    metaDescription: 'Manage Qlink wearables.',
    keywords: 'products, catalog, qlink',
    featuredImageAlt: 'Catalog',
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SAMPLE_PRODUCTS;
    return SAMPLE_PRODUCTS.filter(
      (p) => p.id.toLowerCase().includes(s) || p.nameEn.toLowerCase().includes(s) || p.nameAr.includes(q)
    );
  }, [q]);

  return (
    <div className="web-page products-page">
      <PageMeta title="Product catalog" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title">Product catalog</h1>
          <p className="web-page-sub">Manage Qlink wearables and inventory levels.</p>
        </div>
        <Link to="/web/products/new" className="btn-primary">+ Add new product</Link>
      </div>

      <div className="search-wide-wrap">
        <Search className="search-wide-icon" size={18} />
        <input
          type="search"
          className="field-input products-search-input"
          placeholder="Search by product name or ID…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
        />
      </div>

      <div className="product-grid">
        {filtered.map((p) => (
          <article key={p.id} className="product-card">
            <Link to={`/web/products/${encodeURIComponent(p.id)}/edit`} className="product-card-link">
              <div className="product-card-image-wrap">
                {p.inStock ? <span className="stock-badge">In stock</span> : null}
                <img src={p.image} alt="" className="product-card-img" />
              </div>
              <div className="product-card-body">
                <div className="product-card-title-row">
                  <h2 className="product-card-name">{p.nameEn}</h2>
                  <span className="product-card-price">{p.price.toLocaleString()}</span>
                </div>
                <p className="product-card-desc">{p.subtitleEn}</p>
                <div className="product-card-foot">
                  <span className="product-card-stock">
                    <Package size={14} />
                    Stock: {p.stock.toLocaleString()} units
                  </span>
                  <span className="product-card-id">{p.id}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <SeoSection title="Catalog page SEO" slugPrefix="qlink.com/shop/" value={seo} onChange={setSeo} />
    </div>
  );
};

export default Products;
