import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, UserPlus, Users, MessageSquare, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { utcDate } from '@/lib/time';
import ChatNotifyPrompt from '@/components/ChatNotifyPrompt';

export default function PrivateChats() {
  const [user, setUser] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
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

  const { data: friendRequests = [] } = useQuery({
    queryKey: ['friends', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.Friend.list();
      return all.filter(f => f.user_email === user.email || f.friend_email === user.email);
    },
    enabled: !!user,
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const friends = friendRequests
    .filter(f => f.status === 'accepted')
    .map(f => {
      const friendEmail = f.user_email === user?.email ? f.friend_email : f.user_email;
      const friendUser = allUsers.find(u => u.email === friendEmail);
      return { ...f, friendEmail, friendUser };
    });

  const pendingRequests = friendRequests.filter(
    f => f.friend_email === user?.email && f.status === 'pending'
  );

  const getChatRoom = (email1, email2) => {
    return [email1, email2].sort().join('_');
  };

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', selectedFriend?.friendEmail],
    queryFn: async () => {
      if (!selectedFriend || !user) return [];
      const room = getChatRoom(user.email, selectedFriend.friendEmail);
      return await base44.entities.ChatMessage.filter({ room }, '-created_date', 100);
    },
    enabled: !!selectedFriend && !!user,
  });

  useEffect(() => {
    if (!user || !selectedFriend) return;
    const room = getChatRoom(user.email, selectedFriend.friendEmail);
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data.room === room) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedFriend.friendEmail] });
      }
    });
    return unsubscribe;
  }, [user, selectedFriend, queryClient]);

  const addFriendMutation = useMutation({
    mutationFn: (data) => base44.entities.Friend.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setShowAddFriend(false);
      setFriendEmail('');
    },
  });

  const acceptFriendMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Friend.update(id, { status: 'accepted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data) => base44.entities.ChatMessage.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      setMessage('');
    },
  });

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendEmail.trim() || !user) return;
    
    addFriendMutation.mutate({
      user_email: user.email,
      friend_email: friendEmail.trim(),
      status: 'pending'
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !selectedFriend) return;
    
    const room = getChatRoom(user.email, selectedFriend.friendEmail);
    sendMessageMutation.mutate({
      message: message.trim(),
      sender_name: user.full_name || user.email,
      sender_email: user.email,
      room
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Laden...</div>
      </div>
    );
  }

  const sortedMessages = [...messages].reverse();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <Users className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Vrienden Chat</h1>
          </div>
          <p className="text-slate-400">Chat privé met je vrienden</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Friends List */}
          <div className="lg:col-span-1 bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Vrienden</h2>
              <Button
                onClick={() => setShowAddFriend(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="mb-4 space-y-2">
                <h3 className="text-xs text-slate-400 font-semibold uppercase">Verzoeken</h3>
                {pendingRequests.map(req => {
                  const requester = allUsers.find(u => u.email === req.user_email);
                  return (
                    <div key={req.id} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm font-medium">
                          {requester?.full_name || req.user_email}
                        </div>
                      </div>
                      <Button
                        onClick={() => acceptFriendMutation.mutate({ id: req.id })}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Friends */}
            <div className="space-y-2">
              {friends.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  Nog geen vrienden toegevoegd
                </p>
              ) : (
                friends.map(friend => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedFriend?.id === friend.id
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-white font-medium text-sm">
                      {friend.friendUser?.full_name || friend.friendEmail}
                    </div>
                    <div className="text-xs text-slate-500">{friend.friendEmail}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
            {selectedFriend ? (
              <>
                <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold">
                      {selectedFriend.friendUser?.full_name || selectedFriend.friendEmail}
                    </h3>
                    <p className="text-xs text-slate-500">{selectedFriend.friendEmail}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFriend(null)}
                    className="lg:hidden"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="h-[400px] overflow-y-auto p-4 space-y-3">
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

                <ChatNotifyPrompt />

                <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/20">
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
              </>
            ) : (
              <div className="h-[500px] flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Selecteer een vriend om te chatten</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Friend Dialog */}
      <Dialog open={showAddFriend} onOpenChange={setShowAddFriend}>
        <DialogContent className="bg-slate-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Vriend Toevoegen</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFriend} className="space-y-4">
            <Input
              value={friendEmail}
              onChange={(e) => setFriendEmail(e.target.value)}
              placeholder="Email van je vriend"
              type="email"
              className="bg-slate-800 border-purple-500/30 text-white"
            />
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddFriend(false)}
                className="flex-1 border-purple-500/30"
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={!friendEmail.trim() || addFriendMutation.isPending}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {addFriendMutation.isPending ? 'Toevoegen...' : 'Toevoegen'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}