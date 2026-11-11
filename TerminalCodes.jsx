import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Power, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { TERMINAL_LEVELS } from '@/lib/terminalShared';

export default function TerminalCodes() {
  const [codes, setCodes] = useState([]);
  const [newCode, setNewCode] = useState('');
  const [newLevel, setNewLevel] = useState('volledig');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const result = await base44.entities.RedeemCode.filter({ reward_type: 'terminal' });
    setCodes(Array.isArray(result) ? result : result?.items || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const code = newCode.trim().toUpperCase();
    if (!code) { toast.error('Vul een code in'); return; }
    setSaving(true);
    await base44.entities.RedeemCode.create({
      code,
      reward_type: 'terminal',
      terminal_level: newLevel,
      max_uses: 0,
      uses: 0,
      used_by: [],
      active: true,
      description: `Terminal met niveau ${newLevel}`,
    });
    setNewCode('');
    setSaving(false);
    await load();
    toast.success('Terminal-code aangemaakt');
  };

  const toggleActive = async (item) => {
    setCodes(prev => prev.map(c => (c.id === item.id ? { ...c, active: !item.active } : c)));
    await base44.entities.RedeemCode.update(item.id, { active: !item.active });
  };

  const changeLevel = async (item, value) => {
    setCodes(prev => prev.map(c => (c.id === item.id ? { ...c, terminal_level: value } : c)));
    await base44.entities.RedeemCode.update(item.id, { terminal_level: value });
  };

  const remove = async (item) => {
    setCodes(prev => prev.filter(c => c.id !== item.id));
    await base44.entities.RedeemCode.delete(item.id);
    toast.success('Code verwijderd');
  };

  return (
    <div className="bg-slate-900/50 border border-green-500/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-green-500/20">
        <h2 className="text-white font-bold">Codes die de terminal openen ({codes.length})</h2>
        <p className="text-slate-400 text-xs mt-1">Kies per code hoeveel rechten iemand krijgt. Deze codes staan niet bij Codes.</p>
      </div>

      <div className="p-4 flex flex-col sm:flex-row gap-2 border-b border-slate-800">
        <Input
          value={newCode}
          onChange={e => setNewCode(e.target.value.toUpperCase())}
          placeholder="NIEUWE CODE"
          className="bg-slate-800 border-slate-700 text-white font-mono"
        />
        <select
          value={newLevel}
          onChange={e => setNewLevel(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-2 py-1.5 shrink-0"
        >
          {TERMINAL_LEVELS.map(l => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
        <Button onClick={create} disabled={saving} className="bg-green-600 hover:bg-green-700 shrink-0">
          <Plus className="w-4 h-4 mr-2" />
          Aanmaken
        </Button>
      </div>

      <div className="divide-y divide-slate-800">
        {codes.length === 0 && (
          <p className="text-slate-500 text-sm p-4">Nog geen terminal-codes.</p>
        )}
        {codes.map(item => (
          <div key={item.id} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-800/30">
            <div className="min-w-0">
              <p className="font-mono text-sm text-green-300 truncate">{item.code}</p>
              <p className="text-slate-500 text-xs">
                {item.uses || 0} keer gebruikt
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <select
                value={item.terminal_level || 'volledig'}
                onChange={e => changeLevel(item, e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1.5"
              >
                {TERMINAL_LEVELS.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              <button
                onClick={() => toggleActive(item)}
                className={`p-2 rounded ${item.active ? 'text-green-400 hover:bg-green-500/10' : 'text-slate-500 hover:bg-slate-700/40'}`}
                title={item.active ? 'Actief' : 'Uitgeschakeld'}
              >
                <Power className="w-4 h-4" />
              </button>
              <button
                onClick={() => remove(item)}
                className="p-2 rounded text-red-400 hover:bg-red-500/10"
                title="Verwijderen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}