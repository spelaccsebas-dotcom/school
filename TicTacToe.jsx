import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { RotateCcw, Trophy, Frown } from 'lucide-react';

export default function TicTacToe({ onGameEnd }) {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);

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
    return squares.every(s => s) ? 'draw' : null;
  };

  const minimax = (squares, isMax) => {
    const result = checkWinner(squares);
    if (result === 'O') return 10;
    if (result === 'X') return -10;
    if (result === 'draw') return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'O';
          best = Math.max(best, minimax(squares, false));
          squares[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = 'X';
          best = Math.min(best, minimax(squares, true));
          squares[i] = null;
        }
      }
      return best;
    }
  };

  const getBestMove = (squares) => {
    let bestVal = -Infinity;
    let bestMove = -1;
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        squares[i] = 'O';
        const moveVal = minimax(squares, false);
        squares[i] = null;
        if (moveVal > bestVal) {
          bestMove = i;
          bestVal = moveVal;
        }
      }
    }
    return bestMove;
  };

  const handleClick = (index) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result);
      if (result === 'X') onGameEnd(500);
      return;
    }

    setIsPlayerTurn(false);

    setTimeout(() => {
      const aiMove = getBestMove([...newBoard]);
      if (aiMove !== -1) {
        newBoard[aiMove] = 'O';
        setBoard([...newBoard]);
        const aiResult = checkWinner(newBoard);
        if (aiResult) {
          setWinner(aiResult);
        }
      }
      setIsPlayerTurn(true);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-purple-300">
          Jij: <span className="font-bold text-blue-400">X</span> | 
          AI: <span className="font-bold text-pink-400">O</span>
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {board.map((cell, index) => (
          <motion.button
            key={index}
            onClick={() => handleClick(index)}
            whileHover={{ scale: cell ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl text-4xl font-bold flex items-center justify-center border transition-all ${
              cell 
                ? cell === 'X' 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                  : 'bg-pink-500/20 border-pink-500/50 text-pink-400'
                : 'bg-slate-800/80 border-purple-500/20 hover:border-purple-500/50 hover:bg-slate-700/80'
            }`}
          >
            {cell}
          </motion.button>
        ))}
      </div>

      {winner && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 text-xl font-bold ${
            winner === 'X' ? 'text-green-400' : winner === 'O' ? 'text-red-400' : 'text-yellow-400'
          }`}
        >
          {winner === 'X' ? (
            <><Trophy className="w-6 h-6" /> Je hebt gewonnen!</>
          ) : winner === 'O' ? (
            <><Frown className="w-6 h-6" /> AI wint!</>
          ) : (
            <>Gelijkspel!</>
          )}
        </motion.div>
      )}
    </div>
  );
}