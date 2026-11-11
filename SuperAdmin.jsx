import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Shield, Activity, Gamepad2, MessageCircle, Trophy, User, Eye, Users,
  Star, Trash2, BarChart2, Ban, MonitorOff, Send, EyeOff, PlusCircle, RotateCcw, MinusCircle, Lock, Unlock, Monitor, X, Video, Sparkles, Zap, Clock, Infinity, Gift, Copy, RefreshCw, HelpCircle, FileText, Type, ExternalLink, FileCode2, Terminal
} from 'lucide-react';
import moment from 'moment';
import VideoAdmin from '../components/VideoAdmin';
import GameDoorElkaarTab from '../components/GameDoorElkaarTab';
import VragenTab from '../components/VragenTab';
import BlindnessTab from '../components/BlindnessTab';
import InfoTekstTab from '../components/InfoTekstTab';
import BulkGamesActions from '../components/BulkGamesActions';
import SiteTextsTab from '../components/SiteTextsTab';
import LinkGameTab from '@/components/LinkGameTab';
import CodeViewerTab from '@/components/CodeViewerTab';
import TerminalTab from '@/components/TerminalTab';
import AiBeheerTab from '@/components/AiBeheerTab';

import { toast } from 'sonner';
import { timeAgo, utcDate } from '@/lib/time';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ALLOWED_EMAILS = ['s.olivier@werkschuit-haarlem.nl', 's.olivier@student.werkschuit-haarlem.nl'];

const GAME_LIST = [
  { id: 'memory', name: 'Memory', icon: '🧠' },
  { id: 'snake', name: 'Snake', icon: '🐍' },
  { id: 'tictactoe', name: 'Boter Kaas Eieren', icon: '⭕' },
  { id: 'reaction', name: 'Reactie Test', icon: '⚡' },
  { id: 'whackamole', name: 'Whack-a-Mole', icon: '🐹' },
  { id: 'simonsays', name: 'Simon Says', icon: '🎨' },
  { id: 'numberguess', name: 'Raad het Getal', icon: '🔢' },
  { id: 'quiz', name: 'Quiz', icon: '❓' },
  { id: 'colormatch', name: 'Kleur Match', icon: '🌈' },
  { id: 'mathrace', name: 'Reken Race', icon: '➕' },
  { id: 'typing', name: 'Type Race', icon: '⌨️' },
  { id: 'brickbreaker', name: 'Brick Breaker', icon: '🧱' },
  { id: 'flappybird', name: 'Flappy Bird', icon: '🐦' },
  { id: 'puzzle', name: 'Schuifpuzzel', icon: '🧩' },
  { id: 'race', name: 'Auto Race', icon: '🏎️' },
  { id: '2048', name: '2048', icon: '🔢' },
  { id: 'minesweeper', name: 'Minesweeper', icon: '💣' },
  { id: 'spaceshooter', name: 'Space Shooter', icon: '🚀' },
  { id: 'pong', name: 'Pong', icon: '🏓' },
  { id: 'jump', name: 'Jump Game', icon: '⬆️' },
  { id: 'tetris', name: 'Tetris', icon: '🟦' },
  { id: 'bubbleshooter', name: 'Bubble Shooter', icon: '🫧' },
  { id: 'hangman', name: 'Galgje', icon: '📝' },
  { id: 'connectfour', name: 'Vier op een Rij', icon: '🔴' },
  { id: 'wordsearch', name: 'Woordzoeker', icon: '🔍' },
  { id: 'sudoku', name: 'Sudoku', icon: '🔢' },
  { id: 'pacman', name: 'Pac-Man', icon: '👻' },
  { id: 'towerdefense', name: 'Tower Defense', icon: '🗼' },
  { id: 'solitaire', name: 'Solitaire', icon: '🃏' },
  { id: 'blackjack', name: 'Blackjack', icon: '🎰' },
  { id: 'cookieclicker', name: 'Cookie Clicker', icon: '🍪' },
  { id: 'checkers', name: 'Dammen', icon: '⚫' },
  { id: 'reversi', name: 'Reversi', icon: '⚪' },
  { id: 'pinball', name: 'Pinball', icon: '🎯' },
  { id: 'dice', name: 'Dobbelspel', icon: '🎲' },
  { id: 'battleship', name: 'Zeeslag', icon: '⚓' },
  { id: 'yahtzee', name: 'Yahtzee', icon: '🎲' },
  { id: 'maze', name: 'Doolhof', icon: '🌀' },
  { id: 'asteroids', name: 'Asteroids', icon: '☄️' },
  { id: 'frogger', name: 'Frogger', icon: '🐸' },
  { id: 'towerstack', name: 'Toren Stapelen', icon: '🏗️' },
  { id: 'match3', name: 'Match 3', icon: '💎' },
  { id: 'wordscramble', name: 'Woord Puzzel', icon: '🔤' },
  { id: 'spotdifference', name: 'Zoek Verschillen', icon: '🔍' },
  { id: 'rps', name: 'Steen Papier Schaar', icon: '✊' },
  { id: 'slotmachine', name: 'Gokautomaat', icon: '🎰' },
  { id: 'dotbox', name: 'Dots & Boxes', icon: '⬜' },
  { id: 'nimgame', name: 'Nim Spel', icon: '🎯' },
  { id: 'cardflip', name: 'Kaart Memory', icon: '🃏' },
  { id: 'trivia', name: 'Trivia Quiz', icon: '🧠' },
  { id: 'riddles', name: 'Raadsels', icon: '🤔' },
  { id: 'concentration', name: 'Concentratie', icon: '🎯' },
  { id: 'jigsaw', name: 'Jigsaw Puzzel', icon: '🧩' },
  { id: 'ttt5x5', name: 'Boter Kaas Eieren 5x5', icon: '⭕' },
  { id: 'gofish', name: 'Go Fish', icon: '🐠' },
  { id: 'mathquiz', name: 'Reken Quiz', icon: '➗' },
  { id: 'coinflip', name: 'Muntje Gooien', icon: '🪙' },
  { id: 'fastclick', name: 'Snel Klikken', icon: '👆' },
  { id: 'patternmatch', name: 'Patroon Match', icon: '🎨' },
  { id: 'findpair', name: 'Vind Paren', icon: '👯' },
  { id: 'targetshoot', name: 'Doelwitten Schieten', icon: '🎯' },
  { id: 'balloonpop', name: 'Ballon Knallen', icon: '🎈' },
  { id: 'chess', name: 'Schaken', icon: '♟️' },
  { id: 'multisnake', name: 'Snake 2 Spelers', icon: '🐍' },
  { id: 'multiquiz', name: 'Quiz Battle', icon: '⚔️' },
  { id: 'racing3d', name: '3D Racing', icon: '🏎️' },
  { id: 'dungeon', name: '3D Dungeon', icon: '🏰' },
  { id: 'builder', name: '3D Stad Bouwen', icon: '🏙️' },
  { id: 'linkgame', name: 'Aap Link', icon: '🐵' },
];

