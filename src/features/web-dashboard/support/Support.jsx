import React, { useState, useEffect } from 'react';
import { MessageCircle, Trash2, Search, Loader2, Save } from 'lucide-react';
import { useSearchParams, useLocation } from 'react-router-dom';
import PageMeta from '../../../components/seo/PageMeta';
import SeoSection from '../../../components/seo/SeoSection';
import RichTextEditor from '../../../components/rich-text/RichTextEditor';
import { supabase } from '../../../lib/supabase';
import { useInbox } from '../../../context/InboxContext';
import '../../../styles/web-dashboard-pages.css';
import './Support.css';

const Support = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isAppView = location.pathname.startsWith('/app');
  const { refresh: refreshInbox } = useInbox();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seoSaving, setSeoSaving] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [replyEn, setReplyEn] = useState('');
  const [replyAr, setReplyAr] = useState('');

  const [seo, setSeo] = useState({
    slug: 'support/contact',
    metaTitle: 'Support — Qlink Admin',
    metaDescription: 'Customer messages.',
    keywords: 'support, messages, qlink',
    featuredImageAlt: 'Support',
  });

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

            let repliedDate = null;
            if (m.replied_at) {
              const rDateObj = new Date(m.replied_at);
              repliedDate = rDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            return {
              id: m.id,
              from: m.sender_name,
              topic: m.subject,
              preview: m.message_body,
              date: formattedDate,
              unread: m.status === 'Unread',

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

  const messageIdFromUrl = searchParams.get('message');

  useEffect(() => {
    if (!messageIdFromUrl || messages.length === 0) return;
    const match = messages.find((m) => String(m.id) === String(messageIdFromUrl));
    if (match) setSelectedId(match.id);
  }, [messageIdFromUrl, messages]);

  if (loading) {
    return (
      <div className={`support-loading${isAppView ? ' support-loading--app' : ''}`}>
        <Loader2 className="animate-spin support-loading-icon" size={48} />
        <p className="support-loading-text">Loading messages...</p>
      </div>
    );
  }

  const saveSeoToDb = async () => {
    setSeoSaving(true);
    try {
      const { error } = await supabase
        .from('seo')
        .update({
          title_en: seo.metaTitle,
          description_en: seo.metaDescription,
        })
        .eq('slug', 'support/contact');

      if (error) throw error;
      alert('SEO updated successfully on the website!');
    } catch (error) {
      console.error('Error updating SEO:', error.message);
      alert('Failed to update SEO');
    } finally {
      setSeoSaving(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const { error } = await supabase.from('support_messages').delete().eq('id', id);
      if (error) throw error;
      setMessages((prev) => prev.filter((m) => m.id !== id));
      setSelectedId(null);
      refreshInbox();
    } catch (error) {
      console.error('Delete error:', error.message);
      alert('Failed to delete message');
    }
  };


  const handleSendReply = async (id) => {
    const isEditorEmpty = (html) => !html || html.trim() === '' || html === '<p></p>' || html === '<p><br></p>';


    if (isEditorEmpty(replyEn) && isEditorEmpty(replyAr)) {
      alert("Please write a reply first!");
      return;
    }

    try {
      const now = new Date().toISOString();

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


      setMessages(prev => prev.map(m => {
        if (m.id === id) {
          const rDateObj = new Date(now);
          const formattedNow = rDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

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

      setReplyEn('');
      setReplyAr('');
      refreshInbox();

    } catch (error) {
      console.error('Reply error:', error.message);
      alert('Failed to send reply');
    }
  };

  const active = messages.find((m) => m.id === selectedId);

  const filteredMessages = messages.filter(m => {
    const matchesSearch =
      m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.preview.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = filterStatus === 'All' || m.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className={`web-page support-page${isAppView ? ' support-page--app' : ''}`}>
      <PageMeta title={seo.metaTitle} description={seo.metaDescription} keywords={seo.keywords} />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title">Messages</h1>
          <p className="web-page-sub">Manage customer messages.</p>
        </div>
      </div>

      <div className="support-split">
        <div className="support-list">
          <div className="support-list-controls">
            <div className="search-wide-wrap support-list-search">
              <Search className="search-wide-icon" size={16} />
              <input
                type="search"
                className="field-input support-list-search-input"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-row support-list-filters">
              {['All', 'Unread', 'Replied'].map(status => (
                <button
                  key={status}
                  className={`filter-pill ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="support-list-scroll">
            {filteredMessages.length === 0 ? (
              <div className="support-list-empty">No messages found.</div>
            ) : (
              filteredMessages.map((m) => (
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

                  {m.status === 'Unread' ? <span className="support-unread-dot" aria-label="Unread" /> : null}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="support-detail">
          {!active ? (
            <div className="support-empty">
              <MessageCircle size={48} strokeWidth={1.25} />
              <p>Select a message to read.</p>
            </div>
          ) : (
            <div className="support-detail-scroll">
              <div className="support-open">
                <div className="support-open-header">
                  <h2 className="support-open-title">{active.topic}</h2>
                  <button
                    type="button"
                    className="btn-danger support-open-delete"
                    onClick={() => handleDeleteMessage(active.id)}
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                </div>
                <p className="support-open-meta">
                  From <strong>{active.from}</strong> · {active.date}
                </p>
                <p className="support-open-body">{active.preview}</p>

                {active.adminReplyEn && (
                  <div className="admin-reply-box">
                    <p className="admin-reply-head">
                      Qlink Support (You) · {active.repliedAt}
                    </p>

                    <div className="admin-reply-block">
                      <span className="admin-reply-label">English Reply:</span>
                      <div className="admin-reply-html" dangerouslySetInnerHTML={{ __html: active.adminReplyEn }} />
                    </div>

                    {active.adminReplyAr && active.adminReplyAr !== '<p></p>' && active.adminReplyAr !== '' && (
                      <div className="admin-reply-block" dir="rtl">
                        <span className="admin-reply-label">Arabic Reply:</span>
                        <div className="admin-reply-html" dangerouslySetInnerHTML={{ __html: active.adminReplyAr }} />
                      </div>
                    )}
                  </div>
                )}

                {!active.adminReplyEn && (
                  <div className="support-reply">
                    <label className="field-label support-reply-label">Reply draft (EN)</label>
                    <RichTextEditor value={replyEn} onChange={setReplyEn} />
                    <div className="support-reply-ar">
                      <label className="field-label support-reply-label">مسودة الرد (AR)</label>
                      <RichTextEditor value={replyAr} onChange={setReplyAr} rtl />
                    </div>
                    <div className="support-reply-actions">
                      <button
                        type="button"
                        className="btn-primary support-reply-send"
                        onClick={() => handleSendReply(active.id)}
                      >
                        Send Response
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <SeoSection
        title={isAppView ? 'Messages page SEO' : 'Support admin SEO'}
        slugPrefix={isAppView ? 'admin.qlink.com/app/messages/' : 'qlink.com/support/'}
        value={seo}
        onChange={setSeo}
        badge={isAppView ? 'Internal' : 'Live'}
      />
      <div className="support-seo-actions">
        <button
          type="button"
          className="btn-publish support-seo-save"
          onClick={saveSeoToDb}
          disabled={seoSaving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px' }}
        >
          {seoSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {seoSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Support;