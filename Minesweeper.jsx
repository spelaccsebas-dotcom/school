import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { RotateCcw, Flag, Bomb } from 'lucide-react';

const GRID_SIZE = 8;
const MINE_COUNT = 10;

export default function Minesweeper({ onGameEnd }) {
  const [grid, setGrid] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flags, setFlags] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    const mines = new Set();
    
    while (mines.size < MINE_COUNT) {
      const pos = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
      mines.add(pos);
    }

    mines.forEach(pos => {
      const row = Math.floor(pos / GRID_SIZE);
      const col = pos % GRID_SIZE;
      newGrid[row][col] = -1;
    });

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] !== -1) {
          let count = 0;
          for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
              const ni = i + di, nj = j + dj;
              if (ni >= 0 && ni < GRID_SIZE && nj >= 0 && nj < GRID_SIZE && newGrid[ni][nj] === -1) {
                count++;
              }
            }
          }
          newGrid[i][j] = count;
        }
      }
    }

    setGrid(newGrid);
    setRevealed(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false)));
    setFlags(new Set());
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const reveal = (i, j) => {
    if (gameOver || revealed[i][j] || flags.has(`${i}-${j}`)) return;

    const newRevealed = revealed.map(row => [...row]);
    
    const floodFill = (i, j) => {
      if (i < 0 || i >= GRID_SIZE || j < 0 || j >= GRID_SIZE || newRevealed[i][j]) return;
      
      newRevealed[i][j] = true;
      
      if (grid[i][j] === 0) {
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            floodFill(i + di, j + dj);
          }
        }
      }
    };

    if (grid[i][j] === -1) {
      setGameOver(true);
      // Reveal all mines
      for (let ii = 0; ii < GRID_SIZE; ii++) {
        for (let jj = 0; jj < GRID_SIZE; jj++) {
          if (grid[ii][jj] === -1) newRevealed[ii][jj] = true;
        }
      }
      setRevealed(newRevealed);
      onGameEnd(0);
      return;
    }

    floodFill(i, j);
    setRevealed(newRevealed);

    // Check win
    let safe = 0;
    for (let ii = 0; ii < GRID_SIZE; ii++) {
      for (let jj = 0; jj < GRID_SIZE; jj++) {
        if (newRevealed[ii][jj] && grid[ii][jj] !== -1) safe++;
      }
    }
    if (safe === GRID_SIZE * GRID_SIZE - MINE_COUNT) {
      setWon(true);
      setGameOver(true);
      onGameEnd(1000);
    }
  };

  const toggleFlag = (i, j, e) => {
    e.preventDefault();
    if (gameOver || revealed[i][j]) return;
    
    const key = `${i}-${j}`;
    const newFlags = new Set(flags);
    if (newFlags.has(key)) {
      newFlags.delete(key);
    } else {
      newFlags.add(key);
    }
    setFlags(newFlags);
  };

  const getNumberColor = (num) => {
    const colors = ['', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-orange-500', 'text-cyan-500', 'text-pink-500', 'text-yellow-500'];
    return colors[num] || '';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-sm">
        <div className="text-purple-300 flex items-center gap-2">
          <Flag className="w-4 h-4" />
          <span className="font-bold text-white">{MINE_COUNT - flags.size}</span>
        </div>
        <Button onClick={initGame} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nieuw
        </Button>
      </div>

      <div className="bg-slate-900/80 p-2 rounded-xl border border-purple-500/30">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <motion.button
                key={`${i}-${j}`}
                onClick={() => reveal(i, j)}
                onContextMenu={(e) => toggleFlag(i, j, e)}
                whileHover={{ scale: revealed[i][j] ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center font-bold text-sm transition-all ${
                  revealed[i][j]
                    ? cell === -1
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-700 text-white'
                    : flags.has(`${i}-${j}`)
                    ? 'bg-yellow-600/30 border border-yellow-500'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {revealed[i][j] ? (
                  cell === -1 ? <Bomb className="w-4 h-4" /> : cell > 0 ? <span className={getNumberColor(cell)}>{cell}</span> : ''
                ) : flags.has(`${i}-${j}`) ? (
                  <Flag className="w-3 h-3 text-yellow-400" />
                ) : ''}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {won && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-green-400"
        >
          🎉 Gewonnen!
        </motion.div>
      )}

      {gameOver && !won && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-bold text-red-400"
        >
          💣 Boom! Probeer opnieuw
        </motion.div>
      )}

      <p className="text-slate-500 text-sm">Klik om te openen, rechtsklik voor vlag</p>
    </div>
  );
}