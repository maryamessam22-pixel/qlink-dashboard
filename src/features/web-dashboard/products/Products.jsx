import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Package, Loader2, Edit2, Trash2, FileEdit } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import { loadFormDraftWithMeta } from '../../../lib/formDraft';
import '../../../styles/web-dashboard-pages.css';
import './Products.css';

const NEW_PRODUCT_DRAFT_KEY = 'qlink_draft_product_new';

const Products = () => {
  const location = useLocation();
  const [draftRefresh, setDraftRefresh] = useState(0);
  const [draftImgFailed, setDraftImgFailed] = useState(false);
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

  useEffect(() => {
    const onDraftSaved = (e) => {
      if (e?.detail?.key === NEW_PRODUCT_DRAFT_KEY) setDraftRefresh((n) => n + 1);
    };
    window.addEventListener('qlink-draft-saved', onDraftSaved);
    return () => window.removeEventListener('qlink-draft-saved', onDraftSaved);
  }, []);

  const newProductDraftMeta = useMemo(
    () => loadFormDraftWithMeta(NEW_PRODUCT_DRAFT_KEY),
    [location.pathname, draftRefresh]
  );
  const newProductDraft = newProductDraftMeta?.data;
  const showNewProductDraftAside = Boolean(newProductDraft && typeof newProductDraft === 'object');

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

  const draftCardTitle =
    (newProductDraft?.nameEn && String(newProductDraft.nameEn).trim()) ||
    (newProductDraft?.nameAr && String(newProductDraft.nameAr).trim()) ||
    'Untitled product';
  const draftCardSub =
    (newProductDraft?.subEn && String(newProductDraft.subEn).trim()) ||
    (newProductDraft?.subAr && String(newProductDraft.subAr).trim()) ||
    'Add details in the editor, then publish to show on the live site.';
  const draftPriceRaw = newProductDraft?.price;
  const draftPriceNum = draftPriceRaw !== '' && draftPriceRaw != null ? parseFloat(draftPriceRaw) : NaN;
  const draftPriceLabel =
    Number.isFinite(draftPriceNum) && draftPriceNum >= 0 ? `${draftPriceNum.toLocaleString()} EGP` : '—';
  const draftImage = (newProductDraft?.mainImage && String(newProductDraft.mainImage).trim()) || '';
  const draftSku = (newProductDraft?.sku && String(newProductDraft.sku).trim()) || 'No SKU yet';
  const draftSavedLabel =
    typeof newProductDraftMeta?.savedAt === 'number'
      ? `Saved ${new Date(newProductDraftMeta.savedAt).toLocaleString()}`
      : null;

  useEffect(() => {
    setDraftImgFailed(false);
  }, [draftImage, draftRefresh, location.pathname]);

  if (loading) {
    return (
      <div className="web-page-loading" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
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

      <div
        className={
          showNewProductDraftAside
            ? 'products-catalog-layout products-catalog-layout--with-draft'
            : 'products-catalog-layout'
        }
      >
        <div className="products-catalog-main">
          <div className="product-grid">
        {filtered.map((p) => (
          <article key={p.id} className="product-card">
            <Link to={`/web/products/${encodeURIComponent(p.id)}/edit`} className="product-card-link">
              <div className="product-card-image-wrap">
                {p.status === 'In Stock' && <span className="stock-badge">In stock</span>}
                
                {p.image_url ? (
                  <img 
                    src={p.image_url} 
                    alt={p.featured_image_alt || p.name_en} 
                    className="product-card-img" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                <div className="product-no-image" style={{ display: p.image_url ? 'none' : 'flex' }}>
                  <div className="no-image-text">No image</div>
                  {p.featured_image_alt && (
                    <div className="no-image-alt-hint">
                      &quot;{p.featured_image_alt}&quot;
                    </div>
                  )}
                </div>

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
        </div>

        {showNewProductDraftAside ? (
          <aside className="products-draft-aside" aria-label="Unpublished new product draft">
            <div className="products-draft-aside__header">
              <h2 className="products-draft-aside__title">Draft</h2>
              <p className="products-draft-aside__lead">
                Not on the public website yet. Open the editor and click <strong>Publish product</strong> to go live
                on your storefront.
              </p>
            </div>

            <article className="product-card product-card--draft">
              <div className="product-card-image-wrap">
                <span className="stock-badge stock-badge--draft">Draft</span>
                {draftImage && !draftImgFailed ? (
                  <img
                    src={draftImage}
                    alt=""
                    className="product-card-img"
                    onError={() => setDraftImgFailed(true)}
                  />
                ) : null}
                <div
                  className="product-no-image product-no-image--draft"
                  style={{ display: draftImage && !draftImgFailed ? 'none' : 'flex' }}
                >
                  <FileEdit size={28} strokeWidth={1.5} aria-hidden />
                  <div className="no-image-text">No image in draft</div>
                </div>
              </div>
              <div className="product-card-body">
                <div className="product-card-title-row">
                  <h2 className="product-card-name">{draftCardTitle}</h2>
                  <span className="product-card-price">{draftPriceLabel}</span>
                </div>
                <p className="product-card-desc">{draftCardSub}</p>
                <div className="product-card-foot">
                  <span className="product-card-stock">
                    <Package size={14} />
                    Unpublished
                  </span>
                  <span className="product-card-id">{draftSku}</span>
                </div>
              </div>
            </article>

            {draftSavedLabel ? <p className="products-draft-aside__meta">{draftSavedLabel}</p> : null}

            <Link to="/web/products/new" className="btn-primary products-draft-aside__cta">
              Continue editing
            </Link>
          </aside>
        ) : null}
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