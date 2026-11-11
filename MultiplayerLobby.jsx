import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Users, Plus, Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MultiplayerLobby({ game, onStartGame, onClose }) {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const { data: rooms = [] } = useQuery({
    queryKey: ['game-rooms', game.id],
    queryFn: async () => {
      const allRooms = await base44.entities.GameRoom.list('-created_date', 50);
      return allRooms.filter(r => r.game_id === game.id && r.status !== 'finished');
    },
    refetchInterval: 2000,
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = base44.entities.GameRoom.subscribe((event) => {
      queryClient.invalidateQueries({ queryKey: ['game-rooms'] });
    });
    return unsubscribe;
  }, [user, queryClient]);

  const createRoomMutation = useMutation({
    mutationFn: async () => {
      const room = await base44.entities.GameRoom.create({
        game_id: game.id,
        game_name: game.name,
        host_email: user.email,
        host_name: user.full_name || user.email,
        status: 'waiting',
        current_turn: user.email
      });
      return room;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['game-rooms'] });
      onStartGame(room, 'host');
    },
  });

  const joinRoomMutation = useMutation({
    mutationFn: async (room) => {
      const updated = await base44.entities.GameRoom.update(room.id, {
        guest_email: user.email,
        guest_name: user.full_name || user.email,
        status: 'playing'
      });
      return updated;
    },
    onSuccess: (room) => {
      queryClient.invalidateQueries({ queryKey: ['game-rooms'] });
      onStartGame(room, 'guest');
    },
  });

  const myRooms = rooms.filter(r => 
    r.host_email === user?.email || r.guest_email === user?.email
  );

  const availableRooms = rooms.filter(r => 
    r.status === 'waiting' && 
    r.host_email !== user?.email
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Multiplayer Lobby
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Button
        onClick={() => createRoomMutation.mutate()}
        disabled={createRoomMutation.isPending}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
      >
        <Plus className="w-4 h-4 mr-2" />
        Maak Nieuwe Kamer
      </Button>

      {myRooms.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3">Jouw Kamers</h4>
          <div className="space-y-2">
            {myRooms.map(room => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800 rounded-lg p-4 border border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {room.status === 'waiting' ? 'Wachten op speler...' : 'Aan het spelen'}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {room.host_name} vs {room.guest_name || '...'}
                    </div>
                  </div>
                  {room.status === 'playing' && (
                    <Button
                      size="sm"
                      onClick={() => onStartGame(room, room.host_email === user.email ? 'host' : 'guest')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Spelen
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {availableRooms.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3">Beschikbare Kamers</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {availableRooms.map(room => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-slate-800 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{room.host_name}</div>
                      <div className="text-slate-400 text-sm">Wacht op tegenstander</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => joinRoomMutation.mutate(room)}
                      disabled={joinRoomMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Deelnemen
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {availableRooms.length === 0 && myRooms.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Geen actieve kamers</p>
          <p className="text-slate-500 text-sm">Maak een nieuwe kamer om te beginnen</p>
        </div>
      )}
    </div>
  );
}