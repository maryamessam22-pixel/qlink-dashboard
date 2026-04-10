import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { useInbox } from '../context/InboxContext';
import './NotificationsDropdown.css';

export default function NotificationsDropdown({ isApp, onClose }) {
  const navigate = useNavigate();
  const { recentItems, unreadCount, loading, loadError } = useInbox();
  const base = isApp ? '/app' : '/web';

  const openMessage = (id) => {
    navigate(`${base}/support?message=${encodeURIComponent(id)}`);
    onClose();
  };

  const goSupport = () => {
    navigate(`${base}/support`);
    onClose();
  };

  return (
    <div className={`notifications-dropdown ${isApp ? 'notifications-dropdown--app' : ''}`} role="dialog" aria-label="Notifications">
      <div className="notifications-dropdown-head">
        <h3 className="notifications-dropdown-title">Messages</h3>
        {unreadCount > 0 ? (
          <span className="notifications-dropdown-badge">{unreadCount > 99 ? '99+' : unreadCount} new</span>
        ) : (
          <span className="notifications-dropdown-muted">No unread</span>
        )}
      </div>

      {loadError ? <p className="notifications-dropdown-error">{loadError}</p> : null}

      <div className="notifications-dropdown-list">
        {loading && recentItems.length === 0 ? (
          <p className="notifications-dropdown-empty">Loading…</p>
        ) : recentItems.length === 0 ? (
          <p className="notifications-dropdown-empty">No messages yet. Website contact form saves to Supabase table <code>support_messages</code>.</p>
        ) : (
          recentItems.slice(0, 12).map((item) => (
            <button
              key={item.id}
              type="button"
              className={`notifications-dropdown-item ${item.unread ? 'is-unread' : ''}`}
              onClick={() => openMessage(item.id)}
            >
              <span className="notifications-dropdown-item-source" data-source={item.source}>
                {item.source === 'app' ? 'App' : 'Web'}
              </span>
              <span className="notifications-dropdown-item-from">{item.from}</span>
              <span className="notifications-dropdown-item-topic">{item.topic}</span>
              <span className="notifications-dropdown-item-preview">{item.preview}</span>
            </button>
          ))
        )}
      </div>

      <div className="notifications-dropdown-footer">
        <button type="button" className="notifications-dropdown-all" onClick={goSupport}>
          <MessageCircle size={16} />
          Open inbox
          <ExternalLink size={14} className="notifications-dropdown-all-icon" aria-hidden />
        </button>
      </div>
    </div>
  );
}