const TABS = [
  { id: 'live', label: 'Live', icon: Activity },
  { id: 'videos', label: "Video's", icon: Video },
  { id: '99x', label: '99X Boost', icon: Sparkles },
  { id: 'stats', label: 'Statistieken', icon: BarChart2 },
  { id: 'scores', label: 'Scores', icon: Trophy },
  { id: 'punten', label: 'Punten', icon: PlusCircle },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'bannen', label: 'Bannen', icon: Ban },
  { id: 'games', label: 'Games', icon: EyeOff },
  { id: 'bericht', label: 'Bericht', icon: Send },
  { id: 'polls', label: 'Polls', icon: BarChart2 },
  { id: 'site', label: 'Website', icon: Lock },
  { id: 'schermen', label: 'Schermen', icon: Monitor },
  { id: 'chat', label: 'Admin Chat', icon: MessageCircle },
  { id: 'toegang', label: 'Toegang', icon: Shield },
  { id: 'codes', label: 'Codes', icon: Gift },
  { id: 'gamedoorelkaar', label: 'GameDoorElkaar', icon: Sparkles },
  { id: 'blindness', label: 'Blindness', icon: EyeOff },
  { id: 'vragen', label: 'Vragen', icon: HelpCircle },
  { id: 'tekst', label: 'Tekst', icon: FileText },
  { id: 'cms', label: 'CMS', icon: Type },
  { id: 'link', label: 'Link Game', icon: ExternalLink },
  { id: 'code', label: 'Code', icon: FileCode2 },
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'ai', label: 'AI Beheer', icon: Sparkles },
];

