import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { showChatNotification } from '@/lib/chatNotify';

/** Toont een browsermelding bij een nieuw chatbericht van iemand anders (alleen als de gebruiker dat wil). */
export default function ChatNotifier() {
  useEffect(() => {
    let me = null;
    base44.auth.me().then(u => { me = u; }).catch(() => {});
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event?.type !== 'create') return;
      const data = event.data || {};
      if (!me || data.sender_email === me.email) return;
      if (!document.hidden) return;
      showChatNotification(data);
    });
    return unsubscribe;
  }, []);

  return null;
}