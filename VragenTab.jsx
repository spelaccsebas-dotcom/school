import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HelpCircle, Trash2, Send, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { timeAgo } from '@/lib/time';

export default function VragenTab({ user }) {
  const [newQuestion, setNewQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);

  const { data: questions = [], refetch } = useQuery({
    queryKey: ['admin-questions'],
    queryFn: () => base44.entities.AdminQuestion.list('-created_date', 50),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AdminQuestion.create(data),
    onSuccess: () => {
      refetch();
      setNewQuestion('');
      setOptions(['', '']);
      toast.success('Vraag verstuurd naar alle gebruikers!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminQuestion.delete(id),
    onSuccess: () => { refetch(); toast.success('Vraag verwijderd'); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }) => base44.entities.AdminQuestion.update(id, { active }),
    onSuccess: () => refetch(),
  });

  const handleSend = () => {
    if (!newQuestion.trim()) { toast.error('Typ een vraag'); return; }
    const filteredOptions = options.filter(o => o.trim());
    createMutation.mutate({
      question: newQuestion,
      options: filteredOptions,
      active: true,
      sender_name: user?.full_name || user?.email,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Vraag sturen */}
      <div className="bg-slate-900/50 border border-indigo-500/20 rounded-xl p-6">
        <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-400" />
          Vraag Stellen aan Alle Gebruikers
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          De vraag verschijnt als een banner bovenaan het scherm, ook tijdens games.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Vraag *</label>
            <Input
              placeholder="Bijv. Welk game vind jij het leukst?"
              value={newQuestion}
              onChange={e => setNewQuestion(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-slate-400 mb-1 block">Antwoordopties (optioneel)</label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <Input
                  placeholder={`Optie ${i + 1}`}
                  value={opt}
                  onChange={e => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                />
                {options.length > 2 && (
                  <button onClick={() => setOptions(options.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 px-2">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {options.length < 5 && (
              <button onClick={() => setOptions([...options, ''])} className="text-indigo-400 text-sm hover:text-indigo-300">
                + Optie toevoegen
              </button>
            )}
          </div>
          <Button
            onClick={handleSend}
            disabled={createMutation.isPending}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {createMutation.isPending ? 'Versturen...' : 'Verstuur Vraag naar Iedereen'}
          </Button>
        </div>
      </div>

      {/* Verstuurde vragen */}
      <div className="bg-slate-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-purple-500/20">
          <h2 className="text-white font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            Verstuurde Vragen ({questions.length})
          </h2>
        </div>
        <div className="max-h-[500px] overflow-y-auto">
          {questions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Nog geen vragen verstuurd</div>
          ) : questions.map(q => (
            <div key={q.id} className="flex items-start justify-between p-4 border-b border-slate-800 hover:bg-slate-800/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {q.active ? 'Actief' : 'Gestopt'}
                  </span>
                  {q.sender_name && <span className="text-slate-500 text-xs">door {q.sender_name}</span>}
                </div>
                <p className="text-white text-sm">❓ {q.question}</p>
                {q.options?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {q.options.map((opt, i) => (
                      <span key={i} className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{opt}</span>
                    ))}
                  </div>
                )}
                <p className="text-slate-500 text-xs mt-1">{timeAgo(q.created_date)}</p>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button
                  onClick={() => toggleMutation.mutate({ id: q.id, active: !q.active })}
                  className={`text-xs px-2 py-1 rounded ${q.active ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                >
                  {q.active ? 'Stoppen' : 'Activeren'}
                </button>
                <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(q.id)} className="text-red-400 hover:bg-red-500/10 p-1.5">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}