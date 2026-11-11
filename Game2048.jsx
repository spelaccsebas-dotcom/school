import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

const GRID_SIZE = 4;

export default function Game2048({ onGameEnd }) {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    return newGrid;
  }, []);

  const addRandomTile = (grid) => {
    const emptyCells = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) emptyCells.push({ i, j });
      }
    }
    if (emptyCells.length > 0) {
      const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  useEffect(() => {
    setGrid(initGrid());
  }, [initGrid]);

  const getTileColor = (value) => {
    const colors = {
      0: 'bg-slate-800/30',
      2: 'bg-slate-700',
      4: 'bg-slate-600',
      8: 'bg-orange-600',
      16: 'bg-orange-500',
      32: 'bg-red-600',
      64: 'bg-red-500',
      128: 'bg-yellow-600',
      256: 'bg-yellow-500',
      512: 'bg-yellow-400',
      1024: 'bg-green-600',
      2048: 'bg-green-500'
    };
    return colors[value] || 'bg-purple-600';
  };

  const moveLeft = (grid) => {
    let moved = false;
    let newScore = 0;
    const newGrid = grid.map(row => {
      const filtered = row.filter(cell => cell !== 0);
      const merged = [];
      let i = 0;
      while (i < filtered.length) {
        if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
          const value = filtered[i] * 2;
          merged.push(value);
          newScore += value;
          if (value === 2048 && !won) setWon(true);
          i += 2;
          moved = true;
        } else {
          merged.push(filtered[i]);
          i++;
        }
      }
      while (merged.length < GRID_SIZE) merged.push(0);
      if (JSON.stringify(merged) !== JSON.stringify(row)) moved = true;
      return merged;
    });
    return { grid: newGrid, moved, score: newScore };
  };

  const rotate = (grid) => {
    return grid[0].map((_, i) => grid.map(row => row[i]).reverse());
  };

  const move = (direction) => {
    if (gameOver) return;
    
    let workGrid = grid.map(row => [...row]);
    let result;

    switch (direction) {
      case 'left':
        result = moveLeft(workGrid);
        break;
      case 'right':
        workGrid = workGrid.map(row => row.reverse());
        result = moveLeft(workGrid);
        result.grid = result.grid.map(row => row.reverse());
        break;
      case 'up':
        workGrid = rotate(rotate(rotate(workGrid)));
        result = moveLeft(workGrid);
        result.grid = rotate(result.grid);
        break;
      case 'down':
        workGrid = rotate(workGrid);
        result = moveLeft(workGrid);
        result.grid = rotate(rotate(rotate(result.grid)));
        break;
    }

    if (result.moved) {
      addRandomTile(result.grid);
      setGrid(result.grid);
      setScore(s => s + result.score);
      
      if (!canMove(result.grid)) {
        setGameOver(true);
        onGameEnd(score + result.score);
      }
    }
  };

  const canMove = (grid) => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) return true;
        if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return true;
        if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const direction = e.key.replace('Arrow', '').toLowerCase();
        move(direction);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [grid, gameOver]);

  const resetGame = () => {
    setGrid(initGrid());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full max-w-xs">
        <div className="text-purple-300">
          Score: <span className="font-bold text-white text-xl">{score}</span>
        </div>
        <Button onClick={resetGame} variant="outline" size="sm" className="border-purple-500/30 hover:bg-purple-500/20">
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="bg-slate-900/80 p-3 rounded-2xl border border-purple-500/30">
        <div className="grid grid-cols-4 gap-2">
          {grid.map((row, i) => 
            row.map((cell, j) => (
              <motion.div
                key={`${i}-${j}`}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center font-bold text-white ${getTileColor(cell)}`}
                initial={{ scale: cell === 0 ? 1 : 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {cell > 0 && <span className={cell >= 128 ? 'text-2xl' : 'text-xl'}>{cell}</span>}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div />
        <Button onClick={() => move('up')} variant="outline" className="border-purple-500/30">↑</Button>
        <div />
        <Button onClick={() => move('left')} variant="outline" className="border-purple-500/30">←</Button>
        <Button onClick={() => move('down')} variant="outline" className="border-purple-500/30">↓</Button>
        <Button onClick={() => move('right')} variant="outline" className="border-purple-500/30">→</Button>
      </div>

      {won && !gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-green-400">Je hebt 2048 bereikt!</div>
        </motion.div>
      )}

      {gameOver && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-xl font-bold text-red-400">Game Over!</div>
          <div className="text-slate-400">Score: {score}</div>
        </motion.div>
      )}

      <p className="text-slate-500 text-sm hidden sm:block">Gebruik pijltjestoetsen</p>
    </div>
  );
}