import React, { useRef, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Loader2, Send, Sparkles, CheckCircle2, XCircle } from 'lucide-react';
import { AI_SCHEMA, applyAction, buildPrompt, getCurrentTexts } from '@/lib/aiActions';

const VOORBEELDEN = [
  'Zet de site in onderhoud',
  'Maak een terminalcode BEHEER1 met niveau beheer',
  'Verwijder alle actieve banners',
];

export default function AiBeheerTab({ user }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hoi! Ik ben de beheer-AI. Ik kan dingen aanpassen én verwijderen: teksten, banners, onderhoud, punten, codes, polls, bans, Super Admin- en terminalrechten. Wat wil je doen?',
      actions: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollTop = endRef.current.scrollHeight;
  }, [messages, busy]);

  const send = async () => {
    const vraag = input.trim();
    if (!vraag || busy) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: vraag, actions: [] }]);
    setBusy(true);

    try {
      const customTexts = await getCurrentTexts().catch(() => ({}));
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(vraag, customTexts),
        response_json_schema: AI_SCHEMA,
      });

      const acties = Array.isArray(result?.acties) ? result.acties : [];
      const results = [];
      for (const action of acties) {
        try {
          results.push(await applyAction(action, user));
        } catch (e) {
          results.push({ ok: false, label: `Mislukt: ${action.type}` });
        }
      }

      setMessages(prev => [...prev, {
        role: 'ai',
        text: result?.antwoord || 'Klaar.',
        actions: results,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: 'Er ging iets mis bij het verwerken van je verzoek.',
        actions: [],
      }]);
    }
    setBusy(false);
  };

  return (
    <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-purple-500/20 flex items-center gap-2">
        <Bot className="w-5 h-5 text-purple-400" />
        <div>
          <h2 className="text-white font-bold">AI Beheer</h2>
          <p className="text-slate-400 text-xs">Aanpassen en verwijderen in gewone taal.</p>
        </div>
      </div>

      <div ref={endRef} className="max-h-[45vh] overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div key={index} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${
              message.role === 'user'
                ? 'bg-purple-600/30 border border-purple-500/40 text-white'
                : 'bg-slate-800/70 border border-slate-700 text-slate-200'
            }`}>
              <p className="whitespace-pre-wrap">{message.text}</p>
              {message.actions?.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.actions.map((action, actionIndex) => (
                    <div key={actionIndex} className="flex items-start gap-1.5 text-xs">
                      {action.ok
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                        : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />}
                      <span className={action.ok ? 'text-green-300' : 'text-red-300'}>{action.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> AI denkt na...
          </div>
        )}
      </div>

      <div className="p-3 border-t border-purple-500/20 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {VOORBEELDEN.map(voorbeeld => (
            <button
              key={voorbeeld}
              onClick={() => setInput(voorbeeld)}
              className="text-[11px] px-2 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:border-purple-500/50 hover:text-white"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />{voorbeeld}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Wat moet ik aanpassen of verwijderen?"
            disabled={busy}
            className="bg-slate-800 border-slate-700 text-white"
          />
          <Button onClick={send} disabled={busy || !input.trim()} className="bg-purple-600 hover:bg-purple-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}