export default function SuperAdmin() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('live');
  const [activities, setActivities] = useState([]);
  const [banEmail, setBanEmail] = useState('');
  const [banName, setBanName] = useState('');
  const [banReason, setBanReason] = useState('');
  const [kickEmail, setKickEmail] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [pointsPlayerName, setPointsPlayerName] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsGame, setPointsGame] = useState('Admin Bonus');
  const [pointsMode, setPointsMode] = useState('add');
  const [bulkPoints, setBulkPoints] = useState('');
  const [accessEmail, setAccessEmail] = useState('');
  const [accessName, setAccessName] = useState('');
  const [accessTabs, setAccessTabs] = useState([]);
  const [boostEmail, setBoostEmail] = useState('');
  const [boostMultiplier, setBoostMultiplier] = useState('99');
  const [boostHours, setBoostHours] = useState('1');
  const [boostPermanent, setBoostPermanent] = useState(false);
  const queryClient = useQueryClient();

  const isFullAdmin = user?.role === 'admin' || ALLOWED_EMAILS.includes(user?.email) || (typeof window !== 'undefined' && localStorage.getItem('__giveSuperadmin') === 'true');

  const { data: accessList = [], refetch: refetchAccess } = useQuery({
    queryKey: ['admin-access'],
    queryFn: () => base44.entities.AdminAccess.list(),
    enabled: !!user,
  });

  const myAccess = accessList.find(a => a.user_email === user?.email);
  const allowedTabs = isFullAdmin ? TABS.map(t => t.id) : (myAccess?.allowed_tabs || []);
  const visibleTabs = TABS.filter(t => allowedTabs.includes(t.id));

  useEffect(() => {
    if (user && !isFullAdmin) {
      const hasAccess = accessList.find(a => a.user_email === user.email);
      if (accessList !== undefined && !hasAccess && accessList.length >= 0) {
        // Check after a short delay to ensure query has loaded
      }
    }
  }, [user, accessList, isFullAdmin]);

  const grantAccessMutation = useMutation({
    mutationFn: (data) => base44.entities.AdminAccess.create(data),
    onSuccess: () => { refetchAccess(); setAccessEmail(''); setAccessName(''); setAccessTabs([]); toast.success('Toegang verleend!'); },
  });

  const updateAccessMutation = useMutation({
    mutationFn: ({ id, tabs }) => base44.entities.AdminAccess.update(id, { allowed_tabs: tabs }),
    onSuccess: () => { refetchAccess(); toast.success('Toegang bijgewerkt!'); },
  });

  const revokeAccessMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminAccess.delete(id),
    onSuccess: () => { refetchAccess(); toast.success('Toegang ingetrokken'); },
  });

  const toggleTab = (tabId, current, id) => {
    const updated = current.includes(tabId) ? current.filter(t => t !== tabId) : [...current, tabId];
    updateAccessMutation.mutate({ id, tabs: updated });
  };

  const toggleNewTab = (tabId) => {
    setAccessTabs(prev => prev.includes(tabId) ? prev.filter(t => t !== tabId) : [...prev, tabId]);
  };

  const { data: allUsersForBoost = [], refetch: refetchBoostUsers } = useQuery({
    queryKey: ['users-for-boost'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user && activeTab === '99x',
  });

  const giveBoostMutation = useMutation({
    mutationFn: async ({ email, permanent, hours, multiplier }) => {
      const targetUser = allUsersForBoost.find(u => u.email === email);
      if (!targetUser) throw new Error('Gebruiker niet gevonden');
      const expires = permanent ? '' : new Date(Date.now() + hours * 60000).toISOString();
      const original = targetUser.score_multiplier > 1 ? (targetUser.multiplier_original || 1) : (targetUser.score_multiplier || 1);
      await base44.entities.User.update(targetUser.id, {
        score_multiplier: multiplier,
        multiplier_expires: expires,
        multiplier_original: original,
      });
    },
    onSuccess: () => { refetchBoostUsers(); setBoostEmail(''); toast.success('99X boost gegeven!'); },
    onError: (e) => toast.error(e.message),
  });

  const removeBoostMutation = useMutation({
    mutationFn: async (targetUser) => {
      await base44.entities.User.update(targetUser.id, {
        score_multiplier: targetUser.multiplier_original || 1,
        multiplier_expires: '',
        multiplier_original: 1,
      });
    },
    onSuccess: () => { refetchBoostUsers(); toast.success('Boost verwijderd'); },
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  // Live activities
  const { data: initialActivities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list('-created_date', 50),
    enabled: !!user,
  });

  useEffect(() => {
    if (initialActivities.length > 0) setActivities(initialActivities);
  }, [initialActivities]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.Activity.subscribe((event) => {
      if (event.type === 'create') {
        setActivities(prev => [event.data, ...prev].slice(0, 100));
      }
    });
    return unsubscribe;
  }, [user]);

  // Scores
  const { data: scores = [] } = useQuery({
    queryKey: ['all-scores'],
    queryFn: () => base44.entities.Score.list('-created_date', 100),
    enabled: !!user && activeTab === 'scores',
  });

  const deleteScoreMutation = useMutation({
    mutationFn: (id) => base44.entities.Score.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-scores'] });
      toast.success('Score verwijderd');
    },
  });

  // Reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: () => base44.entities.Review.list('-created_date', 100),
    enabled: !!user && activeTab === 'reviews',
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) => base44.entities.Review.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
      toast.success('Review verwijderd');
    },
  });

  // Game stats
  const gameStats = useMemo(() => {
    const counts = {};
    activities.filter(a => a.activity_type === 'game_start').forEach(a => {
      const game = a.details?.game || 'Onbekend';
      counts[game] = (counts[game] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [activities]);

  const { data: bans = [], refetch: refetchBans } = useQuery({
    queryKey: ['bans'],
    queryFn: () => base44.entities.Ban.list('-created_date', 100),
    enabled: !!user && activeTab === 'bannen',
  });

  const banMutation = useMutation({
    mutationFn: (data) => base44.entities.Ban.create(data),
    onSuccess: () => {
      refetchBans();
      setBanEmail('');
      setBanName('');
      setBanReason('');
      toast.success('Gebruiker geband!');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id) => base44.entities.Ban.delete(id),
    onSuccess: () => {
      refetchBans();
      toast.success('Ban opgeheven');
    },
  });

  // Kick = stuur een speciale activity die de gebruiker eruit gooit
  const kickMutation = useMutation({
    mutationFn: (email) => base44.entities.Activity.create({
      user_email: 'admin',
      user_name: 'Admin',
      activity_type: 'page_visit',
      details: { kick_target: email, action: 'kick' }
    }),
    onSuccess: () => {
      setKickEmail('');
      toast.success('Kick signaal verstuurd!');
    },
  });

  // Punten geven / resetten
  const { data: allScores = [], refetch: refetchAllScores } = useQuery({
    queryKey: ['punten-scores'],
    queryFn: () => base44.entities.Score.list('-score', 200),
    enabled: !!user && activeTab === 'punten',
  });

  const addPointsMutation = useMutation({
    mutationFn: (data) => base44.entities.Score.create(data),
    onSuccess: () => {
      refetchAllScores();
      setPointsPlayerName('');
      setPointsAmount('');
      toast.success('Punten toegevoegd!');
    },
  });

  const resetPlayerScoresMutation = useMutation({
    mutationFn: async (playerName) => {
      const toDelete = allScores.filter(s => s.player_name === playerName);
      await Promise.all(toDelete.map(s => base44.entities.Score.delete(s.id)));
    },
    onSuccess: () => {
      refetchAllScores();
      queryClient.invalidateQueries({ queryKey: ['all-scores'] });
      toast.success('Scores gereset!');
    },
  });

  // Groepeer scores per speler
  const playerScores = useMemo(() => {
    const map = {};
    allScores.forEach(s => {
      if (!map[s.player_name]) map[s.player_name] = { name: s.player_name, total: 0, count: 0, best: 0 };
      map[s.player_name].total += s.score;
      map[s.player_name].count += 1;
      if (s.score > map[s.player_name].best) map[s.player_name].best = s.score;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [allScores]);

  // Codes
  const [newCode, setNewCode] = useState('');
  const [codeRewardType, setCodeRewardType] = useState('punten');
  const [codePoints, setCodePoints] = useState('');
  const [codeMultiplier, setCodeMultiplier] = useState('2');
  const [codeMultiplierMins, setCodeMultiplierMins] = useState('60');
  const [codeMaxUses, setCodeMaxUses] = useState('1');
  const [codeDesc, setCodeDesc] = useState('');
  const [codeSuperadminTabs, setCodeSuperadminTabs] = useState(['live', 'stats', 'scores', 'punten']);

  const { data: allCodes = [], refetch: refetchCodes } = useQuery({
    queryKey: ['redeem-codes'],
    queryFn: async () => {
      const result = await base44.entities.RedeemCode.filter({ reward_type: { $ne: 'terminal' } }, { sort: '-created_date', limit: 100 });
      return Array.isArray(result) ? result : result?.items || [];
    },
    enabled: !!user && activeTab === 'codes',
  });

  const createCodeMutation = useMutation({
    mutationFn: (data) => base44.entities.RedeemCode.create(data),
    onSuccess: () => {
      refetchCodes();
      setNewCode('');
      setCodeDesc('');
      setCodePoints('');
      setCodeSuperadminTabs(['live', 'stats', 'scores', 'punten']);
      toast.success('Code aangemaakt!');
    },
  });

  const deleteCodeMutation = useMutation({
    mutationFn: (id) => base44.entities.RedeemCode.delete(id),
    onSuccess: () => { refetchCodes(); toast.success('Code verwijderd'); },
  });

  const toggleCodeMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.RedeemCode.update(id, { active }),
    onSuccess: () => refetchCodes(),
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewCode(result);
  };

  // Polls
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  const { data: allPolls = [], refetch: refetchPolls } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: () => base44.entities.Poll.list('-created_date', 50),
    enabled: !!user && activeTab === 'polls',
  });

  const createPollMutation = useMutation({
    mutationFn: (data) => base44.entities.Poll.create(data),
    onSuccess: () => {
      refetchPolls();
      setPollQuestion('');
      setPollOptions(['', '']);
      toast.success('Poll aangemaakt!');
    },
  });

  const deletePollMutation = useMutation({
    mutationFn: (id) => base44.entities.Poll.delete(id),
    onSuccess: () => { refetchPolls(); toast.success('Poll verwijderd'); },
  });

  const togglePollMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.Poll.update(id, { active }),
    onSuccess: () => { refetchPolls(); },
  });

  // Site instellingen (maintenance + admin chat)
  const { data: siteSettings = [], refetch: refetchSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => base44.entities.SiteSettings.list(),
    enabled: !!user,
  });
  const maintenanceSetting = siteSettings.find(s => s.key === 'maintenance');
  const maintenanceOn = maintenanceSetting?.value === 'true';
  const chatSetting = siteSettings.find(s => s.key === 'admin_chat');
  const chatEnabled = chatSetting?.value === 'true';


  const toggleMaintenanceMutation = useMutation({
    mutationFn: async (enable) => {
      if (maintenanceSetting) {
        await base44.entities.SiteSettings.update(maintenanceSetting.id, { value: enable ? 'true' : 'false' });
      } else {
        await base44.entities.SiteSettings.create({ key: 'maintenance', value: enable ? 'true' : 'false', description: 'Website in onderhoudsmodus' });
      }
    },
    onSuccess: (_, enable) => {
      refetchSettings();
      toast.success(enable ? 'Website afgesloten voor gebruikers!' : 'Website weer open voor iedereen!');
      setTimeout(() => window.location.reload(), 800);
    },
  });

  // Schermen - live gebruikers bijhouden via activiteiten
  const liveUsers = useMemo(() => {
    const map = {};
    activities.forEach(a => {
      if (a.user_email && a.user_email !== 'admin') {
        if (!map[a.user_email] || utcDate(a.created_date) > utcDate(map[a.user_email].created_date)) {
          map[a.user_email] = a;
        }
      }
    });
    return Object.values(map).sort((a, b) => utcDate(b.created_date) - utcDate(a.created_date));
  }, [activities]);

  // Online = actief in de laatste 5 minuten
  const onlineEmails = useMemo(() => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const emails = new Set();
    activities.forEach(a => {
      if (a.user_email && utcDate(a.created_date) > fiveMinutesAgo) {
        emails.add(a.user_email);
      }
    });
    return emails;
  }, [activities]);

  const handleBan = () => {
    if (!banEmail) { toast.error('Vul een email in'); return; }
    banMutation.mutate({ user_email: banEmail, user_name: banName, reason: banReason, banned_by: user.email });
  };

  // Hidden games
  const { data: hiddenGames = [], refetch: refetchHidden } = useQuery({
    queryKey: ['hidden-games'],
    queryFn: () => base44.entities.HiddenGame.list(),
    enabled: !!user && activeTab === 'games',
  });

  const sendReloadSignal = async () => {
    const sig = Date.now().toString();
    const existing = siteSettings.find(s => s.key === 'reload_signal');
    if (existing) {
      await base44.entities.SiteSettings.update(existing.id, { value: sig });
    } else {
      await base44.entities.SiteSettings.create({ key: 'reload_signal', value: sig, description: 'Reload signaal voor alle gebruikers' });
    }
    refetchSettings();
  };

  const hideGameMutation = useMutation({
    mutationFn: (data) => base44.entities.HiddenGame.create(data),
    onSuccess: () => { refetchHidden(); toast.success('Game verborgen'); sendReloadSignal(); setTimeout(() => window.location.reload(), 800); },
  });
  const showGameMutation = useMutation({
    mutationFn: (id) => base44.entities.HiddenGame.delete(id),
    onSuccess: () => { refetchHidden(); toast.success('Game zichtbaar gemaakt'); sendReloadSignal(); setTimeout(() => window.location.reload(), 800); },
  });

  // Admin broadcast messages
  const { data: adminMessages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => base44.entities.AdminMessage.list('-created_date', 20),
    enabled: !!user && activeTab === 'bericht',
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.AdminMessage.create(data),
    onSuccess: () => {
      refetchMessages();
      setBroadcastMsg('');
      toast.success('Bericht verstuurd naar alle gebruikers!');
    },
  });
  const deleteMessageMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminMessage.delete(id),
    onSuccess: () => { refetchMessages(); toast.success('Bericht verwijderd'); },
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'game_start': return <Gamepad2 className="w-4 h-4" />;
      case 'game_end': return <Trophy className="w-4 h-4" />;
      case 'chat_message': return <MessageCircle className="w-4 h-4" />;
      case 'page_visit': return <Eye className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'game_start': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'game_end': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'chat_message': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'page_visit': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getActivityText = (activity) => {
    switch (activity.activity_type) {
      case 'game_start': return `speelt nu ${activity.details?.game || 'een game'}`;
      case 'game_end': return `behaalde ${activity.details?.score || 0} punten in ${activity.details?.game || 'een game'}`;
      case 'chat_message': return `stuurde een bericht: "${activity.details?.message?.substring(0, 50) || '...'}"`;
      case 'page_visit': return `bezocht ${activity.details?.page || 'een pagina'}`;
      default: return 'deed iets';
    }
  };

  const stats = {
    gamesPlaying: activities.filter(a => a.activity_type === 'game_start').length,
    recentScores: activities.filter(a => a.activity_type === 'game_end').length,
    chatMessages: activities.filter(a => a.activity_type === 'chat_message').length,
    pageVisits: activities.filter(a => a.activity_type === 'page_visit').length,
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-purple-500">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Super Admin</h1>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
              LIVE
            </Badge>
          </div>
          <p className="text-slate-400">Volledig beheer van het platform</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* LIVE TAB */}
        {activeTab === 'live' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Games gestart', value: stats.gamesPlaying, icon: Gamepad2, color: 'purple' },
                { label: 'Scores behaald', value: stats.recentScores, icon: Trophy, color: 'yellow' },
                { label: 'Chat berichten', value: stats.chatMessages, icon: MessageCircle, color: 'blue' },
                { label: 'Pagina bezoeken', value: stats.pageVisits, icon: Eye, color: 'green' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className={`bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-xl p-4`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-8 h-8 text-${stat.color}-400`} />
                      <div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                        <div className="text-xs text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Live Activiteiten Feed
                </h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Nog geen activiteiten...</div>
                ) : (
                  <AnimatePresence initial={false}>
                    {activities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-4 border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border ${getActivityColor(activity.activity_type)}`}>
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <User className="w-3 h-3 text-slate-500" />
                              <span className="text-white font-semibold">{activity.user_name}</span>
                              <span className={`w-2 h-2 rounded-full ${onlineEmails.has(activity.user_email) ? 'bg-green-400' : 'bg-slate-600'}`} title={onlineEmails.has(activity.user_email) ? 'Online' : 'Offline'} />
                            </div>
                            <p className="text-slate-300 text-sm">{getActivityText(activity)}</p>
                            <p className="text-slate-500 text-xs mt-1">{timeAgo(activity.created_date)}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-400" />
                Meest Gespeelde Games
              </h2>
              {gameStats.length === 0 ? (
                <div className="text-slate-500 text-center py-12">Nog geen game data beschikbaar</div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={gameStats} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-35} textAnchor="end" />
                    <YAxis tick={{ fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8 }}
                      labelStyle={{ color: '#fff' }}
                      itemStyle={{ color: '#a855f7' }}
                    />
                    <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} name="Keer gespeeld" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        )}

        {/* SCORES TAB */}
        {activeTab === 'scores' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Alle Scores ({scores.length})
                </h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {scores.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Geen scores gevonden</div>
                ) : (
                  scores.map((score) => (
                    <div key={score.id} className="flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/30">
                      <div>
                        <div className="text-white font-semibold">{score.player_name}</div>
                        <div className="text-slate-400 text-sm">{score.game} — {score.score} punten</div>
                        <div className="text-slate-500 text-xs">{timeAgo(score.created_date)}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteScoreMutation.mutate(score.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  Alle Reviews ({reviews.length})
                </h2>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {reviews.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Geen reviews gevonden</div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="flex items-start justify-between p-4 border-b border-slate-800 hover:bg-slate-800/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-semibold">{review.user_name}</span>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="text-slate-400 text-sm">{review.game_name}</div>
                        {review.comment && <div className="text-slate-300 text-sm mt-1 italic">"{review.comment}"</div>}
                        <div className="text-slate-500 text-xs mt-1">{timeAgo(review.created_date)}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteReviewMutation.mutate(review.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* PUNTEN TAB */}
        {activeTab === 'punten' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Bulk punten voor actieve gebruikers */}
            <div className="bg-slate-900/50 border border-green-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Punten aan Iedereen Actief Geven
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                Geeft punten aan alle <strong className="text-green-300">{liveUsers.length} actieve gebruikers</strong> tegelijk.
              </p>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Bijv. 500"
                  value={bulkPoints}
                  onChange={e => setBulkPoints(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button
                  onClick={async () => {
                    const amt = Number(bulkPoints);
                    if (!amt || liveUsers.length === 0) { toast.error('Vul punten in en zorg dat er actieve gebruikers zijn'); return; }
                    await Promise.all(liveUsers.map(u =>
                      base44.entities.Score.create({ player_name: u.user_name, score: amt, game: 'Admin Bonus' })
                    ));
                    toast.success(`${amt} punten gegeven aan ${liveUsers.length} actieve gebruikers!`);
                    setBulkPoints('');
                    refetchAllScores();
                  }}
                  disabled={!bulkPoints || liveUsers.length === 0}
                  className="bg-green-600 hover:bg-green-700 shrink-0"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Geef aan Iedereen
                </Button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                {pointsMode === 'add' ? <PlusCircle className="w-5 h-5 text-yellow-400" /> : <MinusCircle className="w-5 h-5 text-red-400" />}
                Punten Beheren
              </h2>
              {/* Toggle add/remove */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setPointsMode('add')}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${pointsMode === 'add' ? 'bg-yellow-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <PlusCircle className="w-4 h-4" /> Punten Geven
                </button>
                <button
                  onClick={() => setPointsMode('remove')}
                  className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${pointsMode === 'remove' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <MinusCircle className="w-4 h-4" /> Punten Aftrekken
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Naam speler *</label>
                  <Input placeholder="Naam van speler" value={pointsPlayerName} onChange={e => setPointsPlayerName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Punten *</label>
                  <Input type="number" placeholder="Bijv. 500" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Game naam</label>
                  <Input placeholder="Admin Bonus" value={pointsGame} onChange={e => setPointsGame(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <Button
                  onClick={() => {
                    if (!pointsPlayerName || !pointsAmount) { toast.error('Vul naam en punten in'); return; }
                    const amt = pointsMode === 'remove' ? -Math.abs(Number(pointsAmount)) : Math.abs(Number(pointsAmount));
                    addPointsMutation.mutate({ player_name: pointsPlayerName, score: amt, game: pointsGame || 'Admin Aanpassing' });
                  }}
                  disabled={addPointsMutation.isPending}
                  className={`w-full ${pointsMode === 'add' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  {pointsMode === 'add' ? <PlusCircle className="w-4 h-4 mr-2" /> : <MinusCircle className="w-4 h-4 mr-2" />}
                  {addPointsMutation.isPending ? 'Bezig...' : pointsMode === 'add' ? 'Punten Geven' : 'Punten Aftrekken'}
                </Button>
              </div>
            </div>

            {/* Overzicht per speler */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Spelers & Scores ({playerScores.length})
                </h2>
                <p className="text-slate-400 text-xs mt-1">Reset verwijdert alle scores van die speler.</p>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {playerScores.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Nog geen scores</div>
                ) : (
                  playerScores.map(player => (
                    <div key={player.name} className="flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/30">
                      <div>
                        <div className="text-white font-semibold">{player.name}</div>
                        <div className="text-slate-400 text-sm">Totaal: <span className="text-yellow-400 font-bold">{player.total}</span> pts · Best: {player.best} · {player.count}x gespeeld</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resetPlayerScoresMutation.mutate(player.name)}
                        disabled={resetPlayerScoresMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Reset
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* GAMES TAB */}
        {activeTab === 'games' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <EyeOff className="w-5 h-5 text-purple-400" />
                  Games Verbergen / Tonen
                </h2>
                <p className="text-slate-400 text-sm mt-1">Verborgen games zijn niet meer zichtbaar voor spelers op de homepage.</p>
              </div>
              <div className="p-4 space-y-2">
                <BulkGamesActions
                  gameList={GAME_LIST}
                  hiddenGames={hiddenGames}
                  onDone={async () => { await refetchHidden(); await sendReloadSignal(); setTimeout(() => window.location.reload(), 800); }}
                />
                <div className="max-h-[500px] overflow-y-auto space-y-2">
                {GAME_LIST.map(game => {
                  const hidden = hiddenGames.find(h => h.game_id === game.id);
                  return (
                    <div key={game.id} className={`flex items-center justify-between p-3 rounded-lg border ${hidden ? 'border-red-500/30 bg-red-500/5 opacity-60' : 'border-slate-700 bg-slate-800/30'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{game.icon}</span>
                        <div>
                          <div className="text-white font-semibold text-sm">{game.name}</div>
                          {hidden && <div className="text-red-400 text-xs">Verborgen</div>}
                        </div>
                      </div>
                      {hidden ? (
                        <Button size="sm" onClick={() => showGameMutation.mutate(hidden.id)} className="bg-green-600 hover:bg-green-700 text-xs">
                          Tonen
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => hideGameMutation.mutate({ game_id: game.id, game_name: game.name })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs">
                          <Trash2 className="w-3 h-3 mr-1" /> Verbergen
                        </Button>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* BERICHT TAB */}
        {activeTab === 'bericht' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/50 border border-blue-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-400" />
                Bericht Sturen naar Alle Gebruikers
              </h2>
              <p className="text-slate-400 text-sm mb-4">Dit bericht verschijnt bovenaan het scherm voor <strong className="text-white">alle gebruikers</strong> die op de website zijn, inclusief in games.</p>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Type</label>
                  <Select value={broadcastType} onValueChange={setBroadcastType}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">ℹ️ Info (blauw)</SelectItem>
                      <SelectItem value="warning">⚠️ Waarschuwing (oranje)</SelectItem>
                      <SelectItem value="alert">🚨 Alert (rood)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Bericht *</label>
                  <Input placeholder="Typ hier je bericht voor alle spelers..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <Button onClick={() => { if (!broadcastMsg) { toast.error('Typ een bericht'); return; } sendMessageMutation.mutate({ message: broadcastMsg, type: broadcastType, active: true, sender_name: user?.full_name || user?.email }); }} disabled={sendMessageMutation.isPending} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? 'Versturen...' : 'Verstuur naar Alle Gebruikers'}
                </Button>
              </div>
            </div>

            {/* Actieve berichten */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Verstuurde Berichten ({adminMessages.length})
                </h2>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {adminMessages.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Geen berichten verstuurd</div>
                ) : (
                  adminMessages.map(msg => (
                    <div key={msg.id} className="flex items-start justify-between p-4 border-b border-slate-800 hover:bg-slate-800/30">
                      <div>
                        <div className={`text-sm font-semibold mb-1 ${msg.type === 'alert' ? 'text-red-400' : msg.type === 'warning' ? 'text-orange-400' : 'text-blue-400'}`}>
                          {msg.type === 'alert' ? '🚨 Alert' : msg.type === 'warning' ? '⚠️ Waarschuwing' : 'ℹ️ Info'}
                        </div>
                        <div className="text-white text-sm">
                          {msg.sender_name && <span className="text-purple-300 font-semibold">{msg.sender_name}: </span>}
                          {msg.message}
                        </div>
                        <div className="text-slate-500 text-xs mt-1">{timeAgo(msg.created_date)}</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => deleteMessageMutation.mutate(msg.id)} className="text-red-400 hover:bg-red-500/10 ml-2">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* POLLS TAB */}
        {activeTab === 'polls' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Maak poll */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-purple-400" />
                Nieuwe Poll Aanmaken
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Vraag *</label>
                  <input
                    placeholder="Bijv. Welk game vind jij het leukst?"
                    value={pollQuestion}
                    onChange={e => setPollQuestion(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Antwoorden</label>
                  {pollOptions.map((opt, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input
                        placeholder={`Optie ${i + 1}`}
                        value={opt}
                        onChange={e => { const o = [...pollOptions]; o[i] = e.target.value; setPollOptions(o); }}
                        className="flex-1 bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 text-sm"
                      />
                      {pollOptions.length > 2 && (
                        <button onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 px-2">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {pollOptions.length < 6 && (
                    <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-purple-400 text-sm hover:text-purple-300">
                      + Optie toevoegen
                    </button>
                  )}
                </div>
                <Button
                  onClick={() => {
                    const opts = pollOptions.filter(o => o.trim());
                    if (!pollQuestion || opts.length < 2) { toast.error('Vul een vraag en minimaal 2 opties in'); return; }
                    createPollMutation.mutate({ question: pollQuestion, options: opts, votes: {}, voters: [], active: true });
                  }}
                  disabled={createPollMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Poll Aanmaken
                </Button>
              </div>
            </div>

            {/* Bestaande polls */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-purple-400" />
                  Alle Polls ({allPolls.length})
                </h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {allPolls.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Nog geen polls</div>
                ) : allPolls.map(poll => {
                  const totalVotes = Object.values(poll.votes || {}).reduce((a, b) => a + b, 0);
                  return (
                    <div key={poll.id} className="p-4 border-b border-slate-800">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white font-semibold text-sm">{poll.question}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${poll.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {poll.active ? 'Actief' : 'Gestopt'}
                            </span>
                          </div>
                          <div className="text-slate-500 text-xs">{totalVotes} stemmen</div>
                          <div className="mt-2 space-y-1">
                            {(poll.options || []).map((opt, i) => {
                              const count = poll.votes?.[i] || 0;
                              const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                              return (
                                <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
                                  <div className="w-24 bg-slate-700 rounded-full h-1.5">
                                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span>{opt}</span>
                                  <span className="text-purple-300">{pct}% ({count})</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-3">
                          <button
                            onClick={() => togglePollMutation.mutate({ id: poll.id, active: !poll.active })}
                            className={`text-xs px-2 py-1 rounded ${poll.active ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                          >
                            {poll.active ? 'Stoppen' : 'Activeren'}
                          </button>
                          <button onClick={() => deletePollMutation.mutate(poll.id)} className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* WEBSITE TAB */}
        {activeTab === 'site' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-400" />
                Website Afsluiten / Openen
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Als je de website afsluit, zien gewone gebruikers een onderhoudspagina. Jij en <strong className="text-white">s.olivier@werkschuit-haarlem.nl</strong> kunnen de site nog gewoon gebruiken.
              </p>
              <div className={`p-6 rounded-xl border-2 text-center mb-6 ${maintenanceOn ? 'border-red-500/50 bg-red-500/10' : 'border-green-500/50 bg-green-500/10'}`}>
                <div className="text-5xl mb-3">{maintenanceOn ? '🔒' : '🌐'}</div>
                <div className={`text-2xl font-bold mb-1 ${maintenanceOn ? 'text-red-400' : 'text-green-400'}`}>
                  {maintenanceOn ? 'Website GESLOTEN' : 'Website OPEN'}
                </div>
                <div className="text-slate-400 text-sm">
                  {maintenanceOn ? 'Gewone gebruikers zien nu een onderhoudspagina.' : 'Iedereen kan de website normaal gebruiken.'}
                </div>
              </div>
              <Button
                onClick={() => toggleMaintenanceMutation.mutate(!maintenanceOn)}
                disabled={toggleMaintenanceMutation.isPending}
                className={`w-full text-lg py-6 ${maintenanceOn ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {maintenanceOn ? <><Unlock className="w-5 h-5 mr-2" /> Website Openen voor Iedereen</> : <><Lock className="w-5 h-5 mr-2" /> Website Afsluiten voor Gebruikers</>}
              </Button>
            </div>
          </motion.div>
        )}

        {/* SCHERMEN TAB */}
        {activeTab === 'schermen' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-cyan-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  Live Gebruikers Schermen
                </h2>
                <p className="text-slate-400 text-xs mt-1">Zie wat elke gebruiker als laatste deed op de website. ({liveUsers.length} gebruikers actief)</p>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[700px] overflow-y-auto">
                {liveUsers.length === 0 ? (
                  <div className="col-span-full p-8 text-center text-slate-500">Geen actieve gebruikers gevonden</div>
                ) : (
                  liveUsers.map(activity => (
                    <div key={activity.user_email} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                      {/* "Screen" header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${onlineEmails.has(activity.user_email) ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
                          <span className="text-white font-semibold text-sm">{activity.user_name}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${onlineEmails.has(activity.user_email) ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                            {onlineEmails.has(activity.user_email) ? 'online' : 'offline'}
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs">{timeAgo(activity.created_date)}</span>
                      </div>
                      {/* Fake screen */}
                      <div className="bg-slate-950 rounded-lg border border-slate-700 p-3 min-h-[120px] flex flex-col justify-between">
                        <div className="flex items-center gap-1 mb-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <div className="flex-1 ml-2 bg-slate-800 rounded text-xs text-slate-500 px-2 py-0.5">gamezone.nl</div>
                        </div>
                        <div className="text-center">
                          {activity.activity_type === 'game_start' && (
                            <>
                              <div className="text-3xl mb-1">🎮</div>
                              <div className="text-white text-sm font-semibold">{activity.details?.game || 'Game'}</div>
                              <div className="text-green-400 text-xs">Speelt nu</div>
                            </>
                          )}
                          {activity.activity_type === 'game_end' && (
                            <>
                              <div className="text-3xl mb-1">🏆</div>
                              <div className="text-white text-sm font-semibold">{activity.details?.game || 'Game'}</div>
                              <div className="text-yellow-400 text-xs">Score: {activity.details?.score || 0}</div>
                            </>
                          )}
                          {activity.activity_type === 'chat_message' && (
                            <>
                              <div className="text-3xl mb-1">💬</div>
                              <div className="text-white text-sm font-semibold">Chat</div>
                              <div className="text-blue-400 text-xs truncate">"{activity.details?.message?.substring(0, 30) || '...'}"</div>
                            </>
                          )}
                          {activity.activity_type === 'page_visit' && (
                            <>
                              <div className="text-3xl mb-1">🌐</div>
                              <div className="text-white text-sm font-semibold">{activity.details?.page || 'Pagina'}</div>
                              <div className="text-slate-400 text-xs">Bezoekt pagina</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* TOEGANG TAB */}
        {activeTab === 'toegang' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Toegang verlenen */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Toegang Verlenen
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                  <Input placeholder="gebruiker@email.com" value={accessEmail} onChange={e => setAccessEmail(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Naam (optioneel)</label>
                  <Input placeholder="Naam" value={accessName} onChange={e => setAccessName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Welke tabs mag deze persoon zien?</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {TABS.map(tab => {
                      const Icon = tab.icon;
                      const selected = accessTabs.includes(tab.id);
                      return (
                        <button
                          key={tab.id}
                          onClick={() => toggleNewTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                            selected ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (!accessEmail) { toast.error('Vul een email in'); return; }
                    if (accessTabs.length === 0) { toast.error('Kies minstens 1 tab'); return; }
                    const existing = accessList.find(a => a.user_email === accessEmail);
                    if (existing) { updateAccessMutation.mutate({ id: existing.id, tabs: accessTabs }); setAccessEmail(''); setAccessName(''); setAccessTabs([]); }
                    else grantAccessMutation.mutate({ user_email: accessEmail, user_name: accessName, allowed_tabs: accessTabs });
                  }}
                  disabled={grantAccessMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Toegang Verlenen
                </Button>
              </div>
            </div>

            {/* Bestaande toegangen */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold">Gebruikers met Toegang ({accessList.length})</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {accessList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Nog niemand heeft extra toegang</div>
                ) : accessList.map(access => (
                  <div key={access.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">{access.user_name || access.user_email}</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => revokeAccessMutation.mutate(access.id)} className="text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {TABS.map(tab => {
                        const Icon = tab.icon;
                        const has = (access.allowed_tabs || []).includes(tab.id);
                        return (
                          <button
                            key={tab.id}
                            onClick={() => toggleTab(tab.id, access.allowed_tabs || [], access.id)}
                            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-all ${
                              has ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            <Icon className="w-2.5 h-2.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 99X BOOST TAB */}
        {activeTab === '99x' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/50 border border-yellow-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                99X Boost Geven
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email van speler *</label>
                  <Input placeholder="gebruiker@email.com" value={boostEmail} onChange={e => setBoostEmail(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Multiplier (bijv. 99)</label>
                  <Input type="number" min="1" placeholder="99" value={boostMultiplier} onChange={e => setBoostMultiplier(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setBoostPermanent(!boostPermanent)}
                    className={`w-12 h-6 rounded-full transition-all relative ${boostPermanent ? 'bg-purple-600' : 'bg-slate-700'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${boostPermanent ? 'left-6' : 'left-0.5'}`} />
                  </button>
                  <label className="text-sm text-slate-300">Permanent (geen tijdslimiet)</label>
                </div>
                {!boostPermanent && (
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Duur (minuten)</label>
                    <Input type="number" min="1" placeholder="1" value={boostHours} onChange={e => setBoostHours(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                )}
                <Button
                  onClick={() => {
                    if (!boostEmail) { toast.error('Vul een email in'); return; }
                    const mult = Number(boostMultiplier);
                    if (!mult || mult < 1) { toast.error('Vul een geldig getal in'); return; }
                    giveBoostMutation.mutate({ email: boostEmail, permanent: boostPermanent, hours: Number(boostHours) || 1, multiplier: mult });
                  }}
                  disabled={giveBoostMutation.isPending}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {giveBoostMutation.isPending ? 'Bezig...' : `${boostMultiplier || '?'}X Boost Geven`}
                </Button>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold">Actieve Boosts</h2>
              </div>
              <div className="divide-y divide-slate-800">
                {allUsersForBoost.filter(u => u.score_multiplier >= 99).length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Geen actieve 99X boosts</div>
                ) : allUsersForBoost.filter(u => u.score_multiplier >= 99).map(u => (
                  <div key={u.id} className="flex items-center justify-between p-4">
                    <div>
                      <div className="text-white font-semibold">{u.full_name || u.email}</div>
                      <div className="text-yellow-400 text-xs mt-1">
                        {u.multiplier_expires ? `Verloopt: ${new Date(u.multiplier_expires).toLocaleString('nl-NL')}` : '♾️ Permanent'}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => removeBoostMutation.mutate(u)} className="text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-red-400" />
                Admin Abuse Chat
              </h2>
              <p className="text-slate-400 text-sm mb-6">Zet de chat aan zodat admin-gebruikers met toegang kunnen chatten via de zwevende knop links onderin.</p>
              <div className={`p-6 rounded-xl border-2 text-center mb-6 ${chatEnabled ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                <div className="text-5xl mb-3">{chatEnabled ? '💬' : '🔇'}</div>
                <div className={`text-2xl font-bold mb-1 ${chatEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  Admin Chat {chatEnabled ? 'OPEN' : 'GESLOTEN'}
                </div>
              </div>
              <Button
                onClick={async () => {
                  const newVal = !chatEnabled;
                  if (chatSetting) {
                    await base44.entities.SiteSettings.update(chatSetting.id, { value: newVal ? 'true' : 'false' });
                  } else {
                    await base44.entities.SiteSettings.create({ key: 'admin_chat', value: newVal ? 'true' : 'false', description: 'Admin chat ingeschakeld' });
                  }
                  refetchSettings();
                  toast.success(newVal ? 'Admin chat geopend!' : 'Admin chat gesloten!');
                  await sendReloadSignal();
                  setTimeout(() => window.location.reload(), 500);
                }}
                className={`w-full text-lg py-6 ${chatEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {chatEnabled ? 'Chat Sluiten' : 'Chat Openen'}
              </Button>
            </div>
          </motion.div>
        )}

        {/* CODES TAB */}
        {activeTab === 'codes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Code aanmaken */}
            <div className="bg-slate-900/50 border border-pink-500/20 rounded-xl p-6">
              <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-pink-400" />
                Nieuwe Code Aanmaken
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Code *</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Bijv. GAMEZONE2024"
                      value={newCode}
                      onChange={e => setNewCode(e.target.value.toUpperCase())}
                      className="bg-slate-800 border-slate-700 text-white font-mono tracking-widest"
                    />
                    <Button onClick={generateRandomCode} variant="ghost" className="text-slate-400 hover:text-white shrink-0" title="Genereer willekeurige code">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Beschrijving (optioneel)</label>
                  <Input placeholder="Bijv. Kerstcadeau" value={codeDesc} onChange={e => setCodeDesc(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Beloning type *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'punten', label: '🏆 Punten', desc: 'Geef punten' },
                      { id: 'multiplier_tijd', label: '⚡ Multiplier', desc: 'X punten voor tijd' },
                      { id: 'superadmin', label: '🛡️ Admin', desc: 'Admin toegang' },
                    ].map(rt => (
                      <button
                        key={rt.id}
                        onClick={() => setCodeRewardType(rt.id)}
                        className={`p-3 rounded-xl border text-center transition-all ${codeRewardType === rt.id ? 'border-pink-500/50 bg-pink-500/20 text-white' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'}`}
                      >
                        <div className="font-semibold text-sm">{rt.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{rt.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {codeRewardType === 'punten' && (
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Aantal punten *</label>
                    <Input type="number" placeholder="Bijv. 1000" value={codePoints} onChange={e => setCodePoints(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                )}

                {codeRewardType === 'multiplier_tijd' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Multiplier (bijv. 5)</label>
                      <Input type="number" placeholder="5" value={codeMultiplier} onChange={e => setCodeMultiplier(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Duur (minuten)</label>
                      <Input type="number" placeholder="60" value={codeMultiplierMins} onChange={e => setCodeMultiplierMins(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                    </div>
                  </div>
                )}

                {codeRewardType === 'superadmin' && (
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Welke tabs krijgt deze admin?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TABS.map(tab => {
                        const Icon = tab.icon;
                        const selected = codeSuperadminTabs.includes(tab.id);
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setCodeSuperadminTabs(prev => prev.includes(tab.id) ? prev.filter(t => t !== tab.id) : [...prev, tab.id])}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                              selected ? 'bg-pink-500/20 border-pink-500/50 text-pink-300' : 'border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {codeRewardType !== 'terminal' && (
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Max gebruik (0 = onbeperkt)</label>
                    <Input type="number" placeholder="1" value={codeMaxUses} onChange={e => setCodeMaxUses(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (!newCode.trim()) { toast.error('Vul een code in'); return; }
                    if (codeRewardType === 'punten' && !codePoints) { toast.error('Vul punten in'); return; }
                    const data = {
                      code: newCode.trim().toUpperCase(),
                      reward_type: codeRewardType,
                      max_uses: codeRewardType === 'terminal' ? 0 : (Number(codeMaxUses) || 1),
                      uses: 0,
                      used_by: [],
                      active: true,
                      description: codeDesc || '',
                    };
                    if (codeRewardType === 'punten') data.points = Number(codePoints);
                    if (codeRewardType === 'multiplier_tijd') {
                      data.multiplier = Number(codeMultiplier) || 2;
                      data.multiplier_minutes = Number(codeMultiplierMins) || 60;
                    }
                    if (codeRewardType === 'superadmin') {
                      data.superadmin_tabs = codeSuperadminTabs;
                    }
                    createCodeMutation.mutate(data);
                  }}
                  disabled={createCodeMutation.isPending}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Code Aanmaken
                </Button>
              </div>
            </div>

            {/* Bestaande codes */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-400" />
                  Alle Codes ({allCodes.length})
                </h2>
                <p className="text-slate-400 text-xs mt-1">Codes kunnen worden ingewisseld op <span className="text-purple-300">/Redeem</span>. Terminal-codes beheer je in de tab <span className="text-green-300">Terminal</span>.</p>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {allCodes.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Nog geen codes aangemaakt</div>
                ) : allCodes.map(c => (
                  <div key={c.id} className={`flex items-start justify-between p-4 border-b border-slate-800 hover:bg-slate-800/30 ${!c.active ? 'opacity-50' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono font-bold text-white tracking-widest text-sm bg-slate-800 px-2 py-0.5 rounded">{c.code}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${c.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {c.active ? 'Actief' : 'Gestopt'}
                        </span>
                        <span className="text-xs text-slate-500">{c.uses || 0} keer gebruikt{c.reward_type !== 'terminal' && (c.max_uses === 0 ? ' (onbeperkt)' : ` / max ${c.max_uses}`)}</span>
                      </div>
                      {c.description && <div className="text-slate-400 text-xs mb-1">{c.description}</div>}
                      <div className="text-xs text-slate-500">
                        {c.reward_type === 'punten' && `🏆 ${c.points} punten`}
                        {c.reward_type === 'multiplier_tijd' && `⚡ ${c.multiplier}X multiplier voor ${c.multiplier_minutes} min`}
                        {c.reward_type === 'superadmin' && `🛡️ Super Admin toegang${c.superadmin_tabs?.length ? ` (${c.superadmin_tabs.length} tabs)` : ''}`}
                        {c.reward_type === 'terminal' && '🖥️ Geheime Terminal'}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-3 shrink-0">
                      <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Code gekopieerd!'); }} className="text-slate-400 hover:text-white p-1.5">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <button
                        onClick={() => toggleCodeMutation.mutate({ id: c.id, active: !c.active })}
                        className={`text-xs px-2 py-1 rounded ${c.active ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                      >
                        {c.active ? 'Stop' : 'Start'}
                      </button>
                      <Button size="sm" variant="ghost" onClick={() => deleteCodeMutation.mutate(c.id)} className="text-red-400 hover:bg-red-500/10 p-1.5">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* GAMEDOORELKAAR TAB */}
        {activeTab === 'gamedoorelkaar' && (
          <GameDoorElkaarTab siteSettings={siteSettings} refetchSettings={refetchSettings} user={user} />
        )}

        {/* BLINDNESS TAB */}
        {activeTab === 'blindness' && (
          <BlindnessTab siteSettings={siteSettings} refetchSettings={refetchSettings} />
        )}

        {/* VRAGEN TAB */}
        {activeTab === 'vragen' && (
          <VragenTab user={user} />
        )}

        {/* TEKST TAB */}
        {activeTab === 'tekst' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <InfoTekstTab />
          </motion.div>
        )}

        {/* CMS TAB */}
        {activeTab === 'cms' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SiteTextsTab />
          </motion.div>
        )}

        {/* LINK GAME TAB */}
        {activeTab === 'link' && (
          <LinkGameTab siteSettings={siteSettings} refetchSettings={refetchSettings} />
        )}

        {/* CODE TAB */}
        {activeTab === 'terminal' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TerminalTab siteSettings={siteSettings} refetchSettings={refetchSettings} />
          </motion.div>
        )}

        {activeTab === 'code' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <CodeViewerTab />
          </motion.div>
        )}

        {/* AI BEHEER TAB */}
        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AiBeheerTab user={user} />
          </motion.div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <VideoAdmin />
          </motion.div>
        )}

        {/* BANNEN TAB */}
        {activeTab === 'bannen' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Ban */}
              <div className="bg-slate-900/50 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-400" />
                  Gebruiker Bannen
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Email *</label>
                    <Input placeholder="gebruiker@email.com" value={banEmail} onChange={e => setBanEmail(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Naam (optioneel)</label>
                    <Input placeholder="Naam van speler" value={banName} onChange={e => setBanName(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Reden (optioneel)</label>
                    <Input placeholder="Reden voor ban..." value={banReason} onChange={e => setBanReason(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <Button onClick={handleBan} disabled={banMutation.isPending} className="w-full bg-red-600 hover:bg-red-700">
                    <Ban className="w-4 h-4 mr-2" />
                    {banMutation.isPending ? 'Bannen...' : 'Gebruiker Bannen'}
                  </Button>
                </div>
              </div>

              {/* Kick */}
              <div className="bg-slate-900/50 border border-orange-500/20 rounded-xl p-6">
                <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                  <MonitorOff className="w-5 h-5 text-orange-400" />
                  Gebruiker Kicken
                </h2>
                <p className="text-slate-400 text-sm mb-4">Stuur een signaal om de sessie van een gebruiker te sluiten. De gebruiker wordt direct uitgelogd.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Email van gebruiker *</label>
                    <Input placeholder="gebruiker@email.com" value={kickEmail} onChange={e => setKickEmail(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
                  </div>
                  <Button onClick={() => kickEmail && kickMutation.mutate(kickEmail)} disabled={kickMutation.isPending || !kickEmail} className="w-full bg-orange-600 hover:bg-orange-700">
                    <MonitorOff className="w-4 h-4 mr-2" />
                    {kickMutation.isPending ? 'Kicken...' : 'Gebruiker Kicken'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Bans lijst */}
            <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-purple-500/20">
                <h2 className="text-white font-bold flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-400" />
                  Gebande Gebruikers ({bans.length})
                </h2>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {bans.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">Geen gebande gebruikers</div>
                ) : (
                  bans.map(ban => (
                    <div key={ban.id} className="flex items-center justify-between p-4 border-b border-slate-800 hover:bg-slate-800/30">
                      <div>
                        <div className="text-white font-semibold">{ban.user_name || ban.user_email}</div>
                        {ban.reason && <div className="text-red-400 text-xs mt-1">Reden: {ban.reason}</div>}
                        <div className="text-slate-500 text-xs">{timeAgo(ban.created_date)}</div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => unbanMutation.mutate(ban.id)} className="text-green-400 hover:text-green-300 hover:bg-green-500/10">
                        Unban
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}