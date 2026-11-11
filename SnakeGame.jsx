import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

const GRID_SIZE = 15;
const CELL_SIZE = 20;

export default function SnakeGame({ onGameEnd }) {
  const [snake, setSnake] = useState([{ x: 7, y: 7 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 7, y: 7 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setGameRunning(false);
  };

  const startGame = () => {
    resetGame();
    setGameRunning(true);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameRunning) return;
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameRunning]);

  useEffect(() => {
    if (!gameRunning || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newHead = {
          x: (prevSnake[0].x + direction.x + GRID_SIZE) % GRID_SIZE,
          y: (prevSnake[0].y + direction.y + GRID_SIZE) % GRID_SIZE
        };

        // Check collision with self
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setGameRunning(false);
          onGameEnd(score * 10);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check if eating food
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood());
          setScore(s => s + 1);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, 150);
    return () => clearInterval(interval);
  }, [gameRunning, gameOver, direction, food, generateFood, score, onGameEnd]);

  const handleDirectionButton = (newDir) => {
    if (!gameRunning) return;
    if (newDir.y === 0 && direction.y === 0 && newDir.x === -direction.x) return;
    if (newDir.x === 0 && direction.x === 0 && newDir.y === -direction.y) return;
    setDirection(newDir);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-purple-300 text-lg">
        Score: <span className="font-bold text-white">{score}</span>
      </div>

      <div 
        className="relative bg-slate-900/80 rounded-xl border border-purple-500/30 overflow-hidden"
        style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
      >
        {/* Grid background */}
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
          {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, i) => (
            <div key={i} className="border border-purple-500/5" />
          ))}
        </div>

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm ${index === 0 ? 'bg-green-400' : 'bg-green-500/80'}`}
            style={{
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              left: segment.x * CELL_SIZE + 1,
              top: segment.y * CELL_SIZE + 1,
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute bg-red-500 rounded-full animate-pulse"
          style={{
            width: CELL_SIZE - 4,
            height: CELL_SIZE - 4,
            left: food.x * CELL_SIZE + 2,
            top: food.y * CELL_SIZE + 2,
          }}
        />

        {/* Overlay */}
        {!gameRunning && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <Button onClick={startGame} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Play className="w-4 h-4 mr-2" />
              {gameOver ? 'Opnieuw' : 'Start'}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div />
        <Button size="icon" variant="outline" onClick={() => handleDirectionButton({ x: 0, y: -1 })} className="border-purple-500/30">
          <ArrowUp className="w-5 h-5" />
        </Button>
        <div />
        <Button size="icon" variant="outline" onClick={() => handleDirectionButton({ x: -1, y: 0 })} className="border-purple-500/30">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => handleDirectionButton({ x: 0, y: 1 })} className="border-purple-500/30">
          <ArrowDown className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="outline" onClick={() => handleDirectionButton({ x: 1, y: 0 })} className="border-purple-500/30">
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-slate-500 text-sm hidden sm:block">Gebruik pijltjestoetsen om te bewegen</p>
    </div>
  );
}