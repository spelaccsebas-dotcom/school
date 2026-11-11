import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminQuestionPopup() {
  const [questions, setQuestions] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [answered, setAnswered] = useState({}); // { [id]: answerText }

  useEffect(() => {
    const load = async () => {
      const qs = await base44.entities.AdminQuestion.list('-created_date', 5);
      setQuestions(qs.filter(q => q.active));
    };
    load();

    const unsub = base44.entities.AdminQuestion.subscribe((event) => {
      if (event.type === 'create') {
        setQuestions(prev => [event.data, ...prev]);
      } else if (event.type === 'delete') {
        setQuestions(prev => prev.filter(q => q.id !== event.id));
      } else if (event.type === 'update') {
        if (!event.data?.active) {
          setQuestions(prev => prev.filter(q => q.id !== event.id));
        } else {
          setQuestions(prev => prev.map(q => q.id === event.id ? event.data : q));
        }
      }
    });
    return unsub;
  }, []);

  const visible = questions.filter(q => !dismissed.includes(q.id));

  return (
    <div className="fixed top-16 left-0 right-0 z-[9999] pointer-events-none">
      <AnimatePresence>
        {visible.map(q => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pointer-events-auto mx-auto max-w-3xl mt-2 px-4 py-3 rounded-xl border bg-gradient-to-r from-indigo-600 to-violet-700 border-indigo-400/30 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <span className="text-lg mt-0.5">❓</span>
                <div className="flex-1 min-w-0">
                  <span className="text-white font-medium text-sm">
                    {q.sender_name && <span className="font-bold">{q.sender_name}: </span>}
                    {q.question}
                  </span>
                  {/* Answer options */}
                  {q.options?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {answered[q.id] ? (
                        <span className="text-white/80 text-xs bg-white/20 px-3 py-1 rounded-full">
                          ✅ Jouw antwoord: <strong>{answered[q.id]}</strong>
                        </span>
                      ) : (
                        q.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => setAnswered(prev => ({ ...prev, [q.id]: opt }))}
                            className="text-white text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all border border-white/20"
                          >
                            {opt}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setDismissed(prev => [...prev, q.id])}
                className="text-white/70 hover:text-white flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}