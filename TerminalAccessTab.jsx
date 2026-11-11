import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { TERMINAL_LEVELS } from '@/lib/terminalShared';

const asList = (result) => (Array.isArray(result) ? result : result?.items || []);

const LEVEL_BADGE = {
  kijk: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  punten: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  beheer: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  volledig: 'text-green-300 bg-green-500/10 border-green-500/30',
};

export default function TerminalAccessTab() {
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('punten');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const result = await base44.entities.TerminalAccess.list();
    setRows(asList(result));
    setLoading(false);
  };

  useEffect(() => {
    load();
    base44.entities.User.list().then(list => setUsers(asList(list))).catch(() => setUsers([]));
  }, []);

  const add = async () => {
    const value = email.trim().toLowerCase();
    const target = users.find(u => (u.email || '').toLowerCase() === value);
    if (!value) { toast.error('Vul een e-mailadres in'); return; }
    if (!target) { toast.error('Geen account met dit e-mailadres'); return; }
    setSaving(true);
    const existing = asList(await base44.entities.TerminalAccess.filter({ user_email: target.email }));
    if (existing[0]) {
      await base44.entities.TerminalAccess.update(existing[0].id, { level, user_name: target.full_name || '' });
    } else {
      await base44.entities.TerminalAccess.create({
        user_email: target.email,
        user_name: target.full_name || '',
        level,
      });
    }
    setSaving(false);
    setEmail('');
    await load();
    toast.success(`Rechten van ${target.full_name || target.email} ingesteld`);
  };

  const changeLevel = async (row, value) => {
    setRows(prev => prev.map(r => (r.id === row.id ? { ...r, level: value } : r)));
    await base44.entities.TerminalAccess.update(row.id, { level: value });
  };

  const remove = async (row) => {
    setRows(prev => prev.filter(r => r.id !== row.id));
    await base44.entities.TerminalAccess.delete(row.id);
    toast.success('Rechten teruggezet');
  };

  return (
    <div className="bg-slate-900/50 border border-green-500/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-green-500/20">
        <h2 className="text-white font-bold">Rechten per gebruiker ({rows.length})</h2>
        <p className="text-slate-400 text-xs mt-1">
          Zonder eigen instelling start iedereen op <span className="text-slate-300">Alleen kijken</span>, behalve via een terminal-code.
        </p>
      </div>

      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mailadres van de gebruiker"
            className="bg-slate-800 border-slate-700 text-white"
          />
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white text-sm rounded-md px-2 py-1.5 shrink-0"
          >
            {TERMINAL_LEVELS.map(l => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
          <Button onClick={add} disabled={saving} className="bg-green-600 hover:bg-green-700 shrink-0">
            <UserPlus className="w-4 h-4 mr-2" />
            Instellen
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {TERMINAL_LEVELS.map(l => (
            <p key={l.id} className="text-[11px] text-slate-500">
              <span className={`px-1.5 py-0.5 rounded border mr-1.5 ${LEVEL_BADGE[l.id]}`}>{l.label}</span>
              {l.description}
            </p>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-800">
        {loading && <p className="text-slate-500 text-sm p-4">Laden...</p>}
        {!loading && rows.length === 0 && (
          <p className="text-slate-500 text-sm p-4">Nog niemand met eigen rechten.</p>
        )}
        {rows.map(row => (
          <div key={row.id} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-800/30">
            <div className="min-w-0">
              <p className="text-white text-sm truncate">{row.user_name || row.user_email}</p>
              <p className={`text-[10px] inline-block mt-1 px-1.5 py-0.5 rounded border ${LEVEL_BADGE[row.level] || LEVEL_BADGE.kijk}`}>
                {row.level}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <select
                value={row.level}
                onChange={e => changeLevel(row, e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-md px-2 py-1.5"
              >
                {TERMINAL_LEVELS.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              <button
                onClick={() => remove(row)}
                className="p-2 rounded text-red-400 hover:bg-red-500/10"
                title="Rechten weghalen"
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