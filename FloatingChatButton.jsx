import React, { useState, useEffect, useRef } from 'react';
import useDraggable from '../hooks/useDraggable';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Users, Globe, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { utcDate } from '@/lib/time';
import ChatNotifyPrompt from '@/components/ChatNotifyPrompt';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatType, setChatType] = useState(null); // 'general' or 'friends'
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendEmail, setFriendEmail] = useState('');
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
        // Not logged in
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
    enabled: !!user && chatType === 'friends',
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: chatType === 'friends',
  });

  const friends = friendRequests
    .filter(f => f.status === 'accepted')
    .map(f => {
      const friendEmail = f.user_email === user?.email ? f.friend_email : f.user_email;
      const friendUser = allUsers.find(u => u.email === friendEmail);
      return { ...f, friendEmail, friendUser };
    });

  const pendingRequests = friendRequests
    .filter(f => f.status === 'pending' && f.friend_email === user?.email);

  const getChatRoom = (email1, email2) => {
    return [email1, email2].sort().join('_');
  };

  const currentRoom = chatType === 'general' ? 'general' : 
    (selectedFriend && user ? getChatRoom(user.email, selectedFriend.friendEmail) : null);

  const { data: messages = [] } = useQuery({
    queryKey: ['chat-messages', currentRoom],
    queryFn: () => base44.entities.ChatMessage.filter({ room: currentRoom }, '-created_date', 50),
    refetchInterval: 2000,
    enabled: isOpen && !!currentRoom,
  });

  useEffect(() => {
    if (!user || !isOpen || !currentRoom) return;
    const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
      if (event.data.room === currentRoom) {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', currentRoom] });
      }
    });
    return unsubscribe;
  }, [user, isOpen, currentRoom, queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.ChatMessage.create(data);
      if (user) {
        await base44.entities.Activity.create({
          user_email: user.email,
          user_name: user.full_name || user.email,
          activity_type: 'chat_message',
          details: { message: data.message, room: data.room }
        }).catch(() => {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      setMessage('');
    },
  });

  const addFriendMutation = useMutation({
    mutationFn: async (data) => {
      // Check if user exists
      const userExists = allUsers.some(u => u.email === data.friend_email);
      if (!userExists) {
        throw new Error('Deze gebruiker bestaat niet in de app');
      }
      // Check if already friends
      const alreadyExists = friendRequests.some(f => 
        (f.user_email === data.user_email && f.friend_email === data.friend_email) ||
        (f.user_email === data.friend_email && f.friend_email === data.user_email)
      );
      if (alreadyExists) {
        throw new Error('Vriendschapsverzoek bestaat al');
      }
      return base44.entities.Friend.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setShowAddFriend(false);
      setFriendEmail('');
    },
  });

  const acceptFriendMutation = useMutation({
    mutationFn: (id) => base44.entities.Friend.update(id, { status: 'accepted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim() || !user || !currentRoom) return;
    
    sendMessageMutation.mutate({
      message: message.trim(),
      sender_name: user.full_name || user.email,
      sender_email: user.email,
      room: currentRoom
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setChatType(null);
    setSelectedFriend(null);
    setShowAddFriend(false);
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!friendEmail.trim() || !user) return;
    
    addFriendMutation.mutate({
      user_email: user.email,
      friend_email: friendEmail.trim(),
      status: 'pending'
    });
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sortedMessages = [...messages].reverse();
  const drag = useDraggable('chat-btn-pos', { x: window.innerWidth - 80, y: window.innerHeight - 80 });

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <div ref={drag.containerRef} style={drag.containerStyle}>
        {/* Drag handle */}
        <div
          onMouseDown={drag.onDragStart}
          onTouchStart={drag.onDragStart}
          className="absolute -top-2 -left-2 -right-2 -bottom-2 cursor-grab active:cursor-grabbing rounded-full"
          style={{ zIndex: -1 }}
        />
        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) {
              setChatType(null);
              setSelectedFriend(null);
            }
          }}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-white" />
                <h3 className="text-white font-bold">
                  {chatType === 'general' ? 'Algemene Chat' : chatType === 'friends' ? 'Vrienden Chat' : 'Chat'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {chatType === 'friends' && !selectedFriend && (
                  <button
                    onClick={() => setShowAddFriend(!showAddFriend)}
                    className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!chatType ? (
              // Choose chat type
              <div className="p-6 space-y-3 bg-slate-950">
                <h4 className="text-white text-sm font-semibold mb-4">Kies een chat:</h4>
                <button
                  onClick={() => setChatType('general')}
                  className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">Algemene Chat</div>
                    <div className="text-slate-400 text-xs">Praat met iedereen</div>
                  </div>
                </button>
                <button
                  onClick={() => setChatType('friends')}
                  className="w-full bg-slate-800 hover:bg-slate-700 p-4 rounded-xl flex items-center gap-3 transition-colors"
                >
                  <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-pink-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-semibold">Vrienden Chat</div>
                    <div className="text-slate-400 text-xs">Chat met vrienden</div>
                  </div>
                </button>
              </div>
            ) : chatType === 'friends' && !selectedFriend ? (
              // Select friend
              <div className="h-80 overflow-y-auto p-4 bg-slate-950">
                <button
                  onClick={() => setChatType(null)}
                  className="text-purple-400 text-sm mb-4 hover:text-purple-300"
                >
                  ← Terug
                </button>
                
                {showAddFriend && (
                  <form onSubmit={handleAddFriend} className="mb-4 bg-slate-800 p-3 rounded-lg">
                    <div className="flex gap-2">
                      <Input
                        value={friendEmail}
                        onChange={(e) => setFriendEmail(e.target.value)}
                        placeholder="Email van vriend..."
                        className="bg-slate-700 border-purple-500/30 text-white placeholder:text-slate-500 text-sm"
                      />
                      <Button
                        type="submit"
                        disabled={!friendEmail.trim() || addFriendMutation.isPending}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                      >
                        {addFriendMutation.isPending ? '...' : 'Toevoegen'}
                      </Button>
                    </div>
                    {addFriendMutation.isError && (
                      <div className="text-red-400 text-xs mt-2">
                        {addFriendMutation.error.message}
                      </div>
                    )}
                  </form>
                )}

                {pendingRequests.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <h5 className="text-white text-xs font-semibold">Vriendschapsverzoeken:</h5>
                    {pendingRequests.map(req => {
                      const requester = allUsers.find(u => u.email === req.user_email);
                      return (
                        <div key={req.id} className="bg-slate-800 p-3 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm">{requester?.full_name || req.user_email}</div>
                          </div>
                          <Button
                            onClick={() => acceptFriendMutation.mutate(req.id)}
                            disabled={acceptFriendMutation.isPending}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accepteer
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 text-sm">Geen vrienden gevonden</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {friends.map(friend => (
                      <button
                        key={friend.id}
                        onClick={() => setSelectedFriend(friend)}
                        className="w-full bg-slate-800 hover:bg-slate-700 p-3 rounded-lg text-left transition-colors"
                      >
                        <div className="text-white font-medium text-sm">
                          {friend.friendUser?.full_name || friend.friendEmail}
                        </div>
                        <div className="text-xs text-slate-500">{friend.friendEmail}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Messages
              <>
                <div className="px-4 py-2 bg-slate-800 border-b border-purple-500/20">
                  <button
                    onClick={() => {
                      if (chatType === 'friends' && selectedFriend) {
                        setSelectedFriend(null);
                      } else {
                        setChatType(null);
                      }
                    }}
                    className="text-purple-400 text-xs hover:text-purple-300"
                  >
                    ← Terug
                  </button>
                </div>
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-950">
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
                          <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="text-xs text-slate-500 mb-1 px-2">
                              {msg.sender_name}
                            </div>
                            <div
                              className={`rounded-2xl px-3 py-2 ${
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
              </>
            )}

            {/* Input - only show when chat is selected */}
            {(chatType === 'general' || (chatType === 'friends' && selectedFriend)) && (
              <>
              <ChatNotifyPrompt />
              <form onSubmit={handleSend} className="p-3 border-t border-purple-500/20 bg-slate-900">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Typ een bericht..."
                    className="bg-slate-800 border-purple-500/30 text-white placeholder:text-slate-500 text-sm"
                  />
                  <Button
                    type="submit"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}