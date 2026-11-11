import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { BarChart2, CheckCircle2 } from 'lucide-react';

export default function Polls() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const load = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
      } catch {
        base44.auth.redirectToLogin();
      }
    };
    load();
  }, []);

  const { data: polls = [], isLoading } = useQuery({
    queryKey: ['polls'],
    queryFn: () => base44.entities.Poll.filter({ active: true }, '-created_date'),
    enabled: !!user,
  });

  const voteMutation = useMutation({
    mutationFn: async ({ poll, optionIndex }) => {
      const votes = { ...(poll.votes || {}) };
      const voters = [...(poll.voters || [])];
      votes[optionIndex] = (votes[optionIndex] || 0) + 1;
      voters.push(user.email);
      await base44.entities.Poll.update(poll.id, { votes, voters });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['polls'] }),
  });

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-white text-xl">Laden...</div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm">Stem mee!</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Polls
          </h1>
          <p className="text-slate-400 mt-2">Geef je mening!</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center text-slate-400 py-20">Laden...</div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20">
            <BarChart2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Nog geen actieve polls</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {polls.map((poll, pi) => {
                const hasVoted = (poll.voters || []).includes(user.email);
                const totalVotes = Object.values(poll.votes || {}).reduce((a, b) => a + b, 0);

                return (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pi * 0.1 }}
                    className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-6"
                  >
                    <h2 className="text-white font-bold text-lg mb-5">{poll.question}</h2>
                    <div className="space-y-3">
                      {(poll.options || []).map((option, i) => {
                        const count = poll.votes?.[i] || 0;
                        const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        return (
                          <div key={i}>
                            {hasVoted ? (
                              <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                                <div
                                  className="absolute left-0 top-0 bottom-0 bg-purple-500/20 transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                                <div className="relative flex items-center justify-between">
                                  <span className="text-white text-sm font-medium">{option}</span>
                                  <span className="text-purple-300 text-sm font-bold">{pct}% ({count})</span>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => voteMutation.mutate({ poll, optionIndex: i })}
                                disabled={voteMutation.isPending}
                                className="w-full text-left px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-purple-500/10 transition-all text-white text-sm font-medium"
                              >
                                {option}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-slate-500 text-xs">
                      {hasVoted && <CheckCircle2 className="w-3 h-3 text-green-400" />}
                      <span>{hasVoted ? 'Je hebt gestemd · ' : ''}{totalVotes} stem{totalVotes !== 1 ? 'men' : ''}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}