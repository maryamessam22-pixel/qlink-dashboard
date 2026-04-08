import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import '../../../styles/web-dashboard-pages.css';
import './Support.css';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  
  const [replyEn, setReplyEn] = useState('<p>Draft reply (EN)…</p>');
  const [replyAr, setReplyAr] = useState('<p>مسودة رد (AR)…</p>');
  
  const [seo, setSeo] = useState({
    slug: 'support/contact',
    metaTitle: 'Support — Qlink Admin',
    metaDescription: 'Customer messages.',
    keywords: 'support, messages, qlink',
    featuredImageAlt: 'Support',
  });

  // Fetch Data from Supabase
  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Support Messages
        const { data: msgsData, error: msgsError } = await supabase
          .from('support_messages')
          .select('*')
          .order('received_at', { ascending: false });

        if (msgsError) throw msgsError;

        if (msgsData) {
          // تحويل شكل الداتا عشان تناسب الـ UI بتاعك
          const formattedMessages = msgsData.map((m) => {
            // تظبيط شكل التاريخ
            const dateObj = new Date(m.date || m.received_at);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return {
              id: m.id,
              from: m.sender_name,
              topic: m.subject,
              preview: m.message_body,
              date: formattedDate,
              unread: m.status === 'Unread',
              fullData: m // بنحتفظ بالداتا كاملة لو احتاجها بعدين
            };
          });
          setMessages(formattedMessages);
        }

        // 2. Fetch SEO Data for 'support/contact'
        const { data: seoData, error: seoError } = await supabase
          .from('seo')
          .select('*')
          .eq('slug', 'support/contact')
          .single(); // بنجيب صف واحد بس

        if (seoError && seoError.code !== 'PGRST116') {
          // PGRST116 يعني ملقاش داتا، بنتجاهله
          console.error('SEO Fetch Error:', seoError);
        }

        if (seoData) {
          setSeo({
            slug: seoData.slug,
            metaTitle: seoData.title_en || 'Support — Qlink Admin',
            metaDescription: seoData.description_en || 'Customer messages.',
            keywords: 'support, contact, messages', // مفيش keywords في الداتابيز فبنحط ديفولت
            featuredImageAlt: 'Contact Support',
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportData();
  }, []);

  // دالة لحفظ تعديلات الـ SEO في الداتابيز لما تخلصي تعديل
  const handleSaveSeo = async (updatedSeo) => {
    setSeo(updatedSeo);
    try {
      const { error } = await supabase
        .from('seo')
        .update({
          title_en: updatedSeo.metaTitle,
          description_en: updatedSeo.metaDescription,
          // لو ضفتي حقول عربي في الـ SeoSection ضيفيها هنا:
          // title_ar: updatedSeo.metaTitleAr,
          // description_ar: updatedSeo.metaDescriptionAr,
        })
        .eq('slug', 'support/contact');

      if (error) throw error;
      alert('SEO updated successfully on the website!');
    } catch (error) {
      console.error('Error updating SEO:', error.message);
      alert('Failed to update SEO');
    }
  };

  const active = messages.find((m) => m.id === selectedId);

  return (
    <div className="web-page support-page">
      <PageMeta title={seo.metaTitle} description={seo.metaDescription} keywords={seo.keywords} />

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
          {loading ? (
            <div style={{ padding: '20px', color: '#8b949e' }}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div style={{ padding: '20px', color: '#8b949e' }}>No messages found.</div>
          ) : (
            messages.map((m) => (
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
            ))
          )}
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

      <SeoSection 
        title="Support admin SEO" 
        slugPrefix="qlink.com/support/" 
        value={seo} 
        onChange={handleSaveSeo} 
        badge="Live" 
      />
    </div>
  );
};

export default Support;