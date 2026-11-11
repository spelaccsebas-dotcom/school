import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Play, Square, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function GameDoorElkaarTab({ siteSettings, refetchSettings }) {
  const [duurMinuten, setDuurMinuten] = useState('5');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Tick every second for countdown
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const eventSetting = siteSettings?.find(s => s.key === 'gamedoorelkaar');
  const eventData = (() => {
    try { return eventSetting ? JSON.parse(eventSetting.value) : null; } catch { return null; }
  })();

  const isActive = eventData?.active && (!eventData?.expires || new Date(eventData.expires) > new Date(now));

  const secondsLeft = eventData?.expires
    ? Math.max(0, Math.round((new Date(eventData.expires) - now) / 1000))
    : null;

  const sendReloadSignal = async () => {
    const sig = Date.now().toString();
    const existing = siteSettings?.find(s => s.key === 'reload_signal');
    if (existing) {
      await base44.entities.SiteSettings.update(existing.id, { value: sig });
    } else {
      await base44.entities.SiteSettings.create({ key: 'reload_signal', value: sig, description: 'Reload signaal' });
    }
  };

  const saveEventSetting = async (value) => {
    if (eventSetting) {
      await base44.entities.SiteSettings.update(eventSetting.id, { value: JSON.stringify(value) });
    } else {
      await base44.entities.SiteSettings.create({
        key: 'gamedoorelkaar',
        value: JSON.stringify(value),
        description: 'GameDoorElkaar event'
      });
    }
  };

  const startEvent = async () => {
    const mins = Number(duurMinuten);
    if (!mins || mins < 1) { toast.error('Vul een geldige tijdsduur in'); return; }
    setLoading(true);
    const expires = new Date(Date.now() + mins * 60 * 1000).toISOString();
    await saveEventSetting({ active: true, expires, seed: Date.now() });
    await sendReloadSignal();
    refetchSettings();
    setLoading(false);
    toast.success(`🎲 GameDoorElkaar gestart voor ${mins} minuten! Iedereen reloadt.`);
  };

  const stopEvent = async () => {
    setLoading(true);
    await saveEventSetting({ active: false, expires: null, seed: null });
    await sendReloadSignal();
    refetchSettings();
    setLoading(false);
    toast.success('GameDoorElkaar gestopt! Iedereen reloadt.');
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          GameDoorElkaar Event
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Als dit event actief is, worden de games op de homepage voor <strong className="text-white">iedereen</strong> in een willekeurige volgorde getoond.
          Bij starten én stoppen reloadt iedereen automatisch.
        </p>

        {/* Status */}
        <div className={`p-6 rounded-xl border-2 text-center mb-6 ${isActive ? 'border-purple-500/50 bg-purple-500/10' : 'border-slate-600/50 bg-slate-800/30'}`}>
          <div className="text-5xl mb-3">{isActive ? '🎲' : '😴'}</div>
          <div className={`text-2xl font-bold mb-1 ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>
            GameDoorElkaar {isActive ? 'ACTIEF' : 'INACTIEF'}
          </div>
          {isActive && secondsLeft !== null && (
            <div className="flex items-center justify-center gap-2 text-purple-400 mt-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-xl font-bold">{formatTime(secondsLeft)}</span>
              <span className="text-sm text-slate-400">resterend</span>
            </div>
          )}
          {!isActive && <div className="text-slate-500 text-sm">Games staan in normale volgorde</div>}
        </div>

        {/* Controls */}
        {!isActive ? (
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400 mb-1 block">Duur (minuten) *</label>
              <Input
                type="number"
                min="1"
                placeholder="Bijv. 5"
                value={duurMinuten}
                onChange={e => setDuurMinuten(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <Button
              onClick={startEvent}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6"
            >
              <Play className="w-5 h-5 mr-2" />
              {loading ? 'Starten...' : `GameDoorElkaar Starten (${duurMinuten || '?'} min)`}
            </Button>
          </div>
        ) : (
          <Button
            onClick={stopEvent}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
          >
            <Square className="w-5 h-5 mr-2" />
            {loading ? 'Stoppen...' : 'GameDoorElkaar Stoppen'}
          </Button>
        )}
      </div>
    </div>
  );
}