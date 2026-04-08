import React, { useEffect, useState } from 'react';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import PageMeta from '../../../../components/seo/PageMeta';
import RichTextEditor from '../../../../components/rich-text/RichTextEditor';
import { BilingualTextInput } from '../../../../components/bilingual/BilingualField';
import SeoSection from '../../../../components/seo/SeoSection';
import '../../../../styles/web-dashboard-pages.css';

const defaultFaqs = () => [
  {
    qEn: 'Is the bracelet waterproof?',
    qAr: 'هل السوار مقاوم للماء؟',
    aEn: '<p>Yes, it is rated for daily wear and splash resistance.</p>',
    aAr: '<p>نعم، مصمم للارتداء اليومي ومقاومة الماء المتقطع.</p>',
  },
];

const CmsFaqs = () => {
  const [items, setItems] = useState(defaultFaqs);
  const [seo, setSeo] = useState({
    slug: 'faq',
    metaTitle: 'FAQ — Qlink',
    metaDescription: 'Frequently asked questions about Qlink.',
    keywords: 'faq, qlink, help',
    featuredImageAlt: 'FAQ',
  });

  useEffect(() => {
    const onAdd = () => {
      setItems((list) => [...list, { qEn: '', qAr: '', aEn: '<p></p>', aAr: '<p></p>' }]);
    };
    window.addEventListener('cms:add-section', onAdd);
    return () => window.removeEventListener('cms:add-section', onAdd);
  }, []);

  const patch = (i, key, val) => {
    setItems((prev) => {
      const n = [...prev];
      n[i] = { ...n[i], [key]: val };
      return n;
    });
  };

  return (
    <div>
      <PageMeta title="CMS · FAQ" description={seo.metaDescription} keywords={seo.keywords} />

      <section className="web-card">
        <div className="web-card-head">
          <h2 className="web-card-title">
            <HelpCircle size={18} style={{ marginRight: 8, verticalAlign: 'middle', color: '#38bdf8' }} />
            Support questions
          </h2>
          <button type="button" className="btn-primary" onClick={() => setItems((list) => [...list, { qEn: '', qAr: '', aEn: '<p></p>', aAr: '<p></p>' }])}>
            <Plus size={18} />
            Add question
          </button>
        </div>

        {items.map((item, i) => (
          <div key={i} className="faq-editor-card">
            <div className="faq-editor-head">
              <span style={{ fontWeight: 600, color: '#fff' }}>Q{i + 1}</span>
              <button type="button" className="about-team-remove" style={{ position: 'static' }} aria-label="Delete question" onClick={() => setItems((p) => p.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
            </div>
            <BilingualTextInput
              labelEn="Question (EN)"
              labelAr="السؤال (AR)"
              valueEn={item.qEn}
              valueAr={item.qAr}
              onChangeEn={(v) => patch(i, 'qEn', v)}
              onChangeAr={(v) => patch(i, 'qAr', v)}
            />
            <div style={{ marginTop: 16 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Answer (EN)</label>
              <RichTextEditor value={item.aEn} onChange={(v) => patch(i, 'aEn', v)} />
            </div>
            <div style={{ marginTop: 16 }}>
              <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>الإجابة (AR)</label>
              <RichTextEditor value={item.aAr} onChange={(v) => patch(i, 'aAr', v)} rtl />
            </div>
          </div>
        ))}
      </section>

      <SeoSection title="FAQ SEO" slugPrefix="qlink.com/faq/" value={seo} onChange={setSeo} />
    </div>
  );
};

export default CmsFaqs;
