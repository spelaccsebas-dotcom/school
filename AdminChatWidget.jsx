import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminChatWidget() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ['admin-abuse-chat'],
    queryFn: () => base44.entities.ChatMessage.filter({ room: 'admin_abuse' }, '-created_date', 50),
    refetchInterval: 2000,
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    const unsub = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data?.room === 'admin_abuse') {
        queryClient.invalidateQueries({ queryKey: ['admin-abuse-chat'] });
      }
    });
    return unsub;
  }, [isOpen, queryClient]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMutation = useMutation({
    mutationFn: (msg) => base44.entities.ChatMessage.create({
      message: msg,
      sender_name: user?.full_name || user?.email,
      sender_email: user?.email,
      room: 'admin_abuse',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-abuse-chat'] });
      setMessage('');
    },
  });

  const sortedMessages = [...messages].reverse();

  if (!user) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50">
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-r from-red-500 to-orange-500 rounded-full shadow-lg flex items-center justify-center"
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-16 left-0 w-80 bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-white" />
              <span className="text-white font-bold text-sm">Admin Abuse Chat</span>
              <span className="ml-auto text-xs text-white/70">🔴 LIVE</span>
            </div>

            <div className="h-72 overflow-y-auto p-3 space-y-2 bg-slate-950">
              {sortedMessages.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">Geen berichten nog...</div>
              ) : (
                sortedMessages.map((msg) => {
                  const isMe = msg.sender_email === user?.email;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <span className="text-xs text-slate-500 mb-0.5 px-1">{msg.sender_name}</span>
                        <div className={`rounded-xl px-3 py-1.5 text-sm ${isMe ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-slate-800 text-white'}`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); if (message.trim() && user) sendMutation.mutate(message.trim()); }}
              className="p-2 border-t border-red-500/20 bg-slate-900 flex gap-2"
            >
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Typ een bericht..."
                className="bg-slate-800 border-slate-700 text-white text-sm placeholder:text-slate-500"
              />
              <Button type="submit" disabled={!message.trim()} size="sm" className="bg-gradient-to-r from-red-500 to-orange-500">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}