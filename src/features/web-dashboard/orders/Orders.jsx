import React, { useState } from 'react';
import { Clock, Download, Filter, Search } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import '../../../styles/web-dashboard-pages.css';
import './Orders.css';

const ROWS = [
  { id: 'ORD-8821', when: '2 mins ago', customer: 'Mohamed Saber', product: 'Qlink Black', dot: '#6b7280', status: 'Shipped', revenue: '$49.99' },
  { id: 'ORD-8820', when: '1 hour ago', customer: 'Sara Ali', product: 'Qlink Silver', dot: '#e5e7eb', status: 'Processing', revenue: '$49.99' },
  { id: 'ORD-8819', when: 'Yesterday', customer: 'Omar H.', product: 'Qlink Red', dot: '#e03232', status: 'Delivered', revenue: '$54.99' },
  { id: 'ORD-8818', when: '2 days ago', customer: 'Layla M.', product: 'Qlink Black', dot: '#6b7280', status: 'Pending', revenue: '$49.99' },
];

const statusClass = (s) => {
  const k = s.toLowerCase();
  if (k === 'shipped') return 'st-shipped';
  if (k === 'delivered') return 'st-delivered';
  if (k === 'processing' || k === 'pending') return 'st-muted';
  return 'st-muted';
};

const Orders = () => {
  const [notesEn, setNotesEn] = useState('<p>Internal notes for fulfillment (EN).</p>');
  const [notesAr, setNotesAr] = useState('<p>ملاحظات داخلية للتنفيذ (AR).</p>');
  const [seo, setSeo] = useState({
    slug: 'orders',
    metaTitle: 'Orders — Qlink Admin',
    metaDescription: 'Bracelet inventory and sales.',
    keywords: 'orders, sales, qlink',
    featuredImageAlt: 'Orders',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const filteredRows = ROWS.filter(r => {
    const matchesSearch = 
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'All' || r.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="web-page orders-page">
      <PageMeta title="Orders" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title">Bracelet inventory &amp; sales</h1>
          <p className="web-page-sub">Manage bracelets inventory and sales.</p>
        </div>
        <div className="orders-actions">
          <button type="button" className="btn-primary">
            <Download size={16} />
            Download CSV
          </button>
        </div>
      </div>

      <div className="filter-row" style={{ marginBottom: '24px' }}>
          <div className="search-wide-wrap">
              <Search className="search-wide-icon" size={18} />
              <input 
                  type="search" 
                  className="field-input" 
                  placeholder="Search orders, customers..." 
                  style={{ width: '100%', paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Shipped', 'Processing', 'Delivered', 'Pending'].map(s => (
                  <button 
                    key={s}
                    className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
                    onClick={() => setFilterStatus(s)}
                  >
                      {s}
                  </button>
              ))}
          </div>
      </div>

      <div className="web-card orders-table-card">
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order details</th>
                <th>Customer</th>
                <th>Product variant</th>
                <th>Status</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="ord-id">{r.id}</div>
                    <div className="ord-when">
                      <Clock size={12} />
                      {r.when}
                    </div>
                  </td>
                  <td>{r.customer}</td>
                  <td>
                    <span className="variant-dot" style={{ background: r.dot }} aria-hidden />
                    {r.product}
                  </td>
                  <td>
                    <span className={`status-pill ${statusClass(r.status)}`}>{r.status}</span>
                  </td>
                  <td className="ord-revenue">{r.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 12 }}>Fulfillment notes</h2>
        <p className="web-page-sub" style={{ marginBottom: 16 }}>Bilingual internal notes (no UI language toggle).</p>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Notes (EN)</label>
        <RichTextEditor value={notesEn} onChange={setNotesEn} />
        <div style={{ marginTop: 16 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>ملاحظات (AR)</label>
          <RichTextEditor value={notesAr} onChange={setNotesAr} rtl />
        </div>
      </section>

      <SeoSection title="Orders admin SEO" slugPrefix="admin.qlink.com/orders/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default Orders;
