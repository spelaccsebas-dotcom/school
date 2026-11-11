import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, RotateCcw, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export const DEFAULT_INFO_CONTENT = {
  aboutTitle: 'Over deze app',
  aboutText: 'GameZone is een online gaming platform waar je 31 verschillende games kunt spelen, scores kunt bijhouden, en met vrienden kunt chatten. Van klassieke games zoals Snake en Tetris tot moderne puzzels en arcade games - er is voor ieder wat wils!',
  stats: [
    { label: '31+ Games', desc: 'Speel verschillende categorieën' },
    { label: 'Scorebord', desc: 'Compete met andere spelers' },
    { label: 'Vrienden', desc: 'Voeg vrienden toe en chat privé' },
    { label: 'Gratis', desc: '100% gratis te spelen' },
  ],
  contactTitle: 'Contact',
  contactText: 'Heb je vragen, suggesties of feedback? Neem gerust contact op!',
  contactEmail: 'contact@gamezone.nl',
  versionText: 'GameZone v1.0 • Gemaakt met ❤️ in Nederland',
};

export default function InfoTekstTab() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(DEFAULT_INFO_CONTENT);

  const { data: setting = [] } = useQuery({
    queryKey: ['info-content-setting'],
    queryFn: () => base44.entities.SiteSettings.filter({ key: 'info_content' }),
  });

  useEffect(() => {
    if (setting && setting.length > 0) {
      try {
        setContent({ ...DEFAULT_INFO_CONTENT, ...JSON.parse(setting[0].value) });
      } catch (e) {}
    }
  }, [setting]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const value = JSON.stringify(data);
      if (setting && setting[0]) {
        await base44.entities.SiteSettings.update(setting[0].id, { value });
      } else {
        await base44.entities.SiteSettings.create({ key: 'info_content', value, description: 'Info pagina tekst' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['info-content-setting'] });
      toast.success('Tekst opgeslagen!');
    },
  });

  const updateStat = (i, field, val) => {
    setContent(prev => {
      const stats = [...prev.stats];
      stats[i] = { ...stats[i], [field]: val };
      return { ...prev, stats };
    });
  };

  const addStat = () => {
    setContent(prev => ({ ...prev, stats: [...prev.stats, { label: 'Nieuwe stat', desc: 'Beschrijving' }] }));
  };

  const removeStat = (i) => {
    setContent(prev => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }));
  };

  return (
    <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
      <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        Info Pagina Tekst Aanpassen
      </h2>
      <p className="text-slate-400 text-sm mb-6">Pas de tekst aan die op de Info pagina wordt getoond.</p>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Titel "Over deze app"</label>
          <Input value={content.aboutTitle} onChange={e => setContent({ ...content, aboutTitle: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Over tekst</label>
          <Textarea rows={4} value={content.aboutText} onChange={e => setContent({ ...content, aboutText: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-2 block">Stat kaarten</label>
          <div className="grid sm:grid-cols-2 gap-3">
            {content.stats.map((stat, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 space-y-2 relative">
                <button onClick={() => removeStat(i)} className="absolute top-2 right-2 text-red-400 hover:text-red-300" title="Verwijder stat">
                  <X className="w-4 h-4" />
                </button>
                <Input placeholder="Label" value={stat.label} onChange={e => updateStat(i, 'label', e.target.value)} className="bg-slate-900 border-slate-700 text-white text-sm pr-8" />
                <Input placeholder="Beschrijving" value={stat.desc} onChange={e => updateStat(i, 'desc', e.target.value)} className="bg-slate-900 border-slate-700 text-white text-sm" />
              </div>
            ))}
            <button onClick={addStat} className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-purple-500/50 transition-all text-sm">
              <Plus className="w-4 h-4" /> Stat toevoegen
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-slate-400 mb-1 block">Contact titel</label>
          <Input value={content.contactTitle} onChange={e => setContent({ ...content, contactTitle: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Contact tekst</label>
          <Textarea rows={2} value={content.contactText} onChange={e => setContent({ ...content, contactText: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Contact email</label>
          <Input value={content.contactEmail} onChange={e => setContent({ ...content, contactEmail: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>
        <div>
          <label className="text-sm text-slate-400 mb-1 block">Versie tekst</label>
          <Input value={content.versionText} onChange={e => setContent({ ...content, versionText: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={() => saveMutation.mutate(content)} disabled={saveMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Opslaan...' : 'Opslaan'}
          </Button>
          <Button onClick={() => setContent(DEFAULT_INFO_CONTENT)} variant="ghost" className="text-slate-400">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset naar standaard
          </Button>
        </div>
      </div>
    </div>
  );
}