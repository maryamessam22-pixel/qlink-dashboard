import React, { useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { Link } from 'react-router-dom';
import '../../../styles/web-dashboard-pages.css';
import './Support.css';

const MESSAGES = [
  { id: 1, from: 'Leila Essam', topic: 'Project inquiry', date: 'Oct 24', preview: 'We would love to explore a partnership…', unread: true },
  { id: 2, from: 'Zeina Essam', topic: 'Collaboration', date: 'Oct 22', preview: 'Following up on our last call…', unread: false },
  { id: 3, from: 'Ahmed', topic: 'Job offer', date: 'Oct 20', preview: 'I am reaching out regarding…', unread: false },
];

const Support = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [replyEn, setReplyEn] = useState('<p>Draft reply (EN)…</p>');
  const [replyAr, setReplyAr] = useState('<p>مسودة رد (AR)…</p>');
  const [seo, setSeo] = useState({
    slug: 'support',
    metaTitle: 'Support — Qlink Admin',
    metaDescription: 'Customer messages.',
    keywords: 'support, messages, qlink',
    featuredImageAlt: 'Support',
  });

  const active = MESSAGES.find((m) => m.id === selectedId);

  return (
    <div className="web-page support-page">
      <PageMeta title="Messages" description={seo.metaDescription} keywords={seo.keywords} />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title">Messages</h1>
          <p className="web-page-sub">Manage customer messages.</p>
        </div>
        <Link to="/web/products" className="btn-primary">
          <Plus size={18} />
          New message
        </Link>
      </div>

      <div className="support-split">
        <div className="support-list">
          {MESSAGES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`support-row ${selectedId === m.id ? 'active' : ''}`}
              onClick={() => setSelectedId(m.id)}
            >
              <div className="support-row-top">
                <span className="support-from">{m.from}</span>
                <span className="support-date">{m.date}</span>
              </div>
              <div className="support-topic">{m.topic}</div>
              <p className="support-preview">{m.preview}</p>
              {m.unread ? <span className="support-unread-dot" aria-label="Unread" /> : null}
            </button>
          ))}
        </div>

        <div className="support-detail">
          {!active ? (
            <div className="support-empty">
              <MessageCircle size={48} strokeWidth={1.25} />
              <p>Select a message to read.</p>
            </div>
          ) : (
            <div className="support-open">
              <h2 className="support-open-title">{active.topic}</h2>
              <p className="support-open-meta">
                From <strong>{active.from}</strong> · {active.date}
              </p>
              <p className="support-open-body">{active.preview}</p>
              <div className="support-reply">
                <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Reply draft (EN)</label>
                <RichTextEditor value={replyEn} onChange={setReplyEn} />
                <div style={{ marginTop: 16 }}>
                  <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>مسودة الرد (AR)</label>
                  <RichTextEditor value={replyAr} onChange={setReplyAr} rtl />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SeoSection title="Support admin SEO" slugPrefix="admin.qlink.com/support/" value={seo} onChange={setSeo} badge="Internal" />
    </div>
  );
};

export default Support;
