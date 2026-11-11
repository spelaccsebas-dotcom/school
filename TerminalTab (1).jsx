import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyRound, Save, Terminal as TerminalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { TERMINAL_COMMANDS } from '@/lib/terminalCommands';
import TerminalCodes from '@/components/TerminalCodes';
import TerminalAccessTab from '@/components/TerminalAccessTab';
import TerminalLog from '@/components/TerminalLog';

export default function TerminalTab({ siteSettings = [], refetchSettings }) {
  const setting = siteSettings.find(s => s.key === 'terminal_password');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPassword(setting?.value || '');
  }, [setting?.id, setting?.value]);

  const savePassword = async () => {
    const value = password.trim();
    if (!value) { toast.error('Vul een wachtwoord in'); return; }
    setSaving(true);
    if (setting) {
      await base44.entities.SiteSettings.update(setting.id, { value });
    } else {
      await base44.entities.SiteSettings.create({
        key: 'terminal_password',
        value,
        description: 'Wachtwoord voor de geheime terminal',
      });
    }
    setSaving(false);
    refetchSettings();
    toast.success('Wachtwoord opgeslagen');
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-green-500/20 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-green-400" />
          Terminal wachtwoord
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Gebruikers kunnen op de codes-pagina een code van het type <span className="text-green-300">Terminal</span> inwisselen.
          Er opent dan een terminal-venster waarin dit wachtwoord nodig is.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nieuw wachtwoord"
            className="bg-slate-800 border-slate-700 text-white font-mono"
          />
          <Button onClick={savePassword} disabled={saving} className="bg-green-600 hover:bg-green-700 shrink-0">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>

      <TerminalAccessTab />

      <TerminalCodes />

      <TerminalLog />

      <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-purple-500/20">
          <h2 className="text-white font-bold flex items-center gap-2">
            <TerminalIcon className="w-5 h-5 text-green-400" />
            Alle terminal-codes ({TERMINAL_COMMANDS.length})
          </h2>
          <p className="text-slate-400 text-xs mt-1">Dit zijn de commando's die gebruikers in de terminal kunnen typen. De badge laat zien welk niveau nodig is.</p>
        </div>
        <div className="divide-y divide-slate-800">
          {TERMINAL_COMMANDS.map(command => (
            <div key={command.name} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-800/30">
              <span className="font-mono text-sm text-green-300 bg-slate-800 px-2 py-0.5 rounded flex items-center gap-2 shrink-0">
                {command.name}
                <span className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 rounded">{command.level || 'kijk'}</span>
              </span>
              <span className="text-slate-400 text-xs text-right">{command.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}