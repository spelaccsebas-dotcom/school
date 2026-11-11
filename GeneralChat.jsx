import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { utcDate } from '@/lib/time';
import ChatNotifyPrompt from '@/components/ChatNotifyPrompt';

export default function GeneralChat() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

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

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', 'general'],
    queryFn: () => base44.entities.ChatMessage.filter({ room: 'general' }, '-created_date', 100),
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data.room === 'general') {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', 'general'] });
      }
    });
    return unsubscribe;
  }, [user, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      setMessage('');
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    sendMessageMutation.mutate({
      message: message.trim(),
      sender_name: user.full_name || user.email,
      sender_email: user.email,
      room: 'general'
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sortedMessages = [...messages].reverse();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <MessageCircle className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Algemene Chat</h1>
          </div>
          <p className="text-slate-400">Praat met alle spelers</p>
        </motion.div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-3">
            <AnimatePresence initial={false}>
              {sortedMessages.map((msg) => {
                const isMe = msg.sender_email === user.email;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="text-xs text-slate-500 mb-1 px-2">
                        {msg.sender_name}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        <p className="text-sm break-words">{msg.message}</p>
                      </div>
                      <div className="text-xs text-slate-600 mt-1 px-2">
                        {utcDate(msg.created_date).toLocaleTimeString('nl-NL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Meldingen aan/uit — één keer vragen */}
          <ChatNotifyPrompt />

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-purple-500/20">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Typ een bericht..."
                className="bg-slate-800 border-purple-500/30 text-white placeholder:text-slate-500"
              />
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}