import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { SAMPLE_PRODUCTS } from '../products/ProductEditor';
import '../../../styles/web-dashboard-pages.css';
import './Inventory.css';

const Inventory = () => {
  const [policyEn, setPolicyEn] = useState('<p>Restock when available units fall below threshold.</p>');
  const [policyAr, setPolicyAr] = useState('<p>أعد التخزين عندما تنخفض الوحدات المتاحة عن الحد.</p>');
  const [seo, setSeo] = useState({
    slug: 'inventory',
    metaTitle: 'Inventory — Qlink Admin',
    metaDescription: 'Stock levels and reservations.',
    keywords: 'inventory, stock, qlink',
    featuredImageAlt: 'Inventory',
  });

  const items = SAMPLE_PRODUCTS.map((p, i) => {
    const reserved = 40 + i * 5;
    const avail = Math.max(0, p.stock - reserved);
    const cap = p.stock + 200;
    const availPct = Math.min(100, Math.round((avail / cap) * 100));
    const resPct = Math.min(100, Math.round((reserved / cap) * 100));
    return { ...p, avail, reserved, availPct, resPct, sku: `QL-SLV-${String(i + 2).padStart(3, '0')}` };
  });

  return (
    <div className="web-page inventory-page">
      <PageMeta title="Inventory" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title">Inventory management</h1>
          <p className="web-page-sub">Manage Qlink wearables and inventory levels.</p>
        </div>
        <Link to="/web/products/new" className="btn-primary">+ Add new product</Link>
      </div>

      <div className="inventory-grid">
        {items.map((it) => (
          <article key={it.id} className="inv-card">
            <div className="inv-card-top">
              <img src={it.image} alt="" className="inv-thumb" />
              <div>
                <h2 className="inv-name">{it.nameEn}</h2>
                <p className="inv-sku">{it.sku}</p>
              </div>
              <span className="inv-stock-badge">In stock</span>
            </div>
            <div className="inv-metric">
              <div className="inv-metric-label">
                <span>Available</span>
                <span>{it.avail.toLocaleString()} units</span>
              </div>
              <div className="inv-bar-track">
                <div className="inv-bar-fill inv-bar-blue" style={{ width: `${it.availPct}%` }} />
              </div>
            </div>
            <div className="inv-metric">
              <div className="inv-metric-label">
                <span>Reserved (orders)</span>
                <span>{it.reserved.toLocaleString()} units</span>
              </div>
              <div className="inv-bar-track">
                <div className="inv-bar-fill inv-bar-gray" style={{ width: `${it.resPct}%` }} />
              </div>
            </div>
            <div className="inv-actions">
              <button type="button" className="btn-secondary">Restock</button>
              <button type="button" className="btn-secondary">History</button>
            </div>
          </article>
        ))}
      </div>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 12 }}>Restock policy</h2>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Policy (EN)</label>
        <RichTextEditor value={policyEn} onChange={setPolicyEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>السياسة (AR)</label>
          <RichTextEditor value={policyAr} onChange={setPolicyAr} rtl />
        </div>
      </section>

      <SeoSection title="Inventory admin SEO" slugPrefix="admin.qlink.com/inventory/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default Inventory;
