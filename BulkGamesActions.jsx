import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { EyeOff, Eye, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkGamesActions({ gameList, hiddenGames, onDone }) {
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);

  const hiddenIds = new Set(hiddenGames.map(h => h.game_id));

  const hideAll = async () => {
    setBusy(true);
    try {
      const toHide = gameList.filter(g => !hiddenIds.has(g.id));
      if (toHide.length > 0) await base44.entities.HiddenGame.bulkCreate(toHide.map(g => ({ game_id: g.id, game_name: g.name })));
      toast.success('Alle games verborgen');
      onDone();
    } catch (e) { toast.error('Fout bij verbergen'); }
    setBusy(false);
  };

  const showAll = async () => {
    setBusy(true);
    try {
      await base44.entities.HiddenGame.deleteMany({});
      toast.success('Alle games zichtbaar');
      onDone();
    } catch (e) { toast.error('Fout bij tonen'); }
    setBusy(false);
  };

  const hideAllExcept = async () => {
    setBusy(true);
    try {
      const selectedSet = new Set(selected);
      const toHide = gameList.filter(g => !selectedSet.has(g.id) && !hiddenIds.has(g.id));
      const toUnhide = hiddenGames.filter(h => selectedSet.has(h.game_id));
      if (toHide.length > 0) await base44.entities.HiddenGame.bulkCreate(toHide.map(g => ({ game_id: g.id, game_name: g.name })));
      await Promise.all(toUnhide.map(h => base44.entities.HiddenGame.delete(h.id)));
      toast.success('Alle games verborgen behalve geselecteerde');
      onDone();
    } catch (e) { toast.error('Fout'); }
    setBusy(false);
  };

  const showAllExcept = async () => {
    setBusy(true);
    try {
      const selectedSet = new Set(selected);
      const toUnhide = hiddenGames.filter(h => !selectedSet.has(h.game_id));
      const toHide = gameList.filter(g => selectedSet.has(g.id) && !hiddenIds.has(g.id));
      await Promise.all(toUnhide.map(h => base44.entities.HiddenGame.delete(h.id)));
      if (toHide.length > 0) await base44.entities.HiddenGame.bulkCreate(toHide.map(g => ({ game_id: g.id, game_name: g.name })));
      toast.success('Alle games zichtbaar behalve geselecteerde');
      onDone();
    } catch (e) { toast.error('Fout'); }
    setBusy(false);
  };

  const toggleGame = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-4 mb-4">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <Layers className="w-5 h-5 text-purple-400" />
        Bulk Acties
      </h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={hideAll} disabled={busy} size="sm" className="bg-red-600 hover:bg-red-700">
          <EyeOff className="w-4 h-4 mr-1" /> Verberg Alle Games
        </Button>
        <Button onClick={showAll} disabled={busy} size="sm" className="bg-green-600 hover:bg-green-700">
          <Eye className="w-4 h-4 mr-1" /> Laat Alle Games Zien
        </Button>
      </div>
      <div className="border-t border-slate-700 pt-3">
        <p className="text-slate-400 text-sm mb-2">Selecteer games, kies dan een actie:</p>
        <div className="max-h-40 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 mb-3">
          {gameList.map(g => (
            <button
              key={g.id}
              onClick={() => toggleGame(g.id)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border transition-all text-left ${selected.includes(g.id) ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-slate-700 text-slate-400 hover:text-white'}`}
            >
              <span>{g.icon}</span>
              <span className="truncate">{g.name}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={hideAllExcept} disabled={busy || selected.length === 0} size="sm" className="bg-orange-600 hover:bg-orange-700">
            <EyeOff className="w-4 h-4 mr-1" /> Verberg Alles Behalve Geselecteerde
          </Button>
          <Button onClick={showAllExcept} disabled={busy || selected.length === 0} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-1" /> Toon Alles Behalve Geselecteerde
          </Button>
        </div>
      </div>
    </div>
  );
}