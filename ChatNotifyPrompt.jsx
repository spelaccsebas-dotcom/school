import React, { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getChatNotifyChoice, requestChatNotifyPermission, setChatNotifyChoice } from '@/lib/chatNotify';

/** Vraagt één keer of de gebruiker een melding wil bij nieuwe chatberichten. */
export default function ChatNotifyPrompt() {
  const [choice, setChoice] = useState(getChatNotifyChoice());
  const [busy, setBusy] = useState(false);

  if (choice) return null;

  const answer = async (value) => {
    setBusy(true);
    if (value === 'aan') {
      const granted = await requestChatNotifyPermission();
      if (!granted) {
        setChatNotifyChoice('uit');
        setChoice('uit');
        setBusy(false);
        toast.error('Meldingen zijn geblokkeerd in je browser');
        return;
      }
    }
    setChatNotifyChoice(value);
    setChoice(value);
    setBusy(false);
    toast.success(value === 'aan' ? 'Je krijgt nu een melding bij nieuwe berichten' : 'Meldingen staan uit');
  };

  return (
    <div className="m-3 rounded-lg border border-purple-500/30 bg-purple-500/10 p-3 flex flex-col sm:flex-row sm:items-center gap-2">
      <Bell className="w-4 h-4 text-purple-300 shrink-0" />
      <p className="flex-1 text-xs text-slate-300">Wil je een melding als er een nieuw chatbericht binnenkomt?</p>
      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          onClick={() => answer('aan')}
          disabled={busy}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-xs"
        >
          <Bell className="w-3.5 h-3.5 mr-1" /> Ja
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => answer('uit')}
          disabled={busy}
          className="text-slate-400 hover:text-white text-xs"
        >
          <BellOff className="w-3.5 h-3.5 mr-1" /> Nee
        </Button>
      </div>
    </div>
  );
}