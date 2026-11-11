import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { History, RefreshCw } from 'lucide-react';
import { asItems } from '@/lib/terminalShared';
import { timeAgo } from '@/lib/time';

const LEVEL_BADGE = {
  kijk: 'text-slate-300 bg-slate-500/10 border-slate-500/30',
  punten: 'text-blue-300 bg-blue-500/10 border-blue-500/30',
  beheer: 'text-purple-300 bg-purple-500/10 border-purple-500/30',
  volledig: 'text-green-300 bg-green-500/10 border-green-500/30',
};

/** Logboek van alle terminal-commando's: wie deed wat en wanneer. */
export default function TerminalLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const result = await base44.entities.TerminalLog.filter({}, '-created_date', 100);
    setRows(asItems(result));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-slate-900/50 border border-green-500/20 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-green-500/20 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-white font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-green-400" />
            Commando-log ({rows.length})
          </h2>
          <p className="text-slate-400 text-xs mt-1">Laatste 100 commando's uit de terminal, met naam en tijd.</p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={load}
          className="text-green-400 hover:text-green-300 hover:bg-green-500/10 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Laden...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">Nog geen commando's uitgevoerd</div>
        ) : (
          rows.map(row => (
            <div key={row.id} className="flex items-center justify-between gap-3 p-3 border-b border-slate-800 hover:bg-slate-800/30">
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold truncate">{row.user_name || row.user_email}</div>
                <div className="font-mono text-green-300 text-xs truncate">$ {row.command}</div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${LEVEL_BADGE[row.level] || LEVEL_BADGE.kijk}`}>
                  {row.level || 'kijk'}
                </span>
                <div className="text-slate-500 text-xs mt-1">{timeAgo(row.created_date)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}