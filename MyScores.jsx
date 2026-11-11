import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award, Target, Camera, Zap, Lock } from 'lucide-react';

const MULTIPLIER_UPGRADES = [
  { level: 2,  icon: '⚡', cost: 500,      label: 'Koop 2X Multiplier',  color: 'from-blue-500 to-cyan-500' },
  { level: 4,  icon: '🔥', cost: 2500,     label: 'Koop 4X Multiplier',  color: 'from-orange-500 to-yellow-500' },
  { level: 8,  icon: '💫', cost: 10000,    label: 'Koop 8X Multiplier',  color: 'from-purple-500 to-pink-500' },
  { level: 16, icon: '🌟', cost: 50000,    label: 'Koop 16X Multiplier', color: 'from-pink-500 to-rose-500' },
  { level: 32, icon: '🚀', cost: 250000,   label: 'Koop 32X Multiplier', color: 'from-green-500 to-emerald-500' },
];

export default function MyScores() {
  const [user, setUser] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [buyingMultiplier, setBuyingMultiplier] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ profile_picture: file_url });
      const updatedUser = await base44.auth.me();
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleBuyMultiplier = async (upgrade) => {
    setBuyingMultiplier(true);
    await base44.auth.updateMe({ score_multiplier: upgrade.level });
    const updatedUser = await base44.auth.me();
    setUser(updatedUser);
    setBuyingMultiplier(false);
  };

  const { data: scores = [], isLoading } = useQuery({
    queryKey: ['my-scores', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const allScores = await base44.entities.Score.list('-score');
      return allScores.filter(score => score.created_by === user.email);
    },
    enabled: !!user,
  });

  // Group scores by game and get best score
  const gameStats = scores.reduce((acc, score) => {
    if (!acc[score.game]) {
      acc[score.game] = {
        game: score.game,
        bestScore: score.score,
        attempts: 1,
        totalScore: score.score,
        scores: [score]
      };
    } else {
      acc[score.game].bestScore = Math.max(acc[score.game].bestScore, score.score);
      acc[score.game].attempts += 1;
      acc[score.game].totalScore += score.score;
      acc[score.game].scores.push(score);
    }
    return acc;
  }, {});

  const stats = Object.values(gameStats).sort((a, b) => b.bestScore - a.bestScore);
  const totalGames = scores.length;
  const currentMultiplier = user?.score_multiplier || 1;
  const totalPoints = scores.reduce((sum, s) => sum + s.score, 0);
  const nextUpgrade = MULTIPLIER_UPGRADES.find(u => u.level > currentMultiplier);
  const gamesPlayed = stats.length;
  const bestScore = stats[0]?.bestScore || 0;
  const avgScore = totalGames > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / totalGames) : 0;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {user.profile_picture ? (
                  <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <label className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>
              {uploadingPhoto && (
                <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
            {user.full_name || user.email}
          </h1>
          <p className="text-slate-400">Jouw gaming statistieken</p>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{bestScore}</div>
                <div className="text-slate-400 text-sm">Beste Score</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalGames}</div>
                <div className="text-slate-400 text-sm">Totaal Gespeeld</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{gamesPlayed}</div>
                <div className="text-slate-400 text-sm">Games Geprobeerd</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{avgScore}</div>
                <div className="text-slate-400 text-sm">Gemiddelde</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Multiplier Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">Score Multiplier</h2>
            </div>
            <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
              <span className="text-purple-300 font-bold text-lg">{currentMultiplier}X actief</span>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap">
            {MULTIPLIER_UPGRADES.map(upgrade => {
              const owned = currentMultiplier >= upgrade.level;
              const isNext = nextUpgrade?.level === upgrade.level;
              const canAfford = totalPoints >= upgrade.cost;
              const prevOwned = upgrade.level === 2 || currentMultiplier >= upgrade.level / 2;

              return (
                <button
                  key={upgrade.level}
                  onClick={() => isNext && handleBuyMultiplier(upgrade)}
                  disabled={owned || !isNext || !canAfford || buyingMultiplier}
                  className={`flex-1 min-w-[120px] p-4 rounded-xl border transition-all text-center ${
                    owned
                      ? 'bg-green-900/30 border-green-500/40 opacity-70'
                      : isNext && canAfford
                      ? `bg-gradient-to-br ${upgrade.color} border-transparent hover:opacity-90 cursor-pointer shadow-lg`
                      : 'bg-slate-800/50 border-slate-700 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="text-3xl mb-2">{owned ? '✅' : !isNext ? <Lock className="w-5 h-5 mx-auto text-slate-500" /> : upgrade.icon}</div>
                  <div className={`font-bold text-sm mb-1 ${owned ? 'text-green-400' : isNext && canAfford ? 'text-white' : 'text-slate-500'}`}>
                    {upgrade.level}X
                  </div>
                  {owned ? (
                    <div className="text-green-300 text-xs">Gekocht</div>
                  ) : isNext ? (
                    <div className={`text-xs font-semibold ${canAfford ? 'text-white' : 'text-slate-500'}`}>
                      {upgrade.cost.toLocaleString()} pts
                    </div>
                  ) : (
                    <div className="text-slate-600 text-xs">🔒 Vergrendeld</div>
                  )}
                </button>
              );
            })}
          </div>

          {nextUpgrade && (
            <p className="text-slate-500 text-xs mt-3 text-center">
              Je hebt {totalPoints.toLocaleString()} punten • Nog {Math.max(0, nextUpgrade.cost - totalPoints).toLocaleString()} nodig voor {nextUpgrade.level}X
            </p>
          )}
        </motion.div>

        {/* Games List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Jouw Games</h2>
          
          {isLoading ? (
            <div className="text-center py-12 text-slate-400">Laden...</div>
          ) : stats.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Je hebt nog geen games gespeeld</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.game}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="bg-slate-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{stat.game}</h3>
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-slate-400">Beste: </span>
                          <span className="text-green-400 font-bold">{stat.bestScore}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Pogingen: </span>
                          <span className="text-purple-400 font-bold">{stat.attempts}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Gem: </span>
                          <span className="text-blue-400 font-bold">{Math.round(stat.totalScore / stat.attempts)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent scores */}
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-slate-400 text-xs mb-2">Recente scores:</div>
                    <div className="flex gap-2 flex-wrap">
                      {stat.scores.slice(0, 5).map((score, i) => (
                        <div
                          key={i}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs"
                        >
                          {score.score}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);