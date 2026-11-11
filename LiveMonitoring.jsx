import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity as ActivityIcon, Gamepad2, MessageCircle, Trophy, User, Eye } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { timeAgo } from '@/lib/time';

export default function LiveMonitoring() {
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: initialActivities = [] } = useQuery({
    queryKey: ['activities'],
    queryFn: () => base44.entities.Activity.list('-created_date', 50),
    enabled: !!user,
  });

  useEffect(() => {
    if (initialActivities.length > 0) {
      setActivities(initialActivities);
    }
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

  const getActivityIcon = (type) => {
    switch (type) {
      case 'game_start': return <Gamepad2 className="w-4 h-4" />;
      case 'game_end': return <Trophy className="w-4 h-4" />;
      case 'chat_message': return <MessageCircle className="w-4 h-4" />;
      case 'page_visit': return <Eye className="w-4 h-4" />;
      default: return <ActivityIcon className="w-4 h-4" />;
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
      case 'game_start':
        return `speelt nu ${activity.details?.game || 'een game'}`;
      case 'game_end':
        return `behaalde ${activity.details?.score || 0} punten in ${activity.details?.game || 'een game'}`;
      case 'chat_message':
        return `stuurde een bericht: "${activity.details?.message?.substring(0, 50) || '...'}"`;
      case 'page_visit':
        return `bezocht ${activity.details?.page || 'een pagina'}`;
      default:
        return 'deed iets';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  const stats = {
    gamesPlaying: activities.filter(a => a.activity_type === 'game_start').length,
    recentScores: activities.filter(a => a.activity_type === 'game_end').length,
    chatMessages: activities.filter(a => a.activity_type === 'chat_message').length,
    pageVisits: activities.filter(a => a.activity_type === 'page_visit').length,
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-pink-500">
              <ActivityIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Live Monitoring</h1>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
              LIVE
            </Badge>
          </div>
          <p className="text-slate-400">Bekijk alle activiteiten van gebruikers in real-time</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.gamesPlaying}</div>
                <div className="text-xs text-slate-400">Games gestart</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.recentScores}</div>
                <div className="text-xs text-slate-400">Scores behaald</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.chatMessages}</div>
                <div className="text-xs text-slate-400">Chat berichten</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.pageVisits}</div>
                <div className="text-xs text-slate-400">Pagina bezoeken</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Activity Feed */}
        <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-purple-500/20">
            <h2 className="text-white font-bold flex items-center gap-2">
              <ActivityIcon className="w-5 h-5" />
              Live Activiteiten Feed
            </h2>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Nog geen activiteiten...
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {activities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
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
                        </div>
                        <p className="text-slate-300 text-sm">{getActivityText(activity)}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {timeAgo(activity.created_date)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}