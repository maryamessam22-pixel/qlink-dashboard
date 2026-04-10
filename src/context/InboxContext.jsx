import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';

const InboxContext = createContext(null);

const POLL_MS = 45_000;

function stripPreview(htmlOrText) {
  if (!htmlOrText) return '';
  const t = String(htmlOrText).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > 140 ? `${t.slice(0, 137)}…` : t;
}

export function InboxProvider({ children }) {
  const [rows, setRows] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('support_messages')
      .select('id, sender_name, subject, message_body, status, received_at, date')
      .order('received_at', { ascending: false })
      .limit(40);

    if (error) {
      setLoadError(error.message || 'Could not load inbox.');
      setRows([]);
      setLoading(false);
      return;
    }

    setLoadError('');
    setRows(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await load();
    })();

    const channel = supabase
      .channel('dashboard-inbox-support_messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_messages' }, () => {
        if (!cancelled) load();
      })
      .subscribe();

    const poll = window.setInterval(() => {
      if (!cancelled) load();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
  }, [load]);

  const unreadCount = useMemo(() => rows.filter((r) => r.status === 'Unread').length, [rows]);

  const recentItems = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        from: r.sender_name || 'Unknown',
        topic: r.subject || '(No subject)',
        preview: stripPreview(r.message_body),
        unread: r.status === 'Unread',
        source: String(r.subject || '').trim().toLowerCase().startsWith('[app]') ? 'app' : 'web',
        at: r.received_at || r.date,
      })),
    [rows]
  );

  const value = useMemo(
    () => ({
      unreadCount,
      recentItems,
      loading,
      loadError,
      refresh: load,
    }),
    [unreadCount, recentItems, loading, loadError, load]
  );

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) {
    throw new Error('useInbox must be used within InboxProvider');
  }
  return ctx;
}
