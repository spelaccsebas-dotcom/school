import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cookie, TrendingUp, Zap } from 'lucide-react';

const UPGRADES = [
  { id: 'cursor', name: 'Cursor', cost: 15, cps: 0.1, icon: '👆' },
  { id: 'grandma', name: 'Oma', cost: 100, cps: 1, icon: '👵' },
  { id: 'farm', name: 'Koekjes Farm', cost: 500, cps: 8, icon: '🏭' },
  { id: 'mine', name: 'Koekjes Mijn', cost: 3000, cps: 47, icon: '⛏️' },
  { id: 'factory', name: 'Fabriek', cost: 10000, cps: 260, icon: '🏭' },
  { id: 'bank', name: 'Bank', cost: 40000, cps: 1400, icon: '🏦' },
  { id: 'temple', name: 'Tempel', cost: 200000, cps: 7800, icon: '⛩️' },
  { id: 'wizard', name: 'Tovenaar', cost: 1666666, cps: 44000, icon: '🧙' },
];

const MULTIPLIERS = [
  { id: 'multiplier_2x', name: '2X Multiplier', cost: 5000, multiplier: 2, icon: '⚡' },
  { id: 'multiplier_4x', name: '4X Multiplier', cost: 50000, multiplier: 4, icon: '🔥' },
  { id: 'multiplier_8x', name: '8X Multiplier', cost: 500000, multiplier: 8, icon: '💫' },
  { id: 'multiplier_16x', name: '16X Multiplier', cost: 5000000, multiplier: 16, icon: '🌟' },
];

export default function CookieClicker({ onGameEnd }) {
  const [cookies, setCookies] = useState(0);
  const [cookiesPerClick, setCookiesPerClick] = useState(1);
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0);
  const [upgrades, setUpgrades] = useState({});
  const [multipliers, setMultipliers] = useState({});
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {}
    };
    loadUser();
  }, []);

  const { data: progress } = useQuery({
    queryKey: ['cookie-progress', user?.email],
    queryFn: async () => {
      if (!user) return null;
      const allProgress = await base44.entities.CookieProgress.list();
      const myProgress = allProgress.filter(p => p.created_by === user.email);
      return myProgress[0] || null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (progress) {
      setCookies(progress.cookies || 0);
      setCookiesPerClick(progress.cookies_per_click || 1);
      setCookiesPerSecond(progress.cookies_per_second || 0);
      setUpgrades(progress.upgrades || {});
      setMultipliers(progress.multipliers || {});
      
      // Calculate current multiplier
      let maxMultiplier = 1;
      MULTIPLIERS.forEach(m => {
        if (progress.multipliers?.[m.id]) {
          maxMultiplier = Math.max(maxMultiplier, m.multiplier);
        }
      });
      setCurrentMultiplier(maxMultiplier);
    }
  }, [progress]);

  const saveProgressMutation = useMutation({
    mutationFn: async (data) => {
      if (progress?.id) {
        return await base44.entities.CookieProgress.update(progress.id, data);
      } else {
        return await base44.entities.CookieProgress.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookie-progress'] });
    },
  });

  useEffect(() => {
    if (cookiesPerSecond > 0) {
      const interval = setInterval(() => {
        setCookies(c => c + (cookiesPerSecond * currentMultiplier) / 10);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [cookiesPerSecond, currentMultiplier]);

  useEffect(() => {
    if (user && cookies > 0) {
      const saveInterval = setInterval(() => {
        saveProgressMutation.mutate({
          cookies,
          cookies_per_click: cookiesPerClick,
          cookies_per_second: cookiesPerSecond,
          upgrades,
          multipliers,
        });
      }, 5000);
      return () => clearInterval(saveInterval);
    }
  }, [cookies, cookiesPerClick, cookiesPerSecond, upgrades, multipliers, user]);

  const handleClick = () => {
    setCookies(c => c + (cookiesPerClick * currentMultiplier));
  };

  const buyUpgrade = (upgrade) => {
    const owned = upgrades[upgrade.id] || 0;
    const cost = Math.floor(upgrade.cost * Math.pow(1.15, owned));
    
    if (cookies >= cost) {
      setCookies(c => c - cost);
      setUpgrades(prev => ({ ...prev, [upgrade.id]: owned + 1 }));
      setCookiesPerSecond(cps => cps + upgrade.cps);
    }
  };

  const buyMultiplier = (multiplier) => {
    if (cookies >= multiplier.cost && !multipliers[multiplier.id]) {
      setCookies(c => c - multiplier.cost);
      setMultipliers(prev => ({ ...prev, [multiplier.id]: true }));
      setCurrentMultiplier(multiplier.multiplier);
    }
  };

  const buyClickUpgrade = () => {
    const cost = 50 * Math.pow(2, cookiesPerClick - 1);
    if (cookies >= cost) {
      setCookies(c => c - cost);
      setCookiesPerClick(cpc => cpc + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      {/* Stats */}
      <div className="w-full max-w-md space-y-2">
        <div className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-4xl font-bold text-yellow-400 mb-2">
            {Math.floor(cookies)}
          </div>
          <div className="text-slate-400 text-sm">koekjes</div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">per klik</div>
            <div className="text-green-400 font-bold">{cookiesPerClick * currentMultiplier}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">per seconde</div>
            <div className="text-blue-400 font-bold">{(cookiesPerSecond * currentMultiplier).toFixed(1)}</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-slate-400 text-xs mb-1">multiplier</div>
            <div className="text-purple-400 font-bold">{currentMultiplier}X</div>
          </div>
        </div>
      </div>

      {/* Cookie Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        className="relative w-48 h-48 rounded-full bg-gradient-to-br from-yellow-600 to-orange-600 shadow-2xl hover:shadow-yellow-500/50 transition-shadow"
      >
        <div className="text-8xl">🍪</div>
        {cookiesPerClick > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 text-yellow-300 font-bold"
          >
            +{cookiesPerClick}
          </motion.div>
        )}
      </motion.button>

      {/* Click Upgrade */}
      <Button
        onClick={buyClickUpgrade}
        disabled={cookies < 50 * Math.pow(2, cookiesPerClick - 1)}
        className="bg-purple-600 hover:bg-purple-700 w-full max-w-md"
      >
        <Zap className="w-4 h-4 mr-2" />
        Betere Klik ({50 * Math.pow(2, cookiesPerClick - 1)} koekjes)
      </Button>

      {/* Multipliers */}
      <div className="w-full max-w-md">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Multipliers
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {MULTIPLIERS.map(multiplier => {
            const owned = multipliers[multiplier.id];
            const canAfford = cookies >= multiplier.cost;
            const isActive = currentMultiplier >= multiplier.multiplier;

            return (
              <button
                key={multiplier.id}
                onClick={() => buyMultiplier(multiplier)}
                disabled={owned || !canAfford}
                className={`p-3 rounded-lg border transition-all ${
                  owned || isActive
                    ? 'bg-purple-900/50 border-purple-500 opacity-75'
                    : canAfford
                    ? 'bg-slate-800 border-purple-500/30 hover:bg-purple-800/30 hover:border-purple-500/50'
                    : 'bg-slate-900/50 border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="text-center">
                  <span className="text-3xl mb-2 block">{multiplier.icon}</span>
                  <div className="text-white font-semibold text-sm mb-1">{multiplier.name}</div>
                  <div className={`font-bold text-sm ${canAfford ? 'text-yellow-400' : 'text-slate-500'}`}>
                    {multiplier.cost}
                  </div>
                  {owned && (
                    <div className="text-xs text-green-400 mt-1">✓ Gekocht</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upgrades */}
      <div className="w-full max-w-md">
        <h3 className="text-white font-bold mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Producenten
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {UPGRADES.map(upgrade => {
            const owned = upgrades[upgrade.id] || 0;
            const cost = Math.floor(upgrade.cost * Math.pow(1.15, owned));
            const canAfford = cookies >= cost;

            return (
              <button
                key={upgrade.id}
                onClick={() => buyUpgrade(upgrade)}
                disabled={!canAfford}
                className={`w-full p-3 rounded-lg border transition-all ${
                  canAfford
                    ? 'bg-slate-800 border-purple-500/30 hover:bg-slate-700 hover:border-purple-500/50'
                    : 'bg-slate-900/50 border-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{upgrade.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-semibold text-sm">{upgrade.name}</div>
                      <div className="text-slate-400 text-xs">+{upgrade.cps}/sec</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${canAfford ? 'text-yellow-400' : 'text-slate-500'}`}>
                      {cost}
                    </div>
                    {owned > 0 && (
                      <div className="text-xs text-purple-400">{owned} eigendom</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-slate-500 text-xs text-center mb-2">
        Voortgang wordt automatisch opgeslagen<br />
        Speel verder op elk apparaat!
      </div>

      <Button
        onClick={() => onGameEnd(Math.floor(cookies))}
        variant="outline"
        className="w-full max-w-md border-purple-500/30 hover:bg-purple-500/20"
      >
        Spel Sluiten
      </Button>
    </div>
  );
}