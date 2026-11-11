import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Zap, Trophy, Star, Shield, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { openTerminal } from '@/lib/terminalStore';
import { terminalLevelLabel } from '@/lib/terminalShared';

export default function Redeem() {
  const [user, setUser] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success, message, reward }

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const handleRedeem = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const trimmedCode = code.trim().toUpperCase();
      const codes = await base44.entities.RedeemCode.filter({ code: trimmedCode, active: true });

      if (!codes || codes.length === 0) {
        setResult({ success: false, message: 'Ongeldige of verlopen code.' });
        setLoading(false);
        return;
      }

      const redeemCode = codes[0];

      // Alle codes behalve de terminal-code: één keer per gebruiker en max gebruik
      if (redeemCode.reward_type !== 'terminal') {
        if ((redeemCode.used_by || []).includes(user.email)) {
          setResult({ success: false, message: 'Je hebt deze code al gebruikt!' });
          setLoading(false);
          return;
        }
        if (redeemCode.max_uses > 0 && (redeemCode.uses || 0) >= redeemCode.max_uses) {
          setResult({ success: false, message: 'Deze code is al maximaal gebruikt.' });
          setLoading(false);
          return;
        }
      }

      // Apply reward
      let rewardMessage = '';

      if (redeemCode.reward_type === 'punten') {
        const pts = redeemCode.points || 0;
        await base44.entities.Score.create({
          player_name: user.full_name || 'Speler',
          score: pts,
          game: 'Code Reward'
        });
        rewardMessage = `+${pts} punten`;

      } else if (redeemCode.reward_type === 'multiplier_tijd') {
        const mult = redeemCode.multiplier || 2;
        const mins = redeemCode.multiplier_minutes || 60;
        const expires = new Date(Date.now() + mins * 60000).toISOString();
        await base44.entities.User.update(user.id, {
          score_multiplier: mult,
          multiplier_expires: expires,
          multiplier_original: user.score_multiplier > 1 ? (user.multiplier_original || 1) : 1,
        });
        rewardMessage = `${mult}X multiplier voor ${mins} minuten`;

      } else if (redeemCode.reward_type === 'superadmin') {
        // Grant super admin access with selected tabs
        const existing = await base44.entities.AdminAccess.filter({ user_email: user.email });
        const tabsToGrant = redeemCode.superadmin_tabs?.length > 0 ? redeemCode.superadmin_tabs : ['live', 'stats', 'scores', 'punten'];
        if (existing.length === 0) {
          await base44.entities.AdminAccess.create({
            user_email: user.email,
            user_name: user.full_name || user.email,
            allowed_tabs: tabsToGrant
          });
        } else {
          await base44.entities.AdminAccess.update(existing[0].id, { allowed_tabs: tabsToGrant });
        }
        rewardMessage = 'Super Admin toegang verkregen!';

      } else if (redeemCode.reward_type === 'terminal') {
        const level = redeemCode.terminal_level || 'volledig';
        rewardMessage = `Geheime terminal ontgrendeld (niveau: ${terminalLevelLabel(level)})!`;
      }

      // Update code usage
      await base44.entities.RedeemCode.update(redeemCode.id, {
        uses: (redeemCode.uses || 0) + 1,
        used_by: [...(redeemCode.used_by || []), user.email],
      });

      // Pas openen als de code is bijgeschreven, zodat de rechten meteen kloppen
      if (redeemCode.reward_type === 'terminal') openTerminal();

      setResult({ success: true, message: rewardMessage, type: redeemCode.reward_type });
      setCode('');

    } catch (err) {
      setResult({ success: false, message: 'Er ging iets mis. Probeer het opnieuw.' });
    }
    setLoading(false);
  };

  const rewardIcons = {
    punten: <Trophy className="w-12 h-12 text-yellow-400" />,
    multiplier_tijd: <Zap className="w-12 h-12 text-purple-400" />,
    superadmin: <Shield className="w-12 h-12 text-red-400" />,
    terminal: <Terminal className="w-12 h-12 text-green-400" />,
  };

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Laden...</div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/30">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Code Inwisselen</h1>
          <p className="text-slate-400">Voer een code in om een beloning te ontvangen!</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-slate-900/70 border border-purple-500/20 rounded-2xl p-6 backdrop-blur">

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Jouw code</label>
              <Input
                placeholder="Bijv. GAMEZONE2024"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && !loading && handleRedeem()}
                className="bg-slate-800 border-slate-600 text-white text-lg text-center tracking-widest font-mono placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-500"
                maxLength={30}
              />
            </div>

            <Button
              onClick={handleRedeem}
              disabled={loading || !code.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-lg py-6"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Inwisselen...
                </div>
              ) : (
                <>
                  <Gift className="w-5 h-5 mr-2" />
                  Code Inwisselen
                </>
              )}
            </Button>
          </div>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-6 p-5 rounded-xl border-2 text-center ${
                result.success
                  ? 'bg-green-500/10 border-green-500/40'
                  : 'bg-red-500/10 border-red-500/40'
              }`}
            >
              {result.success ? (
                <>
                  <div className="flex justify-center mb-3">
                    {rewardIcons[result.type] || <Star className="w-12 h-12 text-yellow-400" />}
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-green-400 font-bold text-xl mb-1">Code Ingewisseld!</div>
                  <div className="text-white font-semibold text-lg">{result.message}</div>
                </>
              ) : (
                <>
                  <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <div className="text-red-400 font-bold text-lg">{result.message}</div>
                </>
              )}
            </motion.div>
          )}
        </motion.div>

        <p className="text-center text-slate-600 text-sm mt-4">
          Ingelogd als <span className="text-slate-400">{user.full_name || user.email}</span>
        </p>
      </div>
    </div>
  );
}