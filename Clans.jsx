import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Trophy, Plus, X, Crown, LogOut, Swords, UserPlus, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { utcDate } from '@/lib/time';

const CLAN_ICONS = ['⚔️', '🔥', '💀', '🐉', '🦁', '🌊', '⚡', '🏆', '🎯', '🌙', '🌟', '💎', '🦅', '🐺', '🛡️'];

export default function Clans() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('list'); // 'list' | 'create' | 'detail'
  const [selectedClan, setSelectedClan] = useState(null);
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newIcon, setNewIcon] = useState('⚔️');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: clans = [], isLoading } = useQuery({
    queryKey: ['clans'],
    queryFn: () => base44.entities.Clan.list('-total_points', 50),
    enabled: !!user,
  });

  const { data: allScores = [] } = useQuery({
    queryKey: ['scores-for-clans'],
    queryFn: () => base44.entities.Score.list('-score', 500),
    enabled: !!user,
  });

  // Fetch recent activities to determine who is online (active in last 5 minutes)
  const { data: recentActivities = [] } = useQuery({
    queryKey: ['recent-activities-clans'],
    queryFn: () => base44.entities.Activity.list('-created_date', 200),
    enabled: !!user,
    refetchInterval: 30000, // refresh every 30s
  });

  const onlineEmails = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const emails = new Set();
    recentActivities.forEach(a => {
      if (a.user_email && utcDate(a.created_date) > fiveMinutesAgo) {
        emails.add(a.user_email);
      }
    });
    return emails;
  }, [recentActivities]);

  // Find the clan the current user is in
  const myClan = clans.find(c => c.members?.includes(user?.email));

  const createClanMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Clan.create({
        ...data,
        owner_email: user.email,
        owner_name: user.full_name || user.email,
        members: [user.email],
        member_names: [user.full_name || user.email],
        total_points: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clans'] });
      setView('list');
      setNewName(''); setNewTag(''); setNewDesc(''); setNewIcon('⚔️');
      toast.success('Clan aangemaakt!');
    },
    onError: () => toast.error('Er ging iets mis'),
  });

  const joinClanMutation = useMutation({
    mutationFn: async (clan) => {
      if (myClan) throw new Error('Je zit al in een clan');
      const updatedMembers = [...(clan.members || []), user.email];
      const updatedNames = [...(clan.member_names || []), user.full_name || user.email];
      return base44.entities.Clan.update(clan.id, {
        members: updatedMembers,
        member_names: updatedNames,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clans'] });
      toast.success('Welkom in de clan!');
    },
    onError: (e) => toast.error(e.message),
  });

  const leaveClanMutation = useMutation({
    mutationFn: async (clan) => {
      if (clan.owner_email === user.email) {
        // Owner leaves = delete clan
        return base44.entities.Clan.delete(clan.id);
      }
      const updatedMembers = (clan.members || []).filter(e => e !== user.email);
      const updatedNames = (clan.member_names || []).filter((_, i) => clan.members[i] !== user.email);
      return base44.entities.Clan.update(clan.id, {
        members: updatedMembers,
        member_names: updatedNames,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clans'] });
      setSelectedClan(null);
      setView('list');
      toast.success('Clan verlaten');
    },
  });

  // Sync clan total points based on member scores
  const syncPoints = async (clan) => {
    const memberEmails = clan.members || [];
    const memberScores = allScores.filter(s => memberEmails.includes(s.created_by));
    const total = memberScores.reduce((sum, s) => sum + (s.score || 0), 0);
    await base44.entities.Clan.update(clan.id, { total_points: total });
    queryClient.invalidateQueries({ queryKey: ['clans'] });
  };

  const inviteMutation = useMutation({
    mutationFn: async ({ clan, email, name }) => {
      if (!email) throw new Error('Vul een email in');
      if (clan.members?.includes(email)) throw new Error('Deze persoon zit al in de clan');
      const updatedMembers = [...(clan.members || []), email];
      const updatedNames = [...(clan.member_names || []), name || email];
      return base44.entities.Clan.update(clan.id, {
        members: updatedMembers,
        member_names: updatedNames,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clans'] });
      setInviteEmail('');
      setInviteName('');
      toast.success('Persoon toegevoegd aan de clan!');
    },
    onError: (e) => toast.error(e.message),
  });

  const getClanPoints = (clan) => {
    const memberEmails = clan.members || [];
    const memberScores = allScores.filter(s => memberEmails.includes(s.created_by));
    return memberScores.reduce((sum, s) => sum + (s.score || 0), 0);
  };

  const sortedClans = [...clans].sort((a, b) => getClanPoints(b) - getClanPoints(a));

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Laden...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Clans
          </h1>
          <p className="text-slate-400">Sluit je aan bij een clan en versla anderen samen!</p>
        </motion.div>

        {/* My Clan Banner */}
        {myClan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{myClan.icon || '⚔️'}</span>
              <div>
                <div className="text-white font-bold">{myClan.name} <span className="text-orange-400 text-sm">[{myClan.tag}]</span></div>
                <div className="text-slate-400 text-sm">{myClan.members?.length || 0} leden · {getClanPoints(myClan).toLocaleString()} punten</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setSelectedClan(myClan); setView('detail'); }} className="bg-orange-600 hover:bg-orange-700">
                Bekijken
              </Button>
            </div>
          </motion.div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${view === 'list' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}`}>
              <Shield className="w-4 h-4 inline mr-1" /> Alle Clans
            </button>
          </div>
          {!myClan && (
            <Button onClick={() => setView('create')} className="bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90">
              <Plus className="w-4 h-4 mr-2" /> Clan Aanmaken
            </Button>
          )}
        </div>

        {/* CREATE VIEW */}
        <AnimatePresence>
          {view === 'create' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900/60 border border-orange-500/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Nieuwe Clan Aanmaken</h2>
                <button onClick={() => setView('list')} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                {/* Icon picker */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Clan Icoon</label>
                  <div className="flex flex-wrap gap-2">
                    {CLAN_ICONS.map(icon => (
                      <button key={icon} onClick={() => setNewIcon(icon)}
                        className={`text-2xl p-2 rounded-lg border transition-all ${newIcon === icon ? 'border-orange-500/60 bg-orange-500/20' : 'border-slate-700 hover:border-slate-500'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Clan Naam *</label>
                    <Input placeholder="Bijv. Dragon Warriors" value={newName} onChange={e => setNewName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Tag * (max 4)</label>
                    <Input placeholder="DW" value={newTag} onChange={e => setNewTag(e.target.value.toUpperCase().slice(0, 4))} className="bg-slate-800 border-slate-700 text-white font-mono" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Beschrijving</label>
                  <Input placeholder="Vertel iets over je clan..." value={newDesc} onChange={e => setNewDesc(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <Button
                  onClick={() => {
                    if (!newName || !newTag) { toast.error('Vul naam en tag in'); return; }
                    createClanMutation.mutate({ name: newName, tag: newTag, description: newDesc, icon: newIcon });
                  }}
                  disabled={createClanMutation.isPending}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {createClanMutation.isPending ? 'Aanmaken...' : 'Clan Aanmaken'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* DETAIL VIEW */}
        <AnimatePresence>
          {view === 'detail' && selectedClan && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-slate-900/60 border border-orange-500/20 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedClan.icon || '⚔️'}</span>
                  <div>
                    <h2 className="text-white font-bold text-xl">{selectedClan.name} <span className="text-orange-400">[{selectedClan.tag}]</span></h2>
                    {selectedClan.description && <p className="text-slate-400 text-sm">{selectedClan.description}</p>}
                  </div>
                </div>
                <button onClick={() => setView('list')} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">{getClanPoints(selectedClan).toLocaleString()}</div>
                  <div className="text-slate-400 text-sm">Totale Punten</div>
                </div>
                <div className="bg-slate-800/60 rounded-xl p-4 text-center">
                  <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold text-white">{selectedClan.members?.length || 0}</div>
                  <div className="text-slate-400 text-sm">Leden</div>
                </div>
              </div>
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Leden</h3>
              <div className="space-y-2 mb-6">
                {(selectedClan.member_names || []).map((name, i) => {
                  const email = selectedClan.members?.[i];
                  const isOwner = email === selectedClan.owner_email;
                  const isOnline = email && onlineEmails.has(email);
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                          {name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${isOnline ? 'bg-green-400' : 'bg-slate-500'}`} />
                      </div>
                      <span className="text-white text-sm flex-1">{name}</span>
                      {isOnline && <span className="text-green-400 text-xs">online</span>}
                      {isOwner && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Crown className="w-3 h-3 mr-1" />Leider</Badge>}
                    </div>
                  );
                })}
              </div>
              {/* Invite - only for owner */}
              {selectedClan.owner_email === user.email && (
                <div className="mb-4 p-4 bg-slate-800/40 rounded-xl border border-orange-500/20">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-orange-400" /> Iemand Uitnodigen
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <Input
                        placeholder="Email adres *"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-slate-500 shrink-0" />
                      <Input
                        placeholder="Naam (optioneel)"
                        value={inviteName}
                        onChange={e => setInviteName(e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-sm"
                      />
                    </div>
                    <Button
                      onClick={() => inviteMutation.mutate({ clan: selectedClan, email: inviteEmail, name: inviteName })}
                      disabled={inviteMutation.isPending || !inviteEmail}
                      className="w-full bg-orange-600 hover:bg-orange-700 text-sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {inviteMutation.isPending ? 'Toevoegen...' : 'Toevoegen aan Clan'}
                    </Button>
                  </div>
                </div>
              )}
              {myClan?.id === selectedClan.id && (
                <Button onClick={() => leaveClanMutation.mutate(selectedClan)} disabled={leaveClanMutation.isPending}
                  variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20">
                  <LogOut className="w-4 h-4 mr-2" />
                  {selectedClan.owner_email === user.email ? 'Clan Ontbinden' : 'Clan Verlaten'}
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLAN LIST */}
        {view === 'list' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {isLoading ? (
              <div className="text-center py-12 text-slate-400">Laden...</div>
            ) : sortedClans.length === 0 ? (
              <div className="text-center py-16">
                <Swords className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Nog geen clans. Wees de eerste!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedClans.map((clan, index) => {
                  const pts = getClanPoints(clan);
                  const isMyC = myClan?.id === clan.id;
                  return (
                    <motion.div key={clan.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:border-orange-500/40 ${isMyC ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-700 bg-slate-900/40'}`}
                      onClick={() => { setSelectedClan(clan); setView('detail'); }}>
                      <div className="w-10 text-center font-bold text-slate-500 text-lg">#{index + 1}</div>
                      <span className="text-3xl">{clan.icon || '⚔️'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{clan.name}</span>
                          <span className="text-orange-400 text-sm font-mono">[{clan.tag}]</span>
                          {isMyC && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">Mijn Clan</Badge>}
                        </div>
                        <div className="text-slate-500 text-sm flex items-center gap-2">
                          {clan.members?.length || 0} leden · Leider: {clan.owner_name}
                          {(() => {
                            const onlineCount = (clan.members || []).filter(e => onlineEmails.has(e)).length;
                            return onlineCount > 0 ? (
                              <span className="flex items-center gap-1 text-green-400 text-xs">
                                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
                                {onlineCount} online
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold">{pts.toLocaleString()}</div>
                        <div className="text-slate-500 text-xs">punten</div>
                      </div>
                      {!myClan && (
                        <Button size="sm" onClick={e => { e.stopPropagation(); joinClanMutation.mutate(clan); }}
                          className="bg-orange-600 hover:bg-orange-700 shrink-0">
                          Aanmelden
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}