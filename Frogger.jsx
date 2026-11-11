import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

export default function Frogger({ onGameEnd }) {
  const [frogPos, setFrogPos] = useState({ x: 4, y: 7 });
  const [cars, setCars] = useState([
    [{ x: 0 }, { x: 3 }, { x: 6 }],
    [{ x: 1 }, { x: 4 }, { x: 7 }],
    [{ x: 2 }, { x: 5 }, { x: 8 }]
  ]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCars(prev => prev.map((lane, i) => 
        lane.map(car => ({ x: (car.x + (i % 2 === 0 ? 1 : -1) + 9) % 9 }))
      ));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (frogPos.y >= 1 && frogPos.y <= 3) {
      const laneIndex = frogPos.y - 1;
      const hitByCar = cars[laneIndex].some(car => car.x === frogPos.x);
      if (hitByCar) {
        setGameOver(true);
        onGameEnd && onGameEnd(0);
      }
    }

    if (frogPos.y === 0) {
      setWon(true);
      onGameEnd && onGameEnd(100);
    }
  }, [frogPos, cars, onGameEnd]);

  const move = (dx, dy) => {
    if (gameOver || won) return;
    const newX = Math.max(0, Math.min(8, frogPos.x + dx));
    const newY = Math.max(0, Math.min(7, frogPos.y + dy));
    setFrogPos({ x: newX, y: newY });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const resetGame = () => {
    setFrogPos({ x: 4, y: 7 });
    setGameOver(false);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="grid grid-cols-9 gap-1">
        {[...Array(8)].map((_, y) => (
          [...Array(9)].map((_, x) => {
            const isFrog = frogPos.x === x && frogPos.y === y;
            const isCar = y >= 1 && y <= 3 && cars[y - 1]?.some(car => car.x === x);
            const isGoal = y === 0;

            return (
              <div
                key={`${x}-${y}`}
                className={`w-8 h-8 flex items-center justify-center text-lg ${
                  isGoal ? 'bg-green-500' : y >= 1 && y <= 3 ? 'bg-slate-700' : 'bg-slate-900'
                }`}
              >
                {isFrog && '🐸'}
                {isCar && '🚗'}
              </div>
            );
          })
        ))}
      </div>

      {won && <div className="text-white text-xl font-bold">🎉 Gelukt!</div>}
      {gameOver && <div className="text-white text-xl font-bold">💥 Game Over!</div>}

      {(won || gameOver) && <Button onClick={resetGame}>Opnieuw</Button>}

      <div className="grid grid-cols-3 gap-2">
        <div></div>
        <Button onClick={() => move(0, -1)} size="sm">↑</Button>
        <div></div>
        <Button onClick={() => move(-1, 0)} size="sm">←</Button>
        <div></div>
        <Button onClick={() => move(1, 0)} size="sm">→</Button>
        <div></div>
        <Button onClick={() => move(0, 1)} size="sm">↓</Button>
      </div>
    </div>
  );
}