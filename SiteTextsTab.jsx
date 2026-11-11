import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_SITE_TEXTS, SITE_TEXT_GROUPS } from '@/lib/siteTexts';

export default function SiteTextsTab() {
  const queryClient = useQueryClient();
  const [texts, setTexts] = useState(DEFAULT_SITE_TEXTS);

  const { data: setting = [] } = useQuery({
    queryKey: ['site-texts'],
    queryFn: () => base44.entities.SiteSettings.filter({ key: 'site_texts' }).catch(() => []),
  });

  useEffect(() => {
    if (setting && setting.length > 0) {
      try { setTexts({ ...DEFAULT_SITE_TEXTS, ...JSON.parse(setting[0].value) }); } catch (e) {}
    }
  }, [setting]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const value = JSON.stringify(data);
      if (setting && setting[0]) {
        await base44.entities.SiteSettings.update(setting[0].id, { value });
      } else {
        await base44.entities.SiteSettings.create({ key: 'site_texts', value, description: 'Alle website teksten' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-texts'] });
      toast.success('Teksten opgeslagen! Herlaad de pagina om de wijzigingen te zien.');
    },
  });

  return (
    <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
      <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
        <FileText className="w-5 h-5 text-purple-400" />
        Website Teksten (CMS)
      </h2>
      <p className="text-slate-400 text-sm mb-6">Pas alle teksten op de website aan — menu labels, paginatitels en meer. Na opslaan moeten gebruikers de pagina herladen.</p>

      <div className="space-y-6">
        {SITE_TEXT_GROUPS.map(group => (
          <div key={group.label}>
            <h3 className="text-white font-semibold mb-3 text-sm">{group.label}</h3>
            <div className="space-y-3">
              {group.keys.map(key => (
                <div key={key}>
                  <label className="text-xs text-slate-500 mb-1 block font-mono">{key}</label>
                  <Input value={texts[key] || ''} onChange={e => setTexts({ ...texts, [key]: e.target.value })} className="bg-slate-800 border-slate-700 text-white" />
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex gap-2 pt-2">
          <Button onClick={() => saveMutation.mutate(texts)} disabled={saveMutation.isPending} className="bg-purple-600 hover:bg-purple-700">
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Opslaan...' : 'Opslaan'}
          </Button>
          <Button onClick={() => setTexts(DEFAULT_SITE_TEXTS)} variant="ghost" className="text-slate-400">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset naar standaard
          </Button>
        </div>
      </div>
    </div>
  );
}