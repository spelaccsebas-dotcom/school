import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

export default function ConnectFour({ onGameEnd }) {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const checkWinner = (board, row, col, player) => {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (let [dx, dy] of directions) {
      let count = 1;
      
      for (let i = 1; i < 4; i++) {
        const newRow = row + dx * i;
        const newCol = col + dy * i;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          count++;
        } else {
          break;
        }
      }
      
      for (let i = 1; i < 4; i++) {
        const newRow = row - dx * i;
        const newCol = col - dy * i;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 4) return true;
    }
    return false;
  };

  const aiMove = useCallback((board) => {
    // Simple AI: try to win, block player, or random
    const validCols = [];
    for (let col = 0; col < COLS; col++) {
      if (board[0][col] === 0) validCols.push(col);
    }

    // Check if AI can win
    for (let col of validCols) {
      const testBoard = board.map(row => [...row]);
      for (let row = ROWS - 1; row >= 0; row--) {
        if (testBoard[row][col] === 0) {
          testBoard[row][col] = 2;
          if (checkWinner(testBoard, row, col, 2)) return col;
          break;
        }
      }
    }

    // Check if need to block player
    for (let col of validCols) {
      const testBoard = board.map(row => [...row]);
      for (let row = ROWS - 1; row >= 0; row--) {
        if (testBoard[row][col] === 0) {
          testBoard[row][col] = 1;
          if (checkWinner(testBoard, row, col, 1)) return col;
          break;
        }
      }
    }

    // Random move
    return validCols[Math.floor(Math.random() * validCols.length)];
  }, []);

  const dropPiece = (col) => {
    if (gameOver || board[0][col] !== 0 || currentPlayer !== 1) return;

    const newBoard = board.map(row => [...row]);
    let row = ROWS - 1;
    
    while (row >= 0 && newBoard[row][col] !== 0) {
      row--;
    }

    if (row < 0) return;

    newBoard[row][col] = 1;
    setBoard(newBoard);

    if (checkWinner(newBoard, row, col, 1)) {
      setWinner(1);
      setGameOver(true);
      onGameEnd(500);
      return;
    }

    if (newBoard[0].every(cell => cell !== 0)) {
      setGameOver(true);
      onGameEnd(0);
      return;
    }

    setCurrentPlayer(2);
    
    // AI turn
    setTimeout(() => {
      const aiCol = aiMove(newBoard);
      if (aiCol !== undefined) {
        let aiRow = ROWS - 1;
        while (aiRow >= 0 && newBoard[aiRow][aiCol] !== 0) {
          aiRow--;
        }
        
        if (aiRow >= 0) {
          newBoard[aiRow][aiCol] = 2;
          setBoard([...newBoard]);
          
          if (checkWinner(newBoard, aiRow, aiCol, 2)) {
            setWinner(2);
            setGameOver(true);
            onGameEnd(0);
            return;
          }
        }
      }
      setCurrentPlayer(1);
    }, 500);
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
    setCurrentPlayer(1);
    setWinner(null);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-md">
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full ${currentPlayer === 1 ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-500'}`}>
            Jij
          </div>
          <div className={`px-3 py-1 rounded-full ${currentPlayer === 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-700 text-slate-500'}`}>
            AI
          </div>
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="bg-blue-600 p-4 rounded-2xl shadow-xl">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <motion.button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => dropPiece(colIndex)}
                whileHover={!gameOver && currentPlayer === 1 ? { scale: 1.05 } : {}}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-800 rounded-full flex items-center justify-center"
              >
                <AnimatePresence>
                  {cell !== 0 && (
                    <motion.div
                      initial={{ scale: 0, y: -100 }}
                      animate={{ scale: 1, y: 0 }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${
                        cell === 1 ? 'bg-red-500' : 'bg-yellow-400'
                      }`}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 text-xl font-bold ${
              winner === 1 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {winner === 1 ? (
              <><Trophy className="w-6 h-6" /> Je hebt gewonnen!</>
            ) : (
              <>AI wint!</>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}