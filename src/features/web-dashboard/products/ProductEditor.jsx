import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { normalizeRichTextHtml } from '../../../lib/richTextHtml';
import { clearFormDraft } from '../../../lib/formDraft';
import FormDraftToolbar from '../../../components/cms/FormDraftToolbar';
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
  const [productId] = useState(useParams().productId);
  const navigate = useNavigate();
  const isNew = productId === 'new' || !productId;

  const productDraftKey = useMemo(
    () => `qlink_draft_product_${isNew ? 'new' : productId || 'new'}`,
    [isNew, productId]
  );

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [draggingGalleryIdx, setDraggingGalleryIdx] = useState(null);

  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [subEn, setSubEn] = useState('');
  const [subAr, setSubAr] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [gallery, setGallery] = useState([]);
  const [status, setStatus] = useState('In Stock');

  const [descEn, setDescEn] = useState('');
  const [descAr, setDescAr] = useState('');

  const [featuresEn, setFeaturesEn] = useState([]);
  const [featuresAr, setFeaturesAr] = useState([]);

  const [inTheBox, setInTheBox] = useState([]);
  const [privacyNotes, setPrivacyNotes] = useState([]);
  const [detailTitleEn, setDetailTitleEn] = useState('');
  const [detailTitleAr, setDetailTitleAr] = useState('');
  const [detailSubEn, setDetailSubEn] = useState('');
  const [detailSubAr, setDetailSubAr] = useState('');
  const [detailDescEn, setDetailDescEn] = useState('');
  const [detailDescAr, setDetailDescAr] = useState('');

  const [seo, setSeo] = useState({
    slug: '',
    metaTitle: '',
    metaDescription: '',
    keywords: 'qlink, bracelet, product',
    featuredImageAlt: 'Product',
  });

  useEffect(() => {
    if (isNew) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        if (data) {
          setNameEn(data.name_en || '');
          setNameAr(data.name_ar || '');
          setSubEn(data.subtitle_en || '');
          setSubAr(data.subtitle_ar || '');
          setSku(data.sku || '');
          setPrice(data.price ? String(data.price) : '');
          setMainImage(data.image_url || '');
          setGallery(data['gallery-images'] || []);
          setDescEn(data.description_en || '');
          setDescAr(data.description_ar || '');
          setFeaturesEn(data.features_en || []);
          setFeaturesAr(data.features_ar || []);
          setStatus(data.status || 'In Stock');

          const extra = data.extra_data || {};
          setInTheBox(extra.in_the_box || []);
          setPrivacyNotes(extra.privacy_notes || []);

          if (extra.product_details) {
            setDetailTitleEn(extra.product_details.title_en || '');
            setDetailTitleAr(extra.product_details.title_ar || '');
            setDetailSubEn(extra.product_details.subtitle_en || '');
            setDetailSubAr(extra.product_details.subtitle_ar || '');
            setDetailDescEn(extra.product_details.description_en || '');
            setDetailDescAr(extra.product_details.description_ar || '');
          }

          setSeo({
            slug: data.slug || '',
            metaTitle: data.meta_title || '',
            metaDescription: data.meta_description || '',
            keywords: data.keywords || 'qlink, bracelet, product',
            featuredImageAlt: data.featured_image_alt || '',
          });
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isNew]);

  const captureProductDraft = useCallback(
    () => ({
      nameEn,
      nameAr,
      subEn,
      subAr,
      sku,
      price,
      mainImage,
      gallery,
      status,
      descEn,
      descAr,
      featuresEn,
      featuresAr,
      inTheBox,
      privacyNotes,
      detailTitleEn,
      detailTitleAr,
      detailSubEn,
      detailSubAr,
      detailDescEn,
      detailDescAr,
      seo,
    }),
    [
      nameEn,
      nameAr,
      subEn,
      subAr,
      sku,
      price,
      mainImage,
      gallery,
      status,
      descEn,
      descAr,
      featuresEn,
      featuresAr,
      inTheBox,
      privacyNotes,
      detailTitleEn,
      detailTitleAr,
      detailSubEn,
      detailSubAr,
      detailDescEn,
      detailDescAr,
      seo,
    ]
  );

  const applyProductDraft = useCallback((d) => {
    if (!d || typeof d !== 'object') return;
    const s = (k, fn) => {
      if (d[k] !== undefined) fn(d[k]);
    };
    s('nameEn', setNameEn);
    s('nameAr', setNameAr);
    s('subEn', setSubEn);
    s('subAr', setSubAr);
    s('sku', setSku);
    s('price', setPrice);
    s('mainImage', setMainImage);
    if (Array.isArray(d.gallery)) setGallery(d.gallery);
    s('status', setStatus);
    s('descEn', setDescEn);
    s('descAr', setDescAr);
    if (Array.isArray(d.featuresEn)) setFeaturesEn(d.featuresEn);
    if (Array.isArray(d.featuresAr)) setFeaturesAr(d.featuresAr);
    if (Array.isArray(d.inTheBox)) setInTheBox(d.inTheBox);
    if (Array.isArray(d.privacyNotes)) setPrivacyNotes(d.privacyNotes);
    s('detailTitleEn', setDetailTitleEn);
    s('detailTitleAr', setDetailTitleAr);
    s('detailSubEn', setDetailSubEn);
    s('detailSubAr', setDetailSubAr);
    s('detailDescEn', setDetailDescEn);
    s('detailDescAr', setDetailDescAr);
    if (d.seo && typeof d.seo === 'object') setSeo((prev) => ({ ...prev, ...d.seo }));
  }, []);

  if (loading) {
    return (
      <div className="web-page-loading" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: '16px' }}>Loading product details...</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        sku,
        name_en: nameEn,
        name_ar: nameAr,
        subtitle_en: subEn,
        subtitle_ar: subAr,
        description_en: normalizeRichTextHtml(descEn),
        description_ar: normalizeRichTextHtml(descAr),
        price: parseFloat(price) || 0,
        image_url: mainImage,
        'gallery-images': gallery,
        features_en: featuresEn,
        features_ar: featuresAr,
        status,
        meta_title: seo.metaTitle,
        meta_description: seo.metaDescription,
        slug: seo.slug,
        featured_image_alt: seo.featuredImageAlt,
        extra_data: {
          in_the_box: inTheBox,
          privacy_notes: privacyNotes,
          product_details: {
            title_en: detailTitleEn,
            title_ar: detailTitleAr,
            subtitle_en: detailSubEn,
            subtitle_ar: detailSubAr,
            description_en: normalizeRichTextHtml(detailDescEn),
            description_ar: normalizeRichTextHtml(detailDescAr)
          }
        }
      };

      if (isNew) {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        clearFormDraft(productDraftKey);
        alert('Created successfully!');
      } else {
        const { error } = await supabase.from('products').update(payload).eq('id', productId);
        if (error) throw error;
        clearFormDraft(productDraftKey);
        alert('Updated successfully!');
      }
      navigate('/web/products');
    } catch (err) {
      console.error('Save error:', err.message);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    setFeaturesEn((f) => [...f, '']);
    setFeaturesAr((f) => [...f, '']);
  };
  const removeFeature = (i) => {
    setFeaturesEn((f) => f.filter((_, j) => j !== i));
    setFeaturesAr((f) => f.filter((_, j) => j !== i));
  };
  const setFeatureEn = (i, v) => setFeaturesEn((f) => {
    const n = [...f];
    n[i] = v;
    return n;
  });
  const setFeatureAr = (i, v) => setFeaturesAr((f) => {
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

  const uploadFile = async (file, onComplete) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('qlink-assets') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('qlink-assets') 
        .getPublicUrl(filePath);

      onComplete(data.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err.message);
      alert('Upload failed. Please ensure your bucket allows uploads.');
    } finally {
      setUploading(false);
    }
  };

  const handleDropMain = (e) => {
    e.preventDefault();
    setIsDraggingMain(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      uploadFile(file, setMainImage);
    }
  };

  const handleDropGallery = (e, idx) => {
    e.preventDefault();
    setDraggingGalleryIdx(null);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      uploadFile(file, (url) => setGalleryImage(idx, url));
    }
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <h1 className="web-page-title" style={{ margin: 0 }}>{title}</h1>
            {loading && <Loader2 className="animate-spin" size={18} style={{ color: '#8b949e' }} />}
          </div>
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
            <div
              className={`media-drop-zone ${isDraggingMain ? 'dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingMain(true); }}
              onDragLeave={() => setIsDraggingMain(false)}
              onDrop={handleDropMain}
              onClick={() => document.getElementById('main-image-upload').click()}
              style={{ cursor: 'pointer' }}
            >
              <input
                id="main-image-upload"
                type="file"
                hidden
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) uploadFile(file, setMainImage);
                }}
              />
              {uploading && !mainImage ? (
                <div className="media-placeholder">
                  <Loader2 className="animate-spin" size={32} />
                  <span>Uploading...</span>
                </div>
              ) : mainImage ? (
                <div className="media-preview-container">
                  {mainImage.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                    <video src={mainImage} className="media-full-preview" controls muted />
                  ) : (
                    <img src={mainImage} alt={seo.featuredImageAlt || "Main Preview"} className="media-full-preview" />
                  )}
                  <button
                    type="button"
                    className="media-remove-overlay"
                    onClick={(e) => { e.stopPropagation(); setMainImage(''); }}
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ) : (
                <div className="media-placeholder" style={{ textAlign: 'center', padding: '0 20px' }}>
                  <Plus size={32} />
                  <span style={{ fontWeight: 600, display: 'block' }}>
                    {seo.featuredImageAlt || nameEn || "Drag main image or click to upload"}
                  </span>
                  {(seo.featuredImageAlt || nameEn) && (
                    <small style={{ display: 'block', fontSize: '11px', opacity: 0.6, marginTop: 4 }}>
                      {seo.featuredImageAlt ? "Custom Alt Text" : "Product Name Fallback"}
                    </small>
                  )}
                </div>
              )}
              <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', marginTop: 12 }}>
                <input
                  className="field-input media-url-input"
                  placeholder="Or paste image URL here..."
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="field-label" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                Featured Image Alt Text (SEO)
              </label>
              <input
                className="field-input"
                style={{ width: '100%', fontSize: 14 }}
                placeholder="e.g. Qlink Nova black bracelet on wrist..."
                value={seo.featuredImageAlt}
                onChange={(e) => setSeo({ ...seo, featuredImageAlt: e.target.value })}
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
                <div
                  key={i}
                  className={`media-drop-zone gallery-item ${draggingGalleryIdx === i ? 'dragging' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDraggingGalleryIdx(i); }}
                  onDragLeave={() => setDraggingGalleryIdx(null)}
                  onDrop={(e) => handleDropGallery(e, i)}
                  onClick={() => document.getElementById(`gallery-upload-${i}`).click()}
                  style={{ cursor: 'pointer' }}
                >
                  <input
                    id={`gallery-upload-${i}`}
                    type="file"
                    hidden
                    accept="image/*,video/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) uploadFile(file, (url) => setGalleryImage(i, url));
                    }}
                  />
                  {img ? (
                    <div className="media-preview-container small">
                      {img.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                        <video src={img} className="media-full-preview" muted />
                      ) : (
                        <img src={img} alt={`Gallery ${i}`} className="media-full-preview" />
                      )}
                      <button
                        type="button"
                        className="media-remove-overlay small"
                        onClick={(e) => { e.stopPropagation(); removeGalleryImage(i); }}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="media-placeholder small">
                      <Plus size={20} />
                      <span style={{ fontSize: '11px' }}>{nameEn || "Slot " + (i + 1)}</span>
                    </div>
                  )}
                  <div onClick={(e) => e.stopPropagation()} style={{ width: '100%' }}>
                    <input
                      className="field-input media-url-input-small"
                      placeholder="URL..."
                      value={img}
                      onChange={(e) => setGalleryImage(i, e.target.value)}
                    />
                  </div>
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
            <label className="field-label">SKU / ID</label>
            <input className="field-input" type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. QL-BLK-001" />
          </div>
          <div className="bilingual-field">
            <label className="field-label">Stock Status</label>
            <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Low Stock">Low Stock</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 16 }} className="bilingual-row">
          <div className="bilingual-field">
            <label className="field-label">Price (EGP)</label>
            <input className="field-input" type="number" dir="ltr" value={price} onChange={(e) => setPrice(e.target.value)} />
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
          {featuresEn.map((f, i) => (
            <li key={i} className="feature-row" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="feature-bullet" style={{ background: '#e03232', boxShadow: '0 0 8px rgba(224, 50, 50, 0.4)' }} aria-hidden />
                <input
                  className="field-input feature-input"
                  placeholder="Feature (EN)"
                  value={f}
                  onChange={(e) => setFeatureEn(i, e.target.value)}
                  style={{ textAlign: 'left' }}
                />
                <button type="button" className="feature-trash" onClick={() => removeFeature(i)} aria-label="Remove">
                  <Trash2 size={16} />
                </button>
              </div>
              <input
                className="field-input feature-input"
                dir="rtl"
                placeholder="الميزة (AR)"
                value={featuresAr[i] || ''}
                onChange={(e) => setFeatureAr(i, e.target.value)}
                style={{ textAlign: 'right' }}
              />
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
          <RichTextEditor value={detailDescEn} onChange={setDetailDescEn} />
        </div>
        <div style={{ marginTop: 20 }}>
          <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>تفاصيل وصف المنتج (AR)</label>
          <RichTextEditor value={detailDescAr} onChange={setDetailDescAr} rtl />
        </div>
      </section>

      <div className="seo-with-auto">
        <button type="button" className="btn-secondary seo-auto-btn" onClick={autoSeo}>Auto generate</button>
        <SeoSection title="Products SEO" slugPrefix="qlink.com/product/" value={seo} onChange={setSeo} badge="Must be unique" />
      </div>

      <div className="product-editor-footer">
        <button type="button" className="btn-ghost product-editor-footer__discard" onClick={() => navigate('/web/products')}>
          Back to catalog
        </button>
        <div className="product-editor-footer__actions">
          <FormDraftToolbar
            storageKey={productDraftKey}
            capture={captureProductDraft}
            apply={applyProductDraft}
            disabled={saving || loading}
            compact
          />
          <button
            type="button"
            className="btn-publish product-editor-footer__publish"
            disabled={saving || loading}
            onClick={handleSave}
          >
            {saving ? (
              <><Loader2 className="animate-spin" size={18} /> Saving...</>
            ) : (
              <><Save size={18} /> {isNew ? 'Publish product' : 'Save changes'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductEditor;