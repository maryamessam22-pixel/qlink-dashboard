import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../components/bilingual/BilingualField';
import SeoSection from '../../../components/seo/SeoSection';
import './ProductEditor.css';
import '../../../styles/web-dashboard-pages.css';
import '../../../components/bilingual/BilingualField.css';

export const SAMPLE_PRODUCTS = [
  {
    id: 'PRO-001',
    nameEn: 'Qlink Nova (Touch)',
    nameAr: 'كيو لينك نوفا (لمس)',
    subtitleEn: 'Smart touchscreen safety bracelet',
    subtitleAr: 'سوار أمان بشاشة لمس ذكية',
    price: 1499,
    stock: 1240,
    inStock: true,
    image: 'https://placehold.co/400x280/1f2937/e6edf3?text=Qlink+Nova',
  },
  {
    id: 'PRO-002',
    nameEn: 'Qlink Pulse',
    nameAr: 'كيو لينك بالس',
    subtitleEn: 'Tactical buttons & QR core',
    subtitleAr: 'أزرار تكتيكية ونواة QR',
    price: 1299,
    stock: 890,
    inStock: true,
    image: 'https://placehold.co/400x280/334155/e6edf3?text=Qlink+Pulse',
  },
];

const ProductEditor = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isNew = productId === 'new' || !productId;

  const existing = useMemo(() => SAMPLE_PRODUCTS.find((p) => p.id === productId), [productId]);

  const [nameEn, setNameEn] = useState(existing?.nameEn ?? '');
  const [nameAr, setNameAr] = useState(existing?.nameAr ?? '');
  const [subEn, setSubEn] = useState(existing?.subtitleEn ?? '');
  const [subAr, setSubAr] = useState(existing?.subtitleAr ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [priceArLabel, setPriceArLabel] = useState('');
  const [mainImage, setMainImage] = useState(existing?.image ?? '');
  const [gallery, setGallery] = useState(existing?.gallery ?? []);
  
  const [descEn, setDescEn] = useState('<p>Product description (EN)</p>');
  const [descAr, setDescAr] = useState('<p>وصف المنتج (AR)</p>');
  const [detailTitleEn, setDetailTitleEn] = useState('Details');
  const [detailTitleAr, setDetailTitleAr] = useState('التفاصيل');
  const [detailSubEn, setDetailSubEn] = useState('Everything you need to know');
  const [detailSubAr, setDetailSubAr] = useState('كل ما تحتاج معرفته');
  const [detailRteEn, setDetailRteEn] = useState('<p>Specs and care instructions.</p>');
  const [detailRteAr, setDetailRteAr] = useState('<p>المواصفات وتعليمات العناية.</p>');
  const [features, setFeatures] = useState(['Touchscreen emergency interface', 'Instant 24/7 medical access']);
  const [seo, setSeo] = useState({
    slug: existing ? existing.id.toLowerCase() : 'new-product',
    metaTitle: existing?.nameEn ? `${existing.nameEn} · Qlink` : 'New product · Qlink',
    metaDescription: existing?.subtitleEn ?? '',
    keywords: 'qlink, bracelet, product',
    featuredImageAlt: existing?.nameEn ?? 'Product',
  });

  const addFeature = () => setFeatures((f) => [...f, '']);
  const removeFeature = (i) => setFeatures((f) => f.filter((_, j) => j !== i));
  const setFeature = (i, v) => setFeatures((f) => {
    const n = [...f];
    n[i] = v;
    return n;
  });

  const addGalleryImage = () => setGallery((g) => [...g, '']);
  const removeGalleryImage = (i) => setGallery((g) => g.filter((_, j) => j !== i));
  const setGalleryImage = (i, v) => setGallery((g) => {
    const n = [...g];
    n[i] = v;
    return n;
  });

  const autoSeo = () => {
    setSeo((s) => ({
      ...s,
      metaTitle: `${nameEn || 'Qlink product'} · Buy online`,
      metaDescription: subEn || s.metaDescription,
      slug: (nameEn || 'product').toLowerCase().replace(/\s+/g, '-').slice(0, 48),
    }));
  };

  const title = isNew ? 'Add New Product' : 'Edit Product';

  return (
    <div className="product-editor-page web-page">
      <PageMeta title={title} description={seo.metaDescription} keywords={seo.keywords} />

      <div className="product-editor-top">
        <div>
          <p className="breadcrumb-muted" style={{ margin: 0, fontSize: 13, color: '#8b949e' }}>
            Dashboard / <span style={{ color: '#fff' }}>{title}</span>
          </p>
          <h1 className="web-page-title" style={{ marginTop: 8 }}>{title}</h1>
        </div>
        <Link to="/web/products" className="product-editor-close" aria-label="Close">
          <X size={22} />
        </Link>
      </div>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Product Media</h2>
        
        <div className="product-media-management">
          <div className="media-section">
            <label className="field-label">Main Image</label>
            <div className="media-drop-zone">
              {mainImage ? (
                <div className="media-preview-container">
                  <img src={mainImage} alt="Main Preview" className="media-full-preview" />
                  <button type="button" className="media-remove-overlay" onClick={() => setMainImage('')}>
                    <Trash2 size={24} />
                  </button>
                </div>
              ) : (
                <div className="media-placeholder">
                  <Plus size={32} />
                  <span>Drag main image or paste URL below</span>
                </div>
              )}
              <input 
                className="field-input media-url-input" 
                placeholder="Main Image URL..." 
                value={mainImage} 
                onChange={(e) => setMainImage(e.target.value)} 
              />
            </div>
          </div>

          <div className="media-section">
            <div className="media-gallery-header">
              <label className="field-label">Gallery Images</label>
              <button type="button" className="btn-secondary btn-sm" onClick={addGalleryImage}>
                <Plus size={14} /> Add Slot
              </button>
            </div>
            
            <div className="gallery-grid">
              {gallery.map((img, i) => (
                <div key={i} className="media-drop-zone gallery-item">
                  {img ? (
                    <div className="media-preview-container small">
                      <img src={img} alt={`Gallery ${i}`} className="media-full-preview" />
                      <button type="button" className="media-remove-overlay small" onClick={() => removeGalleryImage(i)}>
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="media-placeholder small">
                      <Plus size={20} />
                      <span>URL below</span>
                    </div>
                  )}
                  <input 
                    className="field-input media-url-input-small" 
                    placeholder="URL..." 
                    value={img} 
                    onChange={(e) => setGalleryImage(i, e.target.value)} 
                  />
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="empty-gallery-hint">
                  No additional images added.
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <BilingualTextInput
            labelEn="Product name (EN)"
            labelAr="اسم المنتج (AR)"
            valueEn={nameEn}
            valueAr={nameAr}
            onChangeEn={setNameEn}
            onChangeAr={setNameAr}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Product subtitle (EN)"
            labelAr="عنوان فرعي للمنتج (AR)"
            valueEn={subEn}
            valueAr={subAr}
            onChangeEn={setSubEn}
            onChangeAr={setSubAr}
          />
        </div>
        <div style={{ marginTop: 16 }} className="bilingual-row">
          <div className="bilingual-field">
            <label className="field-label">Price (EN display)</label>
            <input className="field-input" type="number" dir="ltr" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="bilingual-field">
            <label className="field-label">السعر / تسمية العرض (AR)</label>
            <input className="field-input" type="text" dir="rtl" lang="ar" value={priceArLabel} onChange={(e) => setPriceArLabel(e.target.value)} placeholder="مثال: ١٤٩٩ ج.م" />
          </div>
        </div>
      </section>

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">Key performance features</h2>
          <button type="button" className="btn-primary" onClick={addFeature}>
            <Plus size={18} />
            Add feature
          </button>
        </div>
        <ul className="feature-list">
          {features.map((f, i) => (
            <li key={i} className="feature-row">
              <span className="feature-bullet" aria-hidden />
              <input className="field-input feature-input" value={f} onChange={(e) => setFeature(i, e.target.value)} />
              <button type="button" className="feature-trash" onClick={() => removeFeature(i)} aria-label="Remove">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="web-card">
        <h2 className="web-card-title" style={{ marginBottom: 16 }}>Descriptions</h2>
        <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Product description (EN)</label>
        <RichTextEditor value={descEn} onChange={setDescEn} />
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>وصف المنتج (AR)</label>
          <RichTextEditor value={descAr} onChange={setDescAr} rtl />
        </div>
      </section>

      <section className="web-card">
        <BilingualTextInput
          labelEn="Product details title (EN)"
          labelAr="عنوان تفاصيل المنتج (AR)"
          valueEn={detailTitleEn}
          valueAr={detailTitleAr}
          onChangeEn={setDetailTitleEn}
          onChangeAr={setDetailTitleAr}
        />
        <div style={{ marginTop: 16 }}>
          <BilingualTextInput
            labelEn="Product details subtitle (EN)"
            labelAr="العنوان الفرعي للتفاصيل (AR)"
            valueEn={detailSubEn}
            valueAr={detailSubAr}
            onChangeEn={setDetailSubEn}
            onChangeAr={setDetailSubAr}
          />
        </div>
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Product details description (EN)</label>
          <RichTextEditor value={detailRteEn} onChange={setDetailRteEn} />
        </div>
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>تفاصيل وصف المنتج (AR)</label>
          <RichTextEditor value={detailRteAr} onChange={setDetailRteAr} rtl />
        </div>
      </section>

      <div className="seo-with-auto">
        <button type="button" className="btn-secondary seo-auto-btn" onClick={autoSeo}>Auto generate</button>
        <SeoSection title="Products SEO" slugPrefix="qlink.com/product/" value={seo} onChange={setSeo} badge="Must be unique" />
      </div>

      <div className="product-editor-footer">
        {isNew ? (
          <>
            <button type="button" className="btn-primary" onClick={() => navigate('/web/products')}>Save draft</button>
            <button type="button" className="btn-publish" onClick={() => navigate('/web/products')}>Publish product</button>
          </>
        ) : (
          <>
            <button type="button" className="btn-primary" onClick={() => navigate('/web/products')}>Discard</button>
            <button type="button" className="btn-publish" onClick={() => navigate('/web/products')}>Save changes</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductEditor;
