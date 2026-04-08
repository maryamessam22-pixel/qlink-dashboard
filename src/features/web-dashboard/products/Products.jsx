import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Loader2, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase'; 
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import '../../../styles/web-dashboard-pages.css';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filterStock, setFilterStock] = useState('All');
  
  const [seo, setSeo] = useState({
    slug: 'shop/bracelet',
    metaTitle: 'Product catalog — Qlink Admin',
    metaDescription: 'Manage Qlink wearables.',
    keywords: 'products, catalog, qlink',
    featuredImageAlt: 'Catalog',
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // جلب المنتجات
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        // جلب بيانات الـ SEO الخاصة بصفحة المتجر/المنتجات
        const { data: seoData, error: seoError } = await supabase
          .from('seo')
          .select('*')
          .eq('slug', 'shop/bracelet') // استخدمت shop/bracelet بناءً على الـ SQL اللي بعتيه
          .single();

        if (productsData) setProducts(productsData);
        if (seoData) {
          setSeo({
            slug: seoData.slug,
            metaTitle: seoData.title_en,
            metaDescription: seoData.description_en,
            keywords: 'products, qlink, safety',
            featuredImageAlt: seoData.featured_image_alt || 'Catalog',
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. تحديث الـ SEO في الداتابيز (عند التغيير من الـ Dashboard)
  const handleSeoChange = async (updatedSeo) => {
    setSeo(updatedSeo);
    try {
      const { error } = await supabase
        .from('seo')
        .update({
          title_en: updatedSeo.metaTitle,
          description_en: updatedSeo.metaDescription,
        })
        .eq('slug', 'shop/bracelet');
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating SEO:', error.message);
    }
  };

  // 3. حذف المنتج
  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Delete error:', error.message);
      alert('Failed to delete product');
    }
  };

  // 4. الفلترة والبحث
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    
    return products.filter((p) => {
      const nameEn = p.name_en || '';
      const nameAr = p.name_ar || '';
      const id = p.sku || p.id || '';
      const inStock = p.status === 'In Stock';

      const matchesSearch = !s || 
        id.toLowerCase().includes(s) || 
        nameEn.toLowerCase().includes(s) || 
        nameAr.includes(q);

      const matchesFilter = filterStock === 'All' || 
          (filterStock === 'In Stock' && inStock) || 
          (filterStock === 'Out of Stock' && !inStock);
      
      return matchesSearch && matchesFilter;
    });
  }, [q, filterStock, products]);

  if (loading) {
    return (
      <div className="web-page-loading" style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading catalog...</p>
      </div>
    );
  }

  return (
    <div className="web-page products-page">
      <PageMeta title={seo.metaTitle} description={seo.metaDescription} keywords={seo.keywords} />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title">Product catalog</h1>
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
                  placeholder="Search by product name or SKU…" 
                  style={{ width: '100%', paddingLeft: '44px' }}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
              />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'In Stock', 'Out of Stock'].map(st => (
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

      <div className="product-grid">
        {filtered.map((p) => (
          <article key={p.id} className="product-card">
            <Link to={`/web/products/${encodeURIComponent(p.id)}/edit`} className="product-card-link">
              <div className="product-card-image-wrap">
                {p.status === 'In Stock' && <span className="stock-badge">In stock</span>}
                <img src={p.image_url} alt={p.name_en} className="product-card-img" />
                
                {/* Overlay buttons appearing on hover */}
                <div className="product-card-overlay" onClick={(e) => e.preventDefault()}>
                  <Link 
                    to={`/web/products/${encodeURIComponent(p.id)}/edit`}
                    className="overlay-btn btn-edit-overlay"
                    title="Edit Product"
                  >
                    <Edit2 size={20} />
                  </Link>
                  <button 
                    type="button"
                    className="overlay-btn btn-delete-overlay"
                    title="Delete Product"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(p.id);
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="product-card-body">
                <div className="product-card-title-row">
                  <h2 className="product-card-name">{p.name_en}</h2>
                  <span className="product-card-price">{Number(p.price).toLocaleString()} EGP</span>
                </div>
                <p className="product-card-desc">{p.subtitle_en}</p>
                <div className="product-card-foot">
                  <span className="product-card-stock">
                    <Package size={14} />
                    Status: {p.status}
                  </span>
                  <span className="product-card-id">{p.sku}</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>

      <SeoSection 
        title="Catalog page SEO" 
        slugPrefix="qlink.com/shop/" 
        value={seo} 
        onChange={handleSeoChange} 
      />
    </div>
  );
};

export default Products;