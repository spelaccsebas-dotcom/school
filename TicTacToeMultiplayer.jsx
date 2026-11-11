import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { X as XIcon, Circle, Trophy, Users } from 'lucide-react';

export default function TicTacToeMultiplayer({ room, playerRole, onGameEnd }) {
  const [board, setBoard] = useState(room.game_state?.board || Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState(room.current_turn);
  const [winner, setWinner] = useState(null);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!room) return;
    
    const unsubscribe = base44.entities.GameRoom.subscribe(async (event) => {
      if (event.data.id === room.id && event.type === 'update') {
        const updatedRoom = event.data;
        setBoard(updatedRoom.game_state?.board || Array(9).fill(null));
        setCurrentTurn(updatedRoom.current_turn);
        if (updatedRoom.winner) {
          setWinner(updatedRoom.winner);
        }
      }
    });

    return unsubscribe;
  }, [room]);

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    
    for (let [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = async (index) => {
    if (!user || board[index] || winner || currentTurn !== user.email) return;
    
    const newBoard = [...board];
    newBoard[index] = playerRole === 'host' ? 'X' : 'O';
    
    const gameWinner = checkWinner(newBoard);
    const nextTurn = playerRole === 'host' ? room.guest_email : room.host_email;
    
    const updateData = {
      game_state: { board: newBoard },
      current_turn: nextTurn
    };

    if (gameWinner) {
      updateData.winner = user.email;
      updateData.status = 'finished';
    } else if (!newBoard.includes(null)) {
      updateData.status = 'finished';
      updateData.winner = 'draw';
    }

    await base44.entities.GameRoom.update(room.id, updateData);
    
    setBoard(newBoard);
    setCurrentTurn(nextTurn);
    
    if (updateData.winner) {
      setWinner(updateData.winner);
    }
  };

  const isMyTurn = user && currentTurn === user.email;
  const opponentName = playerRole === 'host' ? room.guest_name : room.host_name;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold">Multiplayer</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Jij: </span>
            <span className="text-purple-400 font-bold">{playerRole === 'host' ? 'X' : 'O'}</span>
          </div>
        </div>
        <div className="text-slate-400 text-sm">
          Tegenstander: {opponentName}
        </div>
      </div>

      {winner ? (
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            {winner === 'draw' ? 'Gelijkspel!' : 
             winner === user?.email ? 'Je hebt gewonnen!' : 
             `${opponentName} heeft gewonnen!`}
          </h3>
        </div>
      ) : (
        <>
          <div className="text-center">
            <div className={`text-lg font-semibold ${isMyTurn ? 'text-green-400' : 'text-slate-400'}`}>
              {isMyTurn ? 'Jouw beurt!' : `${opponentName} is aan de beurt...`}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
            {board.map((value, index) => (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!isMyTurn || value !== null}
                className={`aspect-square rounded-xl border-2 flex items-center justify-center text-4xl font-bold transition-all ${
                  value === null && isMyTurn
                    ? 'border-purple-500/30 bg-slate-800/50 hover:bg-purple-500/10 hover:border-purple-500/50 cursor-pointer'
                    : 'border-slate-700 bg-slate-800/30 cursor-not-allowed'
                }`}
              >
                {value === 'X' && <XIcon className="w-12 h-12 text-blue-400" />}
                {value === 'O' && <Circle className="w-12 h-12 text-pink-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}