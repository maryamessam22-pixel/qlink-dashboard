import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, RefreshCw, Search, Sparkles, User } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PageMeta from '../../../components/seo/PageMeta';
import { supabase } from '../../../lib/supabase';
import '../../../styles/web-dashboard-pages.css';
import './WebAiChat.css';

const FETCH_LIMIT = 1500;

function groupMessagesIntoSessions(rows) {
  const map = new Map();
  for (const row of rows || []) {
    const sid = row.session_id || 'unknown';
    if (!map.has(sid)) map.set(sid, []);
    map.get(sid).push(row);
  }

  const sessions = [];
  for (const [sessionId, msgs] of map) {
    msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const last = msgs[msgs.length - 1];
    let contactName = null;
    let contactEmail = null;
    for (const m of msgs) {
      if (m.name && String(m.name).trim()) contactName = String(m.name).trim();
      if (m.email && String(m.email).trim()) contactEmail = String(m.email).trim();
    }
    sessions.push({
      sessionId,
      messages: msgs,
      lastAt: last?.created_at,
      messageCount: msgs.length,
      contactName,
      contactEmail,
    });
  }

  sessions.sort((a, b) => new Date(b.lastAt || 0) - new Date(a.lastAt || 0));
  return sessions;
}

const WebAiChat = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [rawMessages, setRawMessages] = useState([]);
  const [sessionMeta, setSessionMeta] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const loadData = useCallback(async () => {
    setFetchError('');
    setLoading(true);
    try {
      const [msgRes, sessRes] = await Promise.all([
        supabase
          .from('chat_messages')
          .select('id, created_at, sender, text, model_used, session_id, name, email')
          .order('created_at', { ascending: false })
          .limit(FETCH_LIMIT),
        supabase.from('chat_sessions').select('id, created_at, session_id'),
      ]);

      if (msgRes.error) throw msgRes.error;

      const rows = msgRes.data || [];
      setRawMessages(rows);

      const meta = new Map();
      if (sessRes.data) {
        for (const s of sessRes.data) {
          if (s.session_id) meta.set(s.session_id, s);
        }
      }
      setSessionMeta(meta);
    } catch (e) {
      console.error(e);
      setFetchError(e?.message || 'Failed to load chat data. Check RLS policies for chat_messages / chat_sessions.');
      setRawMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const sessions = useMemo(() => {
    const grouped = groupMessagesIntoSessions(rawMessages);
    return grouped.map((s) => ({
      ...s,
      sessionRow: sessionMeta.get(s.sessionId) || null,
    }));
  }, [rawMessages, sessionMeta]);

  const filteredSessions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter((s) => {
      if (s.sessionId.toLowerCase().includes(q)) return true;
      if (s.contactName && s.contactName.toLowerCase().includes(q)) return true;
      if (s.contactEmail && s.contactEmail.toLowerCase().includes(q)) return true;
      return s.messages.some((m) => String(m.text || '').toLowerCase().includes(q));
    });
  }, [sessions, searchQuery]);

  const urlSession = searchParams.get('session');

  useEffect(() => {
    if (filteredSessions.length === 0) {
      setSelectedSessionId(null);
      return;
    }
    if (urlSession && filteredSessions.some((s) => s.sessionId === urlSession)) {
      setSelectedSessionId(urlSession);
      return;
    }
    setSelectedSessionId((prev) =>
      prev && filteredSessions.some((s) => s.sessionId === prev) ? prev : filteredSessions[0].sessionId
    );
  }, [filteredSessions, urlSession]);

  const active = useMemo(
    () => sessions.find((s) => s.sessionId === selectedSessionId) || null,
    [sessions, selectedSessionId]
  );

  const selectSession = (sessionId) => {
    setSelectedSessionId(sessionId);
    setSearchParams(sessionId ? { session: sessionId } : {}, { replace: true });
  };

  if (loading) {
    return (
      <div
        className="web-page-loading"
        style={{
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <Loader2 className="animate-spin" size={48} style={{ color: '#e03232' }} />
        <p style={{ color: '#8b949e', fontSize: 16 }}>Loading AI chat history…</p>
      </div>
    );
  }

  return (
    <div className="web-page">
      <PageMeta
        title="Web · AI chat"
        description="Website AI assistant conversations and sessions."
        keywords="ai chat, qlink, sessions"
      />

      <div className="web-page-header">
        <div>
          <h1 className="web-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sparkles size={26} style={{ color: '#eab308' }} aria-hidden />
            AI chat (website)
          </h1>
        </div>
        <button type="button" className="btn-secondary" onClick={loadData} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20, fontSize: 13, color: '#8b949e' }}>
        <span>
          <strong style={{ color: '#e6edf3' }}>{sessions.length}</strong> session{sessions.length === 1 ? '' : 's'}
        </span>
        <span>
          <strong style={{ color: '#e6edf3' }}>{rawMessages.length}</strong> message{rawMessages.length === 1 ? '' : 's'}{' '}
          loaded (max {FETCH_LIMIT} newest)
        </span>
      </div>

      {fetchError ? (
        <p className="field-label" style={{ color: '#f87171', marginBottom: 16 }}>
          {fetchError}
        </p>
      ) : null}

      <div className="search-wide-wrap" style={{ marginBottom: 20, maxWidth: 480 }}>
        <Search className="search-wide-icon" size={18} />
        <input
          type="search"
          className="field-input"
          placeholder="Search session id, name, email, or message text…"
          style={{ width: '100%', paddingLeft: 44 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="ai-chat-admin-split">
        <div className="ai-chat-admin-sessions">
          {filteredSessions.length === 0 ? (
            <p style={{ color: '#8b949e', fontSize: 14, padding: 12 }}>No sessions match your search.</p>
          ) : (
            filteredSessions.map((s) => (
              <button
                key={s.sessionId}
                type="button"
                className={`ai-chat-admin-session-btn ${selectedSessionId === s.sessionId ? 'active' : ''}`}
                onClick={() => selectSession(s.sessionId)}
              >
                <div className="ai-chat-admin-session-id">{s.sessionId}</div>
                <div className="ai-chat-admin-session-meta">
                  {s.contactName || s.contactEmail ? (
                    <>
                      <User size={14} style={{ verticalAlign: 'middle', marginRight: 6, opacity: 0.8 }} />
                      {s.contactName || '—'}
                      {s.contactEmail ? ` · ${s.contactEmail}` : ''}
                    </>
                  ) : (
                    <span style={{ color: '#6b7280' }}>No name / email on messages</span>
                  )}
                </div>
                <div className="ai-chat-admin-session-sub">
                  {s.messageCount} message{s.messageCount === 1 ? '' : 's'} ·{' '}
                  {s.lastAt
                    ? new Date(s.lastAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                    : '—'}
                  {s.sessionRow?.created_at ? (
                    <> · session row {new Date(s.sessionRow.created_at).toLocaleDateString()}</>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="ai-chat-admin-detail">
          {!active ? (
            <div className="ai-chat-admin-empty">Select a session to read the transcript.</div>
          ) : (
            <>
              <div className="ai-chat-admin-detail-head">
                <h2 className="ai-chat-admin-detail-title">Transcript</h2>
                <p className="ai-chat-admin-detail-meta">
                  <strong>Session:</strong> {active.sessionId}
                  <br />
                  <strong>Visitor:</strong>{' '}
                  {active.contactName || active.contactEmail
                    ? `${active.contactName || '—'}${active.contactEmail ? ` <${active.contactEmail}>` : ''}`
                    : 'Not provided on messages'}
                </p>
              </div>
              <div className="ai-chat-admin-transcript">
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`ai-chat-admin-msg ${m.sender === 'user' ? 'user' : 'bot'}`}
                  >
                    <strong style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85 }}>
                      {m.sender === 'user' ? 'Visitor' : 'AI'}
                    </strong>
                    <div style={{ marginTop: 6 }}>{m.text}</div>
                    <span className="ai-chat-admin-msg-foot">
                      {m.created_at
                        ? new Date(m.created_at).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'medium',
                          })
                        : ''}
                      {m.sender === 'bot' && m.model_used ? ` · ${m.model_used}` : ''}
                      {m.name ? ` · name: ${m.name}` : ''}
                      {m.email ? ` · email: ${m.email}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebAiChat;
