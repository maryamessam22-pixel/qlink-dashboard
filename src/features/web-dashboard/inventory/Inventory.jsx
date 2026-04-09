import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { supabase } from '../../../lib/supabase';
import '../../../styles/web-dashboard-pages.css';
import './Inventory.css';

const REFRESH_MS = 60_000;

function mapInventoryRow(row) {
  const available = Number(row.available_units) || 0;
  const reserved = Number(row.reserved_units) || 0;
  const total = Math.max(1, available + reserved);
  const stockLabel = String(row.stock ?? '').trim() || '—';
  return {
    id: row.id,
    productId: row.product_id,
    image: row['product-img'] || '',
    nameEn: row['product-name'] || 'Product',
    sku: row.serial || '—',
    stockLabel,
    avail: available,
    reserved,
    availPct: Math.round((available / total) * 100),
    resPct: Math.round((reserved / total) * 100),
    imageAlt: row.featured_image_alt || row['product-name'] || 'Product',
  };
}

function stockBadgeClass(stockLabel) {
  const s = stockLabel.toLowerCase();
  if (s === 'out of stock' || s === 'out') return 'inv-stock-badge inv-stock-badge--out';
  if (s === 'low stock' || s === 'low') return 'inv-stock-badge inv-stock-badge--low';
  return 'inv-stock-badge inv-stock-badge--ok';
}

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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStock, setFilterStock] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchInventory = async () => {
      setFetchError('');
      setLoading(true);
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('updated_at', { ascending: false });
      if (!mounted) return;
      if (error) {
        setFetchError(error.message || 'Failed to load inventory.');
        setItems([]);
        setLoading(false);
        return;
      }
      setItems((data || []).map(mapInventoryRow));
      setLoading(false);
    };
    fetchInventory();
    const id = window.setInterval(fetchInventory, REFRESH_MS);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return items.filter((it) => {
      const matchesSearch =
        !q ||
        it.nameEn.toLowerCase().includes(q) ||
        it.sku.toLowerCase().includes(q);
      const stockNorm = it.stockLabel.toLowerCase();
      const matchesFilter =
        filterStock === 'All' ||
        (filterStock === 'In Stock' && stockNorm === 'in stock') ||
        (filterStock === 'Low Stock' && stockNorm === 'low stock') ||
        (filterStock === 'Out of Stock' && (stockNorm === 'out of stock' || it.avail === 0));
      return matchesSearch && matchesFilter;
    });
  }, [items, searchQuery, filterStock]);

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

      <div className="filter-row" style={{ marginBottom: '24px' }}>
          <div className="search-wide-wrap">
              <Search className="search-wide-icon" size={18} />
              <input 
                  type="search" 
                  className="field-input" 
                  placeholder="Search inventory by name or SKU..." 
                  style={{ width: '100%', paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(st => (
                  <button 
                    key={st}
                    className={`filter-pill ${filterStock === st ? 'active' : ''}`}
                    onClick={() => setFilterStock(st)}
                  >
                      {st}
                  </button>
              ))}
          </div>
      </div>

      {fetchError ? (
        <p className="inventory-error" role="alert">{fetchError}</p>
      ) : null}

      <div className="inventory-grid">
        {loading ? (
          <p className="inventory-loading">Loading inventory…</p>
        ) : filteredItems.length === 0 ? (
          <p className="inventory-empty">
            {items.length === 0 ? 'No inventory rows yet.' : 'No rows match your filters.'}
          </p>
        ) : (
          filteredItems.map((it) => (
          <article key={it.id} className="inv-card">
            <div className="inv-card-top">
              <img src={it.image} alt={it.imageAlt} className="inv-thumb" />
              <div>
                <h2 className="inv-name">{it.nameEn}</h2>
                <p className="inv-sku">{it.sku}</p>
              </div>
              <span className={stockBadgeClass(it.stockLabel)}>{it.stockLabel}</span>
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
        ))
        )}
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
