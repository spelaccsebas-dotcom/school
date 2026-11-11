import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LinkGameTab({ siteSettings, refetchSettings }) {
  const [name, setName] = useState('Aap Link');
  const [url, setUrl] = useState('');
  const client = useQueryClient();
  const nameSetting = siteSettings.find(s => s.key === 'linkgame_name');
  const urlSetting = siteSettings.find(s => s.key === 'linkgame_url');
  useEffect(() => { setName(nameSetting?.value || 'Aap Link'); setUrl(urlSetting?.value || ''); }, [nameSetting?.value, urlSetting?.value]);
  const { data: hidden = [], isPending } = useQuery({ queryKey: ['hidden-games'], queryFn: () => base44.entities.HiddenGame.list() });
  const hiddenLink = hidden.find(h => h.game_id === 'linkgame');
  const save = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error('Vul een naam in.');
      const value = url.trim() ? (/^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`) : '';
      if (value && !/^https?:\/\/[^\s]+$/i.test(value)) throw new Error('Vul een geldige website-link in.');
      if (value) new URL(value);
      await Promise.all([['linkgame_name', name.trim(), nameSetting], ['linkgame_url', value, urlSetting]].map(([key, value, setting]) => setting ? base44.entities.SiteSettings.update(setting.id, { value }) : base44.entities.SiteSettings.create({ key, value })));
      await refetchSettings();
    },
    onSuccess: () => toast.success('Naam en link opgeslagen!'),
  });
  const visibility = useMutation({
    mutationFn: () => hiddenLink ? base44.entities.HiddenGame.delete(hiddenLink.id) : base44.entities.HiddenGame.create({ game_id: 'linkgame', game_name: name.trim() || 'Aap Link' }),
    onSuccess: () => client.invalidateQueries({ queryKey: ['hidden-games'] }),
  });
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-6 max-w-lg space-y-4">
      <h2 className="font-bold text-lg">Link Game Instellen</h2>
      <p className="text-muted-foreground text-sm">Opent in een nieuw browsertabblad. Zonder link verschijnt de aap-foto.</p>
      <label className="block space-y-2"><span>Naam op Home</span><Input value={name} onChange={e => setName(e.target.value)} /></label>
      <label className="block space-y-2"><span>Website-link</span><Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} /></label>
      {save.error && <p role="alert" className="text-destructive text-sm">{save.error.message}</p>}
      <Button className="w-full" disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Opslaan...' : 'Naam en link opslaan'}</Button>
      <p className="text-sm">Status: {isPending ? 'Laden...' : hiddenLink ? 'Verborgen op Home' : 'Zichtbaar op Home'}</p>
      {visibility.error && <p role="alert" className="text-destructive text-sm">{visibility.error.message}</p>}
      <Button variant="outline" className="w-full" disabled={isPending || visibility.isPending} onClick={() => visibility.mutate()}>{visibility.isPending ? 'Bijwerken...' : hiddenLink ? 'Weer laten zien' : 'Verstoppen'}</Button>
    </div>
  );
}