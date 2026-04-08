import React, { useState, useEffect } from 'react';
import { MessageCircle, Plus, Trash2 } from 'lucide-react';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase'; // اتأكدي من المسار ده
import '../../../styles/web-dashboard-pages.css';
import './Support.css';

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  
  const [replyEn, setReplyEn] = useState('<p></p>');
  const [replyAr, setReplyAr] = useState('<p></p>');
  
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

        const { data: msgsData, error: msgsError } = await supabase
          .from('support_messages')
          .select('*')
          .order('received_at', { ascending: false });

        if (msgsError) throw msgsError;

        if (msgsData) {
          const formattedMessages = msgsData.map((m) => {
            const dateObj = new Date(m.date || m.received_at);
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            
            // تظبيط شكل تاريخ الرد لو موجود
            let repliedDate = null;
            if(m.replied_at) {
                const rDateObj = new Date(m.replied_at);
                repliedDate = rDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
            }

            return {
              id: m.id,
              from: m.sender_name,
              topic: m.subject,
              preview: m.message_body,
              date: formattedDate,
              unread: m.status === 'Unread',
              // ===== التعديل الجديد: جبنا أعمدة الرد =====
              adminReplyEn: m.admin_reply_en,
              adminReplyAr: m.admin_reply_ar,
              repliedAt: repliedDate,
              status: m.status,
              fullData: m
            };
          });
          setMessages(formattedMessages);
        }

        const { data: seoData, error: seoError } = await supabase
          .from('seo')
          .select('*')
          .eq('slug', 'support/contact')
          .single();

        if (seoError && seoError.code !== 'PGRST116') {
          console.error('SEO Fetch Error:', seoError);
        }

        if (seoData) {
          setSeo({
            slug: seoData.slug,
            metaTitle: seoData.title_en || 'Support — Qlink Admin',
            metaDescription: seoData.description_en || 'Customer messages.',
            keywords: 'support, contact, messages',
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

  const handleSaveSeo = async (updatedSeo) => {
    setSeo(updatedSeo);
    try {
      const { error } = await supabase
        .from('seo')
        .update({
          title_en: updatedSeo.metaTitle,
          description_en: updatedSeo.metaDescription,
        })
        .eq('slug', 'support/contact');

      if (error) throw error;
      alert('SEO updated successfully on the website!');
    } catch (error) {
      console.error('Error updating SEO:', error.message);
      alert('Failed to update SEO');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('support_messages').delete().eq('id', id);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedId(null);
    } catch (error) {
      console.error('Delete error:', error.message);
      alert('Failed to delete message');
    }
  };

  // ===== التعديل الجديد: دالة الإرسال الحقيقية =====
  const handleSendReply = async (id) => {
    // هنتأكد إن الرد مش فاضي
    if (replyEn === '<p></p>' && replyAr === '<p></p>') {
        alert("Please write a reply first!");
        return;
    }

    try {
        const now = new Date().toISOString();
        
        // حفظ الرد في الداتابيز وتغيير الحالة لـ Replied
        const { error } = await supabase
            .from('support_messages')
            .update({
                admin_reply_en: replyEn,
                admin_reply_ar: replyAr,
                status: 'Replied',
                replied_at: now
            })
            .eq('id', id);

        if (error) throw error;

        // تحديث الـ State عشان تظهر فوراً في الشاشة من غير ريفريش
        setMessages(prev => prev.map(m => {
            if (m.id === id) {
                const rDateObj = new Date(now);
                const formattedNow = rDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
                
                return {
                    ...m,
                    adminReplyEn: replyEn,
                    adminReplyAr: replyAr,
                    repliedAt: formattedNow,
                    unread: false,
                    status: 'Replied'
                };
            }
            return m;
        }));

        alert('The reply has been saved and sent successfully!');
        // تفريغ المربعات بعد الإرسال
        setReplyEn('<p></p>');
        setReplyAr('<p></p>');

    } catch (error) {
         console.error('Reply error:', error.message);
         alert('Failed to send reply');
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
                {/* لو الرسالة حالة Unread هتظهر النقطة */}
                {m.status === 'Unread' ? <span className="support-unread-dot" aria-label="Unread" /> : null}
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
              <div className="support-open-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 className="support-open-title" style={{ margin: 0 }}>{active.topic}</h2>
                <button 
                  type="button" 
                  className="btn-danger" 
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8 }}
                  onClick={() => handleDeleteMessage(active.id)}
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
              <p className="support-open-meta">
                From <strong>{active.from}</strong> · {active.date}
              </p>
              <p className="support-open-body" style={{ marginBottom: 32 }}>{active.preview}</p>
              
              {/* ===== التعديل الجديد: عرض الرد لو موجود ===== */}
              {active.adminReplyEn && (
                  <div className="admin-reply-box" style={{ backgroundColor: '#131722', padding: '20px', borderRadius: '8px', marginBottom: '32px', borderLeft: '4px solid #E03232' }}>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#E03232', fontWeight: 'bold' }}>
                         Qlink Support (You) · {active.repliedAt}
                      </p>
                      
                      <div style={{ marginBottom: '16px'}}>
                          <span style={{fontSize: '12px', color: '#8b949e'}}>English Reply:</span>
                          {/* dangerouslySetInnerHTML عشان نعرض الـ HTML اللي جاي من الـ RichTextEditor */}
                          <div dangerouslySetInnerHTML={{ __html: active.adminReplyEn }} style={{ color: '#fff', fontSize: '14px'}} />
                      </div>

                      {active.adminReplyAr && active.adminReplyAr !== '<p></p>' && (
                          <div dir="rtl">
                             <span style={{fontSize: '12px', color: '#8b949e'}}>Arabic Reply:</span>
                             <div dangerouslySetInnerHTML={{ __html: active.adminReplyAr }} style={{ color: '#fff', fontSize: '14px'}} />
                          </div>
                      )}
                  </div>
              )}

              {/* ===== مربع الرد مش هيظهر غير لو مفيش رد مسبق ===== */}
              {!active.adminReplyEn && (
                  <div className="support-reply">
                    <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>Reply draft (EN)</label>
                    <RichTextEditor value={replyEn} onChange={setReplyEn} />
                    <div style={{ marginTop: 20 }}>
                      <label className="field-label" style={{ display: 'block', marginBottom: 8 }}>مسودة الرد (AR)</label>
                      <RichTextEditor value={replyAr} onChange={setReplyAr} rtl />
                    </div>
                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        className="btn-publish" 
                        style={{ padding: '10px 24px', borderRadius: 8, minWidth: 160 }}
                        onClick={() => handleSendReply(active.id)}
                      >
                        Send Response
                      </button>
                    </div>
                  </div>
              )}

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