import React, { useState, useEffect } from 'react';
import { Clock, Download, Search, Loader2, Trash2 } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { supabase } from '../../../lib/supabase'; // مسار السوبابيز
import '../../../styles/web-dashboard-pages.css';
import './Orders.css';

const statusClass = (s) => {
  const k = (s || '').toLowerCase();
  if (k === 'shipped') return 'st-shipped';
  if (k === 'delivered') return 'st-delivered';
  if (k === 'processing' || k === 'pending') return 'st-muted';
  return 'st-muted';
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

  // Fetch Orders from Supabase
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // سحب الداتا من جدول order
        const { data, error } = await supabase
          .from('order')
          .select('*')
          .order('created_at', { ascending: false }); // ترتيب من الأحدث للأقدم

        if (error) throw error;

        if (data) {
          const formattedOrders = data.map(o => {
            // تظبيط التاريخ (بناخد من الـ created_at أو من الـ time اللي في الداتابيز)
            let formattedDate = o.time || 'Just now';
            if (o.created_at) {
              const dateObj = new Date(o.created_at);
              formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            // تحديد لون النقطة بناءً على اسم المنتج (Variant)
            let dotColor = '#6b7280'; // Default gray
            const variantStr = (o.variant_details || '').toLowerCase();
            if (variantStr.includes('black')) dotColor = '#1f2937';
            else if (variantStr.includes('silver') || variantStr.includes('gray')) dotColor = '#e5e7eb';
            else if (variantStr.includes('red')) dotColor = '#e03232';
            else if (variantStr.includes('blue')) dotColor = '#3b82f6';

            return {
              dbId: o.id,
              id: o.order_number || (o.id != null ? String(o.id).substring(0, 8) : ''),
              when: formattedDate,
              customer: o.customer_name || 'Unknown',
              product: o.variant_details || 'Qlink Bracelet', // استخدمنا variant_details
              dot: dotColor,
              status: o.status || 'Pending',
              revenue: `$${o.revenue || '0.00'}` // استخدمنا revenue
            };
          });
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDeleteOrder = async (dbId) => {
    if (dbId == null) return;
    if (!window.confirm('Delete this order from the database? This cannot be undone.')) return;
    try {
      setDeletingId(dbId);
      const { error } = await supabase.from('order').delete().eq('id', dbId);
      if (error) throw error;
      setOrders((prev) => prev.filter((o) => o.dbId !== dbId));
    } catch (e) {
      alert(e?.message || 'Failed to delete order.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="web-page-loading" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading orders...</p>
      </div>
    );
  }

  const filteredRows = orders.filter(r => {
    const matchesSearch =
      (r.id && r.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.customer && r.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.product && r.product.toLowerCase().includes(searchQuery.toLowerCase()));

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
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#8b949e' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#8b949e' }}>
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((r, index) => (
                  // حطينا index مع ال id عشان لو ال order_number اتكرر بالغلط في الداتا الوهمية الـ React ميزعلش
                  <tr key={`${r.dbId ?? r.id}-${index}`}>
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
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '8px 10px', color: '#f87171', borderColor: 'rgba(248,113,113,0.4)' }}
                        disabled={deletingId === r.dbId || r.dbId == null}
                        title="Delete order"
                        aria-label="Delete order"
                        onClick={() => handleDeleteOrder(r.dbId)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
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

      <SeoSection title="Orders admin SEO" slugPrefix="qlink.com/orders/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default Orders